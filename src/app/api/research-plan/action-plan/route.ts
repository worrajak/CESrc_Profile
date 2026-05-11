import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a research operations advisor for CESRU (Clean Energy System Research Unit, RMUTL).

Given a snapshot of:
- Active/upcoming grant calls (with deadlines)
- The unit's proposals in draft/submitted state
- Outstanding journal targets across those proposals
- Career goals (ผศ./รศ./ศ. targets) per researcher

Output a month-by-month action plan for the requested horizon (3, 6, or 12 months).

Output ONLY a JSON object — no markdown:

{
  "horizon_months": 6,
  "summary": "ภาพรวมแผน 1-2 ย่อหน้า ระบุประเด็นสำคัญสุดของช่วงนี้",
  "months": [
    {
      "month_label": "พ.ค. 2569",
      "year": 2026,
      "month": 5,
      "actions": [
        {
          "category": "grant_submit | grant_full_proposal | grant_revision | journal_submit | journal_revision | thesis_defense | career_evidence | team_meeting",
          "priority": "high | medium | low",
          "title": "ส่ง Concept Proposal FF71 (deadline 15 พ.ค.)",
          "detail": "ทำ Concept Proposal ให้เสร็จ ส่งผ่านต้นสังกัด สถาบันวิจัย",
          "linked_grant_call_code": "FF71",
          "linked_proposal_id": null,
          "deadline": "2026-05-15",
          "assignee_hint": "PI + ทีมร่าง"
        }
      ]
    }
  ],
  "risks": [
    {
      "risk": "FF71 ปิดรับ 15 พ.ค. — หากพลาด ต้องรอปีหน้า (FF72)",
      "mitigation": "เร่งรอบ review ภายในวันที่ 13 พ.ค."
    }
  ],
  "long_term_themes": [
    {
      "theme": "EV Wireless Charging — มี grants 2 ตัวเปิดในปลายปี",
      "rationale": "ตรงกับ expertise ของ PI 3 คน และ pipeline journal Q1"
    }
  ]
}

RULES:
- Cover EXACTLY the requested horizon (3 / 6 / 12 months) starting from current month.
- Group actions per month — Thai labels (ม.ค./ก.พ./...) for month_label, Buddhist Era year preferred.
- Each action MUST link to a concrete grant_call_code or proposal_id when applicable.
- For grant submissions: respect actual close_date.
- For journal targets: assume realistic timelines (writing 1-2 mo, review 2-4 mo).
- Highlight risks of missed deadlines.
- If career goals exist: include "career_evidence" actions like "เตรียมหลักฐานบทความ Scopus Q2 อย่างน้อย 1 บทความ"
- Be specific and actionable — NOT generic advice.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { horizon_months } = body as { horizon_months: 3 | 6 | 12 };
    const horizon = horizon_months || 6;

    // Gather context: open grants, draft proposals, journal queue, career goals
    const [{ data: grants }, { data: proposals }, { data: journals }, { data: goals }, { data: researchers }] =
      await Promise.all([
        supabase
          .from('grant_calls')
          .select('id, agency_code, call_code, call_name_th, open_date, close_date, result_date, budget_min, budget_max, status, research_areas')
          .in('status', ['upcoming', 'open'])
          .order('close_date', { ascending: true, nullsFirst: false }),
        supabase
          .from('proposals')
          .select('id, grant_call_id, title_th, tier_code, status, budget_requested, ai_match_score, pi_id')
          .in('status', ['draft', 'submitted', 'under_review']),
        supabase
          .from('proposal_journal_targets')
          .select('proposal_id, journal_name, quartile, is_open_access, apc_amount_thb, status'),
        supabase
          .from('career_goals')
          .select('researcher_id, target_position, target_date, status'),
        supabase
          .from('researchers')
          .select('id, title_th, first_name_th, last_name_th, position_th, expertise'),
      ]);

    const researcherById: Record<string, any> = {};
    (researchers || []).forEach((r: any) => (researcherById[r.id] = r));

    const grantsText = (grants || [])
      .map((g) => {
        const days = g.close_date
          ? Math.ceil((new Date(g.close_date).getTime() - Date.now()) / 86_400_000)
          : null;
        return `- ${g.agency_code} · ${g.call_code} | open ${g.open_date || '?'} → close ${g.close_date || '?'}${
          days !== null ? ` (${days}d)` : ''
        } | budget ${g.budget_min || '?'}-${g.budget_max || '?'} THB | ${g.call_name_th}`;
      })
      .join('\n') || '(no open/upcoming grants)';

    const proposalsText =
      (proposals || [])
        .map((p) => {
          const pi = p.pi_id ? researcherById[p.pi_id] : null;
          const piName = pi ? `${pi.title_th || ''}${pi.first_name_th || ''} ${pi.last_name_th || ''}`.trim() : '?';
          return `- proposal_id=${p.id} | ${p.status} | tier=${p.tier_code || '?'} | budget ${p.budget_requested || '?'} | PI: ${piName} | ${p.title_th}`;
        })
        .join('\n') || '(no proposals in draft/submitted)';

    const journalsText =
      (journals || [])
        .map((j) => `- proposal=${j.proposal_id} | ${j.journal_name} (${j.quartile || '?'}, OA=${j.is_open_access}, APC=${j.apc_amount_thb || 0}) | status=${j.status || 'planned'}`)
        .join('\n') || '(no journal targets)';

    const goalsText =
      (goals || [])
        .map((g) => {
          const r = researcherById[g.researcher_id];
          const name = r ? `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim() : '?';
          return `- ${name} → ${g.target_position} (target ${g.target_date || 'no date'}) — ${g.status}`;
        })
        .join('\n') || '(no career goals)';

    const today = new Date().toISOString().slice(0, 10);
    const fullPrompt = `${SYSTEM_PROMPT}

---
TODAY: ${today}
HORIZON: ${horizon} months

OPEN / UPCOMING GRANT CALLS:
${grantsText}

DRAFT / SUBMITTED PROPOSALS:
${proposalsText}

JOURNAL TARGETS PIPELINE:
${journalsText}

CAREER GOALS:
${goalsText}
---

Return the JSON action plan now.`;

    const result = await callAIText(fullPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || {},
      source: result.source,
      model: result.model,
      horizon,
      context: {
        grants_count: grants?.length || 0,
        proposals_count: proposals?.length || 0,
        journals_count: journals?.length || 0,
        goals_count: goals?.length || 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
