import { NextRequest, NextResponse } from 'next/server';
import { callAIWithVision, callAIText, getAvailableProviders, type AIProvider } from '@/lib/ai-provider';

/**
 * AI Course Document Parsing — รับเอกสารหลักสูตร/เล่มหลักสูตร/กำหนดการ
 * แยกออกเป็น: กำหนดการ, โมดูล, สมรรถนะ, ตัวชี้วัด, เกณฑ์การวัดและประเมินผล (Rubric)
 * รองรับหลาย AI: Claude, Gemini, GPT, Local (Ollama)
 */

const COURSE_EXTRACTION_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญด้านการออกแบบหลักสูตรฝึกอบรม
จากเอกสารหลักสูตร/กำหนดการ/เล่มหลักสูตรที่ให้มา กรุณาสกัดโครงสร้างหลักสูตรเป็น JSON ดังนี้:

{
  "title": "ชื่อหลักสูตร (ภาษาไทย)",
  "title_en": "ชื่อภาษาอังกฤษ (ถ้ามี)",
  "description": "คำอธิบายหลักสูตร",
  "objectives": ["วัตถุประสงค์ 1", "วัตถุประสงค์ 2"],
  "target_audience": "กลุ่มเป้าหมาย",
  "total_hours": 30,
  "duration_days": 5,
  "level": "beginner|intermediate|advanced|professional",
  "skill_domain": "solar_pv|ev_charger|battery|energy_audit|microgrid|other",
  "fee": 0,
  "prerequisites": "ความรู้พื้นฐานที่ต้องมี",
  "schedule": [
    {
      "day": 1,
      "date": "วันที่ เช่น 15 เม.ย. 2568 หรือ null",
      "time_start": "08:30",
      "time_end": "16:30",
      "activities": [
        {
          "time": "08:30-09:00",
          "activity": "ลงทะเบียน",
          "type": "registration|lecture|workshop|break|exam|field_trip|ceremony",
          "instructor": "ชื่อวิทยากร ถ้ามี หรือ null"
        }
      ]
    }
  ],
  "modules": [
    {
      "module_number": 1,
      "title": "ชื่อโมดูล/หัวข้อ",
      "description": "รายละเอียด",
      "hours": 6,
      "is_practical": false,
      "topics": ["หัวข้อย่อย 1", "หัวข้อย่อย 2"],
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
  ],
  "evaluation": {
    "passing_criteria": "เกณฑ์การผ่าน เช่น ผ่านทุกโมดูล >= 60%",
    "methods": [
      {
        "method": "ข้อเขียน|ปฏิบัติ|โครงงาน|สังเกต|นำเสนอ|แบบทดสอบ",
        "weight_pct": 40,
        "description": "รายละเอียดวิธีการวัดผล"
      }
    ],
    "grading_scale": [
      { "grade": "ดีเยี่ยม", "min_score": 80, "max_score": 100 },
      { "grade": "ดี", "min_score": 70, "max_score": 79 },
      { "grade": "พอใช้", "min_score": 60, "max_score": 69 },
      { "grade": "ไม่ผ่าน", "min_score": 0, "max_score": 59 }
    ],
    "certificate_type": "ประเภทใบรับรอง"
  },
  "instructors": [
    {
      "name": "ชื่อวิทยากร",
      "title": "ตำแหน่ง",
      "organization": "หน่วยงาน",
      "expertise": "ความเชี่ยวชาญ"
    }
  ],
  "materials": ["อุปกรณ์/เอกสารที่ต้องเตรียม"]
}

กฎ:
- ถ้าเอกสารไม่มีสมรรถนะ/ตัวชี้วัดชัดเจน ให้สร้างขึ้นมาจากเนื้อหาของโมดูลนั้น
- weight ของ indicators ใน competency เดียวกันรวมเป็น 100
- rubric ต้องวัดได้จริง เฉพาะเจาะจง ไม่ใช่แค่ "ดี" หรือ "ไม่ดี"
- ถ้าเป็นหลักสูตรช่างเทคนิค/พลังงาน ให้เน้นทักษะปฏิบัติ
- competency_type: knowledge=ความรู้, skill=ทักษะ, attitude=คุณลักษณะ
- ถ้าเอกสารมีกำหนดการ ให้แยกเป็นรายวัน รายกิจกรรม พร้อมเวลาเริ่ม-สิ้นสุด
- ถ้าเอกสารมีเกณฑ์การวัดและประเมินผล ให้แยกรายละเอียดครบถ้วน
- ประมาณจำนวนชั่วโมงและจำนวนวันจากกำหนดการ ถ้าไม่ได้ระบุชัดเจน
- ตอบเฉพาะ JSON เท่านั้น ไม่ต้องมี markdown code block`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textInput = formData.get('text') as string | null;
    const aiProvider = (formData.get('ai_provider') as AIProvider) || undefined;
    const aiModel = (formData.get('ai_model') as string) || undefined;

    const config = {
      ...(aiProvider && { provider: aiProvider }),
      ...(aiModel && { model: aiModel }),
    };

    let result;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = file.type || 'application/octet-stream';
      result = await callAIWithVision(base64, mimeType, COURSE_EXTRACTION_PROMPT, config);
    } else if (textInput) {
      result = await callAIText(
        `${COURSE_EXTRACTION_PROMPT}\n\n---\nเอกสารหลักสูตร:\n${textInput}`,
        config
      );
    } else {
      return NextResponse.json({ error: 'กรุณาอัพโหลดไฟล์หรือใส่ข้อมูลหลักสูตร' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Parse response - might be object or string
    let course;
    if (result.data && typeof result.data === 'object') {
      course = result.data.course || result.data;
    } else {
      const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        course = parsed.course || parsed;
      } else {
        return NextResponse.json({ error: 'AI ไม่สามารถแยกข้อมูลจากเอกสารได้' }, { status: 422 });
      }
    }

    const modules = course.modules || [];
    return NextResponse.json({
      course,
      source: result.source,
      model: result.model,
      filename: file?.name || 'text-input',
      stats: {
        modules: modules.length,
        schedule_days: course.schedule?.length || 0,
        competencies: modules.reduce((sum: number, m: any) => sum + (m.competencies?.length || 0), 0),
        indicators: modules.reduce((sum: number, m: any) =>
          sum + (m.competencies?.reduce((s: number, c: any) => s + (c.indicators?.length || 0), 0) || 0), 0),
        evaluation_methods: course.evaluation?.methods?.length || 0,
        total_hours: course.total_hours || 0,
        duration_days: course.duration_days || 0,
      },
    });
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
