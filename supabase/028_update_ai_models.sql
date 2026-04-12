-- ============================================================
-- 028: Update AI model names to latest versions (April 2025)
-- รัน migration นี้สำหรับผู้ที่รัน 026 ไปแล้ว
-- ============================================================

-- Claude: อัปเดต models list เป็นรุ่นล่าสุด
UPDATE ai_config SET
  models = '["claude-sonnet-4-20250514","claude-opus-4-20250514","claude-haiku-35-20250414"]'::jsonb,
  capabilities = '["document_parse","course_parse","evaluation","grant_parse"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'claude';

-- Gemini: เปลี่ยน default เป็น 2.5-flash
UPDATE ai_config SET
  model_name = 'gemini-2.5-flash',
  models = '["gemini-2.5-flash","gemini-2.5-pro","gemini-2.0-flash"]'::jsonb,
  capabilities = '["document_parse","course_parse","grant_parse"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'gemini';

-- OpenAI: เปลี่ยน default เป็น gpt-4.1
UPDATE ai_config SET
  model_name = 'gpt-4.1',
  models = '["gpt-4.1","gpt-4.1-mini","gpt-4.1-nano","o4-mini"]'::jsonb,
  capabilities = '["document_parse","course_parse","evaluation","grant_parse"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'openai';

-- Local: เปลี่ยน default เป็น llama4-scout
UPDATE ai_config SET
  model_name = 'llama4-scout',
  models = '["llama4-scout","llama4-maverick","llama3.3","gemma3","mistral"]'::jsonb,
  updated_at = NOW()
WHERE provider = 'local';
