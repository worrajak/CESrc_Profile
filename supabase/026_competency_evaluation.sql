-- ============================================================
-- 026: Competency-Based Evaluation System
-- ระบบสมรรถนะ ตัวชี้วัด และเกณฑ์การประเมิน (Rubric)
-- สำหรับการประเมินผลแต่ละโมดูล แต่ละสมรรถนะ
-- CESRU — หน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา
-- ============================================================

-- ============================================================
-- 1. สมรรถนะของโมดูล (Module Competencies)
-- แต่ละโมดูลมีสมรรถนะ (competency) ที่ต้องบรรลุ
-- ============================================================
CREATE TABLE IF NOT EXISTS module_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- ชื่อสมรรถนะ เช่น "สามารถออกแบบระบบ PV ขนาด ≤ 10 kW"
  description TEXT,                         -- คำอธิบายเพิ่มเติม
  competency_type TEXT DEFAULT 'knowledge', -- knowledge, skill, attitude
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. ตัวชี้วัดของสมรรถนะ (Competency Indicators)
-- แต่ละสมรรถนะมีตัวชี้วัดหลายตัว พร้อม rubric 4 ระดับ
-- ============================================================
CREATE TABLE IF NOT EXISTS competency_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID NOT NULL REFERENCES module_competencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- ชื่อตัวชี้วัด
  description TEXT,                         -- คำอธิบาย
  weight DECIMAL(5,2) DEFAULT 25,           -- น้ำหนักคะแนน % (ภายใน competency)

  -- Rubric 4 ระดับ
  rubric_excellent TEXT,                    -- ระดับ 4 (ดีเยี่ยม)
  rubric_good TEXT,                         -- ระดับ 3 (ดี)
  rubric_fair TEXT,                         -- ระดับ 2 (พอใช้)
  rubric_poor TEXT,                         -- ระดับ 1 (ต้องปรับปรุง)

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. ผลการประเมินรายตัวชี้วัด (Indicator Scores)
-- บันทึกคะแนนของผู้เรียนแต่ละตัวชี้วัด
-- ============================================================
CREATE TABLE IF NOT EXISTS indicator_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES competency_indicators(id) ON DELETE CASCADE,
  score INT CHECK (score BETWEEN 1 AND 4),  -- 1=poor, 2=fair, 3=good, 4=excellent
  evaluator_note TEXT,                      -- หมายเหตุจากผู้ประเมิน
  evaluated_by UUID REFERENCES researchers(id),  -- อาจารย์ผู้ประเมิน
  evaluated_at TIMESTAMPTZ DEFAULT now(),

  -- Blockchain
  eval_tx TEXT,                             -- tx hash บันทึก on-chain

  UNIQUE(enrollment_id, indicator_id)
);

-- ============================================================
-- 4. แบบประเมินสำเร็จรูป (Evaluation Templates)
-- อาจารย์สร้างแบบประเมิน reuse ได้
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                       -- ชื่อแบบประเมิน
  description TEXT,
  domain TEXT,                              -- solar_pv, ev_charger, etc.
  level TEXT DEFAULT 'intermediate',
  created_by UUID REFERENCES researchers(id),
  is_public BOOLEAN DEFAULT true,           -- ใช้ร่วมกันได้
  template_data JSONB,                      -- JSON ของ competencies + indicators + rubrics
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. AI Configuration (เก็บ API Key / Model ที่ใช้)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,            -- 'claude', 'gemini', 'openai', 'local'
  model_name TEXT NOT NULL,                 -- 'claude-sonnet-4-20250514', 'gemini-2.0-flash', 'gpt-4o'
  api_key TEXT,                             -- เก็บ API Key (กรอกจากหน้า Admin)
  api_endpoint TEXT,                        -- custom endpoint สำหรับ local AI
  display_name TEXT,                        -- ชื่อแสดง
  is_active BOOLEAN DEFAULT false,          -- เปิดใช้งาน
  is_default BOOLEAN DEFAULT false,         -- เป็นค่าเริ่มต้น
  capabilities JSONB DEFAULT '["document_parse","course_parse"]'::jsonb,
  models JSONB,                             -- รายชื่อ model ที่รองรับ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default AI configs (ไม่มี API key — ต้องกรอกจากหน้า Admin)
