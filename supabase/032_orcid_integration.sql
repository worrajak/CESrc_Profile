-- ============================================================
-- 032: ORCID Integration
-- เพิ่ม orcid_id ในตาราง researchers สำหรับเชื่อมกับ ORCID API
-- ============================================================

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS orcid_id TEXT;

COMMENT ON COLUMN researchers.orcid_id IS 'ORCID iD เช่น 0000-0002-1234-5678';

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_researchers_orcid ON researchers(orcid_id) WHERE orcid_id IS NOT NULL;
