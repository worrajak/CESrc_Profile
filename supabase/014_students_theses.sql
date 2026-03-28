-- ============================================================
-- ระบบนักศึกษาและวิทยานิพนธ์ (Students & Theses)
-- CES-RMUTL Researcher Profile System
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

-- ระดับการศึกษา
CREATE TYPE degree_level AS ENUM (
  'bachelor',       -- ปริญญาตรี
  'master',         -- ปริญญาโท
  'doctoral'        -- ปริญญาเอก
);

-- สถานะนักศึกษา
CREATE TYPE student_status AS ENUM (
  'active',         -- กำลังศึกษา
  'graduated',      -- สำเร็จการศึกษา
  'withdrawn',      -- ลาออก/พ้นสภาพ
  'on_leave'        -- ลาพักการศึกษา
);

-- สถานะวิทยานิพนธ์
CREATE TYPE thesis_status AS ENUM (
  'proposal',           -- เสนอหัวข้อ
  'in_progress',        -- กำลังดำเนินการ
  'defense_scheduled',  -- นัดสอบ
  'defense_passed',     -- สอบผ่าน
  'completed',          -- สำเร็จ/ตีพิมพ์แล้ว
  'withdrawn'           -- ยกเลิก
);

-- บทบาทกรรมการสอบวิทยานิพนธ์
CREATE TYPE committee_role AS ENUM (
  'main_advisor',       -- อาจารย์ที่ปรึกษาหลัก
  'co_advisor',         -- อาจารย์ที่ปรึกษาร่วม
  'committee_chair',    -- ประธานกรรมการสอบ
  'committee_member'    -- กรรมการสอบ
);

-- ============================================================
-- 2. EXTERNAL PERSONS (บุคคลภายนอก)
-- กรรมการสอบ/ที่ปรึกษาจากมหาวิทยาลัยอื่น
-- ============================================================

CREATE TABLE external_persons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- ชื่อภาษาไทย
  title_th        TEXT,
  first_name_th   TEXT,
  last_name_th    TEXT,
  -- ชื่อภาษาอังกฤษ
  title_en        TEXT,
  first_name_en   TEXT,
  last_name_en    TEXT,
  -- สังกัด
  position        TEXT,            -- ตำแหน่งทางวิชาการ
  department      TEXT,
  faculty         TEXT,
  university      TEXT,            -- มหาวิทยาลัย/หน่วยงาน
  email           TEXT,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_external_persons_name
  ON external_persons(last_name_en, first_name_en);

-- ============================================================
-- 3. STUDENTS (นักศึกษา)
-- ============================================================

CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_code    TEXT UNIQUE,               -- รหัสนักศึกษา
  -- ชื่อภาษาไทย
  title_th        TEXT NOT NULL,             -- 'นาย', 'นาง', 'นางสาว'
  first_name_th   TEXT NOT NULL,
  last_name_th    TEXT NOT NULL,
  -- ชื่อภาษาอังกฤษ
  title_en        TEXT,                      -- 'Mr.', 'Ms.'
  first_name_en   TEXT,
  last_name_en    TEXT,
  -- ข้อมูลการศึกษา
  degree_level    degree_level NOT NULL,
  program_th      TEXT,                      -- ชื่อหลักสูตร เช่น 'วิศวกรรมไฟฟ้า'
  program_en      TEXT,                      -- e.g., 'Electrical Engineering'
  enrollment_year INTEGER,                   -- ปีที่เข้าศึกษา
  graduation_year INTEGER,                   -- ปีที่สำเร็จ
  status          student_status NOT NULL DEFAULT 'active',
  -- ติดต่อ
  email           TEXT,
  phone           TEXT,
  -- เชื่อม นศ. ที่กลายเป็นนักวิจัย/อาจารย์
  researcher_id   UUID REFERENCES researchers(id) ON DELETE SET NULL,
  -- รูป
  avatar_url      TEXT,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_degree ON students(degree_level);
CREATE INDEX idx_students_researcher ON students(researcher_id)
  WHERE researcher_id IS NOT NULL;

-- ============================================================
-- 4. THESES (วิทยานิพนธ์/ปริญญานิพนธ์/สารนิพนธ์)
-- ============================================================

CREATE TABLE theses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- ชื่อเรื่อง
  title_th        TEXT NOT NULL,              -- ชื่อวิทยานิพนธ์ภาษาไทย
  title_en        TEXT,                       -- ชื่อภาษาอังกฤษ
  -- ข้อมูลวิชาการ
  degree_level    degree_level NOT NULL,
  program_th      TEXT,
  program_en      TEXT,
  -- ลำดับเวลา
  proposal_date   DATE,                       -- วันที่อนุมัติหัวข้อ
  defense_date    DATE,                       -- วันที่สอบวิทยานิพนธ์
  completion_date DATE,                       -- วันที่สำเร็จ
  academic_year   INTEGER,                    -- ปีการศึกษา
  -- สถานะ
  status          thesis_status NOT NULL DEFAULT 'proposal',
  -- บทคัดย่อ
  abstract_th     TEXT,
  abstract_en     TEXT,
  keywords        TEXT[],
  -- เชื่อมกับสาขาวิจัย
  research_area_id UUID REFERENCES research_areas(id) ON DELETE SET NULL,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_theses_student ON theses(student_id);
CREATE INDEX idx_theses_status ON theses(status);
CREATE INDEX idx_theses_year ON theses(academic_year DESC);
CREATE INDEX idx_theses_research_area ON theses(research_area_id)
  WHERE research_area_id IS NOT NULL;

