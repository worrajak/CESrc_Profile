-- ============================================================
-- 042: Update AI Models to Latest 2026 Versions
-- รุ่นล่าสุด ณ เมษายน 2569
-- ============================================================

-- Claude (Anthropic) — Sonnet 4.5 / 4.6 / 4.7 + Haiku + Opus families
UPDATE ai_config SET
  model_name = 'claude-sonnet-4-5-20250929',
  models = '[
    "claude-sonnet-4-7-20251015",
    "claude-sonnet-4-6-20250812",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-1-20250805",
    "claude-opus-4-20250514",
    "claude-haiku-4-5-20251029",
    "claude-haiku-3-5-20241022"
  ]'::jsonb,
  capabilities = '["document_parse","course_parse","evaluation","grant_parse","vision"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'claude';

-- Gemini (Google) — 2.5 Pro/Flash + 3.0 series
UPDATE ai_config SET
  model_name = 'gemini-2.5-flash',
  models = '[
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ]'::jsonb,
  capabilities = '["document_parse","course_parse","grant_parse","vision","free_tier"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'gemini';

-- OpenAI — GPT-4.1 / 4.5 / o-series + GPT-5
UPDATE ai_config SET
  model_name = 'gpt-4.1',
  models = '[
    "gpt-5",
    "gpt-5-mini",
    "gpt-4.5",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "o3",
    "o4-mini",
    "o3-mini"
  ]'::jsonb,
  capabilities = '["document_parse","course_parse","evaluation","grant_parse","vision"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'openai';

-- Local (Ollama) — แนะนำรุ่นที่ใช้กับงาน research/parse ได้ดี
UPDATE ai_config SET
  model_name = 'llama3.3:70b',
  models = '[
    "llama3.3:70b",
    "llama3.2:3b",
    "llama3.1:8b",
    "qwen2.5:14b",
    "qwen2.5-coder:14b",
    "deepseek-r1:32b",
    "deepseek-v3:67b",
    "gemma2:9b",
    "mistral:7b",
    "mixtral:8x7b"
  ]'::jsonb,
  capabilities = '["document_parse","course_parse","grant_parse","free_local"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'local';

-- ============================================================
-- ฟรี models recommendations:
--   ✅ Gemini 2.5 Flash — ฟรี 100% (Google AI Studio: 15 RPM, 1M TPM)
--   ✅ Gemini 2.5 Flash-Lite — ฟรี เร็วกว่า
--   ✅ Local llama/qwen ผ่าน Ollama — ฟรี (รันบนเครื่องตัวเอง)
--
-- คุ้มที่สุด:
--   • Claude Sonnet 4.5 = $3/$15 per M tokens (in/out) — แม่นยำสุด
--   • GPT-4.1 mini = $0.40/$1.60 per M tokens — สมดุลราคา/คุณภาพ
--   • Gemini 2.5 Flash = ฟรี / $0.075/$0.30 per M tokens (paid tier)
-- ============================================================
