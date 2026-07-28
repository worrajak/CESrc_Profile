/**
 * AI Provider — รองรับหลายโมเดล: Claude, Gemini, GPT, Local (Ollama)
 * อ่าน API Key จาก DB (ai_config) ก่อน fallback ไป env vars
 */

import { supabase } from '@/lib/supabase';

export type AIProvider = 'claude' | 'gemini' | 'openai' | 'local' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
}

export interface AIParseResult {
  data: Record<string, any> | null;
  source: string;
  model: string;
  error?: string;
}

// ENV fallback keys
const ENV_MAP: Record<string, string> = {
  claude: 'CLAUDE_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  local: 'LOCAL_AI_ENDPOINT',
  openrouter: 'OPENROUTER_API_KEY',
};

/**
 * No caching. Query is one SELECT on a 5-row table — negligible.
 * Prior module-scoped cache broke under Vercel serverless: each instance
 * held its own copy, so a save on instance A invalidated only A's cache
 * while the next AI call could land on instance B with stale data.
 * Kept the function name + export invalidateAIConfigCache() as no-op
 * so existing callers in ai-config/route.ts still compile.
 */
export function invalidateAIConfigCache() {
  // Intentionally empty — no cache to invalidate.
}

async function getDBConfigs() {
  try {
    const { data } = await supabase
      .from('ai_config')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

// Get available providers (จาก DB + env)
export async function getAvailableProviders(): Promise<{ provider: AIProvider; name: string; models: string[] }[]> {
  const dbConfigs = await getDBConfigs();
  const available: { provider: AIProvider; name: string; models: string[] }[] = [];

  for (const c of dbConfigs) {
    const hasKey = c.api_key || process.env[ENV_MAP[c.provider] || ''];
    if (hasKey || c.provider === 'local') {
      available.push({
        provider: c.provider,
        name: c.display_name,
        models: c.models || [],
      });
    }
  }

  // ถ้า DB ว่าง ใช้ env vars
  if (available.length === 0) {
    if (process.env.CLAUDE_API_KEY) available.push({ provider: 'claude', name: 'Claude', models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-35-20250414'] });
    if (process.env.GEMINI_API_KEY) available.push({ provider: 'gemini', name: 'Gemini', models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'] });
    if (process.env.OPENAI_API_KEY) available.push({ provider: 'openai', name: 'GPT', models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o4-mini'] });
    if (process.env.OPENROUTER_API_KEY) available.push({ provider: 'openrouter', name: 'OpenRouter', models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-r1:free'] });
    if (process.env.LOCAL_AI_ENDPOINT) available.push({ provider: 'local', name: 'Local', models: ['llama4-scout', 'llama4-maverick', 'llama3.3', 'gemma3', 'mistral'] });
  }

  return available;
}

// Get config for a specific provider (DB → env fallback)
async function resolveConfig(overrides?: Partial<AIConfig>): Promise<AIConfig> {
  const dbConfigs = await getDBConfigs();

  // ถ้าระบุ provider มา
  if (overrides?.provider) {
    const dbConf = dbConfigs.find(c => c.provider === overrides.provider);
    return {
      provider: overrides.provider,
      model: overrides.model || dbConf?.model_name || '',
      apiKey: dbConf?.api_key || process.env[ENV_MAP[overrides.provider] || ''] || '',
      endpoint: dbConf?.api_endpoint || '',
    };
  }

  // ใช้ default จาก DB
  const defaultConf = dbConfigs.find(c => c.is_default) || dbConfigs[0];
  if (defaultConf) {
    return {
      provider: defaultConf.provider,
      model: overrides?.model || defaultConf.model_name,
      apiKey: defaultConf.api_key || process.env[ENV_MAP[defaultConf.provider] || ''] || '',
      endpoint: defaultConf.api_endpoint || '',
    };
  }

  // Fallback env vars
  for (const provider of ['claude', 'gemini', 'openai'] as AIProvider[]) {
    const key = process.env[ENV_MAP[provider]];
    if (key) {
      return { provider, model: '', apiKey: key };
    }
  }

  return { provider: 'claude', model: 'claude-sonnet-4-20250514' }; // fallback เมื่อไม่มี config เลย
}

// Universal AI call with vision support
/**
 * Token budget shared by every provider branch.
 *
 * Reasoning models (o1 · deepseek-r1 · gemini-3.x · claude extended
 * thinking) spend this budget on a hidden reasoning trace *before*
 * emitting visible content. At 4096 the visible JSON came back cut
 * mid-object, JSON.parse failed, and callers saw a bare `data: null`
 * with no explanation.
 */
const AI_MAX_TOKENS = 16000;

/**
 * Single exit point for every provider branch.
 *
 * Turns a raw model response into an AIParseResult with a *diagnosable*
 * error instead of a silent null. Distinguishes four failure modes:
 * API-level error · truncation · empty response · unparseable text.
 */
function finalizeAIResult(args: {
  text: string;
  /** Provider said it stopped because it hit the token cap. */
  truncated: boolean;
  source: string;
  model: string;
  /** Error surfaced by the provider's own error envelope, if any. */
  apiError?: string | null;
}): AIParseResult {
  const { text, truncated, source, model, apiError } = args;

  if (apiError) {
    return { data: null, source, model, error: `${source} API error: ${apiError}` };
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    let error: string;
    if (truncated) {
      error =
        `Response truncated — hit max_tokens (${AI_MAX_TOKENS}). ` +
        `'${model}' is likely a reasoning model that spent the budget on hidden ` +
        `reasoning tokens. Pick a non-reasoning model or raise AI_MAX_TOKENS.`;
    } else if (text.trim().length === 0) {
      error = `Model '${model}' returned an empty response.`;
    } else {
      error = `No JSON object in response from '${model}'. Got: ${text.slice(0, 200)}`;
    }
    return { data: null, source, model, error };
  }

  try {
    return { data: JSON.parse(jsonMatch[0]), source, model };
  } catch (err: any) {
    const hint = truncated
      ? ` Response was truncated at max_tokens (${AI_MAX_TOKENS}), so the JSON is incomplete.`
      : '';
    return { data: null, source, model, error: `Invalid JSON from '${model}': ${err.message}.${hint}` };
  }
}

export async function callAIWithVision(
  base64: string,
  mimeType: string,
  systemPrompt: string,
  config?: Partial<AIConfig>
): Promise<AIParseResult> {
  const resolved = await resolveConfig(config);

  try {
    switch (resolved.provider) {
      case 'claude':
        return await callClaude(base64, mimeType, systemPrompt, resolved.model, resolved.apiKey!);
      case 'gemini':
        return await callGemini(base64, mimeType, systemPrompt, resolved.model, resolved.apiKey!);
      case 'openai':
        return await callOpenAI(base64, mimeType, systemPrompt, resolved.model, resolved.apiKey!);
      case 'openrouter':
        return await callOpenRouter(base64, mimeType, systemPrompt, resolved.model, resolved.apiKey!);
      case 'local':
        return await callLocal(base64, mimeType, systemPrompt, resolved.model, resolved.endpoint || 'http://localhost:11434');
      default:
        return { data: null, source: resolved.provider, model: resolved.model, error: 'Unknown provider' };
    }
  } catch (err: any) {
    return { data: null, source: resolved.provider, model: resolved.model, error: err.message };
  }
}

// === Claude ===
async function callClaude(base64: string, mimeType: string, prompt: string, model: string, apiKey: string): Promise<AIParseResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: AI_MAX_TOKENS,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType.startsWith('image/') ? mimeType : 'image/png', data: base64 } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) return { data: null, source: 'Claude', model, error: await response.text() };
  const result = await response.json();
  return finalizeAIResult({
    text: result.content?.[0]?.text || '',
    truncated: result.stop_reason === 'max_tokens',
    apiError: result.error?.message,
    source: 'Claude',
    model,
  });
}

// === Gemini ===
async function callGemini(base64: string, mimeType: string, prompt: string, model: string, apiKey: string): Promise<AIParseResult> {
  const modelName = model || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: prompt },
        ] }],
      }),
    }
  );

  if (!response.ok) return { data: null, source: 'Gemini', model: modelName, error: await response.text() };
  const result = await response.json();
  return finalizeAIResult({
    text: result.candidates?.[0]?.content?.parts?.[0]?.text || '',
    truncated: result.candidates?.[0]?.finishReason === 'MAX_TOKENS',
    apiError: result.error?.message,
    source: 'Gemini',
    model: modelName,
  });
}

