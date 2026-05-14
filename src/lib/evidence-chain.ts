/**
 * Evidence Trust Chain — "ห่วงโซ่ความน่าเชื่อถือของหลักฐาน"
 *
 * แนวคิดเปรียบเทียบ: เหมือนกับวิธีที่นักวิชาการคลาสสิกของหลายอารยธรรม
 * (เช่น นักนิติศาสตร์, นักประวัติศาสตร์ Polybius / Thucydides, สำนัก
 * Hanafi/Shafi'i, นักวิทยาศาสตร์ Royal Society) ใช้ตรวจสอบรายงาน:
 *
 *   1. ใครรายงาน?      (Who narrates / claims this?)
 *   2. รายงานจากใคร?   (From whom did they get it?)
 *   3. ความน่าเชื่อถือ? (Is each link in the chain trustworthy?)
 *
 * ในงานวิจัย / สิทธิบัตร / ข้อเสนอโครงการ เรานำหลักนี้มาบังคับให้
 *   - ทุก "claim" (ข้อความที่อ้างเป็นข้อเท็จจริง) ต้องมี chain ของ
 *     แหล่งที่มา (links)
 *   - แต่ละ link ต้องระบุ source_type + credibility + วิธีตรวจสอบ
 *   - คะแนนรวมของ chain คำนวณจาก:
 *       a) ความน่าเชื่อถือของแต่ละ link (weakest link weighted heavier)
 *       b) จำนวน independent corroborations
 *       c) ระยะของ chain (chain สั้นชัดเจน > chain ยาวคลุมเครือ)
 *       d) การตรวจสอบได้ (verifiable URL/DOI/witness)
 */

export type SourceType =
  | 'primary_research'  // งานวิจัยต้นฉบับของเราเอง (lab notebook, dataset)
  | 'peer_reviewed'     // บทความที่ผ่าน peer review (journal)
  | 'patent'            // สิทธิบัตร / อนุสิทธิบัตร
  | 'standards'         // มาตรฐาน (IEEE, ISO, IEC, มอก.)
  | 'industry_report'   // รายงานอุตสาหกรรม
  | 'textbook'          // ตำรา (จัดเป็น secondary)
  | 'conference'        // เอกสารประชุมวิชาการ
  | 'preprint'          // arXiv / SSRN (ยังไม่ peer review)
  | 'gov_data'          // ข้อมูลรัฐ / สำมะโน
  | 'expert_interview'  // สัมภาษณ์ผู้เชี่ยวชาญ
  | 'personal_obs'      // การสังเกตของผู้วิจัยเอง
  | 'media'             // สื่อมวลชน / ข่าว
  | 'web_general'       // เว็บไซต์ทั่วไป
  | 'common_knowledge'  // ความรู้ทั่วไป (ไม่ต้องอ้างเช่น "น้ำมีจุดเดือด 100°C")
  | 'unverifiable';     // อ้างไม่ได้ / ลอย

export type Credibility = 'high' | 'medium' | 'low' | 'unverified';

export type EvidenceLink = {
  /** ผู้พูด / แหล่งที่มา (เช่น "Smith et al. 2024" หรือ "IEEE 802.11-2020" หรือ "ผศ.ดร.อนนท์ Lab Notebook 2024") */
  source: string;
  source_type: SourceType;
  /** URL / DOI / patent number / archive locator */
  source_url?: string;
  authors?: string[];
  year?: number;
  credibility: Credibility;
  /** เหตุผลว่าทำไมจึงประเมิน credibility ที่ระดับนั้น */
  credibility_reason: string;
  /** วิธีตรวจสอบ — "ค้น DOI ใน Scopus", "ดู notebook page 23", "อีเมลถาม Dr. X" */
  verification_path?: string;
};

export type ChainStrength = 'strong' | 'moderate' | 'weak' | 'uncited';

