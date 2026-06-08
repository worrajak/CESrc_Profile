-- 058_grant_workplan.sql
-- ════════════════════════════════════════════════════════════════════
-- Phase X1 — generic project-management schema for any grant.
-- Designed to absorb the structure of a "แผนดำเนินงาน" Excel workbook
-- (DaaS Wildfire was the reference model) with 11 sheets:
--   01 Team RACI  · 02 WP Calendar  · 03 Workplan Daily
--   04 Procurement · 05 Contracts   · 06 CashBook Monthly
--   07 Budget     · 08 Disbursement · 09 Tax · 10 Risk Register
--
-- All tables key off grants.id so the same schema works for every
-- grant in the system. Tax compliance is intentionally deferred to
-- Phase X2 — small enough to add later without breaking anything.
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- ENUMs
-- ─────────────────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE raci_role AS ENUM ('R','A','C','I','RA','AR','RC','RI'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE workplan_load AS ENUM ('low','medium','high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE procurement_status AS ENUM ('planning','tor_drafting','rfq_sent','quotes_received','awarded','po_issued','delivered','accepted','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE contract_status AS ENUM ('draft','sent','negotiating','signed','active','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE risk_status AS ENUM ('open','mitigating','accepted','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE disbursement_kind AS ENUM ('advance','reimbursement','final','in_cash','in_kind'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────
-- 1) Work Packages
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_workplan_wp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  wp_code TEXT NOT NULL,            -- WP1, WP2, ...
  title TEXT NOT NULL,
  description TEXT,
  primary_owner_code TEXT,          -- PI, CoI1, R3 ...
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, wp_code)
);
CREATE INDEX IF NOT EXISTS idx_grant_wp_grant ON grant_workplan_wp(grant_id);

-- 1b) WP × Month load (Gantt grid)
CREATE TABLE IF NOT EXISTS grant_workplan_wp_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  wp_id UUID NOT NULL REFERENCES grant_workplan_wp(id) ON DELETE CASCADE,
  month_no INT NOT NULL CHECK (month_no BETWEEN 1 AND 24),   -- M1, M2, ...
  load workplan_load,                -- ▪=low ▪▪=medium ▪▪▪=high
  notes TEXT,
  UNIQUE (wp_id, month_no)
);
CREATE INDEX IF NOT EXISTS idx_grant_wp_cal_grant_month ON grant_workplan_wp_calendar(grant_id, month_no);

-- ─────────────────────────────────────────────────────────────────
-- 2) Milestones per grant (per month)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_workplan_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  month_no INT NOT NULL CHECK (month_no BETWEEN 1 AND 24),
  title TEXT NOT NULL,               -- "Kick-off", "PCB Rev1", ...
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grant_ms_grant ON grant_workplan_milestones(grant_id, month_no);

-- ─────────────────────────────────────────────────────────────────
-- 3) Daily workplan (365 entries)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_workplan_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  weekday TEXT,                      -- "จ.", "อ.", ...
  week_no TEXT,                      -- "W01" ...
  month_no INT,
  period_no INT,                     -- งวด 1/2/3
  phase TEXT,
  activity TEXT NOT NULL,
  owner_codes TEXT,                  -- "PI + Owners" — free text for now
  expected_output TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  actual_output TEXT,
  blocker TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_grant_daily_grant_date ON grant_workplan_daily(grant_id, entry_date);

-- ─────────────────────────────────────────────────────────────────
-- 4) Team — roster + RACI matrix
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  member_code TEXT NOT NULL,         -- "PI", "CoI1", "R3", ...
  full_name TEXT NOT NULL,
  affiliation TEXT,
  expertise TEXT,
  fte NUMERIC(4,3),                  -- 0.5714
  position_label TEXT,               -- "หัวหน้าโครงการ"
  phone TEXT,
  notes TEXT,
  researcher_id UUID REFERENCES researchers(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, member_code)
);
CREATE INDEX IF NOT EXISTS idx_grant_team_grant ON grant_team_members(grant_id);

CREATE TABLE IF NOT EXISTS grant_team_raci (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  activity_no INT NOT NULL,
  activity_title TEXT NOT NULL,
  wp_codes TEXT,                     -- "WP1+3+4" — free-form for now
  -- Per-member role: stored as JSON to keep schema simple
  -- shape: { "PI": "AR", "CoI1": "R", "R3": "C", "RA": "C" }
  roles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, activity_no)
);
CREATE INDEX IF NOT EXISTS idx_grant_raci_grant ON grant_team_raci(grant_id, activity_no);

-- ─────────────────────────────────────────────────────────────────
-- 5) Procurement plan
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  item_no INT,
  item_name TEXT NOT NULL,
  category TEXT,                     -- "3.1 ฮาร์ดแวร์"
  purchase_kind TEXT,                -- "จัดซื้อ" / "จัดจ้าง"
  budget_thb NUMERIC(14,2),
  funding_source TEXT,               -- "บพข." / "In-Cash" / "In-Kind"
  planned_month_range TEXT,          -- "M1-M2"
  needs_tor BOOLEAN DEFAULT FALSE,
  quote_requirement TEXT,            -- "ขอ 3 ราย"
  status procurement_status NOT NULL DEFAULT 'planning',
  vendor TEXT,
  po_no TEXT,
  delivered_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grant_proc_grant ON grant_procurement(grant_id, item_no);

