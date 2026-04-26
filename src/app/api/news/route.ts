import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - list news
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  let query = supabase
    .from('news')
    .select(`
      *,
      news_images (id, image_url, caption, sort_order),
      researchers:author_id (title_th, first_name_th, last_name_th)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ news: data });
}

// POST - create news (requires admin password)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    password, title, content, category, cover_image_url, images, tags, sdg_goals,
    author_id,
    // Travel fields
    is_official_travel,
    travel_purpose,
    travel_location,
    travel_start_date,
    travel_end_date,
    travel_approval_number,
    travel_approval_doc_url,
    travel_approval_link,
    travel_budget,
    travel_funding_source,
    travel_participants,
    travel_activity_type,
  } = body;

  // Verify admin
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const insertData: any = {
    title,
    content,
    category: category || 'team_activity',
    cover_image_url: cover_image_url || null,
    tags: tags || [],
    sdg_goals: sdg_goals || [],
    is_published: true,
    published_at: new Date().toISOString(),
  };

  if (author_id) insertData.author_id = author_id;

  // Travel fields (only if is_official_travel is true)
  if (is_official_travel) {
    insertData.is_official_travel = true;
    insertData.travel_purpose = travel_purpose || null;
    insertData.travel_location = travel_location || null;
    insertData.travel_start_date = travel_start_date || null;
    insertData.travel_end_date = travel_end_date || null;
    insertData.travel_approval_number = travel_approval_number || null;
    insertData.travel_approval_doc_url = travel_approval_doc_url || null;
    insertData.travel_approval_link = travel_approval_link || null;
    insertData.travel_budget = travel_budget ? parseFloat(travel_budget) : null;
    insertData.travel_funding_source = travel_funding_source || null;
    insertData.travel_participants = Array.isArray(travel_participants) ? travel_participants : [];
    insertData.travel_activity_type = travel_activity_type || null;
  }

  // Insert news — with retry if travel columns don't exist (migration 036 not run)
  let { data: news, error: newsError } = await supabase
    .from('news')
    .insert(insertData)
    .select()
    .single();

  if (newsError) {
    // If error mentions a travel column doesn't exist → retry without travel fields
    const msg = newsError.message || '';
    if (msg.includes('is_official_travel') || msg.includes('travel_') || msg.includes('schema cache')) {
      // Strip all travel fields and retry
      const baseData: any = {
        title: insertData.title,
        content: insertData.content,
        category: insertData.category,
        cover_image_url: insertData.cover_image_url,
        tags: insertData.tags,
        sdg_goals: insertData.sdg_goals,
        is_published: insertData.is_published,
        published_at: insertData.published_at,
      };
      if (insertData.author_id) baseData.author_id = insertData.author_id;

      const retry = await supabase
        .from('news')
        .insert(baseData)
        .select()
        .single();

      if (retry.error) {
        return NextResponse.json({
          error: retry.error.message,
          hint: 'อาจต้องรัน migration 036_news_travel_workload.sql ใน Supabase',
        }, { status: 500 });
      }

      return NextResponse.json({
        news: retry.data,
        warning: is_official_travel
          ? 'ข่าวถูกบันทึก แต่ข้อมูลการเดินทางไม่ถูกบันทึก — ต้องรัน migration 036 ใน Supabase ก่อน'
          : undefined,
      });
    }
    return NextResponse.json({ error: newsError.message }, { status: 500 });
  }

  // Insert images if provided
  if (images && images.length > 0) {
    const imageRows = images.slice(0, 4).map((img: { url: string; caption?: string }, idx: number) => ({
      news_id: news.id,
      image_url: img.url,
      caption: img.caption || null,
      sort_order: idx,
    }));

    await supabase.from('news_images').insert(imageRows);
  }

  return NextResponse.json({ news });
}
