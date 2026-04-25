/**
 * AI Document Parser — Reusable library for AI-powered document extraction
 *
 * Use cases:
 * - Parse PDF/DOCX → structured JSON (curriculum, contracts, articles)
 * - Extract metadata from text (tags, SDGs, classifications)
 * - Auto-classify content into categories
 * - Vision-based document understanding (images, scanned docs)
 *
 * Built on top of ai-provider.ts (multi-provider AI calls).
 *
 * Quick start:
 * ```typescript
 * import { parseDocument, TEMPLATES } from '@/lib/ai-document-parser';
 *
 * const result = await parseDocument({
 *   template: TEMPLATES.news_tags,
 *   input: { text: 'Article content...' },
 * });
 * // result.data = { tags: [...], sdg_goals: [...] }
 * ```
 *
 * Or define your own template:
 * ```typescript
 * const result = await parseDocument({
 *   template: {
 *     name: 'product_specs',
 *     description: 'Extract product specifications',
 *     schema: {
 *       name: 'product name',
 *       price: 'number in THB',
 *       features: 'array of feature strings',
 *     },
 *   },
 *   input: { file: pdfFile },
 * });
 * ```
 */

import { callAIText, callAIWithVision, AIProvider, AIConfig } from '@/lib/ai-provider';

// ============================================================
// Types
// ============================================================

export interface ParseTemplate {
  /** Unique identifier for this template */
  name: string;
  /** Human-readable description (used in prompts) */
  description: string;
  /** Schema description — keys are field names, values are descriptions/types */
  schema: Record<string, string>;
  /** Optional custom system prompt (default generated from schema) */
  systemPrompt?: string;
  /** Optional examples to include in prompt (few-shot) */
  examples?: Array<{ input: string; output: any }>;
  /** Maximum tokens for response (default 4096) */
  maxTokens?: number;
  /** Language hint (default 'th' for Thai) */
  language?: 'th' | 'en' | 'auto';
}

export interface ParseInput {
  /** Plain text input */
  text?: string;
  /** File for vision-based parsing (PDF, image) */
  file?: File | Blob;
  /** URL to fetch and parse text from */
  url?: string;
  /** Pre-extracted text + reference image */
  textWithImage?: { text: string; imageBase64: string; mimeType: string };
}

export interface ParseOptions {
  template: ParseTemplate;
  input: ParseInput;
  /** Override default AI provider (default uses configured provider) */
  provider?: AIProvider;
  /** Override default model */
  model?: string;
  /** Retry on failure (default 1) */
  maxRetries?: number;
}

export interface ParseResult<T = Record<string, any>> {
  success: boolean;
  data: T | null;
  source: string;
  model: string;
  latency_ms: number;
  template: string;
  error?: string;
  raw_response?: string;
}

// ============================================================
// Pre-built templates (can extend with custom)
// ============================================================

