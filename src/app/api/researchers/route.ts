/**
 * GET /api/researchers — ดึงรายชื่อนักวิจัยทั้งหมด
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('researchers')
    .select(
      'id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, unit_role, email, orcid_id, scopus_id, openalex_id, google_scholar, expertise, avatar_url, cited_by_count, h_index, i10_index, is_active'
    )
    .eq('is_active', true)
    .order('unit_role')
    .order('last_name_en');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
