/**
 * GET /api/engagement/stats — aggregate stats for admin dashboard
 * Returns: heatmap, top pages, daily activity, comment counts
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    // Heatmap (day × hour)
    const { data: heatmap } = await supabase
      .from('v_engagement_heatmap')
      .select('*');

    // Top pages (last 30d)
    const { data: topPages } = await supabase
      .from('v_top_pages')
      .select('*')
      .limit(20);

    // Daily activity (last 30d)
    const { data: daily } = await supabase
      .from('v_daily_activity')
      .select('*')
      .limit(30);

    // Totals
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { count: totalViews } = await supabase
      .from('engagement_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'page_view')
      .gte('date_bucket', isoDate);

    const { count: totalComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    const { count: totalUsers } = await supabase
      .from('guest_users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      heatmap: heatmap || [],
      top_pages: topPages || [],
      daily: daily || [],
      totals: {
        views_30d: totalViews || 0,
        comments_total: totalComments || 0,
        users_total: totalUsers || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
