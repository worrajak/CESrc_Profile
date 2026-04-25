-- ============================================================
-- 040: PhD Advisor Relationships + Role Updates
-- เพิ่มความสัมพันธ์อาจารย์ที่ปรึกษา ป.เอก สำหรับสมาชิกที่ลงทะเบียนเรียน ป.เอก
-- ใน researchers ด้วยกันเอง (ไม่ใช่ student ภายนอก)
-- ============================================================

-- 1) Add PhD advisor + status fields
ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS is_pursuing_phd BOOLEAN DEFAULT false;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS phd_advisor_id UUID REFERENCES researchers(id) ON DELETE SET NULL;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS phd_program TEXT;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS phd_university TEXT;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS phd_start_year INTEGER;

COMMENT ON COLUMN researchers.is_pursuing_phd IS 'เป็นนักศึกษาปริญญาเอกหรือไม่ (สามารถ ทับซ้อนกับ unit_role ได้ เช่น member ที่กำลังเรียน ป.เอก)';
COMMENT ON COLUMN researchers.phd_advisor_id IS 'อาจารย์ที่ปรึกษาวิทยานิพนธ์ ป.เอก (ในกรณีที่เรียน ป.เอก ในกลุ่มนี้)';

CREATE INDEX IF NOT EXISTS idx_researchers_phd_advisor ON researchers(phd_advisor_id) WHERE phd_advisor_id IS NOT NULL;

-- 2) โกศล โอฬารไพโรจน์ → ที่ปรึกษา (advisor)
UPDATE researchers SET
  unit_role = 'advisor',
  position_th = 'ที่ปรึกษาหน่วยวิจัยระบบพลังงานสะอาด',
  position_en = 'Research Unit Advisor'
WHERE id = 'a0000001-0000-0000-0000-000000000003';

-- 3) มนตรี เงาเดช → member + นศ. ป.เอก (ที่ปรึกษา: ธีระศักดิ์)
UPDATE researchers SET
  is_pursuing_phd = true,
  phd_advisor_id = 'a0000001-0000-0000-0000-000000000002'  -- ธีระศักดิ์
WHERE id = 'a0000001-0000-0000-0000-000000000008';

-- 4) นริศ กำแพงแก้ว → member + นศ. ป.เอก (ที่ปรึกษา: ธีระศักดิ์)
UPDATE researchers SET
  is_pursuing_phd = true,
  phd_advisor_id = 'a0000001-0000-0000-0000-000000000002'  -- ธีระศักดิ์
WHERE id = 'a0000001-0000-0000-0000-000000000014';

-- ============================================================
-- Summary:
--   advisors now: 3 — จัตตุฤทธิ์, เสถียร, โกศล
--   PhD students (pure): 4 — ธเนศ, วุฒิไกร, กิตตินัน, ณรงค์
--   Members ที่ก็เป็น นศ. ป.เอก: 2 — มนตรี, นริศ (ทั้งคู่ที่ปรึกษา ธีระศักดิ์)
--
-- หมายเหตุ: หากต้องการให้ ธเนศ/วุฒิไกร/กิตตินัน/ณรงค์ มี advisor
-- ให้ UPDATE phd_advisor_id เพิ่มเติมตามที่ต้องการ
-- ============================================================
