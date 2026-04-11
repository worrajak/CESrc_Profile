import { NextRequest, NextResponse } from 'next/server';
import { callAIWithVision, getAvailableProviders, type AIProvider } from '@/lib/ai-provider';

/**
 * AI Document Parsing — รับเอกสาร PDF/รูปภาพ/Word แยก field สำหรับลงทะเบียนอบรม
 * รองรับหลาย AI: Claude, Gemini, GPT, Local (Ollama)
 * เลือก provider ผ่าน form field: ai_provider, ai_model
 */

const EXTRACTION_PROMPT = `คุณเป็น AI ที่ช่วยแยกข้อมูลจากเอกสารลงทะเบียนอบรม/หนังสือราชการ/ใบสมัคร
จากเอกสารที่ให้มา กรุณาสกัดข้อมูลต่อไปนี้ (ถ้ามี) และตอบเป็น JSON เท่านั้น:

{
  "requester_name": "ชื่อ-สกุลผู้สมัคร/ผู้ติดต่อ",
  "requester_org": "หน่วยงาน/บริษัท/สังกัด",
  "requester_email": "อีเมล",
  "requester_phone": "เบอร์โทร",
  "title": "หัวข้อ/เรื่อง/หลักสูตรที่สมัคร",
  "description": "รายละเอียดเพิ่มเติม",
  "num_participants": "จำนวนผู้เข้าอบรม (ตัวเลข)",
  "location": "สถานที่",
  "preferred_date_start": "วันเริ่ม (YYYY-MM-DD)",
  "preferred_date_end": "วันสิ้นสุด (YYYY-MM-DD)"
}

ตอบเฉพาะ JSON เท่านั้น ไม่ต้องอธิบาย ถ้าไม่พบข้อมูลไหนให้ใส่ null`;

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

    const result = await callAIWithVision(base64, mimeType, EXTRACTION_PROMPT, {
      provider: aiProvider,
      model: aiModel,
    });

    if (result.data) {
      // Clean null values
      const cleaned: Record<string, string> = {};
      for (const [key, value] of Object.entries(result.data)) {
        if (value && value !== 'null' && value !== 'undefined') {
          cleaned[key] = String(value);
        }
      }

      return NextResponse.json({
        parsed: cleaned,
        source: result.source,
        model: result.model,
        filename: file.name,
      });
    }

    return NextResponse.json(
      { error: result.error || 'ไม่สามารถแยกข้อมูลได้ — กรุณาตั้งค่า API Key', providers: getAvailableProviders() },
      { status: 422 }
    );
  } catch (err) {
    console.error('Parse document error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// GET — รายชื่อ AI providers ที่ใช้ได้
export async function GET() {
  return NextResponse.json({
    providers: getAvailableProviders(),
  });
}
