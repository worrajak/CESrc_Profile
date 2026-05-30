-- 052_cache_rls_fix.sql
-- ════════════════════════════════════════════════════════════════════
-- Performance fix for cesru_homepage_cache RLS policies.
--
-- Migration 050 used a single FOR ALL USING() policy for writes. Because
-- FOR ALL covers SELECT as well, every SELECT against this table had
-- Postgres evaluating the EXISTS subquery against researchers + the
-- auth.jwt() extraction — for the read path that the public homepage
-- already uses anonymously. That added 50-100ms per page load.
--
-- This migration splits the write policy into INSERT and UPDATE/DELETE
-- with WITH CHECK / USING — neither applies to SELECT — so the SELECT
-- path only evaluates the trivial USING (true) policy.
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

-- Drop the previous all-in-one write policy
DROP POLICY IF EXISTS homepage_cache_write ON cesru_homepage_cache;

-- INSERT: only admins can create cache rows
CREATE POLICY homepage_cache_insert
  ON cesru_homepage_cache
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM researchers r
      WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (r.is_admin = true OR r.is_active = true)
    )
  );

-- UPDATE: only admins can update existing rows
CREATE POLICY homepage_cache_update
  ON cesru_homepage_cache
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM researchers r
      WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (r.is_admin = true OR r.is_active = true)
    )
  );

-- DELETE: only admins can delete (e.g. force regenerate by wiping cache)
CREATE POLICY homepage_cache_delete
  ON cesru_homepage_cache
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM researchers r
      WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (r.is_admin = true OR r.is_active = true)
    )
  );

-- homepage_cache_read (FOR SELECT USING (true)) remains from migration
-- 050; nothing to change for the read path.

COMMENT ON TABLE cesru_homepage_cache IS
  'Cache for the homepage executive summary. SELECT is public (RLS
   policy USING (true)). INSERT/UPDATE/DELETE require admin auth
   (separate policies that do NOT trigger on SELECT).';
