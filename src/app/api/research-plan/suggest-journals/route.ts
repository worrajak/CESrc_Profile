import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a publication strategist for CESRU (Clean Energy System Research Unit, RMUTL).

Given a drafted research concept proposal, suggest 4-6 target journals spanning multiple quartiles (Q1 to Q4 / TCI) so the team has options. Include open-access (gold/diamond) options with APC estimates.

Output ONLY a JSON object — no markdown:

{
  "targets": [
    {
      "journal_name": "Applied Energy",
      "publisher": "Elsevier",
      "issn": "0306-2619",
      "homepage_url": "https://...",
      "scopus_indexed": true,
      "wos_indexed": true,
      "tci_tier": null,
      "quartile": "Q1",
      "impact_factor": 11.2,
      "is_open_access": true,
      "oa_model": "hybrid",
      "apc_amount_usd": 3000,
      "apc_amount_thb": 105000,
      "fee_waiver": false,
      "ai_rationale": "Top journal in clean energy; matches PI's prior publications and the EV/grid scope. APC high but Hybrid option keeps subscription route open.",
      "research_gap": "ระบุ gap ที่ paper นี้จะปิดในวงการ",
      "scope_match_score": 92,
      "priority": 1
    },
    ...
  ],
  "budget_impact": {
    "recommended_apc_reserve_thb": 80000,
    "rationale": "เลือก mix Q1 + Q3 (OA fee waivers possible) — โดยเฉลี่ย ~80K THB"
  }
}

RULES:
- Mix tiers: at least one Q1/Q2 ambitious + one Q3/Q4 safer + one TCI tier-1 (Thai journal).
- For Thailand-affiliated authors, Elsevier/Wiley often grant 20-30% APC discount.
- APC: realistic 2026 values — Q1 OA $2500-$4000, Q2 $1500-$2500, Q3 $800-$1500, Diamond/Society $0-$500.
- Convert USD → THB at ~35 THB/USD.
- scope_match_score 0-100 — be brutally honest.
- priority: 1 (first choice) to 6.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposal_id } = body as { proposal_id: string };

    if (!proposal_id) {
      return NextResponse.json({ error: 'proposal_id required' }, { status: 400 });
    }

    const { data: proposal, error: pErr } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposal_id)
      .single();
    if (pErr || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const summary = `
PROPOSAL:
Title (TH): ${proposal.title_th}
Title (EN): ${proposal.title_en || '—'}
Abstract (EN): ${proposal.abstract_en || ''}
Abstract (TH): ${proposal.abstract_th || ''}
Methodology: ${proposal.methodology || ''}
Objectives: ${(proposal.objectives || []).join('; ')}
Expected outputs (must satisfy): ${(proposal.expected_outputs || []).join('; ')}
Keywords: ${(proposal.keywords || []).join(', ')}
Tier: ${proposal.tier_code || ''}
Budget: ${proposal.budget_requested || ''} THB
`.trim();

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n${summary}\n---\n\nReturn the JSON now.`;

    const result = await callAIText(fullPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || { targets: [] },
      source: result.source,
      model: result.model,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
