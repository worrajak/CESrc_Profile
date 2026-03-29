-- ============================================================
-- ระบบ Milestone & Progress Tracking สำหรับนักศึกษา
-- นศ.แจ้งสถานะ + เขียนข่าว + บันทึกผลงานตีพิมพ์
-- CES-RMUTL Researcher Profile System
-- ============================================================
-- IDEMPOTENT: สามารถ run ซ้ำได้โดยไม่ error
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE milestone_category AS ENUM (
    -- ป.ตรี (โครงงาน)
    'project_start',            -- เริ่มทำโครงงาน
    'project_proposal',         -- เสนอหัวข้อโครงงาน
    'project_midterm',          -- สอบกลางภาค/ความก้าวหน้า
    'project_presentation',     -- นำเสนอโครงงาน
    'project_completed',        -- ส่งเล่มโครงงาน/จบ

    -- ป.โท / ป.เอก (วิทยานิพนธ์)
    'enrollment',               -- เข้าศึกษา/ลงทะเบียน
    'coursework_complete',      -- เรียน coursework ครบ
    'qualifying_exam',          -- สอบ QE (Qualifying Exam)
    'committee_formed',         -- ตั้งกรรมการสอบ
    'proposal_defense',         -- สอบหัวข้อวิทยานิพนธ์
    'research_progress',        -- รายงานความก้าวหน้า
    'publication_submitted',    -- ส่งบทความตีพิมพ์
    'publication_accepted',     -- บทความได้รับตีพิมพ์
    'thesis_defense',           -- สอบวิทยานิพนธ์
    'thesis_revision',          -- แก้ไขวิทยานิพนธ์
    'thesis_approved',          -- วิทยานิพนธ์ผ่านอนุมัติ
    'graduation',               -- สำเร็จการศึกษา

    -- ทั่วไป
    'fieldwork',                -- ลงพื้นที่/เก็บข้อมูล
    'conference_presentation',  -- นำเสนอที่ประชุมวิชาการ
    'workshop_training',        -- อบรม/สัมมนา
    'other'                     -- อื่นๆ
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_committee_role AS ENUM (
    'advisor',              -- อาจารย์ที่ปรึกษา
    'co_advisor',           -- อาจารย์ที่ปรึกษาร่วม
    'committee_chair',      -- ประธานกรรมการสอบ
    'committee_member'      -- กรรมการสอบ
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. STUDENT MILESTONES (เหตุการณ์สำคัญ)
-- ใช้ได้ทั้ง ป.ตรี (project_group) และ ป.โท/เอก (thesis)
-- ============================================================

CREATE TABLE IF NOT EXISTS student_milestones (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- เชื่อมกับงาน (เลือกอย่างใดอย่างหนึ่ง)
  thesis_id         UUID REFERENCES theses(id) ON DELETE CASCADE,
  project_group_id  UUID REFERENCES project_groups(id) ON DELETE CASCADE,
  -- ประเภทและรายละเอียด
  category          milestone_category NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  -- วันที่
  milestone_date    DATE NOT NULL,
  -- เชื่อมกับผลงานตีพิมพ์ (ถ้าเป็น milestone เรื่อง publication)
  publication_id    UUID REFERENCES publications(id) ON DELETE SET NULL,
  -- เชื่อมกับข่าว (ถ้า นศ.เขียนข่าวประกอบ)
  news_id           UUID REFERENCES news(id) ON DELETE SET NULL,
  -- ไฟล์แนบ (เช่น ใบรับรอง, สไลด์, รูปถ่าย)
  attachments       JSONB DEFAULT '[]',
  -- ใครบันทึก
  recorded_by_student UUID REFERENCES students(id) ON DELETE SET NULL,
  recorded_by_researcher UUID REFERENCES researchers(id) ON DELETE SET NULL,
  -- สถานะ
  is_verified       BOOLEAN DEFAULT false,
  verified_by       UUID REFERENCES researchers(id) ON DELETE SET NULL,
  -- Metadata
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  -- ต้องเชื่อมกับ thesis หรือ project อย่างใดอย่างหนึ่ง
  CONSTRAINT chk_milestone_work CHECK (
    (thesis_id IS NOT NULL AND project_group_id IS NULL)
    OR
    (thesis_id IS NULL AND project_group_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_milestone_thesis ON student_milestones(thesis_id)
  WHERE thesis_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_milestone_project ON student_milestones(project_group_id)
  WHERE project_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_milestone_date ON student_milestones(milestone_date DESC);
CREATE INDEX IF NOT EXISTS idx_milestone_category ON student_milestones(category);
CREATE INDEX IF NOT EXISTS idx_milestone_publication ON student_milestones(publication_id)
  WHERE publication_id IS NOT NULL;

-- ============================================================
-- 3. PROJECT COMMITTEE (กรรมการสอบโครงงาน ป.ตรี)
-- เฉพาะนักวิจัยภายใน (ไม่มี external)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_committee (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES project_groups(id) ON DELETE CASCADE,
  researcher_id   UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  role            project_committee_role NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, researcher_id)
);

CREATE INDEX IF NOT EXISTS idx_pcommittee_group ON project_committee(group_id);
CREATE INDEX IF NOT EXISTS idx_pcommittee_researcher ON project_committee(researcher_id);

-- ============================================================
-- 4. PROJECT PUBLICATIONS (บทความจากโครงงาน ป.ตรี)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_publications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES project_groups(id) ON DELETE CASCADE,
  publication_id  UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, publication_id)
);

CREATE INDEX IF NOT EXISTS idx_proj_pub_group ON project_publications(group_id);
CREATE INDEX IF NOT EXISTS idx_proj_pub_pub ON project_publications(publication_id);

-- ============================================================
-- 5. RLS
-- ============================================================

ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_publications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read student_milestones" ON student_milestones;
  CREATE POLICY "Public read student_milestones" ON student_milestones FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read project_committee" ON project_committee;
  CREATE POLICY "Public read project_committee" ON project_committee FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read project_publications" ON project_publications;
  CREATE POLICY "Public read project_publications" ON project_publications FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow insert student_milestones" ON student_milestones;
  CREATE POLICY "Allow insert student_milestones" ON student_milestones FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update student_milestones" ON student_milestones;
  CREATE POLICY "Allow update student_milestones" ON student_milestones FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete student_milestones" ON student_milestones;
  CREATE POLICY "Allow delete student_milestones" ON student_milestones FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert project_committee" ON project_committee;
  CREATE POLICY "Allow insert project_committee" ON project_committee FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update project_committee" ON project_committee;
  CREATE POLICY "Allow update project_committee" ON project_committee FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete project_committee" ON project_committee;
  CREATE POLICY "Allow delete project_committee" ON project_committee FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert project_publications" ON project_publications;
  CREATE POLICY "Allow insert project_publications" ON project_publications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update project_publications" ON project_publications;
  CREATE POLICY "Allow update project_publications" ON project_publications FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete project_publications" ON project_publications;
  CREATE POLICY "Allow delete project_publications" ON project_publications FOR DELETE USING (true);
END $$;

-- ============================================================
-- 6. TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS trg_milestones_updated ON student_milestones;
CREATE TRIGGER trg_milestones_updated
  BEFORE UPDATE ON student_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. VIEW: Timeline ของ นศ. แต่ละคน
-- ============================================================

CREATE OR REPLACE VIEW v_student_timeline AS
SELECT
  sm.id AS milestone_id,
  sm.category,
  sm.title,
  sm.description,
  sm.milestone_date,
  sm.is_verified,
  sm.attachments,
  sm.news_id,
  -- ข้อมูล นศ.
  COALESCE(ts.id, ps.id) AS student_id,
  COALESCE(
    ts.title_th || ts.first_name_th || ' ' || ts.last_name_th,
    ps.title_th || ps.first_name_th || ' ' || ps.last_name_th
  ) AS student_name_th,
  COALESCE(ts.degree_level, ps.degree_level) AS degree_level,
  -- ข้อมูลงาน
  CASE
    WHEN sm.thesis_id IS NOT NULL THEN 'thesis'
    ELSE 'project'
  END AS work_type,
  COALESCE(t.title_th, pt.title_th) AS work_title,
  -- ข้อมูลผลงานตีพิมพ์ (ถ้ามี)
  p.title AS publication_title,
  p.doi,
  -- work id
  COALESCE(sm.thesis_id, sm.project_group_id) AS work_id
FROM student_milestones sm
LEFT JOIN theses t ON t.id = sm.thesis_id
LEFT JOIN students ts ON ts.id = t.student_id
LEFT JOIN project_groups pg ON pg.id = sm.project_group_id
LEFT JOIN project_topics pt ON pt.id = pg.topic_id
LEFT JOIN project_members pm ON pm.group_id = pg.id AND pm.role = 'leader'
LEFT JOIN students ps ON ps.id = pm.student_id
LEFT JOIN publications p ON p.id = sm.publication_id
ORDER BY sm.milestone_date DESC;

-- ============================================================
-- 8. VIEW: สรุปผลงานตีพิมพ์จากงาน นศ. ของแต่ละอาจารย์
-- ============================================================

CREATE OR REPLACE VIEW v_advisor_student_publications AS
-- จาก thesis (ป.โท/เอก)
SELECT
  tc.researcher_id,
  tp.publication_id,
  p.title AS publication_title,
  p.year AS pub_year,
  p.doi,
  t.title_th AS work_title,
  s.degree_level,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  'thesis' AS source_type
FROM thesis_committee tc
JOIN theses t ON t.id = tc.thesis_id
JOIN students s ON s.id = t.student_id
JOIN thesis_publications tp ON tp.thesis_id = t.id
JOIN publications p ON p.id = tp.publication_id
WHERE tc.committee_role IN ('main_advisor', 'co_advisor')

UNION ALL

-- จาก project (ป.ตรี)
SELECT
  pt.advisor_id AS researcher_id,
  pp.publication_id,
  p.title AS publication_title,
  p.year AS pub_year,
  p.doi,
  pt.title_th AS work_title,
  'bachelor'::degree_level,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  'project' AS source_type
FROM project_publications pp
JOIN project_groups pg ON pg.id = pp.group_id
JOIN project_topics pt ON pt.id = pg.topic_id
JOIN publications p ON p.id = pp.publication_id
JOIN project_members pm ON pm.group_id = pg.id AND pm.role = 'leader'
JOIN students s ON s.id = pm.student_id;

-- ============================================================
-- 9. VIEW: Publication checklist สำหรับ ป.โท/เอก
-- ============================================================

CREATE OR REPLACE VIEW v_thesis_publication_progress AS
SELECT
  t.id AS thesis_id,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  t.title_th AS thesis_title,
  t.degree_level,
  t.status AS thesis_status,
  COUNT(DISTINCT tp.publication_id) AS total_publications,
  COUNT(DISTINCT tp.publication_id)
    FILTER (WHERE p.pub_type IN ('journal_international', 'journal_national'))
    AS journal_count,
  COUNT(DISTINCT tp.publication_id)
    FILTER (WHERE p.pub_type IN ('conference_international', 'conference_national'))
    AS conference_count,
  -- เกณฑ์ขั้นต่ำ (ป.โท ≥ 1 journal, ป.เอก ≥ 2 journal)
  CASE
    WHEN t.degree_level = 'master' THEN
      COUNT(DISTINCT tp.publication_id) FILTER (WHERE p.pub_type::TEXT LIKE 'journal%') >= 1
    WHEN t.degree_level = 'doctoral' THEN
      COUNT(DISTINCT tp.publication_id) FILTER (WHERE p.pub_type::TEXT LIKE 'journal%') >= 2
    ELSE true
  END AS meets_publication_requirement,
  (SELECT sm.title FROM student_milestones sm
   WHERE sm.thesis_id = t.id
   ORDER BY sm.milestone_date DESC LIMIT 1) AS latest_milestone,
  (SELECT sm.milestone_date FROM student_milestones sm
   WHERE sm.thesis_id = t.id
   ORDER BY sm.milestone_date DESC LIMIT 1) AS latest_milestone_date
FROM theses t
JOIN students s ON s.id = t.student_id
LEFT JOIN thesis_publications tp ON tp.thesis_id = t.id
LEFT JOIN publications p ON p.id = tp.publication_id
GROUP BY t.id, s.title_th, s.first_name_th, s.last_name_th, t.title_th,
         t.degree_level, t.status;
