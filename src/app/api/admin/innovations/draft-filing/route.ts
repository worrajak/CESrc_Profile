import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai-provider';

export const runtime = 'nodejs';
export const maxDuration = 90;

const SYSTEM_PROMPT = `You are a senior Thai intellectual-property filing advisor for CESRU (Clean Energy System Research Unit, RMUTL).

You receive a researcher's invention idea + technical details. Produce a complete pre-filing package for the Thailand Department of Intellectual Property (DIP / กรมทรัพย์สินทางปัญญา, IPThailand).

Reference: https://www.ipthailand.go.th — accept Petty Patent (อนุสิทธิบัตร), Patent (สิทธิบัตรการประดิษฐ์), Design Patent (สิทธิบัตรการออกแบบผลิตภัณฑ์), Copyright (ลิขสิทธิ์).

Output ONLY a single JSON object inside one pair of curly braces — no markdown wrapper, no commentary. All Thai content must be in proper Thai language.

Schema:
{
  "recommended_type": "petty_patent | patent | design_patent | copyright | trade_secret",
  "recommendation_rationale_th": "1-2 ย่อหน้า อธิบายทำไม IP ประเภทนี้เหมาะที่สุด พิจารณาความใหม่ ขั้นการประดิษฐ์ที่สูงขึ้น และระยะเวลาคุ้มครอง",

  "key_features_th": [
    "จุดเด่นที่ทำให้สิ่งประดิษฐ์นี้แตกต่าง 1",
    "จุดเด่น 2",
    "จุดเด่น 3"
  ],

  "estimated_cost_thb": {
    "filing_fee": 500,
    "examination_fee": 0,
    "publication_fee": 0,
    "annual_fee_year_1_2": 0,
    "annual_fee_year_3_plus": 200,
    "agent_fee_optional": 5000,
    "total_first_year_min": 500
  },

  "timeline_months": {
    "filing_to_publication": 3,
    "publication_opposition_window": 12,
    "publication_to_grant": 6,
    "total_expected": 21
  },

  "documents_needed": [
    {
      "code": "สป/สผ/อสป/001-ก",
      "name_th": "คำขอจดทะเบียนสิทธิบัตร/อนุสิทธิบัตร",
      "required": true,
      "auto_drafted": false,
      "download_url": "https://www.ipthailand.go.th/th/แบบฟอร์ม.html",
      "notes_th": "ผู้ขอ + ผู้ประดิษฐ์ + ตัวแทน (ถ้ามี)"
    },
    {
      "code": "specification",
      "name_th": "รายละเอียดการประดิษฐ์",
      "required": true,
      "auto_drafted": true,
      "notes_th": "ระบบสร้าง draft ให้แล้วในไฟล์นี้"
    },
    {
      "code": "claims",
      "name_th": "ข้อถือสิทธิ (Claims)",
      "required": true,
      "auto_drafted": true,
      "notes_th": "ข้อถือสิทธิหลัก + ข้อย่อย"
    },
    {
      "code": "abstract",
      "name_th": "บทสรุปการประดิษฐ์ (≤200 คำ)",
      "required": true,
      "auto_drafted": true
    },
    {
      "code": "drawings",
      "name_th": "ภาพประกอบ (รูปวงจร/แผนผัง/ภาพ 3D)",
      "required": true,
      "auto_drafted": false,
      "notes_th": "อย่างน้อย 1 ภาพ — ระบุหมายเลขชิ้นส่วน"
    },
    {
      "code": "inventor_consent",
      "name_th": "หนังสือยินยอมจากผู้ประดิษฐ์",
      "required": true,
      "auto_drafted": false,
      "notes_th": "ผู้ประดิษฐ์ทุกคนลงนาม"
    },
    {
      "code": "assignment",
      "name_th": "หนังสือมอบสิทธิให้มหาวิทยาลัย (กรณีจดในนามมหาวิทยาลัย)",
      "required": false,
      "auto_drafted": false
    }
  ],

  "draft_specification": {
    "title_th": "ชื่อการประดิษฐ์ที่ชัดเจน (เช่น 'ระบบ X สำหรับการ Y โดยใช้ Z')",
    "title_en": "English title",
    "field_th": "สาขาเทคนิคที่เกี่ยวข้อง — 1-2 ประโยค",
    "background_th": "ภูมิหลังการประดิษฐ์ 2-3 ย่อหน้า: ปัญหาที่มีอยู่, ข้อจำกัดของวิธีเดิม, สิ่งที่เราจะแก้",
    "summary_th": "สรุปการประดิษฐ์ 1-2 ย่อหน้า: ทำอะไร / ทำงานยังไง / ประโยชน์",
    "disclosure_th": "การเปิดเผยการประดิษฐ์ 4-8 ย่อหน้า: รายละเอียดการทำงาน / โครงสร้าง / องค์ประกอบ / ลำดับ — ละเอียดพอที่ผู้เชี่ยวชาญในสาขาสามารถทำตามได้",
    "best_mode_th": "วิธีการที่ดีที่สุดในการนำการประดิษฐ์ไปใช้ — รายละเอียดเชิงตัวเลข/สเปคหรือพารามิเตอร์ที่แนะนำ",
    "drawings_description_th": "คำอธิบายภาพประกอบ — list ภาพที่ควรมี (เช่น 'รูปที่ 1 บล็อกไดอะแกรมของระบบ', 'รูปที่ 2 ขั้นตอนการทำงาน')"
  },

  "draft_claims_th": [
    "1. (ข้อถือสิทธิหลัก / independent claim) ระบบ/วิธี/อุปกรณ์ ...ประกอบด้วย: (a) ... (b) ... (c) ... โดยที่ ...",
    "2. ระบบตามข้อถือสิทธิที่ 1 ที่ ... (dependent)",
    "3. ระบบตามข้อถือสิทธิที่ 1 หรือ 2 ที่ ... (dependent)",
    "4. ระบบตามข้อถือสิทธิที่ 1 ที่ ... (alternative)"
  ],

  "draft_abstract_th": "บทสรุปการประดิษฐ์ในรูปแบบมาตรฐาน ≤ 200 คำ — ระบุปัญหา/วิธีแก้/ประโยชน์อย่างกระชับ",

  "prior_art": [
    {
      "title": "ชื่อ patent / paper / product เก่า",
      "patent_or_doi": "US...... | EP...... | TH..... | DOI:...",
      "country": "US | EP | TH | JP | CN | WO",
      "year": 2020,
      "similarity": "high | medium | low",
      "key_difference_th": "ของเราต่างจากของเขาเพราะ ...",
      "source_note": "real | likely | hypothetical"
    }
  ],

  "filing_strategy": {
    "primary_country": "Thailand",
    "primary_rationale_th": "ทำไมยื่นที่ไทยก่อน — ตลาด, ต้นทุน, ลำดับวันยื่น (priority date)",
    "international_path": "pct | direct | none",
    "international_rationale_th": "ทำไมเลือกเส้นทางนี้ — PCT 30 เดือน, direct ใน 12 เดือน, หรือไม่ยื่นต่างประเทศ",
    "recommended_other_countries": ["US", "CN", "JP"],
    "country_rationale_th": {
      "US": "เหตุผลที่ควรยื่นที่ US — ตลาด, การคุ้มครอง, อายุสิทธิบัตร",
      "CN": "...",
      "JP": "..."
    },
    "global_comparison_th": "สรุปเปรียบเทียบการคุ้มครองในประเทศต่าง ๆ — คุ้มครองนานเท่าไหร่, ค่าจดเฉลี่ย, ระยะเวลา"
  },

  "risks_th": [
    "ความเสี่ยง 1: เช่น ความใหม่อาจไม่พอ เนื่องจาก ...",
    "ความเสี่ยง 2: ค่าใช้จ่ายในการรักษาสิทธิหลังปีที่ ... อาจสูงเกิน",
    "ความเสี่ยง 3: ..."
  ],

  "next_steps_th": [
    "1. ตรวจสอบ prior art เพิ่มเติมที่ฐาน Google Patents, J-PlatPat, IPThailand search",
    "2. วาดภาพประกอบ (อาจใช้ AutoCAD/Visio) ตาม drawings_description",
    "3. ขอจดหมายยินยอมจากผู้ประดิษฐ์ทุกคน",
    "4. เตรียมเงินค่าธรรมเนียมตาม estimated_cost_thb",
    "5. ยื่นที่ IPThailand หรือผ่านตัวแทน",
    "..."
  ]
}

CRITICAL RULES:
- Use proper Thai patent terminology: "ข้อถือสิทธิ" (claims), "การประดิษฐ์" (invention), "บทสรุป" (abstract), "รายละเอียดการประดิษฐ์" (specification/disclosure)
- Petty patent (อนุสิทธิบัตร) is BEST for: incremental improvements, faster grant (~1 year), 10-year max term, no examination needed → suggest when invention is useful but not highly inventive
- Patent (สิทธิบัตร) is BEST for: highly novel inventions, 20-year term, needs substantive examination → suggest when there's a real "inventive step"
- Always include at least 3 prior art entries. If you cannot find real ones in your training data, mark "source_note": "hypothetical" and describe what an examiner LIKELY would cite
- Claims must be hierarchical: claim 1 is independent (broadest), claims 2+ depend on it
- Abstract must be exactly one paragraph, ≤ 200 Thai words (count Thai 'syllable groups' as words)
- Be realistic about costs — actual IPThailand fees: petty patent filing ~250 baht + publication ~250 + annual 250-400 baht/year
- Be helpful and concrete — researchers will use this directly. Avoid generic advice.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      idea_title,
      idea_description,
      technical_details,
      target_markets,    // ["TH", "ASEAN", "global"]
      preferred_type,    // "auto" | "petty_patent" | "patent" | ...
    } = body as {
      idea_title?: string;
      idea_description?: string;
      technical_details?: string;
      target_markets?: string[];
      preferred_type?: string;
    };

    if (!idea_description || idea_description.trim().length < 30) {
      return NextResponse.json({ error: 'กรุณากรอกคำอธิบายไอเดียอย่างน้อย 30 ตัวอักษร' }, { status: 400 });
    }

    const userContext = `
INVENTION IDEA FROM RESEARCHER:

Title (working): ${idea_title || '(no title yet)'}

Description:
${idea_description}

${technical_details ? `Technical details:\n${technical_details}\n` : ''}

Target markets: ${(target_markets || ['TH']).join(', ')}
Preferred filing type: ${preferred_type === 'auto' || !preferred_type ? '(let AI recommend)' : preferred_type}

Now produce the complete JSON pre-filing package.
`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n${userContext}\n---`;

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
