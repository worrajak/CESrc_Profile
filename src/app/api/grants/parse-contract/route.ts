/**
 * API: Parse Grant Proposal/Contract Document
 * Upload เอกสารข้อเสนอ/สัญญา → AI วิเคราะห์สิ่งส่งมอบ, แผนงาน, Milestones
 */

import { NextRequest, NextResponse } from 'next/server';
import { callAIWithVision, getAvailableProviders, AIProvider } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const aiProvider = formData.get('ai_provider') as AIProvider | null;
    const aiModel = formData.get('ai_model') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'application/pdf';

    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญในการวิเคราะห์เอกสารข้อเสนอโครงการวิจัยและสัญญารับทุน

จากเอกสารนี้ ให้สกัดข้อมูลออกมาเป็น JSON format ดังนี้:

{
  "project_title_th": "ชื่อโครงการภาษาไทย",
  "project_title_en": "Project Title in English (if available)",
  "funding_agency": "ชื่อแหล่งทุน",
  "contract_number": "เลขที่สัญญา (ถ้ามี)",
  "budget": 0,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "duration_months": 12,
  "objectives": ["วัตถุประสงค์ 1", "วัตถุประสงค์ 2"],
  "milestones": [
    {
      "title": "ชื่อ Milestone",
      "description": "รายละเอียด",
      "milestone_type": "deliverable|report|presentation|review",
      "planned_date": "YYYY-MM-DD",
      "planned_weight": 15,
      "deliverables": [
        {
          "title": "ชื่อสิ่งส่งมอบ",
          "description": "รายละเอียด",
          "deliverable_type": "document|prototype|software|dataset|paper|patent",
          "planned_date": "YYYY-MM-DD"
        }
      ]
    }
  ],
  "work_plan": [
    {
      "month": 1,
      "activities": ["กิจกรรม 1", "กิจกรรม 2"],
      "planned_pct": 8
    }
  ],
  "team_members": [
    {
      "name": "ชื่อ-สกุล",
      "role": "pi|co_pi|researcher|consultant"
    }
  ],
  "research_areas": ["สาขา 1", "สาขา 2"]
}

สำคัญ:
- milestones ให้เรียงตามลำดับเวลา
- planned_weight คือ % น้ำหนักของ milestone (รวมทุก milestone = 100%)
- work_plan ให้ระบุ planned_pct เป็น % สะสม (cumulative) ของแต่ละเดือน (เดือนสุดท้าย = 100%)
- ถ้าไม่พบข้อมูลบางส่วน ให้ใส่ null
- ตอบเป็น JSON เท่านั้น ห้ามมี markdown`;

    const result = await callAIWithVision(base64, mimeType, systemPrompt, {
      provider: aiProvider || undefined,
      model: aiModel || undefined,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error, source: result.source }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      source: result.source,
      model: result.model,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const providers = await getAvailableProviders();
  return NextResponse.json({ providers });
}
