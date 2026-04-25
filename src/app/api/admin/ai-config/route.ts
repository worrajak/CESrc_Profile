import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AI Config API — CRUD ตั้งค่า AI Provider + API Key ผ่านหน้า Admin
 * GET  → ดึง config ทั้งหมด (auto-seed if empty)
 * POST → บันทึก/อัพเดท config
 */

// ซ่อน API Key แสดงแค่ 6 ตัวแรก + ****
function maskApiKey(key: string | null): string {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.substring(0, 6) + '****' + key.substring(key.length - 4);
}

// Default providers — auto-inserted if table is empty
const DEFAULT_PROVIDERS = [
  {
    provider: 'claude',
    model_name: 'claude-sonnet-4-5-20250929',
    display_name: 'Anthropic Claude',
    is_active: false,
    is_default: false,
    capabilities: ['document_parse', 'course_parse', 'evaluation', 'grant_parse', 'vision'],
    models: [
      'claude-sonnet-4-7-20251015',
      'claude-sonnet-4-6-20250812',
      'claude-sonnet-4-5-20250929',
      'claude-opus-4-1-20250805',
      'claude-opus-4-20250514',
      'claude-haiku-4-5-20251029',
      'claude-haiku-3-5-20241022',
    ],
    api_endpoint: 'https://api.anthropic.com',
  },
  {
    provider: 'gemini',
    model_name: 'gemini-2.5-flash',
    display_name: 'Google Gemini',
    is_active: false,
    is_default: false,
    capabilities: ['document_parse', 'course_parse', 'grant_parse', 'vision', 'free_tier'],
    models: [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    api_endpoint: 'https://generativelanguage.googleapis.com',
  },
  {
    provider: 'openai',
    model_name: 'gpt-4.1',
    display_name: 'OpenAI GPT',
    is_active: false,
    is_default: false,
    capabilities: ['document_parse', 'course_parse', 'evaluation', 'grant_parse', 'vision'],
    models: ['gpt-5', 'gpt-5-mini', 'gpt-4.5', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'o3', 'o4-mini', 'o3-mini'],
    api_endpoint: 'https://api.openai.com',
  },
  {
    provider: 'openrouter',
    model_name: 'meta-llama/llama-3.3-70b-instruct:free',
    display_name: 'OpenRouter (Universal Gateway)',
    is_active: false,
    is_default: false,
    capabilities: ['document_parse', 'course_parse', 'grant_parse', 'vision', 'free_tier', 'multi_model'],
    models: [
      // Free models
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-r1:free',
      'deepseek/deepseek-chat-v3-0324:free',
      'nvidia/llama-3.1-nemotron-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      // Premium (cheap)
      'anthropic/claude-sonnet-4.5',
      'anthropic/claude-haiku-4.5',
      'openai/gpt-4.1',
      'openai/gpt-4.1-mini',
      'openai/o4-mini',
      'google/gemini-2.5-pro',
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-v3',
      'qwen/qwen-2.5-coder-32b-instruct',
    ],
    api_endpoint: 'https://openrouter.ai/api/v1',
  },
  {
    provider: 'local',
    model_name: 'llama3.3:70b',
    display_name: 'Local AI (Ollama)',
    is_active: false,
    is_default: false,
    capabilities: ['document_parse', 'course_parse', 'grant_parse', 'free_local'],
    models: ['llama3.3:70b', 'llama3.2:3b', 'llama3.1:8b', 'qwen2.5:14b', 'qwen2.5-coder:14b', 'deepseek-r1:32b', 'deepseek-v3:67b', 'gemma2:9b', 'mistral:7b', 'mixtral:8x7b'],
    api_endpoint: 'http://localhost:11434',
  },
];

async function autoSeedIfEmpty(): Promise<{ seeded: boolean; error?: string }> {
  // Try to insert defaults — ON CONFLICT DO NOTHING means safe to call multiple times
  const { error } = await supabase
    .from('ai_config')
    .upsert(DEFAULT_PROVIDERS, { onConflict: 'provider', ignoreDuplicates: true });

  if (error) {
    return { seeded: false, error: error.message };
  }
  return { seeded: true };
}

export async function GET() {
  try {
    let { data, error } = await supabase
      .from('ai_config')
      .select('*')
      .order('provider');

    if (error) {
      // Table might not exist
      if (error.message?.toLowerCase().includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({
          error: 'ตาราง ai_config ยังไม่ถูกสร้าง — กรุณารัน SQL: CREATE TABLE ai_config (...)',
          missing_table: true,
        }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-seed if empty
    if (!data || data.length === 0) {
      const seedResult = await autoSeedIfEmpty();
      if (seedResult.error) {
        return NextResponse.json({
          error: 'Auto-seed failed: ' + seedResult.error,
          configs: [],
          hint: 'ตรวจสอบ RLS policies ของ ai_config — admin/anon ต้องมีสิทธิ์ INSERT',
        }, { status: 500 });
      }
      // Re-fetch after seeding
      const { data: refetched } = await supabase.from('ai_config').select('*').order('provider');
      data = refetched || [];
    }

    // Mask API keys for security
    const configs = (data || []).map((c: any) => ({
      ...c,
      api_key_masked: maskApiKey(c.api_key),
      has_api_key: !!c.api_key,
      api_key: undefined,
    }));

    return NextResponse.json({ configs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, api_key, api_endpoint, model_name, is_active, is_default } = body;

    if (!provider) {
      return NextResponse.json({ error: 'กรุณาระบุ provider' }, { status: 400 });
    }

    // ถ้าตั้งเป็น default ต้อง reset ตัวอื่นก่อน
    if (is_default) {
      await supabase
        .from('ai_config')
        .update({ is_default: false })
        .neq('provider', provider);
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // อัพเดท api_key เฉพาะเมื่อส่งมาจริง (ไม่ใช่ค่าว่าง)
    if (api_key !== undefined && api_key !== '') {
      updateData.api_key = api_key;
    }
    if (api_endpoint !== undefined) updateData.api_endpoint = api_endpoint;
    if (model_name !== undefined) updateData.model_name = model_name;
    if (body.models !== undefined) updateData.models = body.models;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data, error } = await supabase
      .from('ai_config')
      .update(updateData)
      .eq('provider', provider)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: {
        ...data,
        api_key_masked: maskApiKey(data.api_key),
        has_api_key: !!data.api_key,
        api_key: undefined,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE — ลบ API Key ออก
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'กรุณาระบุ provider' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ai_config')
      .update({
        api_key: null,
        is_active: false,
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq('provider', provider);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `ลบ API Key ของ ${provider} แล้ว` });
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
