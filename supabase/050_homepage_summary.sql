-- 050_homepage_summary.sql
-- ════════════════════════════════════════════════════════════════════
-- Executive Overview support for the homepage redesign
--
-- Provides:
--   1) cesru_kpi_summary       — single-row view: lifetime + active KPIs
--   2) cesru_activity_stream   — derived activity feed from updated_at
--                                  across publications/patents/grants/innovations
--   3) cesru_homepage_cache    — table to cache AI-generated executive
--                                  summary (24h TTL, refreshable by admins)
--
-- All views are public-readable (anon + authenticated). The cache table is
-- read-by-anyone, write-only-by-admin (RLS).
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1) cesru_kpi_summary  — hero strip numbers (lifetime + active)
-- ─────────────────────────────────────────────────────────────────
-- Returns ONE row. Wrapped as a view so the API can `select * from
-- cesru_kpi_summary` without re-deciding which columns matter.
--
-- Lifetime: publications_total, citations_total, h_index_avg
-- Active:   projects_active
-- Bonus:    publications_ytd / patents_total / innovations_total /
--           researchers_active (handy for AI summary context, not
--           necessarily shown on the hero strip)
DROP VIEW IF EXISTS cesru_kpi_summary;
CREATE VIEW cesru_kpi_summary AS
SELECT
  -- Hero strip (4 cards)
  (SELECT count(*)::int FROM publications)                                              AS publications_total,
  (SELECT coalesce(sum(cited_by_count), 0)::bigint FROM publications)                   AS citations_total,
  (SELECT coalesce(round(avg(h_index)::numeric, 1), 0)
     FROM researchers WHERE is_active = true AND h_index > 0)                           AS h_index_avg,
  (SELECT count(*)::int FROM grants WHERE status = 'active')                            AS projects_active,
  -- Context for AI narrative (not on hero strip)
  (SELECT count(*)::int FROM publications
     WHERE year = extract(year from current_date)::int)                                 AS publications_ytd,
  (SELECT count(*)::int FROM patents WHERE status IN ('granted', 'pending'))            AS patents_total,
  (SELECT count(*)::int FROM cesru_innovations WHERE status IN ('filed', 'granted'))    AS innovations_total,
  (SELECT count(*)::int FROM researchers WHERE is_active = true)                        AS researchers_active,
  now() AS computed_at;

GRANT SELECT ON cesru_kpi_summary TO anon, authenticated;

COMMENT ON VIEW cesru_kpi_summary IS
  'Single-row summary of headline KPIs for the homepage Hero strip.
   Cheap to query — pure aggregates, no joins. Add new KPI columns by
   editing this view, not by adding new endpoints.';


-- ─────────────────────────────────────────────────────────────────
-- 2) cesru_activity_stream  — recent activity feed (derived)
-- ─────────────────────────────────────────────────────────────────
-- UNION ALL across the 4 "output" tables. Each row is normalized to:
--   kind            — what happened   ('publication' | 'patent' | 'grant' | 'innovation')
--   ref_id          — pk of the row (text — different tables, same shape)
--   title_th        — Thai display title (falls back to title)
--   title_en        — English title (nullable)
--   snippet         — short context line (journal name, agency, ip number…)
--   occurred_at     — sort key: updated_at coalesce created_at
--   link_path       — relative URL to the detail page
--
-- The view filters out drafts / unpublished rows so the homepage is
-- collaborator-safe. The API caller is expected to ORDER BY occurred_at
-- DESC LIMIT N.
DROP VIEW IF EXISTS cesru_activity_stream;
CREATE VIEW cesru_activity_stream AS

-- 2a) Publications — keep only ones with a real title
SELECT
  'publication'::text                                       AS kind,
  id::text                                                  AS ref_id,
  coalesce(title_th, title)                                 AS title_th,
  title                                                     AS title_en,
  coalesce(journal_name, year::text)                        AS snippet,
  coalesce(updated_at, created_at)                          AS occurred_at,
  '/publications#' || id::text                              AS link_path
FROM publications
WHERE title IS NOT NULL
  AND (status = 'published' OR status IS NULL)

UNION ALL

-- 2b) Patents — granted or filed
SELECT
  'patent'::text                                            AS kind,
  id::text                                                  AS ref_id,
  title_th                                                  AS title_th,
  title_en                                                  AS title_en,
  coalesce(patent_no, application_no, 'Filed')              AS snippet,
  coalesce(updated_at, created_at)                          AS occurred_at,
  '/patents/' || id::text                                   AS link_path
