-- 051_homepage_perf.sql
-- ════════════════════════════════════════════════════════════════════
-- Performance fixes for the homepage redesign (migration 050).
--
-- Symptoms before this migration:
--   /        slow (5-10 s) — cesru_activity_stream view scans all 4
--                            tables fully and sorts in memory.
--   /admin   slow         — same view used indirectly; researchers
--                            full-scan via ilike(email) in useAdminAuth.
--
-- Fixes:
--   1) LIMIT per UNION branch in cesru_activity_stream (max 30 each
--      → caller sees ≤120 rows instead of full tables)
--   2) Partial b-tree indexes on (updated_at DESC) per branch with the
--      same filter predicates the view uses
--   3) Functional index on researchers(lower(email)) so the case-
--      insensitive admin auth lookup is index-backed
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1) Per-branch indexes so the ORDER BY inside each subquery is
--    index-backed and Postgres can fetch top-N without scanning the
--    whole table.
-- ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_publications_updated_published
  ON publications (updated_at DESC)
  WHERE title IS NOT NULL AND (status = 'published' OR status IS NULL);

CREATE INDEX IF NOT EXISTS idx_patents_updated_active
  ON patents (updated_at DESC)
  WHERE status IN ('granted', 'pending', 'filed');

CREATE INDEX IF NOT EXISTS idx_grants_updated_active
  ON grants (updated_at DESC)
  WHERE status IN ('active', 'completed');

CREATE INDEX IF NOT EXISTS idx_cesru_innovations_updated_filed
  ON cesru_innovations (updated_at DESC)
  WHERE status IN ('filed', 'granted');

-- Functional index on researchers.email (lower-cased) so useAdminAuth's
-- ilike() / lower(email) match is index-backed.
CREATE INDEX IF NOT EXISTS idx_researchers_email_lower
  ON researchers (lower(email));


-- ─────────────────────────────────────────────────────────────────
-- 2) Rewrite cesru_activity_stream with per-branch LIMIT so the
--    UNION operates on ≤30 rows per kind instead of full tables.
--    Caller then ORDER BY occurred_at DESC LIMIT 7 over ≤120 rows.
-- ─────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS cesru_activity_stream;
CREATE VIEW cesru_activity_stream AS

-- 2a) Publications (top 30 most recently updated, published only)
(
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
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 30
)

UNION ALL

-- 2b) Patents (top 30 of active patent states)
(
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
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 30
)

UNION ALL

-- 2c) Grants (top 30, active or completed)
(
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
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 30
)

UNION ALL

-- 2d) Innovations (top 30 filed/granted)
(
  SELECT
    'innovation'::text                                        AS kind,
    id::text                                                  AS ref_id,
    title_th                                                  AS title_th,
    title_en                                                  AS title_en,
    coalesce(ip_number, short_desc_th, 'Innovation')          AS snippet,
    coalesce(updated_at, created_at)                          AS occurred_at,
    '/innovations/' || id::text                               AS link_path
  FROM cesru_innovations
  WHERE status IN ('filed', 'granted')
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 30
);

GRANT SELECT ON cesru_activity_stream TO anon, authenticated;

COMMENT ON VIEW cesru_activity_stream IS
  'Recent activity across publications/patents/grants/innovations.
   Per-branch LIMIT 30 keeps the UNION footprint small so the caller
   can ORDER BY occurred_at DESC LIMIT N cheaply. Backed by partial
   indexes on each branch (idx_*_updated_*).';


-- ─────────────────────────────────────────────────────────────────
-- Smoke test (run by hand)
-- ─────────────────────────────────────────────────────────────────
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM cesru_activity_stream
-- ORDER BY occurred_at DESC LIMIT 7;
--
-- Expect: each branch uses Index Scan Backward on idx_*_updated_*
--         total time < 50ms even with thousands of rows per table.
