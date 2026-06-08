-- 059_progress_reports.sql
-- ════════════════════════════════════════════════════════════════════
-- Phase X2 — unified progress tracking + reason audit log for every
-- step in a grant workplan.
--
-- Adds progress_status (enum) + progress_note (last reason) to:
--   grant_workplan_daily, grant_workplan_milestones,
--   grant_workplan_wp_calendar, grant_disbursement
-- (procurement/contracts/risks already had status enums — extended
--  here with progress_note when missing).
--
-- New table grant_progress_reports keeps the FULL audit trail of
-- every status change with timestamp, reporter, reason, and optional
-- evidence URL. UI surfaces the latest report on each row + an
-- accordion of history.
--
-- RLS: anyone listed in grant_team_members for the grant — OR admin —
-- can insert a report. Reads are open so the team can see each other's
-- updates.
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE progress_status AS ENUM (
    'not_started',    -- ยังไม่เริ่ม (default)
    'on_plan',        -- 🟢 ตามแผน
    'slight_delay',   -- 🟡 ล่าช้าเล็กน้อย
    'off_plan',       -- 🔴 ไม่ตามแผน
    'blocked',        -- 🟣 บล็อค
    'done',           -- ✅ เสร็จแล้ว
    'cancelled'       -- ⚫ ยกเลิก
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────
-- Add status columns to existing workplan tables
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE grant_workplan_daily
  ADD COLUMN IF NOT EXISTS progress_status progress_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

ALTER TABLE grant_workplan_milestones
  ADD COLUMN IF NOT EXISTS progress_status progress_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

ALTER TABLE grant_workplan_wp_calendar
  ADD COLUMN IF NOT EXISTS progress_status progress_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

ALTER TABLE grant_disbursement
  ADD COLUMN IF NOT EXISTS progress_status progress_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

-- procurement/contracts/risks already have their own status enums.
-- We just add a free-text note so reports can carry reason context.
ALTER TABLE grant_procurement
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

ALTER TABLE grant_contracts
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;

ALTER TABLE grant_risks
  ADD COLUMN IF NOT EXISTS progress_note TEXT,
  ADD COLUMN IF NOT EXISTS progress_reported_at TIMESTAMPTZ;


-- ─────────────────────────────────────────────────────────────────
-- History table — one row per status change / report
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_progress_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,

  -- Polymorphic pointer to the entity being reported on. We don't
  -- enforce a FK because entity_id can refer to several tables.
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'daily','milestone','wp_month','procurement','contract','disbursement','risk'
  )),
  entity_id UUID NOT NULL,

  status_from progress_status,            -- nullable if first report
  status_to progress_status NOT NULL,
  reason_th TEXT,                          -- required only for off-plan-ish
  evidence_url TEXT,

  reported_by UUID,                        -- auth.users.id
  reporter_label TEXT,                     -- snapshot: e.g. "ผศ.ดร.วรจักร์ (CoI2)"
  reported_at TIMESTAMPTZ DEFAULT NOW(),

  -- A reason MUST be present when reporting a not-ok status.
  CONSTRAINT progress_reason_required
    CHECK (
      status_to IN ('not_started','on_plan','done','cancelled')
      OR (reason_th IS NOT NULL AND length(trim(reason_th)) > 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_progress_reports_grant
  ON grant_progress_reports(grant_id, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_reports_entity
  ON grant_progress_reports(entity_type, entity_id, reported_at DESC);


-- ─────────────────────────────────────────────────────────────────
-- Helper — is the current user a member of this grant team?
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION grant_is_team_member(target_grant UUID)
RETURNS BOOLEAN AS $$
DECLARE
  me UUID;
BEGIN
  me := apos_current_researcher_id();
  IF me IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM grant_team_members
    WHERE grant_id = target_grant AND researcher_id = me
  );
END;
$$ LANGUAGE plpgsql STABLE;


-- ─────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE grant_progress_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS grant_pr_read ON grant_progress_reports;
CREATE POLICY grant_pr_read ON grant_progress_reports FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS grant_pr_write_team ON grant_progress_reports;
CREATE POLICY grant_pr_write_team ON grant_progress_reports
  FOR INSERT
  WITH CHECK (
    apos_is_admin()
    OR grant_is_team_member(grant_id)
  );


-- ─────────────────────────────────────────────────────────────────
-- Trigger: when a report is inserted, sync the current state onto
-- the parent entity (status + note + timestamp).
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION grant_pr_sync_entity()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.entity_type
    WHEN 'daily' THEN
      UPDATE grant_workplan_daily
      SET progress_status = NEW.status_to,
          progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at
      WHERE id = NEW.entity_id;
    WHEN 'milestone' THEN
      UPDATE grant_workplan_milestones
      SET progress_status = NEW.status_to,
          progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at,
          is_completed = (NEW.status_to = 'done'),
          completed_at = CASE WHEN NEW.status_to = 'done' THEN NEW.reported_at ELSE completed_at END
      WHERE id = NEW.entity_id;
    WHEN 'wp_month' THEN
      UPDATE grant_workplan_wp_calendar
      SET progress_status = NEW.status_to,
          progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at
      WHERE id = NEW.entity_id;
    WHEN 'disbursement' THEN
      UPDATE grant_disbursement
      SET progress_status = NEW.status_to,
          progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at,
          disbursed_at = CASE WHEN NEW.status_to = 'done' AND disbursed_at IS NULL THEN NEW.reported_at::date ELSE disbursed_at END
      WHERE id = NEW.entity_id;
    WHEN 'procurement' THEN
      UPDATE grant_procurement
      SET progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at
      WHERE id = NEW.entity_id;
    WHEN 'contract' THEN
      UPDATE grant_contracts
      SET progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at
      WHERE id = NEW.entity_id;
    WHEN 'risk' THEN
      UPDATE grant_risks
      SET progress_note = NEW.reason_th,
          progress_reported_at = NEW.reported_at
      WHERE id = NEW.entity_id;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_pr_sync ON grant_progress_reports;
CREATE TRIGGER trg_grant_pr_sync
  AFTER INSERT ON grant_progress_reports
  FOR EACH ROW EXECUTE FUNCTION grant_pr_sync_entity();
