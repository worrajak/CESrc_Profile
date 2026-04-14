/**
 * OpenAlex Batch Sync
 * POST /api/openalex/sync — อัปเดต citations + h-index ของทุกนักวิจัยที่มี openalex_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const OA_API = 'https://api.openalex.org';
const MAILTO = 'cesru@rmutl.ac.th';

export async function POST(request: NextRequest) {
  try {
    // Get all researchers with openalex_id
    const { data: researchers, error } = await supabase
      .from('researchers')
      .select('id, first_name_en, last_name_en, openalex_id')
      .not('openalex_id', 'is', null);

    if (error) throw error;
    if (!researchers?.length) {
      return NextResponse.json({ error: 'ไม่พบนักวิจัยที่มี OpenAlex ID' }, { status: 404 });
    }

    const results = [];

    for (const r of researchers) {
      try {
        const res = await fetch(
          `${OA_API}/authors/${r.openalex_id}?mailto=${MAILTO}`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) {
          results.push({ id: r.id, name: `${r.first_name_en} ${r.last_name_en}`, status: 'not_found' });
          continue;
        }
        const d = await res.json();

        // Update stats
        await supabase
          .from('researchers')
          .update({
            cited_by_count: d.cited_by_count || 0,
            h_index: d.summary_stats?.h_index || 0,
            i10_index: d.summary_stats?.i10_index || 0,
          })
          .eq('id', r.id);

        results.push({
          id: r.id,
          name: `${r.first_name_en} ${r.last_name_en}`,
          status: 'updated',
          cited_by_count: d.cited_by_count || 0,
          h_index: d.summary_stats?.h_index || 0,
          i10_index: d.summary_stats?.i10_index || 0,
          works_count: d.works_count || 0,
        });
      } catch (err) {
        results.push({ id: r.id, name: `${r.first_name_en} ${r.last_name_en}`, status: 'error' });
      }
    }

    // Also update per-publication citation counts
    const { data: pubs } = await supabase
      .from('publications')
      .select('id, openalex_id')
      .not('openalex_id', 'is', null);

    let pubsUpdated = 0;
    if (pubs?.length) {
      // Batch by 50
      for (let i = 0; i < pubs.length; i += 50) {
        const batch = pubs.slice(i, i + 50);
        const oaIds = batch.map((p) => `https://openalex.org/${p.openalex_id}`).join('|');
        try {
          const res = await fetch(
            `${OA_API}/works?filter=openalex_id:${oaIds}&per_page=50&mailto=${MAILTO}`,
            { headers: { Accept: 'application/json' } }
          );
          if (res.ok) {
            const d = await res.json();
            for (const w of d.results || []) {
              const shortId = w.id?.replace('https://openalex.org/', '');
              const pub = batch.find((p) => p.openalex_id === shortId);
              if (pub) {
                await supabase
                  .from('publications')
                  .update({
                    cited_by_count: w.cited_by_count || 0,
                    is_open_access: w.open_access?.is_oa || false,
                  })
                  .eq('id', pub.id);
                pubsUpdated++;
              }
            }
          }
        } catch {
          // continue with next batch
        }
      }
    }

    return NextResponse.json({
      success: true,
      researchers_synced: results.filter((r) => r.status === 'updated').length,
      publications_updated: pubsUpdated,
      details: results,
    });
  } catch (err: any) {
    console.error('OpenAlex sync error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
