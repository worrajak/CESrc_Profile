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
function buildPrompt(kpi: any, activity: any[]) {
  // Bucket activity by kind so the AI can lead with the most credible
  // (and most informative for collaborators) signals.
  //   Primary   : grants + publications  — funded work + peer-reviewed output
  //   Secondary : patents + innovations  — applied/IP outputs (mention briefly)
  const primaryKinds = new Set(['grant', 'publication']);
  const primary = activity.filter((a) => primaryKinds.has(a.kind));
  const secondary = activity.filter((a) => !primaryKinds.has(a.kind));

  return `You are summarising the current state of CESRU (Clean Energy System Research Unit,
Rajamangala University of Technology Lanna — RMUTL) for the public homepage Hero.

AUDIENCE: visiting academic peers and potential collaborators — they want to know
"what is CESRU doing right now that's notable" before reaching out.

WRITE STYLE:
- Professional but warm. Avoid generic corporate filler ("driving innovation", "world-class").
- Be specific. Mention real items from the data — not generalities.
- 3-5 sentences in Thai (summary_th) AND 3-5 sentences in English (summary_en).
- No emojis.

NARRATIVE PRIORITY (important):
- LEAD with grants and publications. These are the strongest signals of active
  research depth — funded projects + peer-reviewed output — and what
  collaborators want to see first.
- MENTION patents and innovations briefly, as supporting evidence of translation/
  impact. Do not lead with them; do not list more than 1-2 across both kinds.
- If primary data is sparse, it is OK to lean on KPI totals instead of inventing
  notable activity from secondary kinds.

DATA — KPI snapshot (computed at ${kpi.computed_at || 'now'}):
${JSON.stringify(kpi, null, 2)}

DATA — PRIMARY activity (grants + publications, lead with these — sorted by occurred_at DESC):
${JSON.stringify(primary.slice(0, 8), null, 2)}

DATA — SECONDARY activity (patents + innovations, mention briefly — sorted by occurred_at DESC):
${JSON.stringify(secondary.slice(0, 4), null, 2)}

OUTPUT — single JSON object inside one pair of curly braces, no markdown:
{
  "summary_th": "ย่อหน้าภาษาไทย 3-5 ประโยค",
  "summary_en": "English paragraph, 3-5 sentences",
  "evidence_chain": [ /* one or more EvidenceChain objects, see below */ ]
}

EVIDENCE CHAIN REQUIREMENTS:
- Every numeric claim ("47 publications", "บทความ Q1 จำนวน X ฉบับ") MUST have an
  evidence_chain entry pointing to source_type "primary_research",
  source "cesru_kpi_summary view (CESRU internal database)", and
  verification_path "SELECT * FROM cesru_kpi_summary".
- Every reference to a specific activity item (publication/patent/grant/innovation)
  MUST point to its row: source = "kind:ref_id title", source_url = link_path,
  source_type matching the kind (publication → peer_reviewed, patent → patent,
  grant → gov_data, innovation → patent).
- Credibility for own-DB claims: "high" (verifiable by re-querying).
- DO NOT invent achievements not present in the data above.
- If KPI shows publications_total: 47, write "47 ผลงาน" not "หลายสิบฉบับ".
- If activity is empty for a kind, do not claim items in that kind.

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
  const [kpiRes, activityRes] = await Promise.all([
    supabase.from('cesru_kpi_summary').select('*').maybeSingle(),
    supabase
      .from('cesru_activity_stream')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(10),
  ]);

  if (kpiRes.error) {
    throw new Error(`KPI view query failed: ${kpiRes.error.message}`);
  }
  if (activityRes.error) {
    throw new Error(`Activity view query failed: ${activityRes.error.message}`);
  }

  const kpi = kpiRes.data || {};
  const activity = activityRes.data || [];

  const result = await callAIText(buildPrompt(kpi, activity));
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
