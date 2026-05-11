-- ============================================================
-- 045: Research Plan — Grant Calls table
-- เก็บประกาศแหล่งทุน (FF71, NRCT, TSRI, PMUC ฯลฯ) พร้อมปฏิทิน
-- AI สกัดเงื่อนไข/วันเปิด-ปิด/งบประมาณ จาก URL หรือข้อความที่ paste มา
-- ============================================================

CREATE TABLE IF NOT EXISTS grant_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agency identity
  agency_code TEXT NOT NULL,           -- 'FF', 'NRCT', 'TSRI', 'PMUC', 'PMUA', 'EPPO', 'EGAT'
  agency_name_th TEXT NOT NULL,
  agency_name_en TEXT,

  -- Specific call cycle
  call_code TEXT NOT NULL,             -- 'FF71', 'FF72', 'NRCT-2026-General'
  call_name_th TEXT NOT NULL,
  call_name_en TEXT,
  fiscal_year_be INT,                  -- 2571 for FF71

  -- Calendar (the heart of the planner)
  announce_date DATE,                  -- วันประกาศรับ
  open_date DATE,                      -- วันเปิดรับ
  close_date DATE,                     -- วันปิดรับ
  result_date DATE,                    -- วันประกาศผล

  -- Budget envelope
  budget_min NUMERIC(14,2),            -- THB
  budget_max NUMERIC(14,2),
  duration_months INT,

  -- Conditions (AI-extracted from announcement)
  eligibility_th TEXT,                 -- คุณสมบัติผู้ขอ
  conditions_th TEXT,                  -- เงื่อนไขทุน
  scope_th TEXT,                       -- ขอบเขตการวิจัย
  research_areas TEXT[],               -- หัวข้อวิจัยที่รับ
  required_outputs TEXT[],             -- ผลผลิตที่ต้องส่ง (e.g. "Q1 paper", "patent")

  -- Links
  announcement_url TEXT,               -- ลิงก์ประกาศต้นฉบับ
  regulations_url TEXT,                -- ระเบียบกองทุน
  template_url TEXT,                   -- template ข้อเสนอ

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','open','closed','results_announced','archived')),
  is_active BOOLEAN DEFAULT true,

  -- AI metadata for debugging / re-extraction
  ai_extracted_data JSONB,
  ai_provider TEXT,                    -- which AI was used
  ingested_at TIMESTAMPTZ,
  ingested_by UUID,                    -- auth.users.id
  notes TEXT,                          -- manual notes by admin

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agency_code, call_code)
);

CREATE INDEX IF NOT EXISTS idx_grant_calls_status ON grant_calls(status, close_date);
CREATE INDEX IF NOT EXISTS idx_grant_calls_close_date ON grant_calls(close_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_grant_calls_agency ON grant_calls(agency_code);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_grant_calls_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_calls_updated_at ON grant_calls;
CREATE TRIGGER trg_grant_calls_updated_at
  BEFORE UPDATE ON grant_calls
  FOR EACH ROW EXECUTE FUNCTION update_grant_calls_timestamp();

-- RLS: public read, authenticated write
ALTER TABLE grant_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grant_calls_public_read" ON grant_calls;
CREATE POLICY "grant_calls_public_read" ON grant_calls
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "grant_calls_auth_write" ON grant_calls;
CREATE POLICY "grant_calls_auth_write" ON grant_calls
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Seed: 8 major Thai funding sources for clean energy / engineering
-- ทุนเปล่า ปี 2569 (BE) — ให้ AI เติม dates ภายหลังจาก URL ประกาศ
-- ============================================================

INSERT INTO grant_calls (agency_code, agency_name_th, agency_name_en, call_code, call_name_th, call_name_en, fiscal_year_be, status, source_url, notes) VALUES
-- 1. ทุน FF71 (Fundamental Fund) — มทร.ล้านนา (สกสว.) ⭐ DEADLINE 15 พ.ค. 2569
('FF', 'มทร.ล้านนา / ทุนสนับสนุนงานมูลฐาน (สกสว.)', 'RMUTL Fundamental Fund (TSRI)', 'FF71', 'ทุนสนับสนุนงานมูลฐาน (Fundamental Fund) ประจำปีงบประมาณ พ.ศ. 2571', 'Fundamental Fund FY2571 (BE)', 2571, 'open', NULL, 'ประกาศแล้ว 17 มี.ค. 2569 — ปิดรับ Concept Proposal 15 พ.ค. 2569'),

-- 2. NRCT — สำนักงานการวิจัยแห่งชาติ (วช.)
('NRCT', 'สำนักงานการวิจัยแห่งชาติ', 'National Research Council of Thailand', 'NRCT-2026-General', 'ทุนวิจัยทั่วไป วช. ปี 2569', 'NRCT General Research Grant 2026', 2569, 'upcoming', 'https://www.nrct.go.th', NULL),

-- 3. TSRI — สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)
('TSRI', 'สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม', 'Thailand Science Research and Innovation', 'TSRI-2026', 'ทุนยุทธศาสตร์ สกสว. ปี 2569', 'TSRI Strategic Fund 2026', 2569, 'upcoming', 'https://www.tsri.or.th', NULL),

