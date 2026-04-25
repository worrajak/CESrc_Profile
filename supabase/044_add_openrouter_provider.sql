-- ============================================================
-- 044: Add OpenRouter as 5th AI Provider
-- OpenRouter = unified gateway สำหรับ Claude, GPT, Gemini, Llama, DeepSeek ฯลฯ
-- ใช้ 1 API key เข้าถึงโมเดลได้ 100+ ตัว — มีรุ่นฟรีให้ใช้ด้วย
-- ============================================================

INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint)
VALUES (
  'openrouter',
  'meta-llama/llama-3.3-70b-instruct:free',
  'OpenRouter (Universal Gateway)',
  false,
  false,
  '["document_parse","course_parse","grant_parse","vision","free_tier","multi_model"]'::jsonb,
  '[
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "nvidia/llama-3.1-nemotron-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-haiku-4.5",
    "openai/gpt-4.1",
    "openai/gpt-4.1-mini",
    "openai/o4-mini",
    "google/gemini-2.5-pro",
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct",
    "deepseek/deepseek-v3",
    "qwen/qwen-2.5-coder-32b-instruct"
  ]'::jsonb,
  'https://openrouter.ai/api/v1'
)
ON CONFLICT (provider) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  display_name = EXCLUDED.display_name,
  models = EXCLUDED.models,
  capabilities = EXCLUDED.capabilities,
  api_endpoint = EXCLUDED.api_endpoint,
  updated_at = NOW();

-- Verify
SELECT provider, model_name, display_name, jsonb_array_length(models) as model_count
FROM ai_config
WHERE provider = 'openrouter';

-- ============================================================
-- จุดเด่นของ OpenRouter:
--   ✅ 1 API key → ใช้ได้ Claude, GPT, Gemini, Llama, DeepSeek, Qwen, Mistral
--   ✅ มีรุ่นฟรีให้ใช้: llama-3.3-70b:free, deepseek-r1:free, gemini-2.0-flash-exp:free
--   ✅ Auto-fallback ถ้า provider หลักล่ม
--   ✅ ราคาถูกกว่า direct API บางครั้ง
--
-- สมัคร API key ฟรีที่: https://openrouter.ai/keys
-- ============================================================