// === OpenAI GPT Vision ===
async function callOpenAI(base64: string, mimeType: string, prompt: string, model: string, apiKey: string): Promise<AIParseResult> {
  const modelName = model || 'gpt-4.1';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: AI_MAX_TOKENS,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) return { data: null, source: 'OpenAI', model: modelName, error: await response.text() };
  const result = await response.json();
  return finalizeAIResult({
    text: result.choices?.[0]?.message?.content || '',
    truncated: result.choices?.[0]?.finish_reason === 'length',
    apiError: result.error?.message,
    source: 'OpenAI',
    model: modelName,
  });
}

// === OpenRouter (Universal Gateway) — รองรับ Claude, GPT, Gemini, Llama, DeepSeek ฯลฯ ===
async function callOpenRouter(base64: string, mimeType: string, prompt: string, model: string, apiKey: string): Promise<AIParseResult> {
  const modelName = model || 'meta-llama/llama-3.3-70b-instruct:free';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ce-src-profile.vercel.app',
      'X-Title': 'CESRU Researcher Profile',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: AI_MAX_TOKENS,
      // Keep reasoning short so the budget goes to visible content.
      // Ignored by non-reasoning models.
      reasoning: { effort: 'low' },
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) return { data: null, source: 'OpenRouter', model: modelName, error: await response.text() };
  const result = await response.json();
  const choice = result.choices?.[0];
  return finalizeAIResult({
    text: choice?.message?.content || '',
    truncated: choice?.finish_reason === 'length' || choice?.native_finish_reason === 'MAX_TOKENS',
    apiError: result.error?.message,
    source: `OpenRouter (${modelName})`,
    model: modelName,
  });
}

