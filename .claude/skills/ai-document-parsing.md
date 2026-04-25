---
name: ai-document-parsing
description: Use the project's reusable AI document parser (src/lib/ai-document-parser.ts) when a feature needs to extract structured data from text, PDFs, files, or URLs using AI. This skill saves implementation time by reusing pre-built templates and a unified API.
---

# Skill: AI Document Parsing

## When to use

Use this skill whenever the user asks to:
- "Add AI to extract X from Y"
- "Parse this document automatically"
- "Auto-classify content"
- "Use AI to fill form from a PDF"
- "Add OCR + understanding"

Do NOT use it for:
- Real-time chat (use streaming directly)
- Translation (overkill — use AI provider directly)
- Image generation

## What it provides

The library `src/lib/ai-document-parser.ts` exports:

### Core function
```typescript
parseDocument<T>(opts: ParseOptions): Promise<ParseResult<T>>
```

### Pre-built templates (in `TEMPLATES` object)
- `news_tags` — extract keywords + SDG codes from articles
- `publication_metadata` — extract paper bibliographic data
- `publication_classify` — classify pub into research areas
- `course_curriculum` — parse training course documents
- `grant_contract` — parse research grant contracts
- `travel_approval` — parse official travel docs
- `generic_classification` — categorize + extract keywords
- `generic_extract` — custom schema extraction

### Type-safe helpers
- `parseNewsTags(text)` → `NewsTagsResult`
- `classifyPublication(text)` → `PublicationClassifyResult`
- `parseCourse(input)` → `CourseCurriculumResult`
- `parseGrant(input)` → `GrantContractResult`
- `parseTravel(input)` → `TravelApprovalResult`

### Convenience helpers
- `classifyText(text, template)` — text-only classification
- `parseFile(file, template)` — file upload parsing
- `parseUrl(url, template)` — fetch + parse URL content

### Unified API
- `POST /api/ai/parse` — one endpoint for all use cases
- `GET /api/ai/parse` — list available templates

## How to use (development)

### Step 1: Check if existing template fits

```typescript
import { TEMPLATES } from '@/lib/ai-document-parser';
console.log(Object.keys(TEMPLATES));
// → ['news_tags', 'publication_metadata', ...]
```

If yes → use it directly.

### Step 2: For new use case, create template inline

```typescript
import { parseDocument } from '@/lib/ai-document-parser';

const result = await parseDocument({
  template: {
    name: 'my_template',
    description: 'Extract X from Y',
    schema: {
      field1: 'description (type)',
      field2: 'string[] - list of things',
      // ...
    },
    language: 'th', // 'th' | 'en' | 'auto'
  },
  input: { text }, // or { file } or { url }
});

if (result.success) {
  // result.data is typed (use generic for type-safety)
}
```

### Step 3: For permanent feature, add to TEMPLATES

Edit `src/lib/ai-document-parser.ts`:

```typescript
export const TEMPLATES = {
  // existing...
  my_new_template: {
    name: 'my_new_template',
    description: '...',
    schema: { ... },
    language: 'th',
  },
};

// Optional: add type-safe helper
export interface MyResult { ... }
export const parseMyDoc = (input: ParseInput, opts?: any) =>
  parseDocument<MyResult>({ template: TEMPLATES.my_new_template, input, ...opts });
```

## Schema descriptions

When defining schema fields, use natural language with type hints:

```typescript
schema: {
  // Good — clear and specific
  title: 'string - ชื่อเรื่อง',
  year: 'number - ปีที่ตีพิมพ์',
  authors: 'string[] - รายชื่อผู้แต่ง',
  status: 'pending|approved|rejected',

  // Good — complex objects
  schedule: 'array of {day: number, sessions: array of {time: string, topic: string}}',

  // Bad — too vague
  data: 'any',
  info: 'object',
}
```

The schema description is sent to AI as instruction.

## Provider selection

By default, uses provider with `is_default = true` in `ai_config` table.

Override per-call:
```typescript
await parseDocument({
  template: TEMPLATES.news_tags,
  input: { text },
  provider: 'openrouter',
  model: 'deepseek/deepseek-chat-v3-0324',
});
```

Recommended models:
- **Cheap & good (batch)**: `deepseek/deepseek-chat-v3-0324` via OpenRouter (~$0.001/call)
- **Free**: Gemini direct (`gemini-2.5-flash`) — 15 RPM limit
- **High accuracy**: `claude-sonnet-4-5-20250929` (Claude) — for important tasks
- **Vision**: any model with `has_vision: true` (e.g., gemini-2.5-flash, gpt-4.1, claude)

## Common patterns

### Pattern 1: Extract → save to DB

```typescript
const result = await parseCourse({ file: pdfFile });
if (result.success) {
  await supabase.from('training_courses').insert({
    title_th: result.data.title_th,
    duration_hours: result.data.duration_hours,
    // ...
  });
}
```

### Pattern 2: Bulk classification

```typescript
const pubs = await fetchAllPublications();
for (const pub of pubs) {
  const result = await classifyPublication(pub.title + ' ' + pub.abstract);
  if (result.success) {
    await updatePub(pub.id, { tags: result.data.tags });
  }
  await sleep(500); // throttle
}
```

### Pattern 3: Form auto-fill from upload

```typescript
// User uploads PDF
const result = await parseGrant({ file });
if (result.success) {
  // Pre-fill form
  setFormData({
    title_th: result.data.title_th,
    funding_agency: result.data.funding_agency,
    // ...
  });
}
```

### Pattern 4: Real-time text classification (e.g., comments moderation)

```typescript
const result = await classifyText(commentText, {
  name: 'moderation',
  description: 'Detect inappropriate content',
  schema: {
    is_spam: 'boolean',
    is_offensive: 'boolean',
    confidence: 'number 0-1',
    reason: 'string|null',
  },
});
```

## Anti-patterns (don't do these)

❌ **Don't manually call AI providers when this library exists**
```typescript
// Bad
const prompt = `Extract X from: ${text}`;
const result = await callAIText(prompt);
const data = JSON.parse(result.data); // unsafe
```

✅ **Do use the parser**
```typescript
// Good
const result = await parseDocument({
  template: { schema: { x: 'description' } },
  input: { text },
});
```

❌ **Don't create new API endpoints for each AI feature**
```typescript
// Bad: /api/news/extract-tags, /api/grants/parse-pdf, /api/training/parse-course (all duplicating logic)
```

✅ **Do use unified `/api/ai/parse` or call library directly**
```typescript
// Good
fetch('/api/ai/parse', {
  method: 'POST',
  body: JSON.stringify({ template: 'news_tags', text }),
});
```

## Related files
- `src/lib/ai-document-parser.ts` — core library
- `src/lib/ai-provider.ts` — multi-provider support
- `src/app/api/ai/parse/route.ts` — unified endpoint
- `docs/AI_DOCUMENT_PARSING.md` — full guide

## When updating

If you add a new template:
1. Add to `TEMPLATES` in `src/lib/ai-document-parser.ts`
2. Add TypeScript interface for result
3. Add type-safe helper function
4. Update `docs/AI_DOCUMENT_PARSING.md` "Pre-built Templates" table
5. Update this skill if pattern is fundamentally new
