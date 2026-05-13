import { NextRequest, NextResponse } from 'next/server';
import { callAIText, callAIWithVision } from '@/lib/ai-provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a Thai intellectual-property document parser for CESRU (Clean Energy System Research Unit, RMUTL).

Given a patent / petty patent / license agreement / IP document (text, URL, or image), extract structured data for the CESRU innovations database.

Output ONLY a single JSON object inside one pair of curly braces — no markdown, no commentary. Omit fields you cannot determine.

Schema:
{
  "title_th": "ชื่อนวัตกรรม / สิ่งประดิษฐ์ ภาษาไทย",
  "title_en": "English title (if present)",
  "short_desc_th": "คำอธิบายสั้น 1-2 ประโยค",
  "long_desc_th": "รายละเอียดยาว (ถ้ามี)",
  "innovation_type": "petty_patent | patent | copyright | trademark | trade_secret | prototype",
  "ip_number": "เลขที่อนุสิทธิบัตร/สิทธิบัตร (เช่น 2001008879)",
  "filing_date": "YYYY-MM-DD",       // วันยื่นคำขอ
  "grant_date": "YYYY-MM-DD",        // วันได้รับอนุมัติ
  "status": "concept | filed | granted | expired | abandoned",

  "license_type": "exclusive | sole | non_exclusive",
  "license_holder_name": "บริษัทผู้รับสิทธิ",
  "license_contract_no": "สัญญาเลขที่ (เช่น TLO-LCA-2567-002)",
  "license_start_date": "YYYY-MM-DD",
  "license_end_date": "YYYY-MM-DD",
  "license_territory": "Thailand หรือเขตที่ระบุ",

  "license_fee_breakdown": {
    "disclosure_fee": 300000,
    "vat_pct": 7,
    "vat_amount": 21000,
    "tech_transfer": { "sessions": 5, "people_per_session": 5, "hours_per_day": 8, "days": 4 },
    "consulting":    { "sessions": 5, "times_per_session": 3, "hours_per_day": 8, "days": 3 },
    "late_penalty_pct": 5
  },
  "license_fee_thb": 321000,         // disclosure + vat รวมสุทธิ

  "notes": "หมายเหตุที่สำคัญอื่น ๆ (ผู้ถ่ายทอด, สิทธิเฉพาะ, ฯลฯ)"
}

CRITICAL RULES:
- Convert Thai BE dates → ISO (subtract 543 from year). Examples:
    "๒๒ พฤศจิกายน ๒๕๖๗" → "2024-11-22"
    "9 กรกฎาคม 2563"     → "2020-07-09"
- Thai short months: ม.ค.→01 ก.พ.→02 มี.ค.→03 เม.ย.→04 พ.ค.→05 มิ.ย.→06 ก.ค.→07 ส.ค.→08 ก.ย.→09 ต.ค.→10 พ.ย.→11 ธ.ค.→12
- Money: strip commas, output as number. "๓๐๐,๐๐๐ บาท" → 300000
- "อนุสิทธิบัตร" → petty_patent · "สิทธิบัตร" → patent · "ลิขสิทธิ์" → copyright · "ต้นแบบ" → prototype
- "สิทธิเฉพาะแต่ผู้เดียว" / "Exclusive Licensing" → exclusive
- If disclosure_fee + vat_pct present, compute vat_amount and license_fee_thb (= disclosure_fee × (1 + vat_pct/100))
- For unstructured prose, infer fields conservatively. Do not invent IP numbers or contract numbers.
- If the document is mostly empty / unreadable, return {}.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, image_base64, image_mime } = body as {
      url?: string;
      image_base64?: string;
      image_mime?: string;
    };
    let { text } = body as { text?: string };

    // ─── Path A: image upload (use vision AI) ───
    if (image_base64) {
      const prompt = `${SYSTEM_PROMPT}\n\nThe image is a Thai IP / license document. Extract the JSON now.`;
      const result = await callAIWithVision(image_base64, image_mime || 'image/png', prompt);
      if (result.error) {
        return NextResponse.json({ error: result.error, source: result.source, model: result.model }, { status: 500 });
      }
      return NextResponse.json({ data: result.data || {}, source: result.source, model: result.model });
    }

    if (!url && !text) {
      return NextResponse.json({ error: 'Provide url, text, or image' }, { status: 400 });
    }

    // ─── Path B: URL fetch ───
    if (url && !text) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 CESRU-IP-Ingest/1.0' },
          signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        text = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 14000);
      } catch (e: any) {
        return NextResponse.json(
          { error: `URL fetch failed: ${e.message || 'unknown'}. Paste the document text instead.` },
          { status: 400 },
        );
      }
    }

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Text too short to extract' }, { status: 400 });
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\nIP / LICENSE DOCUMENT TEXT:\n${text}\n---\n\nReturn the JSON now.`;
    const result = await callAIText(fullPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error, source: result.source, model: result.model }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data || {},
      source: result.source,
      model: result.model,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
