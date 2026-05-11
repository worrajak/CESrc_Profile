-- ============================================================
-- 046: Research Plan — Proposals, Team, Journal targets, Career goals
-- Phase 2-5 schemas (Phase 1 already created grant_calls)
-- ============================================================

-- ============================================================
-- Phase 2: proposals — concept/full proposal drafts
-- ============================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_call_id UUID NOT NULL REFERENCES grant_calls(id) ON DELETE CASCADE,

  -- Identity
  title_th TEXT NOT NULL,
  title_en TEXT,
  tier_code TEXT,                          -- e.g. 'FF71-T1' (ทุนนักวิจัยใหม่), 'FF71-T2', etc.

  -- Content
  abstract_th TEXT,
  abstract_en TEXT,
  problem_statement TEXT,                  -- ที่มาและความสำคัญ
  research_questions TEXT[],
  objectives TEXT[],
  methodology TEXT,
  expected_outputs TEXT[],                 -- ผลผลิตที่คาดว่าจะได้
  expected_outcomes TEXT[],                -- ผลลัพธ์/impact
  keywords TEXT[],

  -- Budget
  budget_requested NUMERIC(14,2),          -- ยอดที่จะขอ
  budget_breakdown JSONB,                  -- {"personnel": 50000, "materials": 30000, "apc": 50000, ...}
  duration_months INT,

  -- Team
  pi_id UUID,                              -- researchers.id (PI)
  total_fte_pct NUMERIC(5,2),              -- รวม FTE ของทีม

  -- AI metadata
  ai_match_score INT,                      -- 0-100 ตาม AI ประเมินว่าตรง grant แค่ไหน
  ai_match_rationale TEXT,                 -- AI อธิบายว่าทำไม match
  ai_drafted BOOLEAN DEFAULT false,
  ai_provider TEXT,
  ai_model TEXT,
  ai_generated_data JSONB,                 -- raw AI output for debugging

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','awarded','rejected','withdrawn')),
  submission_date DATE,                    -- วันที่ส่งจริง

  -- Metadata
  created_by UUID,                         -- auth.users.id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_grant_call ON proposals(grant_call_id);
