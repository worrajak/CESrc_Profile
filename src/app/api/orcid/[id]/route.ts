/**
 * ORCID Public API Integration
 * GET /api/orcid/[orcid-id] — ดึง profile, works, fundings จาก ORCID
 * POST /api/orcid/[orcid-id] — นำเข้าข้อมูลจาก ORCID ลง DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ORCID_API = 'https://pub.orcid.org/v3.0';

async function fetchOrcid(orcidId: string, path: string) {
  const res = await fetch(`${ORCID_API}/${orcidId}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

function extractName(person: any) {
  const name = person?.name;
  if (!name) return {};
  return {
    first_name: name['given-names']?.value || '',
    last_name: name['family-name']?.value || '',
    credit_name: name['credit-name']?.value || '',
  };
}

function extractAffiliations(activities: any) {
  const affiliations: any[] = [];

  for (const group of activities?.['affiliation-group'] || []) {
    for (const summary of group?.summaries || []) {
      const aff = summary['employment-summary'] || summary['education-summary'] || summary['distinction-summary'];
      if (!aff) continue;
      affiliations.push({
        type: summary['employment-summary'] ? 'employment' : summary['education-summary'] ? 'education' : 'other',
        organization: aff.organization?.name || '',
        department: aff['department-name'] || '',
        role: aff['role-title'] || '',
        start_year: aff['start-date']?.year?.value || null,
        end_year: aff['end-date']?.year?.value || null,
      });
    }
  }

  return affiliations;
}

function extractWorks(worksData: any) {
  const works: any[] = [];

  for (const group of worksData?.group || []) {
    const summary = group['work-summary']?.[0];
    if (!summary) continue;

    const externalIds = summary['external-ids']?.['external-id'] || [];
    const doi = externalIds.find((e: any) => e['external-id-type'] === 'doi')?.['external-id-value'] || null;

    works.push({
      title: summary.title?.title?.value || '',
      journal_name: summary['journal-title']?.value || '',
      year: parseInt(summary['publication-date']?.year?.value) || null,
      type: summary.type || 'journal-article',
      doi,
      put_code: summary['put-code'],
    });
  }

  // Sort by year descending
  works.sort((a, b) => (b.year || 0) - (a.year || 0));
  return works;
}

function extractFundings(fundingsData: any) {
  const fundings: any[] = [];

  for (const group of fundingsData?.group || []) {
    const summary = group['funding-summary']?.[0];
    if (!summary) continue;

    fundings.push({
      title: summary.title?.title?.value || '',
      funder: summary.organization?.name || '',
      type: summary.type || '',
      start_year: summary['start-date']?.year?.value || null,
      end_year: summary['end-date']?.year?.value || null,
      amount: summary.amount?.value || null,
      currency: summary.amount?.['currency-code'] || null,
      put_code: summary['put-code'],
    });
  }

  fundings.sort((a, b) => (b.start_year || 0) - (a.start_year || 0));
  return fundings;
}

function extractKeywords(person: any) {
  const kws = person?.keywords?.keyword || [];
  return kws.map((k: any) => k.content).filter(Boolean);
}

// GET — Fetch ORCID profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orcidId = params.id;

  // Validate format
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcidId)) {
    return NextResponse.json({ error: 'รูปแบบ ORCID ID ไม่ถูกต้อง (ต้องเป็น 0000-0000-0000-0000)' }, { status: 400 });
  }

  try {
    // Fetch person + works + fundings in parallel
    const [personData, activitiesData, worksData, fundingsData] = await Promise.all([
      fetchOrcid(orcidId, '/person'),
      fetchOrcid(orcidId, '/employments'),
      fetchOrcid(orcidId, '/works'),
      fetchOrcid(orcidId, '/fundings'),
    ]);

    if (!personData) {
      return NextResponse.json({ error: `ไม่พบ ORCID: ${orcidId}` }, { status: 404 });
    }

    const name = extractName(personData);
    const keywords = extractKeywords(personData);
    const affiliations = extractAffiliations(activitiesData);
    const works = extractWorks(worksData);
    const fundings = extractFundings(fundingsData);

    // Check if researcher already linked in DB
    const { data: existingResearcher } = await supabase
      .from('researchers')
      .select('id, first_name_th, last_name_th, first_name_en, last_name_en')
      .eq('orcid_id', orcidId)
      .single();

    return NextResponse.json({
      orcid_id: orcidId,
      name,
      keywords,
      affiliations,
      works,
      fundings,
      existing_researcher: existingResearcher || null,
      stats: {
        works: works.length,
        fundings: fundings.length,
        affiliations: affiliations.length,
        keywords: keywords.length,
      },
    });
  } catch (err: any) {
    console.error('ORCID fetch error:', err);
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อ ORCID API ได้' }, { status: 500 });
  }
}

// POST — Import ORCID data into researcher DB
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orcidId = params.id;

  try {
    const body = await request.json();
    const {
      researcher_id,
      import_works = false,
      import_fundings = false,
      works = [],
      fundings = [],
    } = body;

    if (!researcher_id) {
      return NextResponse.json({ error: 'ต้องระบุ researcher_id' }, { status: 400 });
    }

    // Update researcher's orcid_id
    await supabase
      .from('researchers')
      .update({ orcid_id: orcidId })
      .eq('id', researcher_id);

    let importedWorks = 0;
    let importedFundings = 0;
    let skippedWorks = 0;
    let skippedFundings = 0;

    // Import works as publications
    if (import_works && works.length > 0) {
      for (const work of works) {
        // Check if DOI already exists
        if (work.doi) {
          const { data: existing } = await supabase
            .from('publications')
            .select('id')
            .eq('doi', work.doi)
            .single();

          if (existing) {
            // Link existing publication to researcher if not already linked
            const { data: linked } = await supabase
              .from('publication_authors')
              .select('id')
              .eq('publication_id', existing.id)
              .eq('researcher_id', researcher_id)
              .single();

            if (!linked) {
              await supabase.from('publication_authors').insert({
                publication_id: existing.id,
                researcher_id,
                author_role: 'author',
                author_order: 1,
              });
              importedWorks++;
            } else {
              skippedWorks++;
            }
            continue;
          }
        }

        // Check if title already exists
        const { data: existingByTitle } = await supabase
          .from('publications')
          .select('id')
          .ilike('title', work.title)
          .single();

        if (existingByTitle) {
          skippedWorks++;
          continue;
        }

        // Map ORCID work type to our pub_type
        const typeMap: Record<string, string> = {
          'journal-article': 'journal',
          'conference-paper': 'conference',
          'book-chapter': 'book_chapter',
          'book': 'book',
          'dissertation': 'thesis',
          'report': 'report',
        };

        // Insert new publication
        const { data: newPub } = await supabase
          .from('publications')
          .insert({
            title: work.title,
            journal_name: work.journal_name || null,
            year: work.year,
            doi: work.doi || null,
            pub_type: typeMap[work.type] || 'journal',
            authors_raw: `[Imported from ORCID: ${orcidId}]`,
            source: 'orcid',
          })
          .select('id')
          .single();

        if (newPub) {
          await supabase.from('publication_authors').insert({
            publication_id: newPub.id,
            researcher_id,
            author_role: 'author',
            author_order: 1,
          });
          importedWorks++;
        }
      }
    }

    // Import fundings as grants
    if (import_fundings && fundings.length > 0) {
      for (const fund of fundings) {
        // Check if similar grant exists
        const { data: existingGrant } = await supabase
          .from('grants')
          .select('id')
          .ilike('title_th', `%${fund.title.substring(0, 50)}%`)
          .single();

        if (existingGrant) {
          // Link researcher to existing grant
          const { data: linked } = await supabase
            .from('grant_members')
            .select('id')
            .eq('grant_id', existingGrant.id)
            .eq('researcher_id', researcher_id)
            .single();

          if (!linked) {
            await supabase.from('grant_members').insert({
              grant_id: existingGrant.id,
              researcher_id,
              role: 'researcher',
            });
            importedFundings++;
          } else {
            skippedFundings++;
          }
          continue;
        }

        // Insert new grant
        const fiscalYear = fund.start_year ? parseInt(fund.start_year) + 543 : null;
        const { data: newGrant } = await supabase
          .from('grants')
          .insert({
            title_th: fund.title,
            title_en: fund.title,
            funding_agency: fund.funder || 'Unknown',
            fiscal_year: fiscalYear,
            budget: fund.amount ? parseFloat(fund.amount) : null,
            start_date: fund.start_year ? `${fund.start_year}-01-01` : null,
            end_date: fund.end_year ? `${fund.end_year}-12-31` : null,
            status: fund.end_year && parseInt(fund.end_year) < new Date().getFullYear() ? 'completed' : 'active',
            source: 'orcid',
          })
          .select('id')
          .single();

        if (newGrant) {
          await supabase.from('grant_members').insert({
            grant_id: newGrant.id,
            researcher_id,
            role: 'pi',
          });
          importedFundings++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      orcid_id: orcidId,
      researcher_id,
      imported: { works: importedWorks, fundings: importedFundings },
      skipped: { works: skippedWorks, fundings: skippedFundings },
    });
  } catch (err: any) {
    console.error('ORCID import error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
