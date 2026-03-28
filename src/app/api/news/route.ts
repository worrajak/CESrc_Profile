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
  const { password, title, content, category, cover_image_url, images } = body;

  // Verify admin
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Insert news
  const { data: news, error: newsError } = await supabase
    .from('news')
    .insert({
      title,
      content,
      category: category || 'team_activity',
      cover_image_url: cover_image_url || null,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (newsError) {
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
