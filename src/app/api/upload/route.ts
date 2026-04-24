import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const password = formData.get('password') as string;
  const folder = (formData.get('folder') as string) || 'news';
  const typeHint = (formData.get('type') as string) || '';

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Determine bucket by file type
  const isDocument =
    typeHint === 'document' ||
    file.type === 'application/pdf' ||
    file.type.includes('word') ||
    file.type.includes('spreadsheet') ||
    file.type.includes('presentation');

  const bucket = isDocument ? 'documents' : 'images';

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    // Fallback: try 'images' bucket if 'documents' doesn't exist
    if (isDocument) {
      const { error: fallbackError } = await supabase.storage
        .from('images')
        .upload(filename, buffer, { contentType: file.type, upsert: false });
      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(filename);
      return NextResponse.json({ url: urlData.publicUrl, bucket: 'images' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl, bucket });
}