export const TEMPLATES = {
  // === News & Content ===
  news_tags: {
    name: 'news_tags',
    description: 'แยก tags คำสำคัญ และ SDG goals จากข่าวสาร',
    schema: {
      tags: 'string[] - คำสำคัญ/keywords (3-7 ตัว, ภาษาอังกฤษหรือไทย)',
      sdg_goals: 'string[] - รหัส SDG เช่น "SDG 7", "SDG 13"',
    },
    language: 'th' as const,
  },

  // === Publications ===
  publication_metadata: {
    name: 'publication_metadata',
    description: 'แยกข้อมูล metadata ของบทความวิจัย',
    schema: {
      title: 'string - ชื่อเรื่อง',
      authors: 'string[] - รายชื่อผู้แต่ง',
      journal: 'string - ชื่อวารสาร/conference',
      year: 'number - ปีที่ตีพิมพ์',
      doi: 'string|null - DOI ถ้ามี',
      keywords: 'string[] - keywords',
      abstract: 'string - บทคัดย่อ',
      pub_type: 'journal|conference|book_chapter|book|patent',
    },
    language: 'auto' as const,
  },

  publication_classify: {
    name: 'publication_classify',
    description: 'จำแนก publication เข้ากลุ่มสาขาวิจัยและ SDG',
    schema: {
      tags: 'string[] - 1-3 สาขาวิจัย (Solar Energy, Battery Storage, Electric Vehicle, Wireless Power Transfer, Smart Grid, Power Electronics, Renewable Energy, IoT Systems, Energy Audit, Microgrid)',
      sdgs: 'string[] - 1-3 รหัส SDG (SDG 4, SDG 7, SDG 9, SDG 11, SDG 12, SDG 13)',
      confidence: 'number - 0-1 ความมั่นใจ',
    },
    language: 'en' as const,
  },

  // === Training Courses ===
  course_curriculum: {
    name: 'course_curriculum',
    description: 'แยกโครงสร้างหลักสูตรอบรมจากเอกสาร',
    schema: {
      title_th: 'string - ชื่อหลักสูตรภาษาไทย',
      title_en: 'string - ชื่อหลักสูตรภาษาอังกฤษ',
      description: 'string - คำอธิบายหลักสูตร',
      duration_days: 'number - จำนวนวัน',
      duration_hours: 'number - จำนวนชั่วโมง',
      target_audience: 'string[] - กลุ่มเป้าหมาย',
      objectives: 'string[] - วัตถุประสงค์',
      schedule: 'array - กำหนดการรายวัน [{day: number, date?: string, sessions: [{time: string, topic: string, instructor?: string}]}]',
      modules: 'array - โมดูล [{title: string, description?: string, duration_hours?: number}]',
      evaluation: 'object - {methods: string[], criteria: array, grading_scale?: string}',
      instructors: 'string[] - รายชื่อวิทยากร',
      materials: 'string[] - เอกสาร/อุปกรณ์',
      fee_external: 'number|null - ค่าลงทะเบียน',
      fee_student: 'number|null - ค่านศ.',
    },
    language: 'th' as const,
    maxTokens: 8192,
  },

  // === Grants ===
  grant_contract: {
    name: 'grant_contract',
    description: 'แยกข้อมูลทุนวิจัยจากสัญญา/เอกสารโครงการ',
    schema: {
      title_th: 'string - ชื่อโครงการภาษาไทย',
      title_en: 'string|null - ชื่อโครงการภาษาอังกฤษ',
      contract_number: 'string|null - เลขที่สัญญา',
      funding_agency: 'string - แหล่งทุน',
      budget: 'number|null - งบประมาณ (บาท)',
      start_date: 'string|null - YYYY-MM-DD',
      end_date: 'string|null - YYYY-MM-DD',
      fiscal_year: 'number|null - ปีงบประมาณ พ.ศ.',
      description: 'string - บทคัดย่อโครงการ',
      research_areas: 'string[] - สาขาวิจัย',
      team_members: 'array - [{name: string, role: pi|co_pi|researcher|consultant, affiliation?: string}]',
      milestones: 'array - [{title, planned_date, weight?: number, deliverables?: string[]}]',
      work_plan: 'array - แผนงาน [{phase: string, activities: string[], duration_months?: number}]',
    },
    language: 'th' as const,
    maxTokens: 8192,
  },

  // === Travel Documents ===
  travel_approval: {
    name: 'travel_approval',
    description: 'แยกข้อมูลหนังสืออนุมัติเดินทางไปราชการ',
    schema: {
      approval_number: 'string - เลขที่หนังสือ',
      purpose: 'string - วัตถุประสงค์',
      location: 'string - สถานที่',
      start_date: 'string - YYYY-MM-DD',
      end_date: 'string - YYYY-MM-DD',
      activity_type: 'conference|seminar|training|field_work|meeting|inspection|exhibition|consulting|other',
      participants: 'string[] - รายชื่อผู้ร่วมเดินทาง',
      budget: 'number|null - งบประมาณ',
      funding_source: 'string|null - แหล่งงบ',
    },
    language: 'th' as const,
  },

  // === Generic ===
  generic_classification: {
    name: 'generic_classification',
    description: 'จำแนกเนื้อหาเข้าหมวดหมู่ + แยก keywords',
    schema: {
      categories: 'string[] - หมวดหมู่',
      keywords: 'string[] - คำสำคัญ',
      summary: 'string - สรุปสั้นๆ ในภาษาเดียวกับ input',
    },
    language: 'auto' as const,
  },

  generic_extract: {
    name: 'generic_extract',
    description: 'สกัดข้อมูล structured จากเอกสาร (ใช้ schema custom ผ่าน parameter)',
    schema: {
      // empty — caller must provide schema via custom template
    },
    language: 'auto' as const,
  },
} satisfies Record<string, ParseTemplate>;