CREATE INDEX IF NOT EXISTS idx_proposals_pi ON proposals(pi_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

CREATE OR REPLACE FUNCTION update_proposals_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proposals_updated_at ON proposals;
CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_proposals_timestamp();

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "proposals_public_read" ON proposals;
CREATE POLICY "proposals_public_read" ON proposals FOR SELECT USING (true);
DROP POLICY IF EXISTS "proposals_auth_write" ON proposals;
CREATE POLICY "proposals_auth_write" ON proposals FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Phase 3: proposal_team — PI + co-PIs + FTE allocation
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  researcher_id UUID,                      -- researchers.id (nullable for external)
  external_name TEXT,                      -- ถ้าเป็นคนนอกระบบ
  external_affiliation TEXT,
  role TEXT NOT NULL CHECK (role IN ('pi','co_pi','researcher','advisor','consultant','external_collaborator')),
  fte_pct NUMERIC(5,2),                    -- % ของเวลาทำงาน
  compensation_pct NUMERIC(5,2),           -- % ของค่าตอบแทน (รวม PI + co-PIs ควรเป็น 100)
  responsibilities TEXT,                   -- หน้าที่ในโครงการ
  ai_suggested BOOLEAN DEFAULT false,      -- AI แนะนำมา
  ai_rationale TEXT,                       -- AI อธิบายว่าทำไมเลือกคนนี้

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_team_proposal ON proposal_team(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_team_researcher ON proposal_team(researcher_id);

ALTER TABLE proposal_team ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "proposal_team_public_read" ON proposal_team;
CREATE POLICY "proposal_team_public_read" ON proposal_team FOR SELECT USING (true);
DROP POLICY IF EXISTS "proposal_team_auth_write" ON proposal_team;
CREATE POLICY "proposal_team_auth_write" ON proposal_team FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Phase 4: proposal_journal_targets — Journal/OA strategy + APC feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_journal_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  -- Target identity
  journal_name TEXT NOT NULL,
  publisher TEXT,
  issn TEXT,
  homepage_url TEXT,

  -- Index/tier
  scopus_indexed BOOLEAN DEFAULT false,
  wos_indexed BOOLEAN DEFAULT false,
  tci_tier INT,                            -- 1 or 2 (Thai-Journal Citation Index)
  quartile TEXT CHECK (quartile IN ('Q1','Q2','Q3','Q4','-')),
  impact_factor NUMERIC(5,3),

  -- Open Access & APC
  is_open_access BOOLEAN DEFAULT false,
  oa_model TEXT,                           -- 'gold' | 'hybrid' | 'green' | 'diamond' | NULL
  apc_amount_usd NUMERIC(8,2),             -- APC in USD
  apc_amount_thb NUMERIC(10,2),            -- APC in THB (current rate)
  fee_waiver BOOLEAN DEFAULT false,        -- มีส่วนลดสำหรับ developing countries

  -- AI rationale
  ai_suggested BOOLEAN DEFAULT false,
  ai_rationale TEXT,                       -- ทำไมเลือก / Research gap ที่ AI เจอ
  research_gap TEXT,                       -- AI อธิบาย gap ของ field นี้
  scope_match_score INT,                   -- 0-100

  -- Status
  priority INT DEFAULT 1,                  -- 1 = first choice
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','submitted','under_review','accepted','rejected','published')),
  submission_date DATE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_targets_proposal ON proposal_journal_targets(proposal_id);

ALTER TABLE proposal_journal_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journal_targets_public_read" ON proposal_journal_targets;
CREATE POLICY "journal_targets_public_read" ON proposal_journal_targets FOR SELECT USING (true);
DROP POLICY IF EXISTS "journal_targets_auth_write" ON proposal_journal_targets;
CREATE POLICY "journal_targets_auth_write" ON proposal_journal_targets FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Phase 5a: promotion_criteria — เกณฑ์ ก.พ.อ. ผศ./รศ./ศ. (cached, refreshed by AI)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_code TEXT NOT NULL CHECK (position_code IN ('asst_prof','assoc_prof','full_prof')),
  position_name_th TEXT NOT NULL,          -- "ผู้ช่วยศาสตราจารย์"
  position_name_en TEXT,                   -- "Assistant Professor"
  source TEXT,                             -- "ก.พ.อ.", "มทร.ล้านนา", etc.
  source_url TEXT,
  source_doc_date DATE,                    -- วันที่ของประกาศต้นทาง

  -- Criteria structured as JSON for flexibility
  criteria JSONB,                          -- {"category_1": {...}, "category_2": {...}, ...}
  /*
    Example:
    {
      "วิธีปกติ": {
        "ผลงานวิจัย": "อย่างน้อย 1 เรื่อง ตีพิมพ์ในวารสารระดับชาติหรือนานาชาติ",
        "ผลงานวิชาการอื่น": "อย่างน้อย 1 ชิ้น (เอกสาร/หนังสือ/บทเรียน/...)",
        "ภาระงานสอน": "เคยสอนระดับอุดมศึกษามาแล้วไม่น้อยกว่า 1 ภาคการศึกษา"
      },
      "วิธีพิเศษ": {...}
    }
  */
  notes TEXT,

  -- AI metadata
  ai_extracted BOOLEAN DEFAULT false,
  ai_provider TEXT,
  ingested_at TIMESTAMPTZ,

  is_current BOOLEAN DEFAULT true,         -- false = obsolete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_code, source, is_current) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_promotion_criteria_position ON promotion_criteria(position_code, is_current);

ALTER TABLE promotion_criteria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_criteria_public_read" ON promotion_criteria;
CREATE POLICY "promo_criteria_public_read" ON promotion_criteria FOR SELECT USING (true);
DROP POLICY IF EXISTS "promo_criteria_auth_write" ON promotion_criteria;
CREATE POLICY "promo_criteria_auth_write" ON promotion_criteria FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Phase 5b: career_goals — researcher's promotion target + progress
-- ============================================================
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL,             -- researchers.id
  target_position TEXT NOT NULL CHECK (target_position IN ('asst_prof','assoc_prof','full_prof')),
  target_date DATE,                        -- ตั้งเป้าวันยื่น
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','submitted','awarded','paused')),

  -- Snapshot of criteria used (to allow tracking even if criteria changes)
  criteria_snapshot JSONB,
  criteria_source_id UUID REFERENCES promotion_criteria(id),

  -- Current progress (computed periodically)
  current_progress JSONB,
  /*
    {
      "publications_scopus_q1q2": {"current": 5, "required": 8, "pct": 62.5},
      "h_index": {"current": 7, "required": 10},
      "teaching_semesters": {"current": 12, "required": 2},
      ...
    }
  */
  last_snapshot_at TIMESTAMPTZ,

  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(researcher_id, target_position)
);

CREATE INDEX IF NOT EXISTS idx_career_goals_researcher ON career_goals(researcher_id);

ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "career_goals_public_read" ON career_goals;
CREATE POLICY "career_goals_public_read" ON career_goals FOR SELECT USING (true);
DROP POLICY IF EXISTS "career_goals_auth_write" ON career_goals;
CREATE POLICY "career_goals_auth_write" ON career_goals FOR ALL USING (auth.role() = 'authenticated');

-- Verify
SELECT 'proposals' AS tbl, COUNT(*) FROM proposals
UNION ALL SELECT 'proposal_team', COUNT(*) FROM proposal_team
UNION ALL SELECT 'proposal_journal_targets', COUNT(*) FROM proposal_journal_targets
UNION ALL SELECT 'promotion_criteria', COUNT(*) FROM promotion_criteria
UNION ALL SELECT 'career_goals', COUNT(*) FROM career_goals;
