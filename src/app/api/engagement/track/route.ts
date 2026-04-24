/**
 * POST /api/engagement/track
 * Anonymous engagement tracking for heatmap (PDPA-safe)
 * No IP stored, no user agent stored, no cookies set by this endpoint.
 * Optional user_id if client provides it (never required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createHash } from 'crypto';

function hashShort(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

function detectDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' | 'bot' {
  const lower = ua.toLowerCase();
  if (/bot|crawler|spider|crawling/.test(lower)) return 'bot';
  if (/tablet|ipad/.test(lower)) return 'tablet';
  if (/mobile|android|iphone|ipod/.test(lower)) return 'mobile';
  return 'desktop';
}

function extractReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type = 'page_view',
      target_type = null,
      target_id = null,
      page_path,
      user_id = null,
    } = body;

    if (!page_path) {
      return NextResponse.json({ error: 'page_path required' }, { status: 400 });
    }

    const valid = ['page_view', 'comment', 'link_click', 'scroll_deep', 'cta_click', 'share'];
    if (!valid.includes(event_type)) {
      return NextResponse.json({ error: 'invalid event_type' }, { status: 400 });
    }

    const now = new Date();
    const hour = now.getHours();
    const dow = now.getDay();
    const dateStr = now.toISOString().split('T')[0];

    // Generate session hash from IP + date + user agent hint (one-way, rotates daily)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ua = request.headers.get('user-agent') || '';
    const sessionHash = hashShort(`${ip}-${dateStr}-${ua.substring(0, 50)}`);

    // Bot filter: don't track bots
    const deviceType = detectDeviceType(ua);
    if (deviceType === 'bot') {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const referrerDomain = extractReferrerDomain(request.headers.get('referer'));

    await supabase.from('engagement_events').insert({
      event_type,
      target_type,
      target_id,
      page_path,
      hour_bucket: hour,
      day_of_week: dow,
      date_bucket: dateStr,
      session_hash: sessionHash,
      user_id,
      referrer_domain: referrerDomain,
      user_agent_type: deviceType,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Engagement track error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
