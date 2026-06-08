-- 057_pipeline_authors.sql
-- ════════════════════════════════════════════════════════════════════
-- Phase B: per-pipeline-item author roster (FA / CA / Co-author / Last).
--
-- A row here pins one author — internal (researchers.id) OR external
-- (free-form name + optional ORCID) — to one paper in the pipeline,
-- with their author_role and corresponding-author flag. For papers
-- that are ALREADY in publications, the picker UI can pre-seed this
-- table from publication_authors so the plan owner can override
-- "intended" roles for the next submission.
--
-- Phase C will add ORCID auto-lookup for the external path; the
-- columns are already in place so no schema change is needed then.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS academic_position_pipeline_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL
    REFERENCES academic_position_research_pipeline(id) ON DELETE CASCADE,

  -- Internal (CESRU) researcher — preferred when the author is in our DB.
  researcher_id UUID REFERENCES researchers(id) ON DELETE SET NULL,

  -- External author — used when researcher_id is NULL. Phase C will fill
  -- these via ORCID lookup; Phase B accepts manual entry.
  external_name TEXT,
  external_orcid TEXT,
  external_affiliation TEXT,

  role author_role NOT NULL DEFAULT 'co_author',
  is_corresponding BOOLEAN NOT NULL DEFAULT FALSE,
  author_order INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Exactly one identity slot must be populated
  CHECK (researcher_id IS NOT NULL OR external_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_apos_pl_authors_pipeline
  ON academic_position_pipeline_authors(pipeline_id, author_order);

CREATE INDEX IF NOT EXISTS idx_apos_pl_authors_researcher
  ON academic_position_pipeline_authors(researcher_id)
  WHERE researcher_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────
-- RLS — author rows inherit from the parent pipeline row
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE academic_position_pipeline_authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS apos_pl_authors_read ON academic_position_pipeline_authors;
CREATE POLICY apos_pl_authors_read
  ON academic_position_pipeline_authors
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS apos_pl_authors_write ON academic_position_pipeline_authors;
CREATE POLICY apos_pl_authors_write
  ON academic_position_pipeline_authors
  FOR ALL
  USING (
    pipeline_id IN (
      SELECT id FROM academic_position_research_pipeline
      WHERE plan_id IN (
        SELECT id FROM academic_position_plans
        WHERE researcher_id = apos_current_researcher_id()
      )
    )
    OR apos_is_admin()
  )
  WITH CHECK (
    pipeline_id IN (
      SELECT id FROM academic_position_research_pipeline
      WHERE plan_id IN (
        SELECT id FROM academic_position_plans
        WHERE researcher_id = apos_current_researcher_id()
      )
    )
    OR apos_is_admin()
  );
