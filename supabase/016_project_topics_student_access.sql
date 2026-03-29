-- ============================================================
-- ระบบหัวข้อโครงงาน/วิจัย + นศ.เลือกหัวข้อ + สิทธิ์ นศ.โพสต์ข่าว
-- CES-RMUTL Researcher Profile System
-- ============================================================
-- IDEMPOTENT: สามารถ run ซ้ำได้โดยไม่ error
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE topic_level AS ENUM (
    'bachelor',           -- โครงงาน ป.ตรี
    'master',             -- วิทยานิพนธ์ ป.โท
    'doctoral'            -- วิทยานิพนธ์ ป.เอก
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE topic_status AS ENUM (
    'open',               -- เปิดรับ นศ.
    'reserved',           -- มี นศ.จองแล้ว รอยืนยัน
    'in_progress',        -- กำลังดำเนินการ
    'completed',          -- เสร็จสิ้น
    'cancelled'           -- ยกเลิก
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'forming',            -- กำลังรวมกลุ่ม
    'approved',           -- อาจารย์อนุมัติแล้ว
    'in_progress',        -- กำลังทำ
    'presenting',         -- กำลังนำเสนอ/สอบ
    'completed',          -- สำเร็จ
    'failed'              -- ไม่ผ่าน
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM (
    'leader',             -- หัวหน้ากลุ่ม
    'member'              -- สมาชิก
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. PROJECT TOPICS (หัวข้อโครงงาน/วิจัยที่อาจารย์โพสต์)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_topics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_th          TEXT NOT NULL,
  title_en          TEXT,
  description_th    TEXT,
  description_en    TEXT,
  topic_level       topic_level NOT NULL DEFAULT 'bachelor',
  max_students      INTEGER DEFAULT 2,
  advisor_id        UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  co_advisor_id     UUID REFERENCES researchers(id) ON DELETE SET NULL,
  research_area_id  UUID REFERENCES research_areas(id) ON DELETE SET NULL,
  academic_year     INTEGER,
  semester          INTEGER,
  max_semesters     INTEGER DEFAULT 2,
  required_skills   TEXT[],
  tags              TEXT[],
  status            topic_status NOT NULL DEFAULT 'open',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topics_advisor ON project_topics(advisor_id);
CREATE INDEX IF NOT EXISTS idx_topics_status ON project_topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_level ON project_topics(topic_level);
CREATE INDEX IF NOT EXISTS idx_topics_year ON project_topics(academic_year DESC, semester);
CREATE INDEX IF NOT EXISTS idx_topics_area ON project_topics(research_area_id)
  WHERE research_area_id IS NOT NULL;

-- ============================================================
-- 3. PROJECT GROUPS (กลุ่มโครงงาน)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_groups (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id          UUID NOT NULL REFERENCES project_topics(id) ON DELETE CASCADE,
  project_name_th   TEXT,
  project_name_en   TEXT,
  start_semester    INTEGER,
  start_year        INTEGER,
  expected_end_semester INTEGER,
  expected_end_year INTEGER,
  actual_end_date   DATE,
  status            project_status NOT NULL DEFAULT 'forming',
  grade             TEXT,
  thesis_id         UUID REFERENCES theses(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pgroup_topic ON project_groups(topic_id);
CREATE INDEX IF NOT EXISTS idx_pgroup_status ON project_groups(status);
CREATE INDEX IF NOT EXISTS idx_pgroup_thesis ON project_groups(thesis_id)
  WHERE thesis_id IS NOT NULL;

-- ============================================================
-- 4. PROJECT MEMBERS (สมาชิกในกลุ่มโครงงาน)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id        UUID NOT NULL REFERENCES project_groups(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_pmember_group ON project_members(group_id);
CREATE INDEX IF NOT EXISTS idx_pmember_student ON project_members(student_id);

-- ============================================================
-- 5. STUDENT ACCESS TOKENS (สิทธิ์ นศ.โพสต์ข่าว/เพิ่มข้อมูล)
-- ============================================================

CREATE TABLE IF NOT EXISTS student_access_tokens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  granted_by      UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  access_token    TEXT NOT NULL UNIQUE,
  can_post_news   BOOLEAN DEFAULT true,
  can_upload_data BOOLEAN DEFAULT false,
  can_edit_project BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  last_used_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_token_researcher ON student_access_tokens(granted_by);
CREATE INDEX IF NOT EXISTS idx_token_student ON student_access_tokens(student_id);
CREATE INDEX IF NOT EXISTS idx_token_lookup ON student_access_tokens(access_token)
  WHERE is_active = true;

-- ============================================================
-- 6. NEWS AUTHORSHIP (ข่าวที่ นศ.โพสต์)
-- ============================================================

ALTER TABLE news ADD COLUMN IF NOT EXISTS student_author_id UUID REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE news ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES researchers(id) ON DELETE SET NULL;
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_student_post BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_news_student_author ON news(student_author_id)
  WHERE student_author_id IS NOT NULL;

-- ============================================================
-- 7. RLS
-- ============================================================

ALTER TABLE project_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_access_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Public read (ยกเว้น tokens)
  DROP POLICY IF EXISTS "Public read project_topics" ON project_topics;
  CREATE POLICY "Public read project_topics" ON project_topics FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read project_groups" ON project_groups;
  CREATE POLICY "Public read project_groups" ON project_groups FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read project_members" ON project_members;
  CREATE POLICY "Public read project_members" ON project_members FOR SELECT USING (true);

  -- Tokens: ไม่ให้อ่านจาก public
  DROP POLICY IF EXISTS "No public read tokens" ON student_access_tokens;
  CREATE POLICY "No public read tokens" ON student_access_tokens FOR SELECT USING (false);

  -- Allow write
  DROP POLICY IF EXISTS "Allow insert project_topics" ON project_topics;
  CREATE POLICY "Allow insert project_topics" ON project_topics FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update project_topics" ON project_topics;
  CREATE POLICY "Allow update project_topics" ON project_topics FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete project_topics" ON project_topics;
  CREATE POLICY "Allow delete project_topics" ON project_topics FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert project_groups" ON project_groups;
  CREATE POLICY "Allow insert project_groups" ON project_groups FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update project_groups" ON project_groups;
  CREATE POLICY "Allow update project_groups" ON project_groups FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete project_groups" ON project_groups;
  CREATE POLICY "Allow delete project_groups" ON project_groups FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert project_members" ON project_members;
  CREATE POLICY "Allow insert project_members" ON project_members FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update project_members" ON project_members;
  CREATE POLICY "Allow update project_members" ON project_members FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete project_members" ON project_members;
  CREATE POLICY "Allow delete project_members" ON project_members FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert tokens" ON student_access_tokens;
  CREATE POLICY "Allow insert tokens" ON student_access_tokens FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update tokens" ON student_access_tokens;
  CREATE POLICY "Allow update tokens" ON student_access_tokens FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete tokens" ON student_access_tokens;
  CREATE POLICY "Allow delete tokens" ON student_access_tokens FOR DELETE USING (true);
END $$;

-- ============================================================
-- 8. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_project_topics_updated ON project_topics;
CREATE TRIGGER trg_project_topics_updated
  BEFORE UPDATE ON project_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_project_groups_updated ON project_groups;
CREATE TRIGGER trg_project_groups_updated
  BEFORE UPDATE ON project_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. VIEW: หัวข้อโครงงาน + อาจารย์ + จำนวน นศ.
-- ============================================================

CREATE OR REPLACE VIEW v_project_topics AS
SELECT
  pt.id AS topic_id,
  pt.title_th,
  pt.title_en,
  pt.description_th,
  pt.topic_level,
  pt.status,
  pt.academic_year,
  pt.semester,
  pt.max_students,
  pt.required_skills,
  pt.tags,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS advisor_name_th,
  r.id AS advisor_id,
  ra.name_th AS research_area,
  (SELECT COUNT(*) FROM project_groups pg WHERE pg.topic_id = pt.id
     AND pg.status != 'forming') AS active_groups,
  (SELECT COUNT(*) FROM project_groups pg
   JOIN project_members pm ON pm.group_id = pg.id
   WHERE pg.topic_id = pt.id) AS total_students
FROM project_topics pt
JOIN researchers r ON r.id = pt.advisor_id
LEFT JOIN research_areas ra ON ra.id = pt.research_area_id;

-- ============================================================
-- 10. VIEW: รายชื่อ นศ. ทุกระดับ ของแต่ละอาจารย์
-- ============================================================

CREATE OR REPLACE VIEW v_advisor_all_students AS
SELECT
  pt.advisor_id AS researcher_id,
  s.id AS student_id,
  s.student_code,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  s.degree_level,
  s.status AS student_status,
  'project' AS work_type,
  pt.title_th AS work_title,
  pg.status::TEXT AS work_status,
  pg.actual_end_date AS completion_date,
  pt.academic_year
FROM project_topics pt
JOIN project_groups pg ON pg.topic_id = pt.id
JOIN project_members pm ON pm.group_id = pg.id
JOIN students s ON s.id = pm.student_id

UNION ALL

SELECT
  tc.researcher_id,
  s.id AS student_id,
  s.student_code,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  s.degree_level,
  s.status AS student_status,
  'thesis' AS work_type,
  t.title_th AS work_title,
  t.status::TEXT AS work_status,
  t.completion_date,
  t.academic_year
FROM thesis_committee tc
JOIN theses t ON t.id = tc.thesis_id
JOIN students s ON s.id = t.student_id
WHERE tc.committee_role IN ('main_advisor', 'co_advisor');
