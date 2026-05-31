/**
 * /api/homepage/executive-summary
 * ───────────────────────────────
 * Returns an AI-generated executive summary of CESRU's current state for
 * the homepage Hero section. Backed by 24h cache in `cesru_homepage_cache`.
 *
 * GET  → read cache if fresh, else regenerate; falls back to stale cache
 *        on AI failure (graceful degradation).
 * GET ?refresh=1 → bypass cache, force regeneration. Useful for admins
 *        after publishing a notable result.
 *
 * Data sources (from migration 050):
 *   - cesru_kpi_summary       (single-row view: hero KPIs + context)
 *   - cesru_activity_stream   (union view: recent updates across 4 tables)
 *
 * Writes use the service role key (bypasses RLS) — set
 * SUPABASE_SERVICE_ROLE_KEY in .env.local. Reads use the anon key.
 *
 * Response shape:
 *   { summary_th, summary_en, evidence_chain, source, model,
 *     kpi_snapshot, generated_at, cached, stale? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { callAIText } from '@/lib/ai-provider';
import { EVIDENCE_CHAIN_PROMPT_INSTRUCTIONS } from '@/lib/evidence-chain';
import { authorizeAdminRequest } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CACHE_KEY = 'executive_summary';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ─────────────────────────────────────────────────────────
// CM108 local-news fetcher
// ─────────────────────────────────────────────────────────
// Pulls latest Chiang Mai headlines so the second paragraph of the
// executive summary can weave the unit's research expertise into
// current local context (rainy season → IoT water management, etc).
//
// In-memory cache to avoid hitting CM108 on every regeneration.
const CM108_RSS = 'https://www.cm108.com/w/?feed=rss2';
const CM108_CACHE_TTL_MS = 60 * 60 * 1000; // 1h
type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  categories: string[];
};
let cm108Cache: { ts: number; items: NewsItem[] } | null = null;

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchCM108News(): Promise<NewsItem[]> {
  if (cm108Cache && Date.now() - cm108Cache.ts < CM108_CACHE_TTL_MS) {
    return cm108Cache.items;
  }
  try {
    const res = await fetch(CM108_RSS, {
      headers: { 'User-Agent': 'CESRU-Homepage/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Split into items (each <item> ... </item>) and extract fields via regex.
    // Quick & dirty parsing — RSS is forgiving enough for this.
    const items: NewsItem[] = [];
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const block of itemBlocks.slice(0, 15)) {
      const title = stripHtml(
        (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [, ''])[1],
      );
      const link = (block.match(/<link>([^<]+)<\/link>/) || [, ''])[1].trim();
      const pubDate = (block.match(/<pubDate>([^<]+)<\/pubDate>/) || [, ''])[1].trim();
      const description = stripHtml(
        (block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [, ''])[1],
      ).slice(0, 300);
      const catRegex = /<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g;
      const categories: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = catRegex.exec(block)) !== null && categories.length < 5) {
        const c = m[1].trim();
        if (c) categories.push(c);
      }
      if (title) items.push({ title, link, pubDate, description, categories });
    }

    cm108Cache = { ts: Date.now(), items };
    return items;
  } catch {
    return cm108Cache?.items || [];
  }
}

// ─────────────────────────────────────────────────────────
// Service-role client (server-only, bypasses RLS for cache writes)
// ─────────────────────────────────────────────────────────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (uncomment the existing line) so this route can write to the cache table.',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────
function buildPrompt(kpi: any, activity: any[], news: NewsItem[]) {
  // Bucket activity by kind so the AI can lead with the most credible
  // (and most informative for collaborators) signals.
  //   Primary   : grants + publications  — funded work + peer-reviewed output
  //   Secondary : patents + innovations  — applied/IP outputs (mention briefly)
  const primaryKinds = new Set(['grant', 'publication']);
  const primary = activity.filter((a) => primaryKinds.has(a.kind));
  const secondary = activity.filter((a) => !primaryKinds.has(a.kind));

  return `You are writing the homepage Hero summary for CESRU (Clean Energy System Research Unit,
Rajamangala University of Technology Lanna — RMUTL).

AUDIENCE: visiting academic peers and potential collaborators — they want to know
(a) what CESRU is doing right now that's notable, and (b) how the unit's expertise
applies to current local events in Chiang Mai.

CESRU's research expertise (use to draw connections):
  - IoT / sensor networks
  - Clean energy systems (solar PV, energy storage, microgrid)
  - EV chargers, smart grid
  - Power quality, energy audit
  - Materials & advanced computing applications
  - Blockchain / Web3 for power systems (recent)

OUTPUT — single JSON object, no markdown:
{
  "summary_th": "<Paragraph 1>\\n\\n<Paragraph 2>",
  "summary_en": "<Paragraph 1>\\n\\n<Paragraph 2>",
  "evidence_chain": [ /* EvidenceChain objects per the instructions below */ ]
}

