/**
 * /api/admin/researchers/sync-executives
 * ──────────────────────────────────────
 * Scrapes https://www.rmutl.ac.th/structure/executive, parses ~25 executive
 * cards (name + Thai role + portrait URL), fuzzy-matches each to a row in
 * the researchers table by Thai first+last name, and returns the proposed
 * matches.
 *
 * GET  ?preview=1 → return the proposed matches (no DB write). The admin UI
 *                   shows these in a table with confirm checkboxes.
 * POST           → body { matches: [{ researcher_id, role, photo_url,
 *                   source_url }] } applies each one via UPDATE. Requires
 *                   admin auth.
 *
 * Reads use the anon client; writes go through the service role client so
 * RLS on researchers does not block the update.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authorizeAdminRequest } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

const RMUTL_EXEC_URL = 'https://www.rmutl.ac.th/structure/executive';

// ── HTML helpers ─────────────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#?[0-9a-z]+;/gi, (m) => {
      const map: Record<string, string> = {
        '&quot;': '"', '&#34;': '"', '&apos;': "'", '&#39;': "'",
      };
      return map[m] || ' ';
    });
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// ── Name normalisation for fuzzy match ───────────────────────────────────
// Strip every known title-prefix form from the START of the name string,
// iteratively, until no more match. Handles:
//   • title glued to first name: "ผู้ช่วยศาสตราจารย์พิสิษฐ์ วิมลฯ"
//   • title + space + ดร.: "ผู้ช่วยศาสตราจารย์ ดร.วรจักร์ เมืองใจ"
//   • typo on the live page: "ผู้ช่วยศาสตราจาย์ ดร.ศิรประภา ชัยเนตร"
//                                          ↑ missing ร
//
// The list is ordered LONGEST-FIRST so that "ผู้ช่วยศาสตราจารย์ ดร." is
// tried before plain "ผู้ช่วยศาสตราจารย์" — otherwise the leading title
// would be stripped but "ดร." would remain glued to the first name.
const TITLE_STRINGS = [
  'ศาสตราจารย์ ดร.',
  'รองศาสตราจารย์ ดร.',
  'ผู้ช่วยศาสตราจารย์ ดร.',
  'ผู้ช่วยศาสตราจาย์ ดร.', // typo seen on rmutl.ac.th — missing ร
  'อาจารย์ ดร.',
  'ผู้ช่วยศาสตราจารย์',
  'ผู้ช่วยศาสตราจาย์', // typo
  'รองศาสตราจารย์',
  'ศาสตราจารย์',
  'อาจารย์',
  'ผศ.ดร.',
  'รศ.ดร.',
  'ศ.ดร.',
  'ผศ.',
  'รศ.',
  'ศ.',
  'ดร.',
  'อ.',
  'นาย ',
  'นาง ',
  'นางสาว ',
];

function normalizeName(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of TITLE_STRINGS) {
      if (s.startsWith(p)) {
        s = s.slice(p.length).trim();
        changed = true;
        break;
      }
    }
  }
  return s.replace(/\s+/g, ' ').trim();
}

// ── Scraper ──────────────────────────────────────────────────────────────
type ParsedExec = {
  full_name_raw: string;     // raw name as it appears on page
  full_name_norm: string;    // title-stripped, normalised
  role: string;              // Thai role text
  photo_url: string;         // high-res original portrait
  panel_html: string;        // for debugging
};

function parseExecPage(html: string): ParsedExec[] {
  const execs: ParsedExec[] = [];

  // Anchor on each <a id="post_thumbnail" ... href="<photo>" ... title="<name>">
  // — there is exactly one per executive card (verified by grepping the live
  // page: 25 anchors → 25 executives). For each anchor, look forward in the
  // HTML for the bold name <p> and the role <p>. This is far more robust than
  // trying to balance nested <div> elements with a single regex.
  const anchorRe =
    /<a[^>]*id="post_thumbnail"[^>]*href="([^"]+\.(?:jpe?g|png|webp))"[^>]*title="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const photo_url = m[1];
    const titleAttr = stripHtml(m[2]);

    // Forward window of ~2 KB is plenty — name and role sit a few lines below
    // the photo anchor in every card.
    const offset = m.index + m[0].length;
    const win = html.slice(offset, offset + 2000);

    // Name — the first <p class="text-center kanit"> with bold styling.
    const nameMatch = win.match(
      /<p class="text-center kanit"[^>]*font-weight:\s*bold[^>]*>([\s\S]*?)<\/p>/i,
    );
    const nameInPanel = nameMatch ? stripHtml(nameMatch[1]) : '';

    // Role — the next <p class="text-center kanit"> with min-height 24px.
    const roleMatch = win.match(
      /<p class="text-center kanit"[^>]*min-height:\s*24px[^>]*>([\s\S]*?)<\/p>/i,
    );
    const role = roleMatch ? stripHtml(roleMatch[1]) : '';

    // Prefer the in-panel name (richer formatting) but fall back to the
    // anchor's title attribute if the <p> wasn't found.
    const full_name_raw = nameInPanel || titleAttr;
    if (!full_name_raw) continue;

    execs.push({
      full_name_raw,
      full_name_norm: normalizeName(full_name_raw),
      role,
      photo_url,
      panel_html: win.slice(0, 400),
    });
  }
  return execs;
}

// ── Matcher ──────────────────────────────────────────────────────────────
type Researcher = {
  id: string;
  first_name_th: string;
  last_name_th: string;
  title_th: string | null;
  avatar_url: string | null;
  executive_role_th: string | null;
};

type MatchProposal = {
  rmutl_name: string;
  rmutl_role: string;
  rmutl_photo_url: string;
  researcher_id: string | null;
  researcher_name: string | null;
  has_existing_role: boolean;
  has_existing_avatar: boolean;
  confidence: 'exact' | 'first+last' | 'last_only' | 'none';
};

function matchExecs(execs: ParsedExec[], researchers: Researcher[]): MatchProposal[] {
  return execs.map<MatchProposal>((e) => {
    let best: Researcher | undefined;
    let confidence: MatchProposal['confidence'] = 'none';

    const normParts = e.full_name_norm.split(/\s+/).filter(Boolean);
    // Pattern: "<first> <last>" — try first+last exact match.
    for (const r of researchers) {
      const firstNorm = normalizeName(r.first_name_th);
      const lastNorm = normalizeName(r.last_name_th);

      // Strongest: full string contains both first and last
      if (
        e.full_name_norm.includes(firstNorm) &&
        e.full_name_norm.includes(lastNorm) &&
        firstNorm.length >= 2 &&
        lastNorm.length >= 2
      ) {
        best = r;
        confidence = 'first+last';
        // If the entire normalized strings match exactly bump to exact
        if (`${firstNorm} ${lastNorm}` === e.full_name_norm) confidence = 'exact';
        break;
      }
    }
    if (!best) {
      // Fallback: last name only (less reliable)
      for (const r of researchers) {
        const lastNorm = normalizeName(r.last_name_th);
        if (lastNorm.length >= 3 && e.full_name_norm.includes(lastNorm)) {
          best = r;
          confidence = 'last_only';
          break;
        }
      }
    }

    return {
      rmutl_name: e.full_name_raw,
      rmutl_role: e.role,
      rmutl_photo_url: e.photo_url,
      researcher_id: best?.id || null,
      researcher_name: best ? `${best.title_th || ''}${best.first_name_th} ${best.last_name_th}` : null,
      has_existing_role: !!best?.executive_role_th,
      has_existing_avatar: !!best?.avatar_url,
      confidence,
    };
  });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local so the sync can update researchers.',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─────────────────────────────────────────────────────────────────────────
// GET ?preview=1 — scrape + match, return proposed matches without writing
// ─────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('preview') !== '1') {
    return NextResponse.json({ error: 'Use GET ?preview=1 or POST.' }, { status: 400 });
  }
  const admin = await authorizeAdminRequest(req);
  if (!admin.authorized || !admin.role) {
    return NextResponse.json({ error: 'Admin auth required.' }, { status: 403 });
  }

  try {
    const res = await fetch(RMUTL_EXEC_URL, {
      headers: { 'User-Agent': 'CESRU-Admin-Sync/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `RMUTL page returned HTTP ${res.status}` },
        { status: 502 },
      );
    }
    const html = await res.text();
    const execs = parseExecPage(html);
    if (execs.length === 0) {
      return NextResponse.json(
        { error: 'No executive cards parsed — the page structure may have changed.' },
        { status: 502 },
      );
    }

    const { data: researchersData } = await supabase
      .from('researchers')
      .select('id, first_name_th, last_name_th, title_th, avatar_url, executive_role_th');

    const researchers = (researchersData || []) as Researcher[];
    const proposals = matchExecs(execs, researchers);

    return NextResponse.json({
      source_url: RMUTL_EXEC_URL,
      total_execs: execs.length,
      matched: proposals.filter((p) => p.researcher_id).length,
      proposals,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync failed' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST — apply the confirmed matches
// body: { matches: [{ researcher_id, role, photo_url, source_url }] }
// ─────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await authorizeAdminRequest(req);
  if (!admin.authorized || !admin.role) {
    return NextResponse.json({ error: 'Admin auth required.' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const matches: any[] = Array.isArray(body?.matches) ? body.matches : [];
  if (matches.length === 0) {
    return NextResponse.json({ error: 'No matches provided.' }, { status: 400 });
  }

  try {
    const client = getAdminClient();
    const now = new Date().toISOString();
    const results: { researcher_id: string; ok: boolean; error?: string }[] = [];

    for (const m of matches) {
      if (!m?.researcher_id || !m?.role) {
        results.push({
          researcher_id: m?.researcher_id || '(unknown)',
          ok: false,
          error: 'Missing researcher_id or role',
        });
        continue;
      }
      const { error: upErr } = await client
        .from('researchers')
        .update({
          executive_role_th: m.role,
          executive_unit: 'RMUTL',
          executive_photo_url: m.photo_url || null,
          executive_source_url: m.source_url || RMUTL_EXEC_URL,
          executive_synced_at: now,
        })
        .eq('id', m.researcher_id);
      results.push({
        researcher_id: m.researcher_id,
        ok: !upErr,
        error: upErr?.message,
      });
    }

    return NextResponse.json({
      applied: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Apply failed' }, { status: 500 });
  }
}
