-- 055_researcher_executive_role.sql
-- ════════════════════════════════════════════════════════════════════
-- Add executive-admin role fields to researchers so we can show that
-- a CESRU member also serves as e.g. รองอธิการบดี / ผู้ช่วยอธิการบดี /
-- ผอ.สถาบันวิจัย ฯลฯ on their profile card and detail page.
--
-- Populated by /api/admin/researchers/sync-executives which scrapes
-- https://www.rmutl.ac.th/structure/executive, fuzzy-matches each
-- listed executive to a researchers row by Thai name, and lets an
-- admin confirm the matches before applying.
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS executive_role_th TEXT,         -- "รองอธิการบดี", "คณบดีคณะวิศวกรรมศาสตร์"
  ADD COLUMN IF NOT EXISTS executive_unit    TEXT,         -- "RMUTL" (parent org level)
  ADD COLUMN IF NOT EXISTS executive_photo_url TEXT,       -- official portrait from e-cms.rmutl.ac.th
  ADD COLUMN IF NOT EXISTS executive_source_url TEXT,      -- usually rmutl.ac.th/structure/executive
  ADD COLUMN IF NOT EXISTS executive_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN researchers.executive_role_th IS
  'Thai-language executive role at the parent university (e.g.
   "รองอธิการบดี", "คณบดีคณะวิศวกรรมศาสตร์"). Populated by the
   /api/admin/researchers/sync-executives admin tool. NULL means the
   researcher is not currently serving as an executive.';

COMMENT ON COLUMN researchers.executive_photo_url IS
  'Official portrait URL from the RMUTL exec page. The profile card
   falls back to this when researchers.avatar_url is NULL.';

-- Index so the listing page can highlight executives cheaply
CREATE INDEX IF NOT EXISTS idx_researchers_executive_role
  ON researchers (executive_role_th)
  WHERE executive_role_th IS NOT NULL;