-- 4. PMUC — บพข. (Program Management Unit for Competitiveness)
('PMUC', 'หน่วยบริหารและจัดการทุนด้านการเพิ่มความสามารถในการแข่งขันของประเทศ', 'Program Management Unit for Competitiveness', 'PMUC-2026', 'ทุน บพข. ปี 2569 — Industry & Competitiveness', 'PMUC 2026 — Industry Research', 2569, 'upcoming', 'https://pmuc.or.th', 'เน้นวิจัยที่ใช้ได้จริงในอุตสาหกรรม'),

-- 5. PMUA — บพท. (Program Management Unit for Area-Based Development)
('PMUA', 'หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่', 'Program Management Unit for Area-Based Development', 'PMUA-2026', 'ทุน บพท. ปี 2569 — พื้นที่ภาคเหนือ', 'PMUA 2026 — Northern Thailand Area', 2569, 'upcoming', 'https://pmua.or.th', NULL),

-- 6. PMUB — บพค. (Program Management Unit for Human Resources)
('PMUB', 'หน่วยบริหารและจัดการทุนด้านการพัฒนากำลังคน', 'Program Management Unit for Human Resources & Brain Power', 'PMUB-2026', 'ทุน บพค. ปี 2569 — Frontier Research', 'PMUB 2026 — Frontier Research Fund', 2569, 'upcoming', 'https://www.nxpo.or.th/B', NULL),

-- 7. EPPO — สนพ. (Energy Policy and Planning Office)
('EPPO', 'สำนักงานนโยบายและแผนพลังงาน', 'Energy Policy and Planning Office', 'EPPO-2026', 'ทุนวิจัยพลังงาน สนพ. ปี 2569', 'EPPO Energy Research 2026', 2569, 'upcoming', 'https://www.eppo.go.th', 'ทุนตรงกับ CESRU มาก — clean energy'),

