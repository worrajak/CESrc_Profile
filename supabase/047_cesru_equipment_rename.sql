-- ============================================================
-- 047: Rename CESRU equipment tables to avoid conflict with ASMP
-- ============================================================
-- Context: the public.equipment table is owned by the AcademicService-
-- Platform (ASMP) project that shares this Supabase instance. CESRU's
-- own equipment schema is different (quantity_total, status, etc.) so
-- we move CESRU's tables to cesru_* prefixed names.
--
-- Run this as ONE script in the Supabase SQL Editor — it is idempotent.

-- === ENUMS (only if they don't already exist) ===
DO $$ BEGIN
  CREATE TYPE cesru_equipment_category AS ENUM (
    'test_measurement', 'solar_pv_test', 'lab_facility',
    'computer_it', 'safety', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_equipment_status AS ENUM (
    'available', 'borrowed', 'maintenance', 'disposed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_borrow_status AS ENUM (
    'pending', 'advisor_approved', 'approved', 'borrowed',
    'returned', 'overdue', 'rejected', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_borrower_type AS ENUM (
    'student', 'teacher', 'staff', 'external'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_return_condition AS ENUM (
    'good', 'minor_damage', 'major_damage', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- === TABLE: cesru_equipment (ทะเบียนครุภัณฑ์ CESRU) ===
CREATE TABLE IF NOT EXISTS cesru_equipment (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th             TEXT NOT NULL,
  name_en             TEXT,
  serial_number       TEXT,
  asset_number        TEXT,
  category            cesru_equipment_category NOT NULL DEFAULT 'other',
  status              cesru_equipment_status NOT NULL DEFAULT 'available',
  quantity_total      INTEGER NOT NULL DEFAULT 1,
  quantity_available  INTEGER NOT NULL DEFAULT 1,
  location            TEXT DEFAULT 'ห้องปฏิบัติการพลังงานแสงอาทิตย์ (Solar Lab)',
  description_th      TEXT,
  description_en      TEXT,
  brand               TEXT,
  model               TEXT,
  purchase_date       DATE,
  purchase_value      DECIMAL(12,2),
  warranty_until      DATE,
  disposed_date       DATE,
  disposed_reason     TEXT,
  image_url           TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cesru_eq_category ON cesru_equipment(category);
CREATE INDEX IF NOT EXISTS idx_cesru_eq_status ON cesru_equipment(status);
CREATE INDEX IF NOT EXISTS idx_cesru_eq_asset ON cesru_equipment(asset_number) WHERE asset_number IS NOT NULL;

-- === TABLE: cesru_borrow_requests (คำขอยืม CESRU) ===
CREATE TABLE IF NOT EXISTS cesru_borrow_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id          UUID NOT NULL REFERENCES cesru_equipment(id) ON DELETE RESTRICT,
  quantity              INTEGER NOT NULL DEFAULT 1,
  borrower_type         cesru_borrower_type NOT NULL DEFAULT 'student',
  borrower_name         TEXT NOT NULL,
  borrower_student_id   TEXT,
  borrower_email        TEXT,
  borrower_phone        TEXT NOT NULL,
  borrower_department   TEXT,
  advisor_name          TEXT,
  advisor_id            UUID REFERENCES researchers(id),
  purpose               TEXT NOT NULL,
  borrow_date           DATE NOT NULL,
  expected_return_date  DATE NOT NULL,
  status                cesru_borrow_status NOT NULL DEFAULT 'pending',
  advisor_approved_at   TIMESTAMPTZ,
  advisor_approved_by   TEXT,
  approved_at           TIMESTAMPTZ,
  approved_by           TEXT,
  rejection_reason      TEXT,
  actual_return_date    DATE,
  return_condition      cesru_return_condition,
  return_notes          TEXT,
  returned_to           TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cesru_borrow_status ON cesru_borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_cesru_borrow_eq ON cesru_borrow_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_cesru_borrow_return ON cesru_borrow_requests(expected_return_date);

-- === RLS ===
ALTER TABLE cesru_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE cesru_borrow_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cesru_eq_public_read" ON cesru_equipment;
DROP POLICY IF EXISTS "cesru_eq_anon_write" ON cesru_equipment;
DROP POLICY IF EXISTS "cesru_eq_anon_update" ON cesru_equipment;
DROP POLICY IF EXISTS "cesru_eq_anon_delete" ON cesru_equipment;
CREATE POLICY "cesru_eq_public_read" ON cesru_equipment FOR SELECT USING (true);
CREATE POLICY "cesru_eq_anon_write" ON cesru_equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "cesru_eq_anon_update" ON cesru_equipment FOR UPDATE USING (true);
CREATE POLICY "cesru_eq_anon_delete" ON cesru_equipment FOR DELETE USING (true);

DROP POLICY IF EXISTS "cesru_br_public_read" ON cesru_borrow_requests;
DROP POLICY IF EXISTS "cesru_br_anon_write" ON cesru_borrow_requests;
DROP POLICY IF EXISTS "cesru_br_anon_update" ON cesru_borrow_requests;
DROP POLICY IF EXISTS "cesru_br_anon_delete" ON cesru_borrow_requests;
CREATE POLICY "cesru_br_public_read" ON cesru_borrow_requests FOR SELECT USING (true);
CREATE POLICY "cesru_br_anon_write" ON cesru_borrow_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "cesru_br_anon_update" ON cesru_borrow_requests FOR UPDATE USING (true);
CREATE POLICY "cesru_br_anon_delete" ON cesru_borrow_requests FOR DELETE USING (true);

-- === TRIGGERS (only create if missing) ===
DO $$ BEGIN
  CREATE TRIGGER trg_cesru_eq_updated
    BEFORE UPDATE ON cesru_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cesru_br_updated
    BEFORE UPDATE ON cesru_borrow_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- === VIEW: Overdue Borrows ===
CREATE OR REPLACE VIEW v_cesru_overdue_borrows AS
SELECT br.*, e.name_th AS equipment_name_th, e.name_en AS equipment_name_en,
       e.asset_number, (CURRENT_DATE - br.expected_return_date) AS days_overdue
FROM cesru_borrow_requests br
JOIN cesru_equipment e ON e.id = br.equipment_id
WHERE br.status IN ('borrowed', 'approved')
  AND br.expected_return_date < CURRENT_DATE
  AND br.actual_return_date IS NULL
ORDER BY br.expected_return_date ASC;

-- ============================================================
-- SEED 33 ครุภัณฑ์ใน Lab Solar
-- (skip if rows already exist)
-- ============================================================

INSERT INTO cesru_equipment (name_th, name_en, brand, model, category, quantity_total, quantity_available, notes)
SELECT * FROM (VALUES
  ('มัลติมิเตอร์ Fluke 289', 'Fluke 289 True-RMS Industrial Logging Multimeter', 'Fluke', '289', 'test_measurement'::cesru_equipment_category, 4, 3, 'เสีย 1 เครื่อง'::TEXT),
  ('เครื่องวัดพลังงานไฟฟ้า 3 เฟส Fluke 1730', 'Fluke 1730 Three-Phase Energy Logger', 'Fluke', '1730', 'test_measurement', 2, 2, NULL),
  ('แคลมป์มิเตอร์ Fluke 376 FC', 'Fluke 376 FC True-RMS AC/DC Clamp Meter', 'Fluke', '376 FC', 'test_measurement', 2, 2, NULL),
  ('แคลมป์มิเตอร์ Fluke 337', 'Fluke 337 True-RMS Clamp Meter', 'Fluke', '337', 'test_measurement', 1, 1, NULL),
  ('เครื่องวัดอุณหภูมิอินฟราเรด Fluke 62 MAX+', 'Fluke 62 MAX+ Infrared Thermometer', 'Fluke', '62 MAX+', 'test_measurement', 1, 1, NULL),
  ('เครื่องวัดอุณหภูมิและความชื้น Fluke 971', 'Fluke 971 Temperature & Humidity Meter', 'Fluke', '971', 'test_measurement', 1, 1, NULL),
  ('กล้องถ่ายภาพความร้อน Fluke Ti25', 'Fluke Ti25 Thermal Imager', 'Fluke', 'Ti25', 'test_measurement', 1, 1, NULL),
  ('เครื่องวัดความต้านทานดิน Fluke 1625-2', 'Fluke 1625-2 GEO Earth Ground Tester Kit', 'Fluke', '1625-2', 'test_measurement', 1, 1, NULL),
  ('เครื่องบันทึกข้อมูล HIOKI LR8450-01', 'HIOKI Memory HiLogger LR8450-01', 'HIOKI', 'LR8450-01', 'test_measurement', 1, 1, NULL),
  ('แคลมป์มิเตอร์วัดกำลังไฟฟ้า MS2203', 'Digital Power Clamp Meter MS2203', 'Mastech', 'MS2203', 'test_measurement', 4, 4, NULL),
  ('LCR มิเตอร์ BK Precision 879B', 'BK Precision 879B Handheld LCR Meter', 'BK Precision', '879B', 'test_measurement', 2, 2, NULL),
  ('มัลติมิเตอร์ DIGICON DM-690', 'DIGICON DM-690 Digital Multimeter', 'DIGICON', 'DM-690', 'test_measurement', 1, 1, NULL)
) AS s(name_th, name_en, brand, model, category, quantity_total, quantity_available, notes)
WHERE NOT EXISTS (SELECT 1 FROM cesru_equipment WHERE category = 'test_measurement');

INSERT INTO cesru_equipment (name_th, name_en, brand, model, category, quantity_total, quantity_available, description_th)
SELECT * FROM (VALUES
  ('ชุดทดสอบระบบ PV Seaward PV150', 'Seaward PV150 Solar Complete Kit', 'Seaward', 'PV150', 'solar_pv_test'::cesru_equipment_category, 1, 1, 'ชุดทดสอบระบบ PV ครบชุด (Voc, Isc, Insulation, Continuity)'::TEXT),
  ('เครื่องตรวจสอบระบบ PV HT PV CHECKs', 'HT PV CHECKs', 'HT Instruments', 'PV CHECKs', 'solar_pv_test', 1, 1, 'ตรวจสอบความปลอดภัยระบบ PV'),
  ('เครื่องวัดกราฟ I-V HT I-V 400W', 'HT I-V 400W I-V Curve Tracer', 'HT Instruments', 'I-V 400W', 'solar_pv_test', 1, 1, 'วัดกราฟ I-V ของแผงโซล่าเซลล์ได้ถึง 400W'),
  ('เครื่องวัดความเข้มแสง HT Solar 300N', 'HT Solar 300N Irradiance Meter', 'HT Instruments', 'Solar 300N', 'solar_pv_test', 1, 1, 'วัดความเข้มแสงอาทิตย์และอุณหภูมิแผง'),
  ('เครื่องวิเคราะห์ MPPT HT MPP300', 'HT MPP300 MPPT Analyzer', 'HT Instruments', 'MPP300', 'solar_pv_test', 1, 1, 'วิเคราะห์จุดทำงานสูงสุดของระบบ PV'),
  ('เครื่องทดสอบ PV ระยะไกล Metrel A1378', 'Metrel EurotestPV Remote A1378', 'Metrel', 'A1378', 'solar_pv_test', 1, 1, 'ทดสอบระบบ PV ระยะไกล'),
  ('เครื่องทดสอบ PV แบบพกพา Metrel MI 3109', 'Metrel MI 3109 EurotestPV Lite', 'Metrel', 'MI 3109', 'solar_pv_test', 1, 1, 'ทดสอบระบบ PV แบบพกพา'),
  ('เครื่องวิเคราะห์แผงโซล่าเซลล์ PROVA 210', 'PROVA 210 Solar Module Analyzer', 'PROVA', '210', 'solar_pv_test', 1, 1, 'วิเคราะห์แผงโซล่าเซลล์')
) AS s(name_th, name_en, brand, model, category, quantity_total, quantity_available, description_th)
WHERE NOT EXISTS (SELECT 1 FROM cesru_equipment WHERE category = 'solar_pv_test');

INSERT INTO cesru_equipment (name_th, name_en, brand, model, category, asset_number, quantity_total, quantity_available)
SELECT * FROM (VALUES
  ('คอมพิวเตอร์ All In One', 'Computer All-in-One', NULL::TEXT, NULL::TEXT, 'computer_it'::cesru_equipment_category, '2-11150000-FA19-744000102/001-61', 1, 1),
  ('คอมพิวเตอร์ All In One', 'Computer All-in-One', NULL, NULL, 'computer_it', '2-11150000-FA19-744000102/002-61', 1, 1),
  ('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/001-61', 1, 1),
  ('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/002-61', 1, 1),
  ('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/003-61', 1, 1),
  ('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/004-61', 1, 1),
  ('เครื่องปรับอากาศชนิดติดผนัง', 'Wall-Mounted Air Conditioner', NULL, NULL, 'lab_facility', '2-11150000-FA06-412000104/001-61', 1, 1),
  ('เครื่องปรับอากาศชนิดติดผนัง', 'Wall-Mounted Air Conditioner', NULL, NULL, 'lab_facility', '2-11150000-FA06-412000104/002-61', 1, 1),
  ('โทรทัศน์ LED TV', 'LED TV', NULL, NULL, 'lab_facility', '2-11150000-FA08-773000301/001-61', 1, 1),
  ('โทรทัศน์ LED Smart TV', 'LED Smart TV', NULL, NULL, 'lab_facility', '2-11150000-FA08-773000301/002-61', 1, 1),
  ('เครื่องดูดควันมาตรฐาน', 'Fume Hood', NULL, NULL, 'lab_facility', '2-11150000-FA21-414000701/001-61', 1, 1),
  ('ตู้เย็น', 'Refrigerator', NULL, NULL, 'lab_facility', '2-11150000-FA06-411000101/001-61', 1, 1),
  ('ตู้เย็น', 'Refrigerator', NULL, NULL, 'lab_facility', '2-11150000-FA06-411000101/002-61', 1, 1)
) AS s(name_th, name_en, brand, model, category, asset_number, quantity_total, quantity_available)
WHERE NOT EXISTS (SELECT 1 FROM cesru_equipment WHERE category IN ('computer_it', 'lab_facility'));

-- Verify
SELECT category, COUNT(*) FROM cesru_equipment GROUP BY category ORDER BY category;
