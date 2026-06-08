-- 056b_academic_position_storage.sql
-- ════════════════════════════════════════════════════════════════════
-- Storage bucket for academic position plan document uploads.
--
-- Path layout: academic-position-docs/<researcher_id>/<plan_id>/<filename>
--
-- RLS:
--   • Each researcher uploads/reads/deletes files under their OWN folder
--     (the path's first segment must equal their researchers.id).
--   • Admins (researchers.is_admin = TRUE) can do anything.
--   • Files are private — only signed URLs work.
--
-- Idempotent: re-runs harmlessly.
-- ════════════════════════════════════════════════════════════════════

-- Create the bucket (private). Note: storage.create_bucket() is a
-- function only available with service role; from SQL editor we insert
-- into storage.buckets directly.
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-position-docs', 'academic-position-docs', FALSE)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

-- ─────────────────────────────────────────────────────────────────
-- RLS policies on storage.objects for this bucket
-- ─────────────────────────────────────────────────────────────────

-- Helper to extract the first path segment (researcher_id) for the bucket
-- Storage stores 'name' as the full path like
--   '<researcher_id>/<plan_id>/<filename>'.

DROP POLICY IF EXISTS apos_storage_select ON storage.objects;
CREATE POLICY apos_storage_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'academic-position-docs'
    AND (
      -- Owner: first path segment matches the user's researcher_id
      (storage.foldername(name))[1]::uuid = apos_current_researcher_id()
      OR apos_is_admin()
    )
  );

DROP POLICY IF EXISTS apos_storage_insert ON storage.objects;
CREATE POLICY apos_storage_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'academic-position-docs'
    AND (
      (storage.foldername(name))[1]::uuid = apos_current_researcher_id()
      OR apos_is_admin()
    )
  );

DROP POLICY IF EXISTS apos_storage_update ON storage.objects;
CREATE POLICY apos_storage_update ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'academic-position-docs'
    AND (
      (storage.foldername(name))[1]::uuid = apos_current_researcher_id()
      OR apos_is_admin()
    )
  );

DROP POLICY IF EXISTS apos_storage_delete ON storage.objects;
CREATE POLICY apos_storage_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'academic-position-docs'
    AND (
      (storage.foldername(name))[1]::uuid = apos_current_researcher_id()
      OR apos_is_admin()
    )
  );