// === Local AI (Ollama) ===
async function callLocal(base64: string, _mimeType: string, prompt: string, model: string, endpoint: string): Promise<AIParseResult> {
  const modelName = model || 'llama4-scout';
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName, prompt, images: [base64], stream: false }),
  });

  if (!response.ok) return { data: null, source: 'Local', model: modelName, error: await response.text() };
  const result = await response.json();
  return finalizeAIResult({
    text: result.response || '',
    truncated: result.done_reason === 'length',
    apiError: result.error,
    source: `Local (${modelName})`,
    model: modelName,
  });
}

// === Text-only AI call ===
export async function callAIText(prompt: string, config?: Partial<AIConfig>): Promise<AIParseResult> {
  const resolved = await resolveConfig(config);

  try {
    switch (resolved.provider) {
      case 'claude': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': resolved.apiKey!, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: resolved.model || 'claude-sonnet-4-20250514', max_tokens: AI_MAX_TOKENS, messages: [{ role: 'user', content: prompt }] }),
        });
        const result = await res.json();
        return finalizeAIResult({
          text: result.content?.[0]?.text || '',
          truncated: result.stop_reason === 'max_tokens',
          apiError: result.error?.message,
          source: 'Claude',
          model: resolved.model,
        });
      }
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resolved.apiKey!}` },
          body: JSON.stringify({ model: resolved.model || 'gpt-4.1', max_tokens: AI_MAX_TOKENS, messages: [{ role: 'user', content: prompt }] }),
        });
        const result = await res.json();
        return finalizeAIResult({
          text: result.choices?.[0]?.message?.content || '',
          truncated: result.choices?.[0]?.finish_reason === 'length',
          apiError: result.error?.message,
          source: 'OpenAI',
          model: resolved.model,
        });
      }
      case 'gemini': {
        const modelName = resolved.model || 'gemini-2.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${resolved.apiKey!}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) },
        );
        const result = await res.json();
        return finalizeAIResult({
          text: result.candidates?.[0]?.content?.parts?.[0]?.text || '',
          truncated: result.candidates?.[0]?.finishReason === 'MAX_TOKENS',
          apiError: result.error?.message,
          source: 'Gemini',
          model: modelName,
        });
      }
      case 'local': {
        const endpoint = resolved.endpoint || 'http://localhost:11434';
        const modelName = resolved.model || 'llama4-scout';
        const res = await fetch(`${endpoint}/api/generate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelName, prompt, stream: false }),
        });
        const result = await res.json();
        return finalizeAIResult({
          text: result.response || '',
          truncated: result.done_reason === 'length',
          apiError: result.error,
          source: `Local (${modelName})`,
          model: modelName,
        });
      }
      case 'openrouter': {
        const modelName = resolved.model || 'meta-llama/llama-3.3-70b-instruct:free';
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resolved.apiKey!}`,
            'HTTP-Referer': 'https://ce-src-profile.vercel.app',
            'X-Title': 'CESRU Researcher Profile',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: AI_MAX_TOKENS,
            // Keep reasoning short so the budget goes to visible content.
            // Ignored by non-reasoning models.
            reasoning: { effort: 'low' },
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const result = await res.json();
        const choice = result.choices?.[0];
        return finalizeAIResult({
          text: choice?.message?.content || '',
          truncated: choice?.finish_reason === 'length' || choice?.native_finish_reason === 'MAX_TOKENS',
          apiError: result.error?.message,
          source: `OpenRouter (${modelName})`,
          model: modelName,
        });
      }
      default:
        return { data: null, source: resolved.provider, model: resolved.model, error: 'Unknown provider' };
    }
  } catch (err: any) {
    return { data: null, source: resolved.provider, model: resolved.model, error: err.message };
  }
}
