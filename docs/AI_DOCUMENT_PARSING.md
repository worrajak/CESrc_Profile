# AI Document Parsing — Reusable Library

ระบบ AI document parser แบบ template-based ที่ใช้กับงานต่างๆ ในระบบได้ทุกประเภท

> **TL;DR:** ใช้ `parseDocument()` หรือ helper functions แทนการเขียน AI prompt + JSON parse ซ้ำๆ ในแต่ละ feature

## Why?

ก่อนหน้านี้ มี API endpoint แยกๆ สำหรับ AI ในแต่ละงาน:
- `/api/news/suggest-tags` — แยก tags + SDG
- `/api/services/parse-course` — แยกหลักสูตรอบรม
- `/api/grants/parse-contract` — แยกสัญญาทุนวิจัย
- `/api/publications/auto-classify` — จำแนกผลงานวิจัย

ทุก endpoint ต้องเขียน:
1. AI prompt
2. JSON.parse + validation
3. Error handling
4. File upload + base64 conversion

→ **ซ้ำซ้อนเยอะ** + maintain ยาก

ตอนนี้เปลี่ยนเป็น 1 library + 1 unified API endpoint

## Architecture

```
┌──────────────────────────────────────────────┐
│ src/lib/ai-document-parser.ts (core library) │
│ - parseDocument()                            │
│ - TEMPLATES (pre-built)                      │
│ - Type-safe helpers (parseCourse, parseGrant)│
└────────────────┬─────────────────────────────┘
                 │ uses
                 ▼
┌──────────────────────────────────────────────┐
│ src/lib/ai-provider.ts (low-level)           │
│ - callAIText()                               │
│ - callAIWithVision()                         │
│ - Multi-provider support (5 providers)       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ /api/ai/parse (unified endpoint)             │
│ - POST: parse with template + input          │
│ - GET: list available templates              │
└──────────────────────────────────────────────┘
```

## Pre-built Templates

| Template | Use Case | Schema |
|---|---|---|
| `news_tags` | Extract tags + SDGs from news | `tags`, `sdg_goals` |
| `publication_metadata` | Extract paper metadata | `title`, `authors`, `journal`, `year`, `doi`, ... |
| `publication_classify` | Classify pub into research areas | `tags`, `sdgs`, `confidence` |
| `course_curriculum` | Parse training course doc | `title_th`, `schedule`, `modules`, `evaluation`, ... |
| `grant_contract` | Parse research grant contract | `title_th`, `funding_agency`, `budget`, `milestones`, ... |
| `travel_approval` | Parse official travel doc | `approval_number`, `purpose`, `location`, `dates`, ... |
| `generic_classification` | Generic categorization | `categories`, `keywords`, `summary` |
| `generic_extract` | Custom schema extraction | (provide schema in custom template) |

## Usage Examples

### 1. From frontend (client component)

```typescript
import { parseNewsTags } from '@/lib/ai-document-parser';

// Extract tags from text
const result = await parseNewsTags('นักวิจัยพัฒนาแบตเตอรี่ลิเทียมสำหรับ EV...');

if (result.success) {
  console.log(result.data.tags);       // ['Battery', 'EV', 'Solar Energy']
  console.log(result.data.sdg_goals);  // ['SDG 7', 'SDG 13']
}
```

### 2. Parse PDF file

```typescript
import { parseCourse } from '@/lib/ai-document-parser';

const file = e.target.files[0]; // from <input type="file">
const result = await parseCourse({ file });

if (result.success) {
  const course = result.data;
  console.log(course.title_th);
  console.log(course.schedule);
  // Save to DB...
}
```

### 3. Custom template

```typescript
import { parseDocument } from '@/lib/ai-document-parser';

const result = await parseDocument({
  template: {
    name: 'invoice',
    description: 'Extract invoice details',
    schema: {
      invoice_number: 'string',
      vendor: 'string',
      total_amount: 'number',
      items: 'array of {name, qty, price}',
    },
    language: 'th',
  },
  input: { file: invoicePdf },
});
```

### 4. From backend API

```typescript
import { parseDocument, TEMPLATES } from '@/lib/ai-document-parser';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const result = await parseDocument({
    template: TEMPLATES.publication_classify,
    input: { text },
  });

  return NextResponse.json(result);
}
```

### 5. Via unified API endpoint

```bash
# Use existing template
curl -X POST https://your-app.com/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{
    "template": "news_tags",
    "text": "บทความเกี่ยวกับ solar rooftop..."
  }'

# Custom template
curl -X POST https://your-app.com/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "product_review",
      "description": "Extract product review sentiment",
      "schema": {
        "rating": "number 1-5",
        "pros": "string[]",
        "cons": "string[]",
        "sentiment": "positive|neutral|negative"
      }
    },
    "text": "สินค้าดีมาก ใช้งานง่าย แต่ราคาค่อนข้างสูง..."
  }'

# Upload file
curl -X POST https://your-app.com/api/ai/parse \
  -F "template=course_curriculum" \
  -F "file=@curriculum.pdf"
```