INSERT INTO ai_config (provider, model_name, display_name, is_active, is_default, capabilities, models, api_endpoint) VALUES
  ('claude', 'claude-sonnet-4-20250514', 'Anthropic Claude', false, false,
   '["document_parse","course_parse","evaluation","grant_parse"]'::jsonb,
   '["claude-sonnet-4-20250514","claude-opus-4-20250514","claude-haiku-35-20250414"]'::jsonb,
   'https://api.anthropic.com'),
  ('gemini', 'gemini-2.5-flash', 'Google Gemini', false, false,
   '["document_parse","course_parse","grant_parse"]'::jsonb,
   '["gemini-2.5-flash","gemini-2.5-pro","gemini-2.0-flash"]'::jsonb,
   'https://generativelanguage.googleapis.com'),
  ('openai', 'gpt-4.1', 'OpenAI GPT', false, false,
   '["document_parse","course_parse","evaluation","grant_parse"]'::jsonb,
   '["gpt-4.1","gpt-4.1-mini","gpt-4.1-nano","o4-mini"]'::jsonb,
   'https://api.openai.com'),
  ('local', 'llama4-scout', 'Local AI (Ollama)', false, false,
   '["document_parse"]'::jsonb,
   '["llama4-scout","llama4-maverick","llama3.3","gemma3","mistral"]'::jsonb,
   'http://localhost:11434')
ON CONFLICT (provider) DO NOTHING;

-- ============================================================
-- 6. Views
-- ============================================================

-- สรุปสมรรถนะต่อโมดูล
CREATE OR REPLACE VIEW v_module_competency_summary AS
SELECT
  cm.id AS module_id,
  cm.title_th AS module_title,
  cm.course_id,
  COUNT(DISTINCT mc.id) AS competency_count,
  COUNT(DISTINCT ci.id) AS indicator_count,
  COALESCE(SUM(ci.weight), 0) AS total_weight
FROM course_modules cm
LEFT JOIN module_competencies mc ON mc.module_id = cm.id
LEFT JOIN competency_indicators ci ON ci.competency_id = mc.id
GROUP BY cm.id, cm.title_th, cm.course_id;

-- ผลประเมินรายผู้เรียน
CREATE OR REPLACE VIEW v_enrollment_evaluation AS
SELECT
  e.id AS enrollment_id,
  e.session_id,
  t.first_name_th || ' ' || t.last_name_th AS trainee_name,
  mc.name AS competency_name,
  ci.name AS indicator_name,
  ci.weight AS indicator_weight,
  isc.score,
  CASE isc.score
    WHEN 4 THEN 'ดีเยี่ยม'
    WHEN 3 THEN 'ดี'
    WHEN 2 THEN 'พอใช้'
    WHEN 1 THEN 'ต้องปรับปรุง'
  END AS score_label,
  isc.evaluated_at
FROM enrollments e
JOIN trainees t ON t.id = e.trainee_id
LEFT JOIN indicator_scores isc ON isc.enrollment_id = e.id
LEFT JOIN competency_indicators ci ON ci.id = isc.indicator_id
LEFT JOIN module_competencies mc ON mc.id = ci.competency_id;

-- ============================================================
-- 7. Sample data: สมรรถนะ+ตัวชี้วัด สำหรับ SOLAR-PV-L2 Module 1
-- ============================================================

-- Module 1: ความรู้พื้นฐานพลังงานแสงอาทิตย์
WITH mod1 AS (
  SELECT cm.id FROM course_modules cm
  JOIN training_courses tc ON tc.id = cm.course_id
  WHERE tc.code = 'SOLAR-PV-L2' AND cm.module_number = 1
  LIMIT 1
),
comp1 AS (
  INSERT INTO module_competencies (module_id, name, description, competency_type, sort_order)
  SELECT mod1.id,
    'อธิบายหลักการทำงานของเซลล์แสงอาทิตย์',
    'ผู้เรียนสามารถอธิบายกระบวนการเปลี่ยนพลังงานแสงเป็นพลังงานไฟฟ้า (Photovoltaic Effect) ได้ถูกต้อง',
    'knowledge', 1
  FROM mod1
  WHERE EXISTS (SELECT 1 FROM mod1)
  RETURNING id
)
INSERT INTO competency_indicators (competency_id, name, weight, rubric_excellent, rubric_good, rubric_fair, rubric_poor, sort_order)
SELECT comp1.id, v.name, v.weight, v.r4, v.r3, v.r2, v.r1, v.ord
FROM comp1,
(VALUES
  ('อธิบาย Photovoltaic Effect', 30,
   'อธิบายกระบวนการ PV Effect ได้ครบถ้วน พร้อมยกตัวอย่างวัสดุเซลล์แต่ละชนิด',
   'อธิบายกระบวนการ PV Effect ได้ถูกต้อง แต่ยกตัวอย่างวัสดุไม่ครบ',
   'อธิบายกระบวนการ PV Effect ได้บางส่วน',
   'ไม่สามารถอธิบายกระบวนการ PV Effect ได้', 1),
  ('แยกแยะชนิดเซลล์แสงอาทิตย์', 25,
   'แยกแยะ Mono/Poly/Thin-film/PERC/HJT ได้ครบ พร้อมเปรียบเทียบประสิทธิภาพ',
   'แยกแยะชนิดหลัก 3 ชนิดได้ถูกต้อง',
   'แยกแยะได้บางชนิดแต่สับสน',
   'ไม่สามารถแยกแยะชนิดเซลล์ได้', 2),
  ('อ่านค่า Datasheet PV Module', 25,
   'อ่านค่า Voc, Isc, Vmp, Imp, Pmax, Temperature Coefficient ได้ถูกต้องและนำไปใช้คำนวณได้',
   'อ่านค่าหลักได้ถูกต้องแต่ยังไม่เชื่อมโยงกับการคำนวณ',
   'อ่านค่าได้บางตัว',
   'ไม่สามารถอ่านค่า Datasheet ได้', 3),
  ('คำนวณพลังงานเบื้องต้น', 20,
   'คำนวณ Peak Sun Hours, Daily Energy Yield ได้ถูกต้อง พร้อมปัจจัย derating',
   'คำนวณได้ถูกต้องแต่ไม่รวมปัจจัย derating',
   'คำนวณได้โดยต้องมีตัวช่วย',
   'ไม่สามารถคำนวณได้', 4)
) AS v(name, weight, r4, r3, r2, r1, ord);

