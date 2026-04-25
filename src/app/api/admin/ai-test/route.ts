import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AI Test API — ทดสอบการเชื่อมต่อ AI Provider
 * POST { provider } → ทดสอบ API Key + ส่ง ping request
 */

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json({ error: 'กรุณาระบุ provider' }, { status: 400 });
    }

    // ดึง config จาก DB
    const { data: config } = await supabase
      .from('ai_config')
      .select('*')
      .eq('provider', provider)
      .single();

    if (!config) {
      return NextResponse.json({ error: `ไม่พบ config ของ ${provider}` }, { status: 404 });
    }

    // ใช้ API key จาก DB หรือ fallback env
    const apiKey = config.api_key || getEnvKey(provider);

    if (!apiKey && provider !== 'local') {
      return NextResponse.json({
        success: false,
        error: `ยังไม่ได้กรอก API Key ของ ${config.display_name}`,
      });
    }

    const startTime = Date.now();
    let testResult: { success: boolean; message: string; latency?: number };

    switch (provider) {
      case 'claude':
        testResult = await testClaude(apiKey, config.model_name);
        break;
      case 'gemini':
        testResult = await testGemini(apiKey, config.model_name);
        break;
      case 'openai':
        testResult = await testOpenAI(apiKey, config.model_name);
        break;
      case 'openrouter':
        testResult = await testOpenRouter(apiKey, config.model_name);
        break;
      case 'local':
        testResult = await testLocal(config.api_endpoint || 'http://localhost:11434', config.model_name);
        break;
      default:
        testResult = { success: false, message: `Unknown provider: ${provider}` };
    }

    testResult.latency = Date.now() - startTime;

    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function getEnvKey(provider: string): string {
  const envMap: Record<string, string> = {
    claude: 'CLAUDE_API_KEY',
    gemini: 'GEMINI_API_KEY',
    openai: 'OPENAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    local: 'LOCAL_AI_ENDPOINT',
  };
  return process.env[envMap[provider] || ''] || '';
}

async function testClaude(apiKey: string, model: string) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 32,
        messages: [{ role: 'user', content: 'ตอบแค่ "OK" เท่านั้น' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: `เชื่อมต่อ Claude (${model}) สำเร็จ — ${data.content?.[0]?.text || 'OK'}` };
    }

    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    return { success: false, message: `Claude Error: ${err.error?.message || res.statusText}` };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e.message}` };
  }
}

async function testGemini(apiKey: string, model: string) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ตอบแค่ "OK" เท่านั้น' }] }],
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
      return { success: true, message: `เชื่อมต่อ Gemini (${model}) สำเร็จ — ${text}` };
    }

    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    return { success: false, message: `Gemini Error: ${err.error?.message || res.statusText}` };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e.message}` };
  }
}

async function testOpenAI(apiKey: string, model: string) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 32,
        messages: [{ role: 'user', content: 'ตอบแค่ "OK" เท่านั้น' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: `เชื่อมต่อ OpenAI (${model}) สำเร็จ — ${data.choices?.[0]?.message?.content || 'OK'}` };
    }

    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    return { success: false, message: `OpenAI Error: ${err.error?.message || res.statusText}` };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e.message}` };
  }
}

async function testOpenRouter(apiKey: string, model: string) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ce-src-profile.vercel.app',
        'X-Title': 'CESRU Researcher Profile',
      },
      body: JSON.stringify({
        model,
        max_tokens: 32,
        messages: [{ role: 'user', content: 'Reply with just "OK"' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || 'OK';
      return { success: true, message: `เชื่อมต่อ OpenRouter (${model}) สำเร็จ — ${text}` };
    }

    const errBody = await res.text();
    let errMsg = res.statusText;
    let metadataRaw = '';
    try {
      const parsed = JSON.parse(errBody);
      errMsg = parsed.error?.message || parsed.message || errBody.substring(0, 200);
      // Extract upstream error details from metadata.raw
      if (parsed.error?.metadata?.raw) {
        try {
          const innerParsed = JSON.parse(parsed.error.metadata.raw);
          metadataRaw = innerParsed.error?.message || innerParsed.message || parsed.error.metadata.raw.substring(0, 200);
        } catch {
          metadataRaw = String(parsed.error.metadata.raw).substring(0, 200);
        }
      }
    } catch {
      errMsg = errBody.substring(0, 200);
    }

    // Provide actionable guidance for 429
    let guidance = '';
    if (res.status === 429) {
      guidance = '\n💡 วิธีแก้: (1) ใช้ Gemini direct ฟรี quota สูงกว่า https://aistudio.google.com/app/apikey หรือ (2) เติม OpenRouter credit $1-10 จะปลดล็อค 1000 req/day ที่ https://openrouter.ai/credits หรือ (3) รอ 24 ชม. ให้ daily quota reset';
    } else if (res.status === 404) {
      guidance = '\n💡 Model ไม่มีให้ใช้ — กดปุ่ม "🔄 ดู Models ทั้งหมด" เพื่อดูรายการล่าสุด';
    } else if (res.status === 401) {
      guidance = '\n💡 API key ผิด/หมดอายุ — สมัครใหม่ที่ https://openrouter.ai/keys';
    }

    const fullMsg = metadataRaw
      ? `OpenRouter Error (${res.status}): ${errMsg} — Upstream: ${metadataRaw}${guidance}`
      : `OpenRouter Error (${res.status}): ${errMsg}${guidance}`;

    return { success: false, message: fullMsg };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e.message}` };
  }
}

async function testLocal(endpoint: string, model: string) {
  try {
    // Ollama: ทดสอบด้วย /api/tags (list models)
    const res = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(5000) });

    if (res.ok) {
      const data = await res.json();
      const models = data.models?.map((m: any) => m.name) || [];
      const hasModel = models.some((m: string) => m.startsWith(model));
      return {
        success: true,
        message: `เชื่อมต่อ Ollama สำเร็จ — ${models.length} โมเดล${hasModel ? ` (มี ${model})` : ` (ไม่มี ${model} — กรุณา ollama pull ${model})`}`,
      };
    }

    return { success: false, message: `Ollama ไม่ตอบสนอง: ${res.statusText}` };
  } catch (e: any) {
    return { success: false, message: `ไม่สามารถเชื่อมต่อ Ollama ที่ ${endpoint}: ${e.message}` };
  }
}
