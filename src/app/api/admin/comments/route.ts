/**
 * GET /api/admin/comments — list all comments (admin only)
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, content, target_type, target_id, created_at, is_deleted,
      guest_user:guest_users!user_id (display_name, email, user_type)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}
