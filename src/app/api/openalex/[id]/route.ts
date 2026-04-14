/**
 * OpenAlex API Integration
 * GET /api/openalex/[openalex-id] — ดึง author profile + works จาก OpenAlex
 * POST /api/openalex/[openalex-id] — นำเข้า works ลง DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const OA_API = 'https://api.openalex.org';
const MAILTO = 'cesru@rmutl.ac.th';

async function fetchOA(path: string) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${OA_API}${path}${sep}mailto=${MAILTO}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

function mapWorkType(oaType: string): string {
  const m: Record<string, string> = {
    article: 'journal',
    'journal-article': 'journal',
    'proceedings-article': 'conference',
    'conference-paper': 'conference',
    'book-chapter': 'book_chapter',
    book: 'book',
    dissertation: 'thesis',
    report: 'report',
    'posted-content': 'report',
  };
  return m[oaType] || 'journal';
}

// GET — Fetch OpenAlex author profile + works
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const oaId = params.id;

  try {
    // Fetch author profile
    const authorData = await fetchOA(`/authors/${oaId}`);
    if (!authorData) {
      return NextResponse.json({ error: `ไม่พบ OpenAlex ID: ${oaId}` }, { status: 404 });
    }

    // Fetch works (up to 200)
    const worksData = await fetchOA(`/works?filter=author.id:${oaId}&per_page=200&sort=publication_year:desc`);
    const works = (worksData?.results || []).map((w: any) => {
      let doi = w.doi || '';
      if (doi.startsWith('https://doi.org/')) doi = doi.replace('https://doi.org/', '');

      const authors = (w.authorships || []).map((a: any) => ({
        name: a.author?.display_name || '',
        oa_id: a.author?.id || '',
        position: a.author_position || 'middle',
        institutions: (a.institutions || []).map((i: any) => i.display_name),
      }));

      return {
        openalex_id: w.id || '',
        title: w.title || '',
        doi,
        year: w.publication_year,
        type: w.type || 'article',
        pub_type: mapWorkType(w.type || 'article'),
        cited_by_count: w.cited_by_count || 0,
        journal: w.primary_location?.source?.display_name || '',
        is_oa: w.open_access?.is_oa || false,
        oa_url: w.open_access?.oa_url || '',
        authors,
      };
    });

    // Check if researcher already linked in DB
    const { data: existingResearcher } = await supabase
      .from('researchers')
      .select('id, first_name_th, last_name_th, first_name_en, last_name_en')
      .eq('openalex_id', oaId.replace('https://openalex.org/', ''))
      .single();

    return NextResponse.json({
      openalex_id: authorData.id,
      display_name: authorData.display_name,
      orcid: authorData.orcid || null,
      works_count: authorData.works_count || 0,
      cited_by_count: authorData.cited_by_count || 0,
      h_index: authorData.summary_stats?.h_index || 0,
      i10_index: authorData.summary_stats?.i10_index || 0,
      mean_citedness: authorData.summary_stats?.['2yr_mean_citedness'] || 0,
      affiliations: (authorData.affiliations || []).map((a: any) => ({
        institution: a.institution?.display_name || '',
        years: a.years || [],
      })),
      topics: (authorData.topics || []).slice(0, 10).map((t: any) => ({
        name: t.display_name || '',
        count: t.count || 0,
        subfield: t.subfield?.display_name || '',
      })),
      works,
      existing_researcher: existingResearcher || null,
      stats: {
        works: works.length,
        total_works: authorData.works_count || 0,
        total_citations: authorData.cited_by_count || 0,
        h_index: authorData.summary_stats?.h_index || 0,
        i10_index: authorData.summary_stats?.i10_index || 0,
      },
    });
  } catch (err: any) {
    console.error('OpenAlex fetch error:', err);
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อ OpenAlex API ได้' }, { status: 500 });
  }
}

// POST — Import selected works into DB
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const oaId = params.id;

  try {
    const body = await request.json();
    const { researcher_id, works = [] } = body;

    if (!researcher_id) {
      return NextResponse.json({ error: 'ต้องระบุ researcher_id' }, { status: 400 });
    }

    // Update researcher's openalex_id & stats
    const authorData = await fetchOA(`/authors/${oaId}`);
    if (authorData) {
      const shortId = oaId.replace('https://openalex.org/', '');
      await supabase
        .from('researchers')
        .update({
          openalex_id: shortId,
          cited_by_count: authorData.cited_by_count || 0,
          h_index: authorData.summary_stats?.h_index || 0,
          i10_index: authorData.summary_stats?.i10_index || 0,
        })
        .eq('id', researcher_id);
    }

    let imported = 0;
    let skipped = 0;
    let linked = 0;

    for (const work of works) {
      const doi = work.doi?.trim() || null;
      const title = work.title?.trim() || '';
      if (!title) continue;

      // Check if DOI already exists
      if (doi) {
        const { data: existing } = await supabase
          .from('publications')
          .select('id')
          .eq('doi', doi)
          .single();

        if (existing) {
          // Link researcher if not already linked
          const { data: alreadyLinked } = await supabase
            .from('publication_authors')
            .select('id')
            .eq('publication_id', existing.id)
            .eq('researcher_id', researcher_id)
            .single();

          if (!alreadyLinked) {
            await supabase.from('publication_authors').insert({
              publication_id: existing.id,
              researcher_id,
              author_role: 'co_author',
              author_order: 99,
            });
            linked++;
          } else {
            skipped++;
          }
          continue;
        }
      }

      // Check by title
      const { data: existingByTitle } = await supabase
        .from('publications')
        .select('id')
        .ilike('title', title)
        .single();

      if (existingByTitle) {
        const { data: alreadyLinked } = await supabase
          .from('publication_authors')
          .select('id')
          .eq('publication_id', existingByTitle.id)
          .eq('researcher_id', researcher_id)
          .single();

        if (!alreadyLinked) {
          await supabase.from('publication_authors').insert({
            publication_id: existingByTitle.id,
            researcher_id,
            author_role: 'co_author',
            author_order: 99,
          });
          linked++;
        } else {
          skipped++;
        }
        continue;
      }

      // Insert new publication
      const oaWorkId = (work.openalex_id || '').replace('https://openalex.org/', '');
      const { data: newPub } = await supabase
        .from('publications')
        .insert({
          title,
          journal_name: work.journal || null,
          year: work.year,
          doi: doi || null,
          pub_type: work.pub_type || mapWorkType(work.type || 'article'),
          authors_raw: `[OpenAlex: ${oaId}]`,
          source: 'openalex',
          cited_by_count: work.cited_by_count || 0,
          openalex_id: oaWorkId || null,
          is_open_access: work.is_oa || false,
          open_access_url: work.oa_url || null,
        })
        .select('id')
        .single();

      if (newPub) {
        await supabase.from('publication_authors').insert({
          publication_id: newPub.id,
          researcher_id,
          author_role: 'first_author',
          author_order: 1,
        });
        imported++;
      }
    }

    return NextResponse.json({
      success: true,
      openalex_id: oaId,
      researcher_id,
      imported,
      linked,
      skipped,
    });
  } catch (err: any) {
    console.error('OpenAlex import error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
