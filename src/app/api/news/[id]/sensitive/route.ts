/**
 * GET /api/news/[id]/sensitive
 * คืนข้อมูล sensitive ของข่าวเดินทาง (budget, approval doc, link)
 *
 * Auth requirements:
 * - ต้องส่ง Authorization: Bearer <supabase_access_token>
 * - หรือ admin password ใน query/header
 *
 * Access rules:
 * - Admin (password match) → ได้ทุกข้อมูล
 * - Authenticated user with email matching a researcher → ได้
 * - คนทั่วไป → 403
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const newsId = params.id;
  const url = new URL(request.url);
  const adminPassword = url.searchParams.get('admin_password') ||
    request.headers.get('x-admin-password');

  // 1. Admin bypass
  let isAuthorized = false;
  let viewerType: 'admin' | 'researcher' | null = null;
  let researcherInfo: any = null;

  if (adminPassword === process.env.ADMIN_PASSWORD) {
    isAuthorized = true;
    viewerType = 'admin';
  } else {
    // 2. Check Supabase auth via Bearer token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (token) {
      try {
        // Use service-role-like client to verify token
        const supabaseAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const { data: { user } } = await supabaseAuth.auth.getUser(token);

        if (user?.email) {
          // Check if email matches a researcher in the unit
          const { data: researcher } = await supabase
            .from('researchers')
            .select('id, title_th, first_name_th, last_name_th, unit_role')
            .eq('email', user.email)
            .eq('is_active', true)
            .single();

          if (researcher) {
            isAuthorized = true;
            viewerType = 'researcher';
            researcherInfo = researcher;
          }
        }
      } catch {
        // Invalid token — fall through to 403
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({
      error: 'forbidden',
      message: 'ข้อมูลส่วนนี้สำหรับนักวิจัยในหน่วย CESRU เท่านั้น (login ด้วย email ที่ลงทะเบียนไว้)',
      viewer: 'public',
    }, { status: 403 });
  }

  // 3. Fetch sensitive fields
  const { data: news, error } = await supabase
    .from('news')
    .select('id, is_official_travel, travel_approval_number, travel_approval_doc_url, travel_approval_link, travel_budget, travel_funding_source')
    .eq('id', newsId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!news?.is_official_travel) {
    return NextResponse.json({ error: 'ไม่ใช่ข่าวเดินทาง' }, { status: 400 });
  }

  return NextResponse.json({
    viewer: viewerType,
    researcher: researcherInfo,
    sensitive: {
      travel_approval_number: news.travel_approval_number,
      travel_approval_doc_url: news.travel_approval_doc_url,
      travel_approval_link: news.travel_approval_link,
      travel_budget: news.travel_budget,
      travel_funding_source: news.travel_funding_source,
    },
  });
}
