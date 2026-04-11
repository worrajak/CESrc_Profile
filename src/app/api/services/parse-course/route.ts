import { NextRequest, NextResponse } from 'next/server';
import { callAIWithVision, getAvailableProviders, type AIProvider } from '@/lib/ai-provider';

/**
 * AI Course Document Parsing — รับเอกสารหลักสูตร/เล่มหลักสูตร/กำหนดการ
 * แยกออกเป็น: โมดูล, สมรรถนะ, ตัวชี้วัด, เกณฑ์การประเมิน (Rubric)
 * รองรับหลาย AI: Claude, Gemini, GPT, Local (Ollama)
 */

const COURSE_EXTRACTION_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญด้านการออกแบบหลักสูตรฝึกอบรม
จากเอกสารหลักสูตร/กำหนดการ/เล่มหลักสูตรที่ให้มา กรุณาสกัดโครงสร้างหลักสูตรเป็น JSON ดังนี้:

{
  "title": "ชื่อหลักสูตร (ภาษาไทย)",
  "title_en": "ชื่อภาษาอังกฤษ (ถ้ามี)",
  "description": "คำอธิบายหลักสูตร",
  "total_hours": 30,
  "level": "beginner|intermediate|advanced|professional",
  "prerequisites": "ความรู้พื้นฐานที่ต้องมี",
  "modules": [
    {
      "module_number": 1,
      "title": "ชื่อโมดูล/หัวข้อ",
      "description": "รายละเอียด",
      "hours": 6,
      "is_practical": false,
      "competencies": [
        {
          "name": "ชื่อสมรรถนะ",
          "description": "คำอธิบายสมรรถนะ",
          "competency_type": "knowledge|skill|attitude",
          "indicators": [
            {
              "name": "ตัวชี้วัด",
              "rubric_excellent": "เกณฑ์ระดับดีเยี่ยม (4 คะแนน) — ต้องวัดได้เฉพาะเจาะจง",
              "rubric_good": "เกณฑ์ระดับดี (3 คะแนน)",
              "rubric_fair": "เกณฑ์ระดับพอใช้ (2 คะแนน)",
              "rubric_poor": "เกณฑ์ระดับต้องปรับปรุง (1 คะแนน)",
              "weight": 25
            }
          ]
        }
      ]
    }
  ]
}

กฎ:
- ถ้าเอกสารไม่มีสมรรถนะ/ตัวชี้วัดชัดเจน ให้สร้างขึ้นมาจากเนื้อหาของโมดูลนั้น
- weight ของ indicators ใน competency เดียวกันรวมเป็น 100
- rubric ต้องวัดได้จริง เฉพาะเจาะจง ไม่ใช่แค่ "ดี" หรือ "ไม่ดี"
- ถ้าเป็นหลักสูตรช่างเทคนิค/พลังงาน ให้เน้นทักษะปฏิบัติ
- competency_type: knowledge=ความรู้, skill=ทักษะ, attitude=คุณลักษณะ
- ตอบเฉพาะ JSON เท่านั้น`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const aiProvider = (formData.get('ai_provider') as AIProvider) || undefined;
    const aiModel = (formData.get('ai_model') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';

    const result = await callAIWithVision(base64, mimeType, COURSE_EXTRACTION_PROMPT, {
      provider: aiProvider,
      model: aiModel,
    });

    if (result.data) {
      const course = result.data;
      return NextResponse.json({
        course,
        source: result.source,
        model: result.model,
        filename: file.name,
        stats: {
          modules: course.modules?.length || 0,
          competencies: course.modules?.reduce((sum: number, m: any) => sum + (m.competencies?.length || 0), 0) || 0,
          indicators: course.modules?.reduce((sum: number, m: any) =>
            sum + (m.competencies?.reduce((s: number, c: any) => s + (c.indicators?.length || 0), 0) || 0), 0) || 0,
        },
      });
    }

    return NextResponse.json(
      { error: result.error || 'ไม่สามารถแยกข้อมูลหลักสูตรได้', providers: getAvailableProviders() },
      { status: 422 }
    );
  } catch (err) {
    console.error('Parse course error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// GET — รายชื่อ AI providers ที่ใช้ได้
export async function GET() {
  return NextResponse.json({
    providers: getAvailableProviders(),
  });
}