──────────────────────────────────────────────────────────
PARAGRAPH 1 — Unit overview (3-5 sentences each language)
──────────────────────────────────────────────────────────
Write a focused snapshot of what CESRU is doing now.
- LEAD with grants and publications. These are the strongest signals — funded
  work + peer-reviewed output — and what collaborators want to see first.
- MENTION patents/innovations briefly, max 1-2 items across both kinds.
- Be specific. Mention real items from the data — not generalities.
- If primary data is sparse, lean on KPI totals instead of inventing items.
- No emojis. Professional but warm tone.

──────────────────────────────────────────────────────────
PARAGRAPH 2 — Research-news bridge (300+ words each language)
──────────────────────────────────────────────────────────
THIS IS THE NEW PARAGRAPH. Read the latest Chiang Mai news headlines below
and weave 3-5 of them into a substantive narrative showing HOW CESRU's
expertise (IoT, clean energy, sensor networks, EV, energy audit, etc) could
contribute to those local issues.

EDITORIAL VOICE — important:
- Refer to events NATURALLY, in your own words, as part of the unit's
  perspective on what's happening locally. E.g. "ในช่วงที่เชียงใหม่กำลัง
  เข้าสู่ฤดูฝน…", "การระบาดของไข้เลือดออกในหลายอำเภอ…", "ภัยจาก
  ซูเปอร์เอลนีโญที่คาดการณ์ปีนี้…"
- DO NOT name "CM108" or any other news outlet INSIDE the paragraph.
- DO NOT introduce events with phrases like "ข่าวจาก…" or "รายงานจาก…".
  Just write about the situation, like a unit perspective piece.
- Sources are tracked separately in evidence_chain — the UI shows them as
  a small "ข่าวที่อ้างอิง" credit footer with clickable links. So you
  don't need to credit anyone inline; just write naturally.

Goals of paragraph 2:
- Make research feel TANGIBLE — name specific local events (in your own
  words) + name specific CESRU capabilities that could apply.
- Suggest research questions, service offerings, or collaborations the unit
  could pursue based on the news.