-- ─────────────────────────────────────────────────────────────────
-- 6) Contracts
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  item_no INT,
  contract_name TEXT NOT NULL,
  contract_type TEXT,                -- "สัญญาหลัก" / "MOU" / "สัญญา IP"
  parties TEXT,                      -- "บพข. ↔ sjtw"
  amount_thb NUMERIC(14,2),
  duration TEXT,                     -- "12 เดือน"
  responsible TEXT,                  -- "PI"
  planned_sign_month TEXT,           -- "M1"
  status contract_status NOT NULL DEFAULT 'draft',
  signed_at DATE,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grant_contracts_grant ON grant_contracts(grant_id, item_no);

-- ─────────────────────────────────────────────────────────────────
-- 7) Cashbook (monthly)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_cashbook_monthly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  month_no INT NOT NULL CHECK (month_no BETWEEN 1 AND 24),
  month_label TEXT,                  -- "M1 · มิ.ย. 69"
  -- Inflows
  inflow_agency_thb NUMERIC(14,2) DEFAULT 0,    -- จาก บพข./funder
  inflow_in_cash_thb NUMERIC(14,2) DEFAULT 0,
  -- Outflows by category (5 standard ก.พ.อ./บพข. categories)
  out_compensation_thb NUMERIC(14,2) DEFAULT 0, -- 1. ค่าตอบแทน
  out_labor_thb NUMERIC(14,2) DEFAULT 0,        -- 2. ค่าจ้าง
  out_materials_thb NUMERIC(14,2) DEFAULT 0,    -- 3. ค่าวัสดุ
  out_prototype_thb NUMERIC(14,2) DEFAULT 0,    -- 4. ค่าจัดทำต้นแบบ
  out_misc_thb NUMERIC(14,2) DEFAULT 0,         -- 5. ค่าใช้สอย
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, month_no)
);

-- ─────────────────────────────────────────────────────────────────
-- 8) Budget vs Actual (by category)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_budget (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  category_no INT,                   -- 1..5+
  category_name TEXT NOT NULL,       -- "1. ค่าตอบแทนคณะผู้วิจัย"
  budget_agency_thb NUMERIC(14,2) DEFAULT 0,
  budget_in_cash_thb NUMERIC(14,2) DEFAULT 0,
  budget_in_kind_thb NUMERIC(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grant_id, category_no)
);

-- ─────────────────────────────────────────────────────────────────
-- 9) Disbursement plan (per งวด installment)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_disbursement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  period_no INT NOT NULL,            -- งวด 1, 2, 3
  month_range TEXT,                  -- "M1" / "M2-M3" / "M4"
  description TEXT,                  -- "Advance 50% เมื่อลงนามสัญญา"
  amount_agency_thb NUMERIC(14,2) DEFAULT 0,
  amount_in_cash_thb NUMERIC(14,2) DEFAULT 0,
  amount_in_kind_thb NUMERIC(14,2) DEFAULT 0,
  conditions TEXT,
  responsible TEXT,
  disbursed_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grant_disb_grant ON grant_disbursement(grant_id, period_no);

-- ─────────────────────────────────────────────────────────────────
-- 10) Risk register
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  item_no INT,
  risk_title TEXT NOT NULL,
  category TEXT,                     -- "Procurement" / "Technical" / ...
  probability risk_level,
  impact risk_level,
  level risk_level,                  -- combined heat-map level
  mitigation TEXT,
  responsible TEXT,
  status risk_status NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grant_risks_grant ON grant_risks(grant_id, level);

-- ─────────────────────────────────────────────────────────────────
-- updated_at touch trigger (shared)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION grant_workplan_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'grant_workplan_wp','grant_workplan_milestones','grant_workplan_daily',
    'grant_team_members','grant_procurement','grant_contracts',
    'grant_cashbook_monthly','grant_budget','grant_disbursement','grant_risks'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_touch ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_touch BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION grant_workplan_touch_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- RLS — open SELECT to authenticated; admin-only writes (service role
-- bypasses RLS for the import endpoint). We can tighten by-grant later.
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'grant_workplan_wp','grant_workplan_wp_calendar','grant_workplan_milestones',
    'grant_workplan_daily','grant_team_members','grant_team_raci',
    'grant_procurement','grant_contracts','grant_cashbook_monthly',
    'grant_budget','grant_disbursement','grant_risks'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS grant_wp_read ON %I', t);
    EXECUTE format('CREATE POLICY grant_wp_read ON %I FOR SELECT USING (TRUE)', t);
    EXECUTE format('DROP POLICY IF EXISTS grant_wp_write_admin ON %I', t);
    EXECUTE format(
      'CREATE POLICY grant_wp_write_admin ON %I FOR ALL USING (apos_is_admin()) WITH CHECK (apos_is_admin())',
      t
    );
  END LOOP;
END $$;