// ============================================================
// Core parser function
// ============================================================

function buildPrompt(template: ParseTemplate, content: string): string {
  const lang = template.language || 'th';
  const langInstruction = lang === 'th' ? 'ตอบเป็นภาษาไทยถ้าเนื้อหาเป็นไทย หรือภาษาเดียวกับเนื้อหา' :
    lang === 'en' ? 'Respond in English' :
    'Respond in the same language as the input';

  const schemaLines = Object.entries(template.schema)
    .map(([key, desc]) => `  "${key}": ${desc}`)
    .join(',\n');

  let prompt = template.systemPrompt || `${template.description}\n\n`;

  prompt += `กรุณาวิเคราะห์เนื้อหาต่อไปนี้และตอบในรูปแบบ JSON เท่านั้น (ไม่ต้องมี markdown code block, ไม่ต้องอธิบาย):

JSON Schema:
{
${schemaLines}
}

${langInstruction}

`;

  if (template.examples && template.examples.length > 0) {
    prompt += `\nExamples:\n`;
    template.examples.forEach((ex, i) => {
      prompt += `Input ${i + 1}: ${ex.input}\nOutput ${i + 1}: ${JSON.stringify(ex.output, null, 2)}\n\n`;
    });
  }

  prompt += `\nContent:\n${content}\n\nJSON:`;
  return prompt;
}

async function fetchUrlText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: 'text/html,text/plain,*/*' } });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const text = await res.text();
  // Strip HTML tags + scripts
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50_000); // Cap at 50k chars
}

async function fileToBase64(file: File | Blob): Promise<{ base64: string; mimeType: string }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  const mimeType = (file as File).type || 'application/octet-stream';
  return { base64, mimeType };
}

/**
 * Main parser function — multi-provider, multi-input, template-based
 */
