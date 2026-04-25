-- ============================================================
-- 042: Update AI Models to Latest 2026 Versions
-- รุ่นล่าสุด ณ เมษายน 2569 — ใช้ UPSERT จึงทำงานได้ทั้งกรณี:
--   1) ตาราง ai_config มีอยู่แล้ว (รัน 026 ไปแล้ว) → update
--   2) ตารางยังไม่มี → create + insert
-- ============================================================

-- 1) สร้างตารางถ้ายังไม่มี (เผื่อยังไม่ได้รัน 026)
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  model_name TEXT NOT NULL,
  api_key TEXT,
  api_endpoint TEXT,
  display_name TEXT,
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '["document_parse","course_parse"]'::jsonb,
  models JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) UPSERT — Claude (Anthropic)
INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint)
VALUES (
  'claude',
  'claude-sonnet-4-5-20250929',
  'Anthropic Claude',
  false, false,
  '["document_parse","course_parse","evaluation","grant_parse","vision"]'::jsonb,
  '[
    "claude-sonnet-4-7-20251015",
    "claude-sonnet-4-6-20250812",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-1-20250805",
    "claude-opus-4-20250514",
    "claude-haiku-4-5-20251029",
    "claude-haiku-3-5-20241022"
  ]'::jsonb,
  'https://api.anthropic.com'
)
ON CONFLICT (provider) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  models = EXCLUDED.models,
  capabilities = EXCLUDED.capabilities,
  updated_at = NOW();

-- 3) UPSERT — Gemini (Google)
INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint)
VALUES (
  'gemini',
  'gemini-2.5-flash',
  'Google Gemini',
  false, false,
  '["document_parse","course_parse","grant_parse","vision","free_tier"]'::jsonb,
  '[
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ]'::jsonb,
  'https://generativelanguage.googleapis.com'
)
ON CONFLICT (provider) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  models = EXCLUDED.models,
  capabilities = EXCLUDED.capabilities,
  updated_at = NOW();

-- 4) UPSERT — OpenAI
INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint)
VALUES (
  'openai',
  'gpt-4.1',
  'OpenAI GPT',
  false, false,
  '["document_parse","course_parse","evaluation","grant_parse","vision"]'::jsonb,
  '[
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
  'https://api.openai.com'
)
ON CONFLICT (provider) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  models = EXCLUDED.models,
  capabilities = EXCLUDED.capabilities,
  updated_at = NOW();

-- 5) UPSERT — Local (Ollama)
INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint)
VALUES (
  'local',
  'llama3.3:70b',
  'Local AI (Ollama)',
  false, false,
  '["document_parse","course_parse","grant_parse","free_local"]'::jsonb,
  '[
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
  'http://localhost:11434'
)
ON CONFLICT (provider) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  models = EXCLUDED.models,
  capabilities = EXCLUDED.capabilities,
  updated_at = NOW();

-- ============================================================
-- ✅ ทำงานได้ทั้งสองกรณี:
--   - ถ้า ai_config มีอยู่แล้ว → UPDATE 4 rows
--   - ถ้ายังไม่มี → CREATE TABLE + INSERT 4 rows
--
-- ฟรี models recommendations:
--   ✅ Gemini 2.5 Flash — ฟรี 100% (15 RPM, 1M TPM)
--   ✅ Local llama/qwen ผ่าน Ollama — ฟรี (รันบนเครื่องตัวเอง)
-- ============================================================