FROM patents
WHERE status IN ('granted', 'pending', 'filed')

UNION ALL

-- 2c) Grants — active or recently completed
SELECT
  'grant'::text                                             AS kind,
  id::text                                                  AS ref_id,
  title_th                                                  AS title_th,
  title_en                                                  AS title_en,
  funding_agency                                            AS snippet,
  coalesce(updated_at, created_at)                          AS occurred_at,
  '/grants/' || id::text                                    AS link_path
FROM grants
WHERE status IN ('active', 'completed')

UNION ALL

-- 2d) Innovations — anything not a draft
SELECT
  'innovation'::text                                        AS kind,
  id::text                                                  AS ref_id,
  title_th                                                  AS title_th,
  title_en                                                  AS title_en,
  coalesce(ip_number, short_desc_th, 'Innovation')          AS snippet,
  coalesce(updated_at, created_at)                          AS occurred_at,
  '/innovations/' || id::text                               AS link_path
FROM cesru_innovations
WHERE status IN ('filed', 'granted');
-- Note: 'concept' is excluded (half-baked ideas — not public-safe).
--       'expired' / 'abandoned' excluded too (not current activity).

GRANT SELECT ON cesru_activity_stream TO anon, authenticated;

COMMENT ON VIEW cesru_activity_stream IS
  'Recent activity across publications/patents/grants/innovations.
   Caller orders by occurred_at DESC and limits. Filters out drafts.';


-- ─────────────────────────────────────────────────────────────────
-- 3) cesru_homepage_cache  — AI summary cache (24h TTL)
-- ─────────────────────────────────────────────────────────────────
-- The "executive summary" AI call is expensive (~1-2 sec, costs tokens).
-- Cache the result here. Default key is 'executive_summary' — but other
-- pages can reuse this table with different keys later.
--
-- expires_at is advisory; the API decides whether to regenerate. Admins
-- can DELETE the row to force a fresh generation.
CREATE TABLE IF NOT EXISTS cesru_homepage_cache (
  id              TEXT PRIMARY KEY DEFAULT 'executive_summary',
  summary_th      TEXT,
  summary_en      TEXT,
  -- Evidence chain payload — see src/lib/evidence-chain.ts
  -- Shape: { claims: [{ claim, sources: [{ table, ref_id, field, snippet }, …] }] }
  evidence_chain  JSONB,
  -- Provenance of THIS row (which AI generated it)
  source          TEXT,        -- 'openrouter' | 'openai' | etc.
  model           TEXT,        -- 'google/gemini-3.1-flash-lite-preview' | etc.
  -- Snapshot of KPI numbers used in the prompt — for audit + diff
  kpi_snapshot    JSONB,
  generated_at    TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE cesru_homepage_cache ENABLE ROW LEVEL SECURITY;

-- Read: anyone (it's used to render the public homepage)
DROP POLICY IF EXISTS homepage_cache_read ON cesru_homepage_cache;
CREATE POLICY homepage_cache_read
  ON cesru_homepage_cache
  FOR SELECT
  USING (true);

-- Write: only admins (matches the admin-auth model from migration 049)
DROP POLICY IF EXISTS homepage_cache_write ON cesru_homepage_cache;
CREATE POLICY homepage_cache_write
  ON cesru_homepage_cache
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM researchers r
      WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (r.is_admin = true OR r.is_active = true)
    )
  );

CREATE INDEX IF NOT EXISTS idx_homepage_cache_expires ON cesru_homepage_cache(expires_at);

COMMENT ON TABLE cesru_homepage_cache IS
  'Cache for AI-generated executive summary on the homepage.
   The API route /api/homepage/executive-summary reads the row keyed by
   "executive_summary"; if expires_at < now() it regenerates and upserts.';


-- ─────────────────────────────────────────────────────────────────
-- Smoke test  (run by hand; harmless)
-- ─────────────────────────────────────────────────────────────────
-- SELECT * FROM cesru_kpi_summary;
-- SELECT * FROM cesru_activity_stream ORDER BY occurred_at DESC LIMIT 7;
-- SELECT id, generated_at, expires_at FROM cesru_homepage_cache;