-- ============================================================
-- 5. THESIS COMMITTEE (กรรมการสอบวิทยานิพนธ์)
-- อ้างถึง researchers (CESRU) หรือ external_persons (ภายนอก)
-- ============================================================

CREATE TABLE thesis_committee (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thesis_id           UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
  -- เลือกอย่างใดอย่างหนึ่ง: นักวิจัย CESRU หรือ บุคคลภายนอก
  researcher_id       UUID REFERENCES researchers(id) ON DELETE SET NULL,
  external_person_id  UUID REFERENCES external_persons(id) ON DELETE SET NULL,
  -- บทบาท
  committee_role      committee_role NOT NULL,
  sort_order          INTEGER DEFAULT 0,
  -- Metadata
  created_at          TIMESTAMPTZ DEFAULT now(),
  -- ต้องมีคนอ้างอิงอย่างน้อย 1 คน
  CONSTRAINT chk_committee_person CHECK (
    (researcher_id IS NOT NULL AND external_person_id IS NULL)
    OR
    (researcher_id IS NULL AND external_person_id IS NOT NULL)
  ),
  UNIQUE(thesis_id, researcher_id),
  UNIQUE(thesis_id, external_person_id)
);

CREATE INDEX idx_thesis_committee_thesis ON thesis_committee(thesis_id);
CREATE INDEX idx_thesis_committee_researcher ON thesis_committee(researcher_id)
  WHERE researcher_id IS NOT NULL;

-- ============================================================
-- 6. THESIS-PUBLICATION LINK (ผลงานตีพิมพ์จากวิทยานิพนธ์)
-- ============================================================

CREATE TABLE thesis_publications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thesis_id       UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
  publication_id  UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  description     TEXT,            -- หมายเหตุ เช่น 'ผลจากบทที่ 3'
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(thesis_id, publication_id)
);

CREATE INDEX idx_thesis_pub_thesis ON thesis_publications(thesis_id);
CREATE INDEX idx_thesis_pub_publication ON thesis_publications(publication_id);

-- ============================================================
-- 7. VIEWS
-- ============================================================

-- สรุป นศ. + วิทยานิพนธ์ + อาจารย์ที่ปรึกษา
CREATE OR REPLACE VIEW v_student_thesis AS
SELECT
  s.id AS student_id,
  s.student_code,
  s.title_th || s.first_name_th || ' ' || s.last_name_th AS student_name_th,
  COALESCE(s.title_en, '') || ' ' || COALESCE(s.first_name_en, '') || ' ' || COALESCE(s.last_name_en, '') AS student_name_en,
  s.degree_level AS student_degree,
  s.status AS student_status,
  s.researcher_id,
  t.id AS thesis_id,
  t.title_th AS thesis_title_th,
  t.title_en AS thesis_title_en,
  t.status AS thesis_status,
  t.defense_date,
  t.academic_year,
  t.research_area_id,
  -- ชื่ออาจารย์ที่ปรึกษาหลัก
  (
    SELECT r.title_th || r.first_name_th || ' ' || r.last_name_th
    FROM thesis_committee tc
    JOIN researchers r ON r.id = tc.researcher_id
    WHERE tc.thesis_id = t.id AND tc.committee_role = 'main_advisor'
    LIMIT 1
  ) AS main_advisor_th,
  -- จำนวนผลงานตีพิมพ์จากวิทยานิพนธ์
  (
    SELECT COUNT(*) FROM thesis_publications tp WHERE tp.thesis_id = t.id
  ) AS publication_count
FROM students s
LEFT JOIN theses t ON t.student_id = s.id;

-- ภาระงานที่ปรึกษา
CREATE OR REPLACE VIEW v_advisor_workload AS
SELECT
  r.id AS researcher_id,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS advisor_name_th,
  COUNT(DISTINCT tc.thesis_id)
    FILTER (WHERE tc.committee_role = 'main_advisor') AS main_advisor_count,
  COUNT(DISTINCT tc.thesis_id)
    FILTER (WHERE tc.committee_role = 'co_advisor') AS co_advisor_count,
  COUNT(DISTINCT tc.thesis_id)
    FILTER (WHERE tc.committee_role = 'main_advisor'
            AND t.status NOT IN ('completed', 'withdrawn')) AS active_students,
  COUNT(DISTINCT tc.thesis_id)
    FILTER (WHERE tc.committee_role = 'main_advisor'
            AND t.status = 'completed') AS graduated_students
FROM researchers r
LEFT JOIN thesis_committee tc ON tc.researcher_id = r.id
LEFT JOIN theses t ON t.id = tc.thesis_id
GROUP BY r.id;

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read students" ON students FOR SELECT USING (true);
CREATE POLICY "Public read theses" ON theses FOR SELECT USING (true);
CREATE POLICY "Public read thesis_committee" ON thesis_committee FOR SELECT USING (true);
CREATE POLICY "Public read thesis_publications" ON thesis_publications FOR SELECT USING (true);
CREATE POLICY "Public read external_persons" ON external_persons FOR SELECT USING (true);

-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- (ใช้ update_updated_at() จาก 001_schema.sql)
-- ============================================================

CREATE TRIGGER trg_students_updated
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_theses_updated
  BEFORE UPDATE ON theses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_external_persons_updated
  BEFORE UPDATE ON external_persons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