export async function parseDocument<T = Record<string, any>>(
  opts: ParseOptions
): Promise<ParseResult<T>> {
  const start = Date.now();
  const { template, input, provider, model, maxRetries = 1 } = opts;
  const config: Partial<AIConfig> = { provider, model };

  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Determine input mode
      let result;

      if (input.file) {
        // Vision mode
        const { base64, mimeType } = await fileToBase64(input.file);
        const prompt = buildPrompt(template, '(เนื้อหาอยู่ในไฟล์ที่แนบมา)');
        result = await callAIWithVision(base64, mimeType, prompt, config);
      } else if (input.textWithImage) {
        // Text + image
        const prompt = buildPrompt(template, input.textWithImage.text);
        result = await callAIWithVision(input.textWithImage.imageBase64, input.textWithImage.mimeType, prompt, config);
      } else {
        // Text mode (or fetch URL)
        let content = input.text || '';
        if (input.url) {
          content = await fetchUrlText(input.url);
        }
        if (!content.trim()) {
          throw new Error('No content provided (text, file, or url required)');
        }
        const prompt = buildPrompt(template, content);
        result = await callAIText(prompt, config);
      }

      const latency = Date.now() - start;

      if (result.data && Object.keys(result.data).length > 0) {
        return {
          success: true,
          data: result.data as T,
          source: result.source,
          model: result.model,
          latency_ms: latency,
          template: template.name,
        };
      } else {
        lastError = result.error || 'AI returned no data';
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  return {
    success: false,
    data: null,
    source: provider || 'auto',
    model: model || '',
    latency_ms: Date.now() - start,
    template: template.name,
    error: lastError || 'Unknown error',
  };
}

// ============================================================
// Convenience helpers
// ============================================================

/** Quick text classification helper */
export async function classifyText<T = Record<string, any>>(
  text: string,
  template: keyof typeof TEMPLATES | ParseTemplate,
  options?: Omit<ParseOptions, 'template' | 'input'>
): Promise<ParseResult<T>> {
  const tpl = typeof template === 'string' ? TEMPLATES[template] : template;
  return parseDocument<T>({
    template: tpl,
    input: { text },
    ...options,
  });
}

/** Quick file parsing helper */
export async function parseFile<T = Record<string, any>>(
  file: File | Blob,
  template: keyof typeof TEMPLATES | ParseTemplate,
  options?: Omit<ParseOptions, 'template' | 'input'>
): Promise<ParseResult<T>> {
  const tpl = typeof template === 'string' ? TEMPLATES[template] : template;
  return parseDocument<T>({
    template: tpl,
    input: { file },
    ...options,
  });
}

/** Quick URL parsing helper */
export async function parseUrl<T = Record<string, any>>(
  url: string,
  template: keyof typeof TEMPLATES | ParseTemplate,
  options?: Omit<ParseOptions, 'template' | 'input'>
): Promise<ParseResult<T>> {
  const tpl = typeof template === 'string' ? TEMPLATES[template] : template;
  return parseDocument<T>({
    template: tpl,
    input: { url },
    ...options,
  });
}

// ============================================================
// Type-safe helpers for known templates
// ============================================================

export interface NewsTagsResult {
  tags: string[];
  sdg_goals: string[];
}

export interface PublicationClassifyResult {
  tags: string[];
  sdgs: string[];
  confidence: number;
}

export interface CourseCurriculumResult {
  title_th: string;
  title_en: string;
  description: string;
  duration_days: number;
  duration_hours: number;
  target_audience: string[];
  objectives: string[];
  schedule: Array<{ day: number; date?: string; sessions: Array<{ time: string; topic: string; instructor?: string }> }>;
  modules: Array<{ title: string; description?: string; duration_hours?: number }>;
  evaluation: { methods: string[]; criteria: any[]; grading_scale?: string };
  instructors: string[];
  materials: string[];
  fee_external?: number;
  fee_student?: number;
}

export interface GrantContractResult {
  title_th: string;
  title_en?: string;
  contract_number?: string;
  funding_agency: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  fiscal_year?: number;
  description: string;
  research_areas: string[];
  team_members: Array<{ name: string; role: string; affiliation?: string }>;
  milestones: Array<{ title: string; planned_date: string; weight?: number; deliverables?: string[] }>;
  work_plan: Array<{ phase: string; activities: string[]; duration_months?: number }>;
}

export interface TravelApprovalResult {
  approval_number: string;
  purpose: string;
  location: string;
  start_date: string;
  end_date: string;
  activity_type: string;
  participants: string[];
  budget?: number;
  funding_source?: string;
}

// Type-safe wrappers
export const parseNewsTags = (text: string, opts?: any) => classifyText<NewsTagsResult>(text, 'news_tags', opts);
export const classifyPublication = (text: string, opts?: any) => classifyText<PublicationClassifyResult>(text, 'publication_classify', opts);
export const parseCourse = (input: ParseInput, opts?: any) => parseDocument<CourseCurriculumResult>({ template: TEMPLATES.course_curriculum, input, ...opts });
export const parseGrant = (input: ParseInput, opts?: any) => parseDocument<GrantContractResult>({ template: TEMPLATES.grant_contract, input, ...opts });
export const parseTravel = (input: ParseInput, opts?: any) => parseDocument<TravelApprovalResult>({ template: TEMPLATES.travel_approval, input, ...opts });