export type EvidenceChain = {
  /** ข้อความที่อ้างเป็นข้อเท็จจริงในเอกสาร */
  claim: string;
  /** ห่วงโซ่ links เรียงจาก source ที่ใกล้ตัวที่สุด → ต้นน้ำที่สุด */
  chain: EvidenceLink[];
  /** จำนวน source อิสระที่ยืนยันเรื่องเดียวกัน (ยิ่งสูงยิ่งน่าเชื่อ) */
  independent_corroborations: number;
  overall_trust: ChainStrength;
  /** คะแนน 0-100 */
  trust_score: number;
  concerns: string[];
  suggestions: string[];
};

export type EvidenceAudit = {
  document_type: 'proposal' | 'patent' | 'report' | 'plan';
  /** คะแนนรวม 0-100 */
  overall_score: number;
  claims: EvidenceChain[];
  strong_claims_count: number;
  weak_claims_count: number;
  uncited_claims_count: number;
  recommendations: string[];
  summary: string;
};

// ────────────────────────────────────────────────────────────────
// Trust scoring algorithm (deterministic so we can verify AI didn't lie)
// ────────────────────────────────────────────────────────────────

const SOURCE_TYPE_BASE_SCORE: Record<SourceType, number> = {
  primary_research: 85,
  peer_reviewed: 90,
  patent: 80,
  standards: 95,
  industry_report: 65,
  textbook: 75,
  conference: 70,
  preprint: 55,
  gov_data: 80,
  expert_interview: 60,
  personal_obs: 50,
  media: 35,
  web_general: 30,
  common_knowledge: 70,
  unverifiable: 10,
};

const CREDIBILITY_MULTIPLIER: Record<Credibility, number> = {
  high: 1.0,
  medium: 0.75,
  low: 0.45,
  unverified: 0.2,
};

/**
 * Compute trust score for a chain (0-100).
 * - Multiplies the base score of each link by its credibility multiplier
 * - Takes the WEAKEST link as the floor (Isnād principle: chain is only as
 *   strong as its weakest narrator)
 * - Boosts for independent corroborations (+5 per corroboration, capped at +20)
 * - Bonus if every link has a verification_path (+5)
 */
