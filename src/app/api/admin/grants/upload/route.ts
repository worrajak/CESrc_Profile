import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const password = formData.get('password') as string;
  const folder = (formData.get('folder') as string) || 'grants';

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 50);
  const filename = `${folder}/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Try uploading to 'documents' bucket first, fallback to 'images'
  let bucketName = 'documents';
  let { error } = await supabase.storage
    .from(bucketName)
    .upload(filename, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: false,
    });

  // If documents bucket doesn't exist, use images bucket
  if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
    bucketName = 'images';
    const result = await supabase.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      });
    error = result.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl, bucket: bucketName });
}
