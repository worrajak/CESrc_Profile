-- ============================================================
-- 021: Equipment Inventory & Borrowing System
-- ระบบทะเบียนครุภัณฑ์และระบบยืม-คืน
-- ============================================================

-- === ENUMS ===
CREATE TYPE equipment_category AS ENUM (
  'test_measurement',      -- เครื่องมือวัดทางไฟฟ้า
  'solar_pv_test',         -- เครื่องมือทดสอบระบบ PV
  'lab_facility',          -- สิ่งอำนวยความสะดวกใน Lab
  'computer_it',           -- คอมพิวเตอร์และอุปกรณ์ IT
  'safety',                -- อุปกรณ์ความปลอดภัย
  'other'                  -- อื่นๆ
);

CREATE TYPE equipment_status AS ENUM (
  'available',      -- พร้อมใช้งาน
  'borrowed',       -- ถูกยืม
  'maintenance',    -- ซ่อมบำรุง
  'disposed'        -- ตัดจำหน่าย
);

CREATE TYPE borrow_status AS ENUM (
  'pending',              -- รอพิจารณา
  'advisor_approved',     -- อาจารย์ที่ปรึกษาอนุมัติ (สำหรับ นศ.)
  'approved',             -- อนุมัติแล้ว
  'borrowed',             -- กำลังยืม (รับของแล้ว)
  'returned',             -- คืนแล้ว
  'overdue',              -- เกินกำหนด
  'rejected',             -- ปฏิเสธ
  'cancelled'             -- ยกเลิก
);

CREATE TYPE borrower_type AS ENUM (
  'student',    -- นักศึกษา
  'teacher',    -- อาจารย์
  'staff',      -- เจ้าหน้าที่
  'external'    -- บุคคลภายนอก
);

CREATE TYPE return_condition AS ENUM (
  'good',           -- สภาพดี
  'minor_damage',   -- ชำรุดเล็กน้อย
  'major_damage',   -- ชำรุดมาก
  'lost'            -- สูญหาย
);

-- === TABLE 1: EQUIPMENT (ทะเบียนครุภัณฑ์) ===
CREATE TABLE equipment (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th             TEXT NOT NULL,
  name_en             TEXT,
  serial_number       TEXT,
  asset_number        TEXT,                        -- เลขครุภัณฑ์
  category            equipment_category NOT NULL DEFAULT 'other',
  status              equipment_status NOT NULL DEFAULT 'available',
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

CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_asset ON equipment(asset_number) WHERE asset_number IS NOT NULL;

-- === TABLE 2: BORROW REQUESTS (คำขอยืม) ===
CREATE TABLE borrow_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id          UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  quantity              INTEGER NOT NULL DEFAULT 1,
  -- Borrower
  borrower_type         borrower_type NOT NULL DEFAULT 'student',
  borrower_name         TEXT NOT NULL,
  borrower_student_id   TEXT,
  borrower_email        TEXT,
  borrower_phone        TEXT NOT NULL,
  borrower_department   TEXT,
  -- Advisor (for students)
  advisor_name          TEXT,
  advisor_id            UUID REFERENCES researchers(id),
  -- Borrow details
  purpose               TEXT NOT NULL,
  borrow_date           DATE NOT NULL,
  expected_return_date  DATE NOT NULL,
  -- Approval workflow
  status                borrow_status NOT NULL DEFAULT 'pending',
  advisor_approved_at   TIMESTAMPTZ,
  advisor_approved_by   TEXT,
  approved_at           TIMESTAMPTZ,
  approved_by           TEXT,
  rejection_reason      TEXT,
  -- Return tracking
  actual_return_date    DATE,
  return_condition      return_condition,
  return_notes          TEXT,
  returned_to           TEXT,
  -- Metadata
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_borrow_status ON borrow_requests(status);
CREATE INDEX idx_borrow_equipment ON borrow_requests(equipment_id);
CREATE INDEX idx_borrow_return ON borrow_requests(expected_return_date);

-- === RLS ===
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Anon write equipment" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update equipment" ON equipment FOR UPDATE USING (true);
CREATE POLICY "Anon delete equipment" ON equipment FOR DELETE USING (true);

CREATE POLICY "Public read borrow_requests" ON borrow_requests FOR SELECT USING (true);
CREATE POLICY "Public insert borrow_requests" ON borrow_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update borrow_requests" ON borrow_requests FOR UPDATE USING (true);
CREATE POLICY "Anon delete borrow_requests" ON borrow_requests FOR DELETE USING (true);

-- === TRIGGERS ===
CREATE TRIGGER trg_equipment_updated
  BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_borrow_updated
  BEFORE UPDATE ON borrow_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === VIEW: Overdue Borrows ===
CREATE OR REPLACE VIEW v_overdue_borrows AS
SELECT
  br.*,
  e.name_th AS equipment_name_th,
  e.name_en AS equipment_name_en,
  e.asset_number,
  (CURRENT_DATE - br.expected_return_date) AS days_overdue
FROM borrow_requests br
JOIN equipment e ON e.id = br.equipment_id
WHERE br.status IN ('borrowed', 'approved')
  AND br.expected_return_date < CURRENT_DATE
  AND br.actual_return_date IS NULL
ORDER BY br.expected_return_date ASC;
