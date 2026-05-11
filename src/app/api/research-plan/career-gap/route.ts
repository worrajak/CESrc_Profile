import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an academic promotion advisor for Thai universities (ก.พ.อ.).

Given:
- A researcher's profile and scholarly track record
- The official criteria for the TARGET position (ผศ./รศ./ศ.) including both "วิธีปกติ" (normal) and "วิธีพิเศษ" (special)

Analyze the gap and recommend:
1. Whether the researcher can apply via วิธีปกติ (normal method) right now
2. Or via วิธีพิเศษ (special method, often higher bar but allows shortcuts)
3. Or NOT READY — what specifically they need to acquire first

Output ONLY a JSON object — no markdown:

{
  "researcher_name": "...",
  "target_position": "asst_prof | assoc_prof | full_prof",
  "verdict": "ready_normal | ready_special | not_ready",
  "verdict_summary_th": "สั้นๆ 1-2 ประโยค",
  "normal_method": {
    "applicable": true,
    "criteria_met": [
      { "item": "ผลงานวิจัย Scopus", "required": "อย่างน้อย 1 บทความ", "current": "5 บทความ", "status": "met" }
    ],
    "criteria_missing": [
      { "item": "ภาระงานสอน", "required": "อย่างน้อย 1 ภาคการศึกษา", "current": "0 ภาค", "status": "missing", "action_th": "บันทึกภาระงานสอนในระบบ" }
    ]
  },
  "special_method": {
    "applicable": false,
    "rationale_th": "ต้องการ Scopus Q1 อย่างน้อย 3 บทความ — ตอนนี้มี Q2 5 บทความ แต่ Q1 0 บทความ",
    "criteria_met": [],
    "criteria_missing": [
      { "item": "Scopus Q1", "required": "อย่างน้อย 3 บทความ", "current": "0", "status": "missing" }
    ]
  },
  "recommended_path": "normal | special | wait",
  "recommended_actions_th": [
    "1. รวบรวมหลักฐานภาระงานสอน 1 ภาค",
    "2. ตีพิมพ์ Scopus Q1 1 บทความเพื่อรอใช้สำหรับการยื่นแบบพิเศษในอนาคต"
  ],
  "estimated_months_to_ready": 6
}

RULES:
- Be honest. Do NOT inflate the researcher's record.
- Use ONLY data provided. Mark unknown as "current": "ไม่ทราบ".
- "status" must be one of: "met" | "missing" | "partial" | "unknown".
- Thai language for action_th, verdict_summary_th, rationale_th.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { researcher_id, target_position } = body as {
      researcher_id: string;
      target_position: 'asst_prof' | 'assoc_prof' | 'full_prof';
    };

    if (!researcher_id || !target_position) {
      return NextResponse.json({ error: 'researcher_id and target_position required' }, { status: 400 });
    }

    // Fetch researcher + criteria + recent publications
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase
        .from('researchers')
        .select(
          'id, title_th, first_name_th, last_name_th, position_th, position_en, expertise, h_index, i10_index, cited_by_count, bio_th',
        )
        .eq('id', researcher_id)
        .single(),
      supabase
        .from('promotion_criteria')
        .select('*')
        .eq('position_code', target_position)
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (!r) {
      return NextResponse.json({ error: 'Researcher not found' }, { status: 404 });
    }
    if (!c) {
      return NextResponse.json(
        {
          error: `No promotion criteria saved for ${target_position}. Refresh criteria first via the Career page button.`,
        },
        { status: 404 },
      );
    }

    // Try to fetch the researcher's publications by searching authors_raw
    let pubsText = '(no publications data — table may not link by researcher id)';
    try {
      const fullName = `${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();
      const fullNameEn = `${(r as any).first_name_en || ''} ${(r as any).last_name_en || ''}`.trim();
      const { data: pubs } = await supabase
        .from('publications')
        .select('title, journal_name, year, quartile, scopus_indexed, wos_indexed, tci_indexed')
        .or(`authors_raw.ilike.%${fullName}%${fullNameEn ? `,authors_raw.ilike.%${fullNameEn}%` : ''}`)
        .order('year', { ascending: false })
        .limit(20);
      if (pubs && pubs.length > 0) {
        pubsText = pubs
          .map(
            (p, i) =>
              `${i + 1}. ${p.title} (${p.journal_name || '?'}, ${p.year || '?'}${
                p.quartile ? `, ${p.quartile}` : ''
              }${p.scopus_indexed ? ', Scopus' : ''}${p.wos_indexed ? ', WoS' : ''}${p.tci_indexed ? ', TCI' : ''})`,
          )
          .join('\n');
      }
    } catch {}

    const name = `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();

    const profile = `
RESEARCHER:
- Name: ${name}
- Current position: ${r.position_th || r.position_en || 'unknown'}
- Expertise: ${(r.expertise || []).join(', ') || '(none)'}
- h-index: ${r.h_index ?? '?'}  i10-index: ${r.i10_index ?? '?'}  citations: ${r.cited_by_count ?? '?'}
- Bio: ${r.bio_th || '(none)'}

PUBLICATIONS (last 20, name-matched):
${pubsText}

TARGET CRITERIA:
- Position: ${c.position_name_th} (${c.position_name_en || target_position})
- Source: ${c.source || '(unknown)'} ${c.source_url ? `(${c.source_url})` : ''}
- Criteria object: ${JSON.stringify(c.criteria, null, 2)}
- Notes: ${c.notes || '(none)'}
`.trim();

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n${profile}\n---\n\nAnalyze the gap and return the JSON now.`;

    const result = await callAIText(fullPrompt);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || {},
      source: result.source,
      model: result.model,
      researcher: { id: r.id, name },
      criteria_id: c.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