-- 8. EGAT — กฟผ.
('EGAT', 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย', 'Electricity Generating Authority of Thailand', 'EGAT-2026', 'ทุน กฟผ. ปี 2569', 'EGAT Research Fund 2026', 2569, 'upcoming', 'https://www.egat.co.th', NULL)

ON CONFLICT (agency_code, call_code) DO UPDATE SET
  call_name_th = EXCLUDED.call_name_th,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- ============================================================
-- Enrich FF71 with complete data extracted from PDF announcement
-- (ประกาศ มทร.ล้านนา ลงวันที่ 17 มีนาคม พ.ศ. 2569)
-- ============================================================
UPDATE grant_calls SET
  announce_date = '2026-03-17',           -- ประกาศ 17 มี.ค. 2569
  open_date = '2026-04-01',               -- เริ่มเปิดรับ เมษายน 2569
  close_date = '2026-05-15',              -- ปิดรับ Concept Proposal 15 พ.ค. 2569
  result_date = '2026-09-01',             -- ประกาศผล Full Proposal 1 ก.ย. 2569
  budget_min = 50000,                     -- ขั้นต่ำสุด (R2R / นักวิจัยใหม่)
  budget_max = 1000000,                   -- ขั้นสูงสุด (หน่วยวิจัย Multi-year)
  duration_months = 12,                   -- 1 ปี (Multi-year ได้ 2-3 ปีสำหรับหน่วยวิจัย)
  scope_th = 'แบ่งเป็น 6 แผนงาน: (1) วิจัยและพัฒนานวัตกรรมเพื่อกระตุ้นขีดความสามารถการแข่งขันในอุตสาหกรรมเป้าหมาย — แพทย์/สุขภาพ, เกษตร/อาหาร, ท่องเที่ยว, พลังงาน-วัสดุ-เคมีชีวภาพ, AI-ดิจิทัล, โลจิสติกส์-ราง, ยานยนต์ไฟฟ้า, IDEs (2) สังคมและสิ่งแวดล้อม (3) ขั้นแนวหน้า Frontier Research (4) Lanna Art Craft Cultural & Tech (5) ขับเคลื่อนมหาวิทยาลัยและพัฒนาเชิงพื้นที่ (6) Routine to Research (R2R)',
  eligibility_th = 'หัวหน้าโครงการต้องเป็น (1) ข้าราชการ/พนักงานในสถาบันอุดมศึกษาสังกัด มทร.ล้านนา (2) ผ่านการอบรมจริยธรรมการวิจัย Research Integrity (3) ไม่อยู่ระหว่างลาศึกษาต่อ/ฝึกอบรมในปีงบประมาณ 2569-2571 (4) ไม่ติดค้างปิดโครงการเดิม (5) ถ้าเคยได้ทุน FF ปี 2566/2567/2568 ต้องไม่ติดค้างผลผลิต/ผลลัพธ์ในระบบ NRIIS',
  conditions_th = '5 ประเภททุน: ' ||
    'ประเภทที่ 1 ทุนนักวิจัยใหม่ (50,000-150,000 บาท, 1 ปี); ' ||
    'ประเภทที่ 2 ทุนนักวิจัยรุ่นกลาง (200,000-400,000 บาท, 1 ปี, ต้องมีตำแหน่ง อาจารย์ขึ้นไป + 1 บทความ Scopus ใน 5 ปีย้อนหลัง); ' ||
    'ประเภทที่ 3 ทุนนักวิจัยรุ่นอาวุโส (400,000-600,000 บาท, 1-3 ปี Multi-year, ต้องดำรงตำแหน่ง ผศ. ขึ้นไป + 6 โครงการในฐานะหัวหน้า + 3 บทความ Scopus); ' ||
    'ประเภทที่ 4 ทุนสำหรับหน่วยวิจัย/COE (600,000-1,000,000 บาท/ปี, Multi-year 2-3 ปี, ต้องเป็นหัวหน้าหน่วยวิจัยภายใต้ศูนย์ความเป็นเลิศ + 5 บทความ Scopus + TRL 5 ขึ้นไป); ' ||
    'ประเภทที่ 5 ทุน R2R (50,000-120,000 บาท, 1 ปี, สายสนับสนุน)',
  research_areas = ARRAY['พลังงาน วัสดุ เคมีชีวภาพ', 'ยานยนต์ไฟฟ้า (EV)', 'AI และเทคโนโลยีดิจิทัล', 'การแพทย์และสุขภาพ', 'เกษตรและอาหาร', 'ท่องเที่ยวและบริการ', 'โลจิสติกส์และระบบราง', 'ธุรกิจฐานนวัตกรรม (IDEs)', 'สังคมสูงวัย', 'ทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'ภัยพิบัติและการเปลี่ยนแปลงสภาพภูมิอากาศ', 'Lanna Art Craft Cultural', 'พื้นที่ภาคเหนือ', 'Routine to Research (R2R)'],
  required_outputs = ARRAY['บทความวิจัย Scopus Q1-Q4 (ตามประเภททุน)', 'ทรัพย์สินทางปัญญา (สิทธิบัตร/อนุสิทธิบัตร)', 'ต้นแบบผลิตภัณฑ์/เทคโนโลยี/นวัตกรรมทางสังคม', 'การถ่ายทอดเทคโนโลยี (RU)', 'ฐานข้อมูล/ระบบ/มาตรฐาน', 'กำลังคน/หน่วยงานที่ได้รับการพัฒนาทักษะ', 'ความก้าวหน้าในวิชาชีพของบุคลากรด้านวิทยาศาสตร์วิจัยและนวัตกรรม', 'ทุนวิจัยต่อยอด (SF)', 'ข้อเสนอแนะเชิงนโยบาย (Policy Recommendation)'],
  ingested_at = NOW()
WHERE agency_code = 'FF' AND call_code = 'FF71';

-- Verify
SELECT agency_code, call_code, status, close_date, budget_min, budget_max FROM grant_calls ORDER BY agency_code;
