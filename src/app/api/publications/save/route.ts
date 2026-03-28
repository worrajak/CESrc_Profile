import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, publication, author_links } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check duplicate DOI
  if (publication.doi) {
    const { data: existing } = await supabase
      .from('publications')
      .select('id, title')
      .eq('doi', publication.doi)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        error: `DOI already exists: "${existing.title}"`,
        existing_id: existing.id,
      }, { status: 409 });
    }
  }

  const pubId = randomUUID();

  const { error: pubError } = await supabase
    .from('publications')
    .insert({
      id: pubId,
      title: publication.title,
      pub_type: publication.pub_type || 'journal_international',
      status: publication.status || 'published',
      journal_name: publication.journal_name || null,
      volume: publication.volume || null,
      issue: publication.issue || null,
      pages: publication.pages || null,
      year: publication.year ? parseInt(publication.year) : null,
      doi: publication.doi || null,
      authors_raw: publication.authors_raw || '',
      scopus_indexed: publication.scopus_indexed || false,
      wos_indexed: publication.wos_indexed || false,
      keywords: publication.keywords?.length > 0 ? publication.keywords : null,
    });

  if (pubError) {
    return NextResponse.json({ error: pubError.message }, { status: 500 });
  }

  // Insert author links
  if (author_links && author_links.length > 0) {
    const rows = author_links.map((link: any) => ({
      publication_id: pubId,
      researcher_id: link.researcher_id,
      author_role: link.author_role || 'co_author',
      author_order: link.author_order || 1,
      is_corresponding: link.is_corresponding || false,
    }));

    const { error: authError } = await supabase
      .from('publication_authors')
      .insert(rows);

    if (authError) {
      return NextResponse.json({ error: `Publication saved but author linking failed: ${authError.message}`, id: pubId }, { status: 500 });
    }
  }

  return NextResponse.json({ id: pubId, message: 'Publication saved successfully' });
}
