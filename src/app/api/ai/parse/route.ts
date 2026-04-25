/**
 * Unified AI Document Parsing API
 * POST /api/ai/parse — รับ multipart/form-data หรือ JSON
 *
 * Body (JSON):
 * {
 *   template: 'news_tags' | 'course_curriculum' | ... | custom_object,
 *   text?: string,
 *   url?: string,
 *   provider?: 'claude'|'gemini'|'openai'|'openrouter'|'local',
 *   model?: string,
 *   password?: string  // admin password for sensitive operations
 * }
 *
 * Body (FormData) — for file upload:
 * - template: name (string) or JSON string
 * - file: File
 * - provider, model, password as fields
 *
 * Response:
 * { success, data, source, model, latency_ms, template, error? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument, TEMPLATES, ParseTemplate } from '@/lib/ai-document-parser';

// GET — list available templates
export async function GET() {
  const templates = Object.entries(TEMPLATES).map(([key, t]) => ({
    name: t.name,
    key,
    description: t.description,
    schema: t.schema,
    language: t.language,
  }));
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  let templateInput: any;
  let text: string | undefined;
  let url: string | undefined;
  let file: File | undefined;
  let provider: any;
  let model: string | undefined;
  let password: string | undefined;

  try {
    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      const tpl = fd.get('template');
      templateInput = typeof tpl === 'string' && tpl.startsWith('{') ? JSON.parse(tpl) : tpl;
      text = (fd.get('text') as string) || undefined;
      url = (fd.get('url') as string) || undefined;
      file = (fd.get('file') as File) || undefined;
      provider = (fd.get('provider') as string) || undefined;
      model = (fd.get('model') as string) || undefined;
      password = (fd.get('password') as string) || undefined;
    } else {
      const body = await req.json();
      templateInput = body.template;
      text = body.text;
      url = body.url;
      provider = body.provider;
      model = body.model;
      password = body.password;
    }

    // Auth check (optional for non-sensitive templates)
    const sensitiveTemplates = ['grant_contract', 'travel_approval'];
    if (typeof templateInput === 'string' && sensitiveTemplates.includes(templateInput)) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized for sensitive template' }, { status: 401 });
      }
    }

    // Resolve template
    let template: ParseTemplate;
    if (typeof templateInput === 'string') {
      const tpl = (TEMPLATES as any)[templateInput];
      if (!tpl) {
        return NextResponse.json({
          error: `Unknown template: ${templateInput}`,
          available: Object.keys(TEMPLATES),
        }, { status: 400 });
      }
      template = tpl;
    } else if (templateInput && typeof templateInput === 'object' && templateInput.schema) {
      template = templateInput as ParseTemplate;
    } else {
      return NextResponse.json({ error: 'Missing or invalid template' }, { status: 400 });
    }

    // Validate input
    if (!text && !url && !file) {
      return NextResponse.json({ error: 'Provide text, url, or file' }, { status: 400 });
    }

    const result = await parseDocument({
      template,
      input: { text, url, file },
      provider,
      model,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