- Reference SDGs where they naturally fit (climate, water, public health,
  sustainable communities — don't shoehorn them).
- Mention up to 5 distinct news topics, in flowing prose (NOT bullet points).
- Aim for 300-450 words in Thai, similar length in English.

EXAMPLES of the kind of bridge the user wants:
- "ฝนเริ่มตกมากขึ้น" → IoT sensor networks + flood-prediction models can
  help local authorities; CESRU's sensor expertise is directly applicable.
- "ประเพณีเตียวขึ้นดอย" → SDG 12 (responsible consumption) + waste-reduction
  tech for mass events.
- "แผนที่คาดการณ์น้ำท่วม" → how data layers can be combined with the unit's
  field deployments for better disaster response.
- "เอลนีโญ / ภัยแล้ง" → clean energy + water-energy nexus + sensor-based
  irrigation.
- "ไข้เลือดออก / โรคระบาด" → environmental sensor data → epidemiology models.

──────────────────────────────────────────────────────────
DATA — KPI snapshot (computed at ${kpi.computed_at || 'now'}):
${JSON.stringify(kpi, null, 2)}

DATA — PRIMARY activity (grants + publications, lead with these — sorted by occurred_at DESC):
${JSON.stringify(primary.slice(0, 8), null, 2)}

DATA — SECONDARY activity (patents + innovations, mention briefly — sorted by occurred_at DESC):
${JSON.stringify(secondary.slice(0, 4), null, 2)}

DATA — Latest CM108 Chiang Mai news (use 3-5 in paragraph 2):
${JSON.stringify(news.slice(0, 12), null, 2)}

──────────────────────────────────────────────────────────
EVIDENCE CHAIN REQUIREMENTS
──────────────────────────────────────────────────────────
- Every numeric claim about CESRU ("209 publications", "5.1 h-index") MUST
  have an evidence_chain entry pointing to source_type "primary_research",
  source "cesru_kpi_summary view (CESRU internal database)",
  verification_path "SELECT * FROM cesru_kpi_summary".
- Every specific activity item cited (publication/patent/grant/innovation)
  MUST point to its row: source = "kind:ref_id title", source_url = link_path,
  source_type matching the kind (publication → peer_reviewed, patent →
  patent, grant → gov_data, innovation → patent).
- Every news item referenced in paragraph 2 (even though not named inline)
  MUST have an evidence_chain entry so the credit footer can show it:
    source       = the article's title (NOT the outlet name)
    source_url   = the article link
    source_type  = "media"
    credibility  = "low"
    credibility_reason = "Local Chiang Mai news outlet — useful for
                         context but not a primary source for technical claims".
  The UI extracts every evidence_chain entry where source_type='media' and
  renders them as a small "ข่าวที่อ้างอิง" credit footer with clickable links.
- DO NOT invent achievements, news, or news details not present above.
- If KPI shows publications_total: 209, write "209 ผลงาน" not "หลายร้อย".

${EVIDENCE_CHAIN_PROMPT_INSTRUCTIONS}
`;
}

// ─────────────────────────────────────────────────────────
// Generate (read data → call AI → return payload)
// ─────────────────────────────────────────────────────────
async function generate(): Promise<{
  summary_th: string;
  summary_en: string;
  evidence_chain: any[];
  source: string;
  model: string;
  kpi_snapshot: any;
}> {
  const [kpiRes, activityRes, news] = await Promise.all([
    supabase.from('cesru_kpi_summary').select('*').maybeSingle(),
    supabase
      .from('cesru_activity_stream')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(10),
    fetchCM108News(),
  ]);

  if (kpiRes.error) {
    throw new Error(`KPI view query failed: ${kpiRes.error.message}`);
  }
  if (activityRes.error) {
    throw new Error(`Activity view query failed: ${activityRes.error.message}`);
  }

  const kpi = kpiRes.data || {};
  const activity = activityRes.data || [];

  const result = await callAIText(buildPrompt(kpi, activity, news || []));
  if (result.error || !result.data) {
    throw new Error(result.error || 'AI returned no data');
  }

  const data = result.data as any;
  return {
    summary_th: String(data.summary_th || '').trim(),
    summary_en: String(data.summary_en || '').trim(),
    evidence_chain: Array.isArray(data.evidence_chain) ? data.evidence_chain : [],
    source: result.source,
    model: result.model,
    kpi_snapshot: kpi,
  };
}

// ─────────────────────────────────────────────────────────
// GET — read cache → maybe regenerate → respond
// ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const refreshRequested = url.searchParams.get('refresh') === '1';

  // Force-refresh is admin-only — keeps random visitors from running up AI cost
  let force = false;
  if (refreshRequested) {
    const admin = await authorizeAdminRequest(req);
    if (!admin.authorized || !admin.role) {
      return NextResponse.json(
        { error: 'Force refresh requires admin auth.' },
        { status: 403 },
      );
    }
    force = true;
  }

  // 1) Read existing cache (anon-readable per RLS)
  const { data: cached } = await supabase
    .from('cesru_homepage_cache')
    .select('*')
    .eq('id', CACHE_KEY)
    .maybeSingle();

  const cacheValid =
    cached && cached.expires_at && new Date(cached.expires_at).getTime() > Date.now();

  if (!force && cacheValid && cached.summary_th) {
    return NextResponse.json({
      summary_th: cached.summary_th,
      summary_en: cached.summary_en,
      evidence_chain: cached.evidence_chain || [],
      source: cached.source,
      model: cached.model,
      kpi_snapshot: cached.kpi_snapshot,
      generated_at: cached.generated_at,
      cached: true,
    });
  }

  // 2) Regenerate
  try {
    const fresh = await generate();
    const now = new Date();
    const expires = new Date(now.getTime() + CACHE_TTL_MS);

    try {
      const admin = getAdminClient();
      const { error: upsertErr } = await admin.from('cesru_homepage_cache').upsert(
        {
          id: CACHE_KEY,
          summary_th: fresh.summary_th,
          summary_en: fresh.summary_en,
          evidence_chain: fresh.evidence_chain,
          source: fresh.source,
          model: fresh.model,
          kpi_snapshot: fresh.kpi_snapshot,
          generated_at: now.toISOString(),
          expires_at: expires.toISOString(),
        },
        { onConflict: 'id' },
      );
      if (upsertErr) {
        // Log but don't fail — we still have a fresh summary to return
        console.warn('[executive-summary] cache upsert failed:', upsertErr.message);
      }
    } catch (cacheErr: any) {
      // Service role key missing or other config issue — log and continue.
      // The user still gets a fresh response; only the caching is skipped.
      console.warn('[executive-summary] cache write skipped:', cacheErr.message);
    }

    return NextResponse.json({
      ...fresh,
      generated_at: now.toISOString(),
      cached: false,
    });
  } catch (e: any) {
    // 3) Graceful fallback — serve stale cache if available
    if (cached && cached.summary_th) {
      return NextResponse.json({
        summary_th: cached.summary_th,
        summary_en: cached.summary_en,
        evidence_chain: cached.evidence_chain || [],
        source: cached.source,
        model: cached.model,
        kpi_snapshot: cached.kpi_snapshot,
        generated_at: cached.generated_at,
        cached: true,
        stale: true,
        warning: `Regeneration failed: ${e.message}. Serving stale cache.`,
      });
    }
    return NextResponse.json(
      { error: e.message || 'Generation failed and no cache available' },
      { status: 503 },
    );
  }
}
