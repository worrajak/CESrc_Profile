import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';
import { EVIDENCE_CHAIN_PROMPT_INSTRUCTIONS } from '@/lib/evidence-chain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a Thai research proposal drafting assistant for CESRU (Clean Energy System Research Unit, RMUTL).

Given:
- A grant call (agency, scope, tier, budget range, required outputs)
- A Principal Investigator (PI) profile (expertise, h-index, recent publications)
- (Optional) user hint about topic direction

Draft a concept proposal aligned to:
1. The grant call's stated scope and required outputs
2. The PI's actual expertise (DO NOT invent expertise the PI does not have)
3. Realistic clean-energy / engineering scope for Thailand

Output ONLY a single JSON object — no markdown, no commentary. Schema:

{
  "title_th": "ชื่อโครงการภาษาไทย — กระชับ ไม่เกิน 25 คำ",
  "title_en": "English title (concise, journal-ready)",
  "abstract_th": "บทคัดย่อภาษาไทย 200-300 คำ — ระบุปัญหา วิธีการ ผลที่คาดหวัง",
  "abstract_en": "English abstract 150-200 words",
  "problem_statement": "ที่มาและความสำคัญ 2-3 ย่อหน้า ระบุ research gap ของ field นี้ในประเทศไทย",
  "research_questions": ["คำถามวิจัย 1", "คำถามวิจัย 2"],
  "objectives": ["วัตถุประสงค์ 1", "วัตถุประสงค์ 2", "วัตถุประสงค์ 3"],
  "methodology": "ระเบียบวิธีวิจัย 3-5 ย่อหน้า ระบุ phase, methods, data analysis",
  "expected_outputs": ["บทความ Scopus Q1/Q2 อย่างน้อย 1 เรื่อง", "ต้นแบบเทคโนโลยี TRL 5", "ทรัพย์สินทางปัญญา 1 รายการ"],
  "expected_outcomes": ["ลดต้นทุนระบบ X ลง Y %", "เพิ่ม efficiency ของ Z"],
  "keywords": ["คำสำคัญ 1", "keyword2", "..."],
  "budget_requested": 500000,
  "duration_months": 12,
  "tier_code": "FF71-T2",
  "ai_match_score": 85,
  "ai_match_rationale": "อธิบายว่าหัวข้อนี้ตรงกับ scope ของทุน X อย่างไร PI มีความเชี่ยวชาญในด้าน Y ที่ครอบคลุม Z ของ scope",
  "budget_breakdown": {
    "personnel": 150000,
    "materials": 200000,
    "equipment": 50000,
    "travel": 30000,
    "apc_publication": 50000,
    "other": 20000
  },
  "evidence_chain": [
    {
      "claim": "ข้อความสำคัญใน problem_statement / methodology / expected_outputs ที่อ้างเป็นข้อเท็จจริง",
      "chain": [
        {
          "source": "Author et al. — Journal 2024",
          "source_type": "peer_reviewed",
          "source_url": "https://doi.org/...",
          "year": 2024,
          "credibility": "high",
          "credibility_reason": "...",
          "verification_path": "..."
        }
      ],
      "independent_corroborations": 1,
      "concerns": [],
      "suggestions": []
    }
  ]
}

RULES:
- Budget MUST fall within grant_call.budget_min and budget_max for the chosen tier.
- expected_outputs MUST satisfy grant_call.required_outputs.
- For FF71 tiers: T1 (50K-150K new researcher), T2 (200K-400K mid-career), T3 (400K-600K senior), T4 (600K-1M unit), T5 (50K-120K R2R).
- Thai language for title_th/abstract_th/problem_statement/methodology/objectives/expected_outputs/expected_outcomes.
- English language for title_en/abstract_en/keywords (mix Thai+English OK for keywords).
- ai_match_score 0-100 — be honest. If PI expertise doesn't fit grant scope well, score lower and explain.

${EVIDENCE_CHAIN_PROMPT_INSTRUCTIONS}

For proposals specifically, evidence_chain should cover at minimum:
  - 2-3 strongest claims in problem_statement (research gap, prior work, market need)
  - The methodology's key technique (cite peer-reviewed source or PI's own prior work)
  - Each numeric target in expected_outputs / expected_outcomes (cite baseline data)
