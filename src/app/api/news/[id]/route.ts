import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdmin } from '@/lib/admin-auth';

// GET single news
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('news')
    .select(`
      *,
      news_images (id, image_url, caption, sort_order),
      researchers:author_id (title_th, first_name_th, last_name_th)
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'News not found' }, { status: 404 });
  }

  return NextResponse.json({ news: data });
}

// DELETE news
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const password = body.password ?? null;
  const accessTokenFromBody = body.access_token ?? null;

  const headerAuth = request.headers.get('authorization') || '';
  const headerToken = headerAuth.toLowerCase().startsWith('bearer ') ? headerAuth.slice(7).trim() : null;
  const auth = await checkAdmin({ password, accessToken: headerToken || accessTokenFromBody });
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PUT - update news (admin password required, body same shape as POST)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const {
    password, title, content, category, cover_image_url, images, tags, sdg_goals, author_id,
    is_official_travel, travel_purpose, travel_location, travel_start_date, travel_end_date,
    travel_approval_number, travel_approval_doc_url, travel_approval_link, travel_budget,
    travel_funding_source, travel_participants, travel_activity_type,
  } = body;

  const headerAuthPUT = request.headers.get('authorization') || '';
  const headerTokenPUT = headerAuthPUT.toLowerCase().startsWith('bearer ') ? headerAuthPUT.slice(7).trim() : null;
  const authPUT = await checkAdmin({ password, accessToken: headerTokenPUT || body.access_token || null });
  if (!authPUT.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updateData: any = {
    title,
    content,
    category: category || 'team_activity',
    cover_image_url: cover_image_url || null,
    tags: tags || [],
    sdg_goals: sdg_goals || [],
    author_id: author_id || null,
    updated_at: new Date().toISOString(),
  };

  // Travel fields — store both true and false so the user can also un-flag travel
  if (typeof is_official_travel === 'boolean') {
    updateData.is_official_travel = is_official_travel;
    if (is_official_travel) {
      updateData.travel_purpose = travel_purpose || null;
      updateData.travel_location = travel_location || null;
      updateData.travel_start_date = travel_start_date || null;
      updateData.travel_end_date = travel_end_date || null;
      updateData.travel_approval_number = travel_approval_number || null;
      updateData.travel_approval_doc_url = travel_approval_doc_url || null;
      updateData.travel_approval_link = travel_approval_link || null;
      updateData.travel_budget = travel_budget ? parseFloat(travel_budget) : null;
      updateData.travel_funding_source = travel_funding_source || null;
      updateData.travel_participants = Array.isArray(travel_participants) ? travel_participants : [];
      updateData.travel_activity_type = travel_activity_type || null;
    } else {
      // Wipe travel fields when toggling off
      updateData.travel_purpose = null;
      updateData.travel_location = null;
      updateData.travel_start_date = null;
      updateData.travel_end_date = null;
      updateData.travel_approval_number = null;
      updateData.travel_approval_doc_url = null;
      updateData.travel_approval_link = null;
      updateData.travel_budget = null;
      updateData.travel_funding_source = null;
      updateData.travel_participants = [];
      updateData.travel_activity_type = null;
    }
  }

  let { data: news, error: newsError } = await supabase
    .from('news')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  // Retry without travel fields if the column doesn't exist (migration 036 missing)
  if (newsError && (newsError.message?.includes('travel_') || newsError.message?.includes('is_official_travel') || newsError.message?.includes('schema cache'))) {
    const base: any = {
      title: updateData.title,
      content: updateData.content,
      category: updateData.category,
      cover_image_url: updateData.cover_image_url,
      tags: updateData.tags,
      sdg_goals: updateData.sdg_goals,
      author_id: updateData.author_id,
      updated_at: updateData.updated_at,
    };
    const retry = await supabase.from('news').update(base).eq('id', params.id).select().single();
    news = retry.data;
    newsError = retry.error;
  }

  if (newsError) {
    return NextResponse.json({ error: newsError.message }, { status: 500 });
  }

  // Replace images: delete existing then insert new (max 4)
  if (Array.isArray(images)) {
    await supabase.from('news_images').delete().eq('news_id', params.id);
    if (images.length > 0) {
      const rows = images.slice(0, 4).map((img: { url: string; caption?: string }, idx: number) => ({
        news_id: params.id,
        image_url: img.url,
        caption: img.caption || null,
        sort_order: idx,
      }));
      await supabase.from('news_images').insert(rows);
    }
  }

  return NextResponse.json({ news });
}
