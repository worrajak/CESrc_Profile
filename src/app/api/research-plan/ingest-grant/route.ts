import { NextRequest, NextResponse } from 'next/server';
import { callAIText, callAIWithVision } from '@/lib/ai-provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a Thai research grant intake assistant for CESRU (Clean Energy System Research Unit, RMUTL).

Given a Thai/English funding announcement (text or fetched URL), extract structured grant call data.
Output ONLY a single JSON object inside one pair of curly braces — no markdown, no commentary.

Schema (omit fields you cannot determine; do not invent):

{
  "agency_code": "FF | NRCT | TSRI | PMUC | PMUA | PMUB | EPPO | EGAT | NXPO | NSTDA | <SHORT_CODE_IF_OTHER>",
  "agency_name_th": "ชื่อแหล่งทุนภาษาไทย",
  "agency_name_en": "English agency name",
  "call_code": "FF71 | NRCT-2026-General | <unique short code>",
  "call_name_th": "ชื่อรอบทุนภาษาไทย",
  "call_name_en": "English call name",
  "fiscal_year_be": 2571,
  "announce_date": "YYYY-MM-DD",
  "open_date": "YYYY-MM-DD",
  "close_date": "YYYY-MM-DD",
  "result_date": "YYYY-MM-DD",
  "budget_min": 100000,
  "budget_max": 1000000,
  "duration_months": 12,
  "eligibility_th": "คุณสมบัติผู้ขอทุน",
  "conditions_th": "เงื่อนไขทุน",
  "scope_th": "ขอบเขตการวิจัย",
  "research_areas": ["พลังงานทดแทน", "EV", "smart grid"],
  "required_outputs": ["บทความ Q1", "patent"],
  "announcement_url": "https://...",
  "regulations_url": "https://...",

  // NRIIS-style strategy hierarchy (NRCT and other agencies). Omit if absent.
  "strategy": {
    "strategy_no": "ยุทธศาสตร์ที่ 2 การยกระดับสังคมและสิ่งแวดล้อม ...",
    "program": "P9 พัฒนาสังคมสูงวัยด้วยวิทยาศาสตร์ วิจัยและนวัตกรรม",
    "sub_programs": [
      {
        "code": "F8 (S2P9)",
        "name": "พัฒนาผู้สูงอายุในภาคชนบทและเมือง ...",
        "topic": "การพัฒนาผู้สูงอายุในภาคชนบทและเมือง ให้มีศักยภาพในการพึ่งตนเอง",
        "groups": [
          "นวัตกรรมทางสังคมเพื่อสนับสนุนให้ผู้สูงอายุมีพลังและยังประโยชน์",
          "เปลี่ยนเกษียณเป็นพลัง"
        ]
      }
    ]
  },

  // How to submit (registration URL, required attachments, confirmation step)
  "submission_details_th": "ลงทะเบียนส่งข้อเสนอที่ https://nriis.go.th ...",

  // Where results will be announced (URLs or channel names)
  "result_channels": ["https://www.nrct.go.th", "https://nriis.go.th"]
}

CRITICAL RULES:
- Convert Thai Buddhist Era dates to ISO: "1 ก.พ. 2569" → "2026-02-01" (BE - 543 = AD).
- Thai short months: ม.ค.→01 ก.พ.→02 มี.ค.→03 เม.ย.→04 พ.ค.→05 มิ.ย.→06 ก.ค.→07 ส.ค.→08 ก.ย.→09 ต.ค.→10 พ.ย.→11 ธ.ค.→12.
- Budget in THB. Strip commas/decimals. "1,500,000" → 1500000. "1.5 ล้าน" → 1500000.
- For FF announcements from มทร.ล้านนา: use agency_code "FF", call_code matches the fiscal year suffix (FF71 = FY 2571 BE).
- If only one budget figure given, fill budget_max only.
- duration_months: convert ปี → 12, 18 เดือน → 18.
- research_areas: short Thai phrases or English keywords.

STRATEGY EXTRACTION (NRIIS-style only):
- Look for headers like "ยุทธศาสตร์ที่ N", "แผนงาน Pxx", "แผนงานย่อย Fxx / Nxx", "แผนงานย่อยรายประเด็น", "กลุ่มเรื่อง".
- "แผนงานย่อย" and "แผนงานย่อยรายประเด็น" are TWO different levels:
    • แผนงานย่อย     → code like F8 (S2P9), N13 (S2P9). Maps to sub_programs[].code/name.
    • แผนงานย่อยรายประเด็น → a heading describing the topic of that sub-program.
                              Maps to sub_programs[].topic (NOT to sub_programs[].name).
- "กลุ่มเรื่อง" lines under a sub-program map to that sub-program's "groups" array.
- A single announcement can list multiple sub-programs under the same strategy/program — include each in the sub_programs array in order.
- If the source uses simpler structure (just "ยุทธศาสตร์" and "แผนงาน" without sub-program codes), still fill the fields you can find — omit the rest.

SUBMISSION + RESULT EXTRACTION:
- submission_details_th: capture the FULL submission instructions paragraph,
  including the URL, required confirmation step, status meanings, etc.
- result_channels: pull every URL that appears under "ประกาศผล" / "ประกาศผลการพิจารณา" / "การประกาศผล". Strip Markdown link syntax.

- If text is mostly noise/empty, return {} (empty JSON).
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

    // ────────────────────────────────────────────
    // Path A: Image upload — use vision AI
    // ────────────────────────────────────────────
    if (image_base64) {
      const mime = image_mime || 'image/png';
      const visionPrompt = `${SYSTEM_PROMPT}\n\nThe image is a Thai grant announcement (โบรชัวร์/ประกาศ). Extract the JSON now.`;
      const result = await callAIWithVision(image_base64, mime, visionPrompt);
      if (result.error) {
        return NextResponse.json({ error: result.error, source: result.source, model: result.model }, { status: 500 });
      }
      return NextResponse.json({ data: result.data || {}, source: result.source, model: result.model });
    }

    if (!url && !text) {
      return NextResponse.json({ error: 'Provide url, text, or image' }, { status: 400 });
    }

    // If URL provided but no text, try to fetch text content
    if (url && !text) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 CESRU-ResearchPlan/1.0' },
          // Best-effort: 8s timeout
          signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        // Strip HTML tags crudely (good enough for AI)
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
          .slice(0, 12000); // truncate to keep prompt manageable
      } catch (e: any) {
        return NextResponse.json(
          {
            error: `Could not fetch URL: ${e.message || 'unknown'}. Please paste the announcement text instead.`,
          },
          { status: 400 },
        );
      }
    }

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Text too short to extract' }, { status: 400 });
    }

    const userPrompt = `${SYSTEM_PROMPT}\n\n---\nANNOUNCEMENT TEXT:\n${text}\n---\n\nReturn the JSON now.`;

    const result = await callAIText(userPrompt);

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
