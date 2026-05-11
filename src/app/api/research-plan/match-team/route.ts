import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a research team allocator for CESRU at RMUTL.

Given:
- A drafted concept proposal (title, abstract, methodology, objectives, keywords)
- The PI's profile
- A roster of CESRU researchers with their expertise

Suggest 2-4 co-investigators whose expertise COMPLEMENTS the PI to cover all methodology components.
Output ONLY a JSON object — no markdown:

{
  "team": [
    {
      "researcher_id": "uuid",
      "name": "ชื่อ-นามสกุล (ของ researcher)",
      "role": "co_pi | researcher | advisor",
      "fte_pct": 25,            // % of time on this project (PI typically 30-40%, co-PIs 15-25%)
      "compensation_pct": 20,   // % of personnel budget. PI usually highest.
      "responsibilities": "หน้าที่ในโครงการเป็นภาษาไทย",
      "ai_rationale": "เพราะเชี่ยวชาญ X ซึ่งครอบคลุม methodology Y ของ proposal"
    }
  ],
  "total_fte_pct": 100,         // Sum should be close to 100
  "overall_rationale": "อธิบายภาพรวมว่าทีมนี้ครอบคลุม proposal อย่างไร"
}

RULES:
- Sum of compensation_pct across team (including PI which is computed elsewhere) should equal 100.
- Sum of fte_pct can exceed 100 (people work part-time on multiple projects).
- Do NOT suggest the PI again (PI is separate).
- Prefer 2-4 co-investigators total (not too many).
- Match Thai naming conventions.
- If a researcher's expertise has no overlap with the proposal, do NOT include them.
- Only use researcher_id values from the provided roster.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposal, pi_id, exclude_ids } = body as {
      proposal: any;
      pi_id: string;
      exclude_ids?: string[];
    };

    if (!proposal || !pi_id) {
      return NextResponse.json({ error: 'proposal + pi_id required' }, { status: 400 });
    }

    // Fetch all CESRU researchers EXCEPT PI and excluded
    const { data: roster } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th, position_th, position_en, expertise, h_index, unit_role')
      .neq('id', pi_id)
      .order('h_index', { ascending: false, nullsFirst: false });

    const candidates = (roster || [])
      .filter((r) => !(exclude_ids || []).includes(r.id))
      .slice(0, 25); // cap to keep prompt manageable

    if (candidates.length === 0) {
      return NextResponse.json({ data: { team: [], total_fte_pct: 0, overall_rationale: 'No candidates available' }, source: 'fallback', model: 'none' });
    }

    const rosterText = candidates
      .map((r, i) => {
        const name = `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();
        return `${i + 1}. id=${r.id} | ${name} | ${r.position_th || ''} | h=${r.h_index ?? '?'} | role=${r.unit_role || '?'} | expertise: ${(r.expertise || []).join(', ') || '(none)'}`;
      })
      .join('\n');

    const proposalText = `
DRAFTED PROPOSAL:
Title: ${proposal.title_th || ''} / ${proposal.title_en || ''}
Abstract: ${proposal.abstract_th || ''}
Objectives: ${(proposal.objectives || []).join('; ')}
Methodology: ${proposal.methodology || ''}
Keywords: ${(proposal.keywords || []).join(', ')}
Tier: ${proposal.tier_code || ''}
Budget: ${proposal.budget_requested || ''} THB
`.trim();

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n${proposalText}\n\nCESRU RESEARCHER ROSTER (PI already chosen — DO NOT include in team):\n${rosterText}\n---\n\nReturn the JSON now.`;

    const result = await callAIText(fullPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error, source: result.source, model: result.model }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || { team: [] },
      source: result.source,
      model: result.model,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
