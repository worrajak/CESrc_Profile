-- 054_cleanup_empty_grant_calls.sql
-- ════════════════════════════════════════════════════════════════════
-- One-off cleanup: delete grant_calls rows that have no concrete content.
--
-- The seed in migration 045 added a handful of placeholder upcoming
-- calls (EGAT-2026, EPPO-2026, TSRI-2026, PMUC-2026, PMUA-2026) with
-- agency_code + call_code only — no dates, budget, scope, or research
-- areas. The /research-plan UI filter (page.tsx) already hides these
-- from the listing; this migration is for when you want to actually
-- remove them from the database.
--
-- ── REVIEW FIRST — run the SELECT to see exactly which rows will go ──
-- SELECT id, agency_code, call_code, call_name_th,
--        open_date, close_date, budget_max, scope_th, research_areas
-- FROM grant_calls
-- WHERE open_date IS NULL
--   AND close_date IS NULL
--   AND announce_date IS NULL
--   AND budget_min IS NULL
--   AND budget_max IS NULL
--   AND scope_th IS NULL
--   AND conditions_th IS NULL
--   AND eligibility_th IS NULL
--   AND (research_areas IS NULL OR cardinality(research_areas) = 0);
--
-- ── DELETE (safe — won't cascade, grant_calls has no dependent rows yet) ──
-- Idempotent: re-runs harmlessly if no empty rows remain.
-- ════════════════════════════════════════════════════════════════════

DELETE FROM grant_calls
WHERE open_date IS NULL
  AND close_date IS NULL
  AND announce_date IS NULL
  AND budget_min IS NULL
  AND budget_max IS NULL
  AND scope_th IS NULL
  AND conditions_th IS NULL
  AND eligibility_th IS NULL
  AND (research_areas IS NULL OR cardinality(research_areas) = 0);

-- Smoke test
SELECT count(*) AS remaining_empty_rows
FROM grant_calls
WHERE open_date IS NULL
  AND close_date IS NULL
  AND announce_date IS NULL
  AND budget_min IS NULL
  AND budget_max IS NULL
  AND scope_th IS NULL
  AND conditions_th IS NULL
  AND eligibility_th IS NULL
  AND (research_areas IS NULL OR cardinality(research_areas) = 0);
-- Expect: 0