-- Module 4: ปฏิบัติการติดตั้ง — สมรรถนะด้านทักษะ
WITH mod4 AS (
  SELECT cm.id FROM course_modules cm
  JOIN training_courses tc ON tc.id = cm.course_id
  WHERE tc.code = 'SOLAR-PV-L2' AND cm.module_number = 4
  LIMIT 1
),
comp_install AS (
  INSERT INTO module_competencies (module_id, name, description, competency_type, sort_order)
  SELECT mod4.id,
    'ติดตั้งระบบ Solar PV บนหลังคาได้อย่างถูกต้อง',
    'ผู้เรียนสามารถติดตั้งโครงสร้างรองรับ แผงโซลาร์เซลล์ และเดินสาย DC ได้ตามมาตรฐาน',
    'skill', 1
  FROM mod4
  WHERE EXISTS (SELECT 1 FROM mod4)
  RETURNING id
)
INSERT INTO competency_indicators (competency_id, name, weight, rubric_excellent, rubric_good, rubric_fair, rubric_poor, sort_order)
SELECT comp_install.id, v.name, v.weight, v.r4, v.r3, v.r2, v.r1, v.ord
FROM comp_install,
(VALUES
  ('ติดตั้งโครงสร้างรองรับ (Mounting)', 25,
   'ติดตั้ง mounting structure ได้มุมถูกต้อง แข็งแรง ระยะห่างเหมาะสม ไม่มี shading',
   'ติดตั้งได้ถูกต้อง แต่มีรายละเอียดเล็กน้อยที่ต้องปรับ',
   'ติดตั้งได้แต่ต้องมีผู้ช่วยแนะนำ',
   'ไม่สามารถติดตั้งได้ด้วยตนเอง', 1),
  ('เดินสาย DC และต่อ Connector', 30,
   'เดินสาย DC ถูกต้องตามมาตรฐาน ใช้ MC4 connector ถูกวิธี ติดป้ายชัดเจน',
   'เดินสายถูกต้อง แต่การจัดสายยังไม่เรียบร้อย',
   'เดินสายได้แต่ยังต่อ connector ไม่แน่น',
   'ไม่สามารถเดินสายและต่อ connector ได้', 2),
  ('ต่อ String Configuration', 25,
   'ต่อ series/parallel ได้ถูกต้อง คำนวณ Voc string ไม่เกิน max input inverter',
   'ต่อได้ถูกต้อง แต่ต้องตรวจสอบการคำนวณ',
   'ต่อ series ได้แต่ยังสับสน parallel',
   'ไม่เข้าใจการต่อ string', 3),
  ('ตรวจสอบความปลอดภัยหลังติดตั้ง', 20,
   'ตรวจ grounding, polarity, insulation resistance ได้ครบถ้วน วัดค่าถูกต้อง',
   'ตรวจได้เกือบครบ ขาดบางรายการ',
   'ตรวจได้เฉพาะ polarity',
   'ไม่ทราบขั้นตอนการตรวจสอบ', 4)
) AS v(name, weight, r4, r3, r2, r1, ord);