Provide at least 4 evidence_chain entries for a research proposal.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { grant_call_id, pi_id, tier_code, user_hint } = body as {
      grant_call_id: string;
      pi_id: string;
      tier_code?: string;
      user_hint?: string;
    };

    if (!grant_call_id || !pi_id) {
      return NextResponse.json({ error: 'grant_call_id and pi_id required' }, { status: 400 });
    }

    // Fetch grant call
    const { data: grant, error: grantErr } = await supabase
      .from('grant_calls')
      .select('*')
      .eq('id', grant_call_id)
      .single();
    if (grantErr || !grant) {
      return NextResponse.json({ error: 'Grant call not found' }, { status: 404 });
    }

    // Fetch PI profile + recent publications
    const { data: pi, error: piErr } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en, expertise, h_index, i10_index, cited_by_count, bio_th, bio_en')
      .eq('id', pi_id)
      .single();
    if (piErr || !pi) {
      return NextResponse.json({ error: 'PI not found' }, { status: 404 });
    }

    // Try to fetch recent publications for the PI (last 5)
    let pubsContext = '';
    try {
      const { data: pubs } = await supabase
        .from('publications')
        .select('title, journal_name, year, quartile, keywords')
        .order('year', { ascending: false })
        .limit(5);
      // crude filter by researcher (we don't always have a join)
      if (pubs && pubs.length) {
        pubsContext = pubs
          .map((p, i) => `${i + 1}. ${p.title} (${p.journal_name}, ${p.year}${p.quartile ? `, ${p.quartile}` : ''})`)
          .join('\n');
      }
    } catch {}

    const grantSummary = `
GRANT CALL:
- Agency: ${grant.agency_code} (${grant.agency_name_th})
- Call: ${grant.call_code} — ${grant.call_name_th}
- Fiscal year (BE): ${grant.fiscal_year_be}
- Open: ${grant.open_date || '?'}  Close: ${grant.close_date || '?'}
- Budget: ${grant.budget_min ?? '?'} - ${grant.budget_max ?? '?'} THB
- Duration: ${grant.duration_months ?? '?'} months
- Scope: ${grant.scope_th || '(no scope)'}
- Eligibility: ${grant.eligibility_th || '(no eligibility)'}
- Conditions: ${grant.conditions_th || '(no conditions)'}
- Research areas accepted: ${(grant.research_areas || []).join(', ') || '(none)'}
- Required outputs: ${(grant.required_outputs || []).join(', ') || '(none)'}
`.trim();

    const piName =
      [pi.title_th, pi.first_name_th, pi.last_name_th].filter(Boolean).join('') ||
      [pi.first_name_en, pi.last_name_en].filter(Boolean).join(' ');

    const piSummary = `
PRINCIPAL INVESTIGATOR (PI):
- Name: ${piName}
- Position: ${pi.position_th || pi.position_en || '(unknown)'}
- Expertise: ${(pi.expertise || []).join(', ') || '(none listed)'}
- h-index: ${pi.h_index ?? '?'}  i10-index: ${pi.i10_index ?? '?'}  citations: ${pi.cited_by_count ?? '?'}
- Bio (TH): ${pi.bio_th || pi.bio_en || '(no bio)'}
${pubsContext ? `\nRecent publications context (CESRU-wide, not all by this PI):\n${pubsContext}` : ''}
`.trim();

    const hint = user_hint?.trim()
      ? `\nUSER HINT: ${user_hint.trim()}`
      : '\nNo user hint — base concept entirely on PI expertise.';

    const tierLine = tier_code ? `\nTARGET TIER: ${tier_code}` : '\nSelect the most appropriate tier yourself.';

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n${grantSummary}\n\n${piSummary}${tierLine}${hint}\n---\n\nReturn the JSON now.`;

    const result = await callAIText(fullPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error, source: result.source, model: result.model }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || {},
      source: result.source,
      model: result.model,
      grant: { id: grant.id, code: grant.call_code, agency: grant.agency_code },
      pi: { id: pi.id, name: piName },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