export function computeTrustScore(chain: EvidenceLink[], corroborations: number = 0): number {
  if (!chain || chain.length === 0) return 0;

  const linkScores = chain.map((link) => {
    const base = SOURCE_TYPE_BASE_SCORE[link.source_type] ?? 30;
    const mult = CREDIBILITY_MULTIPLIER[link.credibility] ?? 0.3;
    return base * mult;
  });

  // Average of all links, then floor at the weakest link (×0.85)
  const avg = linkScores.reduce((s, x) => s + x, 0) / linkScores.length;
  const weakest = Math.min(...linkScores);
  let score = Math.min(avg, weakest * 1.15 + 5);

  // Boost for independent corroborations
  score += Math.min(corroborations * 5, 20);

  // Boost if all links are verifiable
  if (chain.every((l) => !!l.verification_path)) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function classifyStrength(score: number): ChainStrength {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'moderate';
  if (score >= 25) return 'weak';
  return 'uncited';
}

export const TRUST_BADGE: Record<ChainStrength, { label: string; cls: string; icon: string }> = {
  strong: { label: 'น่าเชื่อถือสูง', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '✓✓' },
  moderate: { label: 'น่าเชื่อถือปานกลาง', cls: 'bg-amber-100 text-amber-700 border-amber-300', icon: '✓' },
  weak: { label: 'น่าเชื่อถือต่ำ', cls: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⚠' },
  uncited: { label: 'ขาดการอ้างอิง', cls: 'bg-red-100 text-red-700 border-red-300', icon: '✗' },
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  primary_research: 'งานวิจัยต้นฉบับ',
  peer_reviewed: 'บทความ Peer-reviewed',
  patent: 'สิทธิบัตร / อนุสิทธิบัตร',
  standards: 'มาตรฐาน',
  industry_report: 'รายงานอุตสาหกรรม',
  textbook: 'ตำรา',
  conference: 'เอกสารประชุมวิชาการ',
  preprint: 'Preprint (ยังไม่ peer review)',
  gov_data: 'ข้อมูลรัฐ',
  expert_interview: 'สัมภาษณ์ผู้เชี่ยวชาญ',
  personal_obs: 'การสังเกตของผู้วิจัย',
  media: 'สื่อมวลชน',
  web_general: 'เว็บไซต์ทั่วไป',
  common_knowledge: 'ความรู้ทั่วไป',
  unverifiable: 'ไม่สามารถตรวจสอบได้',
};

export const CREDIBILITY_LABEL: Record<Credibility, string> = {
  high: 'สูง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
  unverified: 'ยังไม่ได้ตรวจสอบ',
};

/**
 * Prompt instructions that any AI feature can append to its system prompt
 * to enforce Evidence Chain output.
 */
export const EVIDENCE_CHAIN_PROMPT_INSTRUCTIONS = `
EVIDENCE TRUST CHAIN (ห่วงโซ่ความน่าเชื่อถือของหลักฐาน) — REQUIRED:
สำหรับเอกสารวิชาการทุกฉบับ ทุกข้อความที่อ้างเป็นข้อเท็จจริง (claim) ต้องผ่านการตอบ 3 คำถาม:
  (1) ใครเป็นคนพูด/รายงาน?  (Who is the source?)
  (2) เขารู้จากใคร?         (Where did they get it from?)
  (3) ตัวตนนั้นน่าเชื่อถือไหม? (Is each link in the chain trustworthy?)

นี่ไม่ใช่หลักศาสนาเฉพาะ แต่เป็นวิธีการที่นักวิชาการคลาสสิกหลายอารยธรรมใช้
ตรวจสอบรายงาน (Royal Society, Polybius, นักนิติศาสตร์เปอร์เซีย/อาหรับ, ฯลฯ)
และเป็นพื้นฐานของ peer review สมัยใหม่และ chain-of-custody ในกระบวนการทางวิทยาศาสตร์

สำหรับ claim สำคัญ (background, prior art, technical specs, ที่อาจถูกท้าทาย)
เพิ่ม field "evidence_chain" เป็น array ของ object โดยแต่ละ object คือ EvidenceChain
ที่มีโครงสร้าง:

  {
    "claim": "ข้อความที่อ้างว่าเป็นข้อเท็จจริง",
    "chain": [
      {
        "source": "ผู้พูด/แหล่งที่มา (Author et al. ปี | patent no | standard ID | observation)",
        "source_type": "primary_research | peer_reviewed | patent | standards | industry_report | textbook | conference | preprint | gov_data | expert_interview | personal_obs | media | web_general | common_knowledge | unverifiable",
        "source_url": "URL / DOI / Patent no (ถ้ามี)",
        "authors": ["Author 1", "..."],
        "year": 2024,
        "credibility": "high | medium | low | unverified",
        "credibility_reason": "เหตุผลที่ประเมิน credibility ระดับนี้ (ระบุ journal IF, การยอมรับในวงการ, หรือเหตุผลที่สงสัย)",
        "verification_path": "วิธีตรวจสอบ เช่น 'ค้น DOI ใน Scopus', 'ดู Lab notebook หน้า 23'"
      }
    ],
    "independent_corroborations": 2,
    "concerns": ["ถ้ามีจุดอ่อน เช่น 'ข้อมูลปี 2010 อาจล้าสมัย'"],
    "suggestions": ["วิธีเสริมหลักฐาน เช่น 'ค้นบทความ 5 ปีล่าสุดเพิ่ม'"]
  }

หลักการของ chain:
- แหล่ง primary_research, peer_reviewed, patent, standards = ดีที่สุด
- preprint, conference, expert_interview = ใช้ได้แต่ระวัง
- media, web_general, unverifiable = ใช้แทนหลักฐานหลักไม่ได้
- ถ้าไม่มีแหล่งจริง — บอกตรง ๆ ว่า "common_knowledge" หรือ "personal_obs" และให้ "unverified" credibility
- อย่าเสกแหล่งขึ้นมาเอง — ถ้าไม่รู้แน่ ให้ source: "หลักฐานเพิ่มเติม - ต้องค้นต่อ" และ credibility: "unverified"
- ยิ่งมี independent_corroborations มาก ห่วงโซ่ยิ่งแข็งแรง
`;
