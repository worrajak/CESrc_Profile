/**
 * DELETE /api/admin/comments/[id] — soft delete a comment (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authorizeAdminRequest } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await authorizeAdminRequest(request);
  if (!admin.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const { error } = await supabase
    .from('comments')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: 'admin',
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
