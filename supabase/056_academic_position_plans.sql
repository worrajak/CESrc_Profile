-- 056_academic_position_plans.sql
-- ════════════════════════════════════════════════════════════════════
-- Academic position plan tracker — Phase A.
--
-- Each CESRU researcher can own ONE academic_position_plan describing
-- their progression toward the next academic title (ผศ./รศ./ศ.) per the
-- Thai ก.พ.อ. promotion criteria. The plan carries:
--
--   • plan-level info (current/target title, eligibility window, status,
--     self-set submission target, reviewer, approval threshold)
--   • a checklist of supporting documents (12 categories)
--   • a research-pipeline list (Phase B — schema only here)
--   • per-plan reminders + audit log + credits scoring
--
-- Author roles per publication (FA/CA/Co-author/Last) re-use the existing
-- publication_authors table — no new schema needed for that.
--
-- RLS: each researcher edits their OWN plan only; reviewer + admin
-- (researchers.is_admin = true) can read all plans.
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- ENUMs
-- ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE academic_position_target AS ENUM (
    'asst_prof',     -- ผศ.
    'assoc_prof',    -- รศ.
    'prof'           -- ศ.
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE academic_position_status AS ENUM (
    'draft',         -- ร่าง
    'preparing',     -- กำลังเตรียม
    'submitted',     -- ยื่นแล้ว
    'approved',      -- ได้รับ
    'rejected'       -- ตก
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE academic_position_doc_type AS ENUM (
    'kpo_03',                -- ก.พ.อ. 03
    'kpo_04',                -- ก.พ.อ. 04
    'teaching_supplement',   -- เอกสารประกอบคำสอน
    'lecture_notes',         -- เอกสารคำสอน
    'textbook',              -- ตำรา
    'book',                  -- หนังสือ
    'research',              -- งานวิจัย (Phase B จะ link จาก publications)
    'course_outline',        -- แผนการเรียนการสอน
    'speaker_invitation',    -- หนังสือคำเชิญเป็นวิทยากร
    'conference_cert',       -- หนังสือรับรองประชุมวิชาการ
    'teaching_eval',         -- ผลประเมินการสอน (ฝ่ายนักศึกษา)
    'workload_other',        -- ภาระงานนอกการสอน
    'other'                  -- อื่น ๆ
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE academic_position_doc_source AS ENUM (
    'uploaded',              -- ไฟล์อัปโหลดที่ Supabase Storage
    'external_link',         -- Drive/OneDrive URL
    'linked_publication'     -- ลิงก์ไปยัง publications.id (Phase B)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE academic_position_reminder_type AS ENUM (
    'eligibility_warning',   -- ใกล้ครบกำหนดยื่น
    'deadline_approaching',  -- ใกล้ deadline ที่ตัวเองตั้งไว้
    'self_check',            -- self-check รายเดือน
    'reviewer_comment'       -- reviewer ฝากข้อความ
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE academic_position_pub_status AS ENUM (
    'drafting',
    'submitted',
    'in_review',
    'accepted',
    'published'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────────────────────────
-- 1) academic_position_plans — one per researcher
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID NOT NULL UNIQUE REFERENCES researchers(id) ON DELETE CASCADE,

  -- Current position
  current_position_th TEXT,           -- "ผศ." | "รศ." | "อาจารย์"
  current_position_en TEXT,           -- "Asst.Prof." | "Assoc.Prof." | "Lecturer"
  current_position_date DATE,         -- วันที่ได้รับตำแหน่งปัจจุบัน

  -- Target
  target_position academic_position_target NOT NULL DEFAULT 'asst_prof',
  eligibility_window_start DATE,      -- วันยื่นได้ตั้งแต่
  eligibility_window_end DATE,        -- วันสิ้นสุดที่ยื่นได้
  target_submission_date DATE,        -- เป้าตัวเอง — ตั้งใจยื่นเมื่อไหร่

  -- Status
  status academic_position_status NOT NULL DEFAULT 'draft',
  completion_pct INTEGER NOT NULL DEFAULT 0
    CHECK (completion_pct BETWEEN 0 AND 100),
  approval_threshold INTEGER NOT NULL DEFAULT 80
    CHECK (approval_threshold BETWEEN 0 AND 100),

  -- Reviewer
  reviewer_id UUID REFERENCES researchers(id) ON DELETE SET NULL,
  reviewer_notes TEXT,                -- บันทึกจาก reviewer (researcher เห็น read-only)

  -- Self notes
  notes TEXT,                         -- บันทึกของตัวเอง

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apos_plans_researcher ON academic_position_plans(researcher_id);
CREATE INDEX IF NOT EXISTS idx_apos_plans_status ON academic_position_plans(status);
CREATE INDEX IF NOT EXISTS idx_apos_plans_eligibility ON academic_position_plans(eligibility_window_end);


-- ─────────────────────────────────────────────────────────────────
-- 2) academic_position_documents — checklist items
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES academic_position_plans(id) ON DELETE CASCADE,

  doc_type academic_position_doc_type NOT NULL,
  title TEXT,                          -- override title (default = doc_type label)

  -- File location — exactly one of these is populated based on source_kind
  source_kind academic_position_doc_source NOT NULL DEFAULT 'uploaded',
  storage_path TEXT,                   -- supabase storage path (academic-position-docs/<r>/<p>/<file>)
  external_url TEXT,                   -- Drive / OneDrive / web link
  linked_publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,

  -- State
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  ready_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apos_docs_plan ON academic_position_documents(plan_id);
CREATE INDEX IF NOT EXISTS idx_apos_docs_type ON academic_position_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_apos_docs_ready ON academic_position_documents(plan_id, is_ready);


-- ─────────────────────────────────────────────────────────────────
-- 3) academic_position_research_pipeline — Phase B placeholder
--    Schema is here now so RLS / FKs are wired; UI lands in Phase B.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_research_pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES academic_position_plans(id) ON DELETE CASCADE,

  -- Either link to an existing publication...
  publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
  -- ...or capture external metadata for an in-pipeline paper
  external_title TEXT,
  external_journal TEXT,
  external_year INT,
  external_doi TEXT,

  pub_status academic_position_pub_status NOT NULL DEFAULT 'drafting',
  target_journal TEXT,              -- ที่ตั้งใจส่ง
  target_quartile TEXT CHECK (target_quartile IN ('Q1','Q2','Q3','Q4') OR target_quartile IS NULL),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (publication_id IS NOT NULL OR external_title IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_apos_pipeline_plan ON academic_position_research_pipeline(plan_id);


-- ─────────────────────────────────────────────────────────────────
-- 4) academic_position_reminders — alerts banner feed
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES academic_position_plans(id) ON DELETE CASCADE,

  remind_at TIMESTAMPTZ NOT NULL,
  type academic_position_reminder_type NOT NULL,
  message TEXT NOT NULL,

  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apos_reminders_plan ON academic_position_reminders(plan_id);
CREATE INDEX IF NOT EXISTS idx_apos_reminders_active
  ON academic_position_reminders(plan_id, is_dismissed) WHERE is_dismissed = FALSE;


-- ─────────────────────────────────────────────────────────────────
-- 5) academic_position_audit_log — track who changed what
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES academic_position_plans(id) ON DELETE CASCADE,
  changed_by UUID,                  -- auth.users.id; nullable for system-triggered changes
  changed_at TIMESTAMPTZ DEFAULT NOW(),

  action TEXT NOT NULL,             -- 'insert' | 'update' | 'delete'
  table_name TEXT NOT NULL,         -- which sub-table (plans, documents, pipeline)
  field_name TEXT,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_apos_audit_plan ON academic_position_audit_log(plan_id, changed_at DESC);


-- ─────────────────────────────────────────────────────────────────
-- 6) academic_position_credits — scoring categories
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_position_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES academic_position_plans(id) ON DELETE CASCADE,

  category TEXT NOT NULL,           -- 'teaching' | 'research' | 'service' | 'other'
  subcategory TEXT,                 -- e.g. 'teaching_hours_per_week', 'papers_q1', 'workshops_held'
  label TEXT,
  value NUMERIC,
  unit TEXT,                        -- 'hours', 'papers', 'baht', 'events'

  evidence_doc_id UUID REFERENCES academic_position_documents(id) ON DELETE SET NULL,
  notes TEXT,

  as_of_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apos_credits_plan ON academic_position_credits(plan_id, category);


-- ─────────────────────────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────────────────────────

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION apos_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_apos_plans_touch ON academic_position_plans;
CREATE TRIGGER trg_apos_plans_touch BEFORE UPDATE ON academic_position_plans
  FOR EACH ROW EXECUTE FUNCTION apos_touch_updated_at();

DROP TRIGGER IF EXISTS trg_apos_docs_touch ON academic_position_documents;
CREATE TRIGGER trg_apos_docs_touch BEFORE UPDATE ON academic_position_documents
  FOR EACH ROW EXECUTE FUNCTION apos_touch_updated_at();

DROP TRIGGER IF EXISTS trg_apos_pipeline_touch ON academic_position_research_pipeline;
CREATE TRIGGER trg_apos_pipeline_touch BEFORE UPDATE ON academic_position_research_pipeline
  FOR EACH ROW EXECUTE FUNCTION apos_touch_updated_at();

DROP TRIGGER IF EXISTS trg_apos_credits_touch ON academic_position_credits;
CREATE TRIGGER trg_apos_credits_touch BEFORE UPDATE ON academic_position_credits
  FOR EACH ROW EXECUTE FUNCTION apos_touch_updated_at();

-- Auto-recompute completion_pct whenever documents change
-- completion_pct = COUNT(is_ready = TRUE) / 12 * 100
CREATE OR REPLACE FUNCTION apos_recompute_completion()
RETURNS TRIGGER AS $$
DECLARE
  target_plan_id UUID;
  ready_count INT;
BEGIN
  target_plan_id := COALESCE(NEW.plan_id, OLD.plan_id);
  SELECT COUNT(*) INTO ready_count
  FROM academic_position_documents
  WHERE plan_id = target_plan_id AND is_ready = TRUE;

  -- 12 = number of doc_type slots in the standardised checklist
  UPDATE academic_position_plans
  SET completion_pct = LEAST(100, GREATEST(0, (ready_count * 100 / 12)))
  WHERE id = target_plan_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_apos_docs_completion ON academic_position_documents;
CREATE TRIGGER trg_apos_docs_completion
  AFTER INSERT OR UPDATE OR DELETE ON academic_position_documents
  FOR EACH ROW EXECUTE FUNCTION apos_recompute_completion();


-- ─────────────────────────────────────────────────────────────────
-- Helper view: team overview sorted by readiness
-- ─────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS cesru_career_team_overview;
CREATE VIEW cesru_career_team_overview AS
SELECT
  r.id              AS researcher_id,
  r.title_th,
  r.first_name_th,
  r.last_name_th,
  r.unit_role,
  r.avatar_url,
  r.executive_role_th,
  p.id              AS plan_id,
  p.target_position,
  p.current_position_th,
  p.current_position_date,
  p.eligibility_window_end,
  p.target_submission_date,
  p.status,
  COALESCE(p.completion_pct, 0) AS completion_pct,
  p.approval_threshold,
  -- Days until eligibility window closes (negative = past)
  CASE
    WHEN p.eligibility_window_end IS NULL THEN NULL
    ELSE (p.eligibility_window_end - CURRENT_DATE)::int
  END AS days_until_deadline,
  -- Sort key: 1 = critical (≤90d to close), 2 = active plan, 3 = no plan
  CASE
    WHEN p.id IS NULL THEN 3
    WHEN p.eligibility_window_end IS NOT NULL
         AND (p.eligibility_window_end - CURRENT_DATE) <= 90
         AND (p.eligibility_window_end - CURRENT_DATE) >= 0 THEN 1
    ELSE 2
  END AS sort_bucket
FROM researchers r
LEFT JOIN academic_position_plans p ON p.researcher_id = r.id
WHERE r.is_active = TRUE;

GRANT SELECT ON cesru_career_team_overview TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE academic_position_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_position_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_position_research_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_position_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_position_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_position_credits ENABLE ROW LEVEL SECURITY;

-- Helper: which researcher.id does this JWT belong to?
-- (joined by email; admin = researchers.is_admin = TRUE)
CREATE OR REPLACE FUNCTION apos_current_researcher_id()
RETURNS UUID AS $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM researchers
   WHERE LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
   LIMIT 1;
  RETURN rid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION apos_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT COALESCE(r.is_admin, FALSE) INTO is_admin FROM researchers r
   WHERE LOWER(r.email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
   LIMIT 1;
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;

-- Plans: anyone in CESRU (researchers row exists for this email) can read;
-- only the owner OR admin can update.
DROP POLICY IF EXISTS apos_plans_read ON academic_position_plans;
CREATE POLICY apos_plans_read ON academic_position_plans
  FOR SELECT
  USING (TRUE);  -- read open to public for the team overview

DROP POLICY IF EXISTS apos_plans_insert ON academic_position_plans;
CREATE POLICY apos_plans_insert ON academic_position_plans
  FOR INSERT
  WITH CHECK (
    researcher_id = apos_current_researcher_id()
    OR apos_is_admin()
  );

DROP POLICY IF EXISTS apos_plans_update ON academic_position_plans;
CREATE POLICY apos_plans_update ON academic_position_plans
  FOR UPDATE
  USING (
    researcher_id = apos_current_researcher_id()
    OR apos_is_admin()
  );

DROP POLICY IF EXISTS apos_plans_delete ON academic_position_plans;
CREATE POLICY apos_plans_delete ON academic_position_plans
  FOR DELETE
  USING (apos_is_admin());

-- Documents / pipeline / reminders / credits: owner OR admin can do anything;
-- read is open for the team overview.
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'academic_position_documents',
    'academic_position_research_pipeline',
    'academic_position_reminders',
    'academic_position_credits'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS apos_sub_read ON %I', t);
    EXECUTE format(
      'CREATE POLICY apos_sub_read ON %I FOR SELECT USING (TRUE)', t
    );
    EXECUTE format('DROP POLICY IF EXISTS apos_sub_write ON %I', t);
    EXECUTE format($f$
      CREATE POLICY apos_sub_write ON %I FOR ALL
        USING (
          plan_id IN (
            SELECT id FROM academic_position_plans
            WHERE researcher_id = apos_current_researcher_id()
          )
          OR apos_is_admin()
        )
        WITH CHECK (
          plan_id IN (
            SELECT id FROM academic_position_plans
            WHERE researcher_id = apos_current_researcher_id()
          )
          OR apos_is_admin()
        )
    $f$, t);
  END LOOP;
END $$;

-- Audit log: read open, insert via trigger / service role only
DROP POLICY IF EXISTS apos_audit_read ON academic_position_audit_log;
CREATE POLICY apos_audit_read ON academic_position_audit_log FOR SELECT USING (TRUE);
-- (no INSERT/UPDATE/DELETE policy → writes via service role only)


-- ─────────────────────────────────────────────────────────────────
-- Smoke tests
-- ─────────────────────────────────────────────────────────────────
-- SELECT * FROM cesru_career_team_overview ORDER BY sort_bucket, completion_pct DESC LIMIT 5;
-- INSERT INTO academic_position_plans (researcher_id, target_position) VALUES ('<r-uuid>', 'assoc_prof');