### 6. List available templates

```bash
curl https://your-app.com/api/ai/parse
```

Returns:
```json
{
  "templates": [
    {
      "name": "news_tags",
      "key": "news_tags",
      "description": "...",
      "schema": {...},
      "language": "th"
    },
    ...
  ]
}
```

## Provider Selection

Default: ใช้ provider ที่ตั้ง `is_default = true` ใน `ai_config` table

Override:
```typescript
await parseDocument({
  template: TEMPLATES.news_tags,
  input: { text },
  provider: 'openrouter',
  model: 'deepseek/deepseek-chat-v3-0324',
});
```

## Error Handling

ทุก call return `ParseResult` ที่มี:
```typescript
{
  success: boolean,
  data: T | null,
  source: string,   // 'OpenRouter (model)', 'Claude', etc.
  model: string,
  latency_ms: number,
  template: string,
  error?: string,
  raw_response?: string,
}
```

```typescript
const result = await parseNewsTags(text);
if (!result.success) {
  console.error(`AI parse failed (${result.source}): ${result.error}`);
  // fallback to manual entry...
} else {
  // use result.data
}
```

## Adding a New Template

ถ้ามี use case ใหม่ (เช่น parse แผนวิจัย, IRB application, ฯลฯ):

### Option A: Inline custom template (one-off)

```typescript
const result = await parseDocument({
  template: {
    name: 'my_custom',
    description: 'Extract X from Y',
    schema: { ... },
  },
  input: { text },
});
```

### Option B: Add to TEMPLATES (reusable)

แก้ `src/lib/ai-document-parser.ts`:

```typescript
export const TEMPLATES = {
  ...existing,

  // ใหม่
  irb_application: {
    name: 'irb_application',
    description: 'แยกข้อมูลเอกสารขออนุมัติจริยธรรมการวิจัย',
    schema: {
      project_title: 'string',
      pi_name: 'string',
      participants_count: 'number',
      risk_level: 'low|medium|high',
      // ...
    },
    language: 'th',
  },
};

// ถ้าต้อง type-safe
export interface IrbApplicationResult {
  project_title: string;
  pi_name: string;
  participants_count: number;
  risk_level: 'low' | 'medium' | 'high';
}

export const parseIrbApplication = (input: ParseInput, opts?: any) =>
  parseDocument<IrbApplicationResult>({
    template: TEMPLATES.irb_application,
    input,
    ...opts,
  });
```

## Migration: เก่า → ใหม่

### Before (in `/api/news/suggest-tags`):
```typescript
const prompt = `แยก tags จากเนื้อหา: ${text}\nReturn JSON: {tags: [...]}`;
const result = await callAIText(prompt);
const data = JSON.parse(result.data); // hope it's valid
return data;
```

### After:
```typescript
import { parseNewsTags } from '@/lib/ai-document-parser';

const result = await parseNewsTags(text);
return result.data;
```

## Performance

- Latency: ~2-5 seconds per call (depends on provider + model)
- Cache results when possible (e.g., per publication ID)
- Use cheaper models for batch operations:
  - `gemini-2.5-flash` (free direct, or via OpenRouter)
  - `deepseek/deepseek-chat-v3-0324` (~$0.001 per call)
- Prefer paid providers for production (more reliable than free tier)

## Security

- Sensitive templates (e.g., `grant_contract`, `travel_approval`) require admin password
- Default templates accessible to anyone authenticated
- File uploads: validate size (max 10MB) + type (PDF, DOC, image)
- Don't log raw responses with sensitive data

## Cost Estimation

| Provider/Model | Cost per call (~5k input + 1k output tokens) |
|---|---|
| Gemini 2.5 Flash (direct, free tier) | $0 (15 RPM limit) |
| Gemini 2.5 Flash (paid) | ~$0.0008 |
| DeepSeek v3 (via OpenRouter) | ~$0.001 |
| Claude Sonnet 4.5 | ~$0.030 |
| GPT-4.1 | ~$0.015 |
| GPT-4.1 mini | ~$0.005 |

**Recommendation:** ใช้ DeepSeek v3 หรือ Gemini Flash สำหรับ classification batch, Claude Sonnet สำหรับ task ที่ต้องความแม่นยำสูง

## Related Files

- `src/lib/ai-document-parser.ts` — core library
- `src/lib/ai-provider.ts` — low-level AI calls (5 providers)
- `src/app/api/ai/parse/route.ts` — unified endpoint
- `src/app/admin/ai-settings/page.tsx` — provider config UI

## See Also

- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — overall system architecture
- [`docs/FEATURES.md`](./FEATURES.md) — full feature list
- [`docs/MIGRATIONS.md`](./MIGRATIONS.md) — SQL migration order
