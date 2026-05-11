import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an academic career advisor for Thai universities. The user wants the CURRENT (2025-2026) Thai ก.พ.อ. / OHEC criteria for promotion to:
- ผู้ช่วยศาสตราจารย์ (Assistant Professor / asst_prof)
- รองศาสตราจารย์ (Associate Professor / assoc_prof)
- ศาสตราจารย์ (Professor / full_prof)

If you do not have certain up-to-date data, state so in "notes" and provide the closest known criteria with the year you are confident about (do NOT invent specific numbers).

Output ONLY a JSON object — no markdown:

{
  "criteria": {
    "asst_prof": {
      "position_name_th": "ผู้ช่วยศาสตราจารย์",
      "position_name_en": "Assistant Professor",
      "source": "ก.พ.อ. ฉบับที่ ... พ.ศ. ...",
      "source_url": "https://...",
      "criteria": {
        "วิธีปกติ": {
          "ภาระงานสอน": "เคยสอนระดับอุดมศึกษามาแล้วไม่น้อยกว่า ... ภาคการศึกษา",
          "ผลงานวิจัย": "อย่างน้อย ... เรื่อง ในวารสาร ...",
          "ผลงานทางวิชาการอื่น": "...",
          "คุณภาพผลงาน": "..."
        },
        "วิธีพิเศษ": { ... }
      },
      "notes": "ข้อสังเกตเพิ่มเติม / ถ้าข้อมูลไม่อัพเดทล่าสุดบอกด้วย"
    },
    "assoc_prof": { ... },
    "full_prof": { ... }
  }
}

CRITICAL: Always include a "notes" field acknowledging the year of the criteria you are providing.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_prompt } = body as { user_prompt?: string };

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${user_prompt ? `User context: ${user_prompt}\n\n` : ''}Return the JSON now.`;

    const result = await callAIText(fullPrompt);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const data = result.data || {};
    const criteria = data.criteria || {};

    // Save each position's criteria — mark old ones as not current
    const positions: Array<'asst_prof' | 'assoc_prof' | 'full_prof'> = ['asst_prof', 'assoc_prof', 'full_prof'];
    const saved: any[] = [];
    for (const pos of positions) {
      const c = criteria[pos];
      if (!c) continue;
      // Deactivate older versions
      await supabase
        .from('promotion_criteria')
        .update({ is_current: false })
        .eq('position_code', pos)
        .eq('is_current', true);
      // Insert new
      const { data: inserted } = await supabase
        .from('promotion_criteria')
        .insert({
          position_code: pos,
          position_name_th: c.position_name_th || '',
          position_name_en: c.position_name_en || null,
          source: c.source || null,
          source_url: c.source_url || null,
          criteria: c.criteria || {},
          notes: c.notes || null,
          ai_extracted: true,
          ai_provider: result.source,
          ingested_at: new Date().toISOString(),
          is_current: true,
        })
        .select('id, position_code')
        .single();
      if (inserted) saved.push(inserted);
    }

    return NextResponse.json({
      data: { saved, raw: data },
      source: result.source,
      model: result.model,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
