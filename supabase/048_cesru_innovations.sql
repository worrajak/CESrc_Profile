-- ============================================================
-- 048: CESRU Innovations / IP Portfolio
-- ทะเบียนนวัตกรรม สิทธิบัตร อนุสิทธิบัตร ของหน่วยวิจัย
-- รวมโครงสร้างค่าตอบแทนสิทธิ (license fee) ตามแนวทาง TLO-LCA
-- ============================================================

-- === ENUMS (idempotent) ===
DO $$ BEGIN
  CREATE TYPE cesru_innovation_type AS ENUM (
    'petty_patent',   -- อนุสิทธิบัตร
    'patent',         -- สิทธิบัตร (การประดิษฐ์/การออกแบบ)
    'copyright',      -- ลิขสิทธิ์
    'trademark',      -- เครื่องหมายการค้า
    'trade_secret',   -- ความลับทางการค้า
    'prototype'       -- ต้นแบบ (ยังไม่ยื่นจด)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_innovation_status AS ENUM (
    'concept', 'filed', 'granted', 'expired', 'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cesru_license_type AS ENUM (
    'exclusive',     -- สิทธิเฉพาะแต่ผู้เดียว
    'sole',          -- สิทธิร่วมกับผู้อนุญาต
    'non_exclusive'  -- สิทธิหลายราย
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- === TABLE: cesru_innovations ===
CREATE TABLE IF NOT EXISTS cesru_innovations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  title_th                TEXT NOT NULL,
  title_en                TEXT,
  short_desc_th           TEXT,
  short_desc_en           TEXT,
  long_desc_th            TEXT,

  innovation_type         cesru_innovation_type NOT NULL DEFAULT 'petty_patent',
  ip_number               TEXT,                 -- หมายเลขอนุสิทธิบัตร / สิทธิบัตร
  filing_date             DATE,                 -- วันยื่นคำขอ
  grant_date              DATE,                 -- วันได้รับอนุมัติ
  status                  cesru_innovation_status NOT NULL DEFAULT 'filed',

  -- Inventors (multi-select from researchers table)
  inventor_ids            UUID[] DEFAULT '{}',
  contact_researcher_id   UUID REFERENCES researchers(id) ON DELETE SET NULL,

  -- Images (1-4 URLs, cover + gallery)
  cover_image_url         TEXT,
  image_urls              TEXT[] DEFAULT '{}',  -- additional images (max 3 alongside cover)

  -- Attached documents (patent cert, license agreement, etc.)
  documents               JSONB DEFAULT '[]'::jsonb,
  -- shape: [{label: 'หนังสือรับรองอนุสิทธิบัตร', url, type: 'pdf', size_kb: 320}, ...]

  -- License info (mirrors TLO-LCA style)
  license_type            cesru_license_type,
  license_holder_name     TEXT,                 -- บริษัทผู้รับสิทธิ
  license_contract_no     TEXT,                 -- สัญญาเลขที่ (เช่น TLO-LCA-2567-002)
  license_start_date      DATE,
  license_end_date        DATE,
  license_territory       TEXT,                 -- เช่น "Thailand"

  -- Fee breakdown
  license_fee_thb         NUMERIC(14,2),        -- รวมสุทธิ (รวม VAT)
  license_fee_breakdown   JSONB DEFAULT '{}'::jsonb,
  -- shape: {
  --   disclosure_fee: 300000,
  --   vat_pct: 7,
  --   vat_amount: 21000,
  --   tech_transfer: { sessions: 5, people_per_session: 5, hours: 8, days: 4 },
  --   consulting: { sessions: 5, times_per_session: 3, hours: 8, days: 3 },
  --   late_penalty_pct: 5,
  --   notes: ''
  -- }

  -- Inventor compensation (optional)
  inventor_share_thb      NUMERIC(14,2),
  inventor_share_breakdown JSONB,

  notes                   TEXT,
  is_active               BOOLEAN DEFAULT true,
  sort_order              INTEGER DEFAULT 0,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cesru_innov_type ON cesru_innovations(innovation_type);
CREATE INDEX IF NOT EXISTS idx_cesru_innov_status ON cesru_innovations(status);
CREATE INDEX IF NOT EXISTS idx_cesru_innov_active ON cesru_innovations(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_cesru_innov_contact ON cesru_innovations(contact_researcher_id);

-- === RLS ===
ALTER TABLE cesru_innovations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cesru_innov_public_read" ON cesru_innovations;
CREATE POLICY "cesru_innov_public_read" ON cesru_innovations
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "cesru_innov_anon_write" ON cesru_innovations;
CREATE POLICY "cesru_innov_anon_write" ON cesru_innovations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "cesru_innov_anon_update" ON cesru_innovations;
CREATE POLICY "cesru_innov_anon_update" ON cesru_innovations
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "cesru_innov_anon_delete" ON cesru_innovations;
CREATE POLICY "cesru_innov_anon_delete" ON cesru_innovations
  FOR DELETE USING (true);

-- === Auto-update updated_at ===
DO $$ BEGIN
  CREATE TRIGGER trg_cesru_innov_updated
    BEFORE UPDATE ON cesru_innovations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Seed: 1 example innovation matching TLO-LCA-2567-002
-- (IoT multi-channel value reader with internet technology)
-- ============================================================
INSERT INTO cesru_innovations (
  title_th, short_desc_th,
  innovation_type, ip_number, filing_date, status,
  license_type, license_holder_name, license_contract_no,
  license_start_date, license_end_date, license_territory,
  license_fee_thb, license_fee_breakdown,
  is_active, notes
)
SELECT
  'เครื่องอ่านและบันทึกค่าหลายชนิดโดยใช้เทคโนโลยีอินเตอร์เน็ตของทุกสรรพสิ่ง (IoT)',
  'อุปกรณ์อ่านค่าจาก sensor หลายชนิด เชื่อมต่อผ่าน IoT บันทึก/ส่งข้อมูลแบบ real-time',
  'petty_patent', '2001008879', '2020-07-09', 'filed',
  'exclusive', 'บริษัท พีบีดับบลิว ไลท์ติ้ง จำกัด', 'TLO-LCA-2567-002',
  '2024-11-22', '2027-11-21', 'Thailand',
  321000,  -- 300k + 7% VAT
  jsonb_build_object(
    'disclosure_fee', 300000,
    'vat_pct', 7,
    'vat_amount', 21000,
    'tech_transfer', jsonb_build_object('sessions', 5, 'people_per_session', 5, 'hours_per_day', 8, 'days', 4),
    'consulting', jsonb_build_object('sessions', 5, 'times_per_session', 3, 'hours_per_day', 8, 'days', 3),
    'late_penalty_pct', 5
  ),
  true,
  'ผู้แทนผู้ถ่ายทอด: ผศ.วรจักร์ เมืองใจ · สิทธิเฉพาะแต่ผู้เดียว · ผลิต/จำหน่ายในไทย และส่งออกได้'
WHERE NOT EXISTS (
  SELECT 1 FROM cesru_innovations WHERE ip_number = '2001008879'
);

-- Verify
SELECT title_th, ip_number, status, license_fee_thb FROM cesru_innovations ORDER BY created_at DESC;
