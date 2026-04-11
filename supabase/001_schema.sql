-- ============================================================
-- CES-RMUTL Researcher Profile System
-- Supabase SQL Schema v3.0
-- Clean Energy System Research Unit (CESRU)
-- Rajamangala University of Technology Lanna (RMUTL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. RESEARCHERS (สมาชิกหน่วยวิจัย)
-- ============================================================
CREATE TYPE researcher_role AS ENUM ('head', 'member', 'advisor');
CREATE TYPE academic_title AS ENUM (
  'ศ.ดร.', 'รศ.ดร.', 'ผศ.ดร.', 'ผศ.', 'ดร.', 'อาจารย์',
  'Prof.Dr.', 'Assoc.Prof.Dr.', 'Asst.Prof.Dr.', 'Asst.Prof.', 'Dr.', 'Lect.'
);

CREATE TABLE researchers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Thai name
  title_th      TEXT NOT NULL,               -- 'ผศ.ดร.'
  first_name_th TEXT NOT NULL,               -- 'ธีระศักดิ์'
  last_name_th  TEXT NOT NULL,               -- 'สมศักดิ์'
  -- English name
  title_en      TEXT,                        -- 'Asst.Prof.Dr.'
  first_name_en TEXT,                        -- 'Teerasak'
  last_name_en  TEXT,                        -- 'Somsak'
  -- Roles & affiliation
  unit_role     researcher_role NOT NULL DEFAULT 'member',
  position_th   TEXT,                        -- 'หัวหน้าหน่วยวิจัยฯ'
  position_en   TEXT,                        -- 'Head of Research Unit'
  department    TEXT DEFAULT 'Division of Electrical Engineering',
  faculty       TEXT DEFAULT 'Faculty of Engineering',
  university    TEXT DEFAULT 'Rajamangala University of Technology Lanna',
  campus        TEXT DEFAULT 'Chiang Mai',
  -- Contact
  email         TEXT,
  phone         TEXT,
  orcid_id      TEXT,
  scopus_id     TEXT,
  google_scholar TEXT,
  website       TEXT,
  -- Research expertise
  expertise     TEXT[],                      -- array of research areas
  bio_th        TEXT,
  bio_en        TEXT,
  -- Avatar
  avatar_url    TEXT,
  -- Metadata
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_researchers_role ON researchers(unit_role);
CREATE INDEX idx_researchers_name ON researchers(last_name_en, first_name_en);

-- ============================================================
-- 2. PUBLICATIONS (ผลงานตีพิมพ์)
-- ============================================================
CREATE TYPE publication_type AS ENUM (
  'journal_international',   -- วารสารนานาชาติ
  'journal_national',        -- วารสารในประเทศ
  'conference_international', -- ประชุมวิชาการนานาชาติ
  'conference_national',      -- ประชุมวิชาการในประเทศ
  'book_chapter',            -- บทในหนังสือ
  'book',                    -- หนังสือ/ตำรา
  'patent',                  -- สิทธิบัตร
  'petty_patent',            -- อนุสิทธิบัตร
  'thesis',                  -- วิทยานิพนธ์
  'technical_report'         -- รายงานวิจัย
);

CREATE TYPE publication_status AS ENUM (
  'published', 'accepted', 'in_press', 'submitted', 'draft'
);

CREATE TABLE publications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  title_th        TEXT,                     -- ชื่อภาษาไทย (ถ้ามี)
  pub_type        publication_type NOT NULL,
  status          publication_status DEFAULT 'published',
  -- Journal/Conference info
  journal_name    TEXT,                     -- ชื่อวารสาร/การประชุม
  volume          TEXT,
  issue           TEXT,
  pages           TEXT,                     -- 'pp. 1-10'
  year            INTEGER NOT NULL,
  month           INTEGER,
  -- Identifiers
  doi             TEXT,
  isbn            TEXT,
  issn            TEXT,
  url             TEXT,
  -- Indexing
  scopus_indexed  BOOLEAN DEFAULT false,
  wos_indexed     BOOLEAN DEFAULT false,    -- Web of Science
  tci_indexed     BOOLEAN DEFAULT false,    -- Thai-Journal Citation Index
  impact_factor   DECIMAL(6,3),
  quartile        TEXT,                     -- 'Q1', 'Q2', etc.
  -- Patent specific
  patent_number   TEXT,
  patent_date     DATE,
  -- Full author string (original order)
  authors_raw     TEXT NOT NULL,            -- 'T. Somsak, J. Thongpron, and K. Olarnpaiprojn'
  -- Abstract
  abstract        TEXT,
  keywords        TEXT[],
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_publications_year ON publications(year DESC);
CREATE INDEX idx_publications_type ON publications(pub_type);
CREATE INDEX idx_publications_doi ON publications(doi) WHERE doi IS NOT NULL;

-- ============================================================
-- 3. PUBLICATION AUTHORS (ความสัมพันธ์ นักวิจัย <-> ผลงาน)
-- ============================================================
CREATE TYPE author_role AS ENUM (
  'first_author',           -- ผู้แต่งลำดับแรก
  'corresponding_author',   -- ผู้รับผิดชอบบทความ
  'co_author',              -- ผู้แต่งร่วม
  'last_author'             -- ผู้แต่งลำดับสุดท้าย (มักเป็น senior/advisor)
);

CREATE TABLE publication_authors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id  UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  researcher_id   UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  author_role     author_role NOT NULL DEFAULT 'co_author',
  author_order    INTEGER NOT NULL,         -- ลำดับในรายชื่อผู้แต่ง (1, 2, 3, ...)
  is_corresponding BOOLEAN DEFAULT false,   -- flag เพิ่มเติมสำหรับ corresponding
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(publication_id, researcher_id),
  UNIQUE(publication_id, author_order)
);

CREATE INDEX idx_pub_authors_researcher ON publication_authors(researcher_id);
CREATE INDEX idx_pub_authors_role ON publication_authors(author_role);

-- ============================================================
-- 4. GRANTS / RESEARCH PROJECTS (ทุนวิจัย/โครงการวิจัย)
-- ============================================================
CREATE TYPE grant_status AS ENUM (
  'active', 'completed', 'pending', 'cancelled'
);

CREATE TYPE grant_role AS ENUM (
  'pi',           -- Principal Investigator (หัวหน้าโครงการ)
  'co_pi',        -- Co-PI (ผู้ร่วมโครงการ)
  'researcher',   -- นักวิจัย
  'consultant'    -- ที่ปรึกษา
);

CREATE TABLE grants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_th        TEXT NOT NULL,            -- ชื่อโครงการภาษาไทย
  title_en        TEXT,                     -- ชื่อโครงการภาษาอังกฤษ
  contract_number TEXT,                     -- เลขที่สัญญา
  -- Funding
  funding_agency  TEXT NOT NULL,            -- แหล่งทุน (เช่น กฟผ., บพข.)
  funding_agency_en TEXT,                   -- English name
  budget          DECIMAL(15,2),            -- งบประมาณ (บาท)
  budget_currency TEXT DEFAULT 'THB',
  -- Duration
  start_date      DATE,
  end_date        DATE,
  fiscal_year     INTEGER,                  -- ปีงบประมาณ (พ.ศ.)
  -- Status
  status          grant_status DEFAULT 'completed',
  -- Description
  description_th  TEXT,
  description_en  TEXT,
  -- Research area tags
  research_areas  TEXT[],
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_year ON grants(fiscal_year DESC);
CREATE INDEX idx_grants_agency ON grants(funding_agency);

-- ============================================================
-- 5. GRANT MEMBERS (สมาชิกโครงการวิจัย)
-- ============================================================
CREATE TABLE grant_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id        UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  researcher_id   UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  role            grant_role NOT NULL DEFAULT 'researcher',
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(grant_id, researcher_id)
);

CREATE INDEX idx_grant_members_researcher ON grant_members(researcher_id);

-- ============================================================
-- 6. PATENTS & INNOVATIONS (สิทธิบัตร/อนุสิทธิบัตร)
-- ============================================================
CREATE TYPE patent_type AS ENUM ('patent', 'petty_patent', 'copyright', 'trade_secret');
CREATE TYPE patent_status AS ENUM ('filed', 'pending', 'granted', 'expired', 'rejected');

CREATE TABLE patents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_th        TEXT NOT NULL,
  title_en        TEXT,
  patent_type     patent_type NOT NULL,
  status          patent_status DEFAULT 'granted',
  application_no  TEXT,                     -- เลขที่คำขอ
  patent_no       TEXT,                     -- เลขที่สิทธิบัตร
  filing_date     DATE,
  grant_date      DATE,
  -- Description
  abstract_th     TEXT,
  abstract_en     TEXT,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patent_inventors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patent_id       UUID NOT NULL REFERENCES patents(id) ON DELETE CASCADE,
  researcher_id   UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  inventor_order  INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patent_id, researcher_id)
);

-- ============================================================
-- 7. RESEARCH AREAS (สาขาวิจัย)
-- ============================================================
CREATE TABLE research_areas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_th  TEXT,
  description_en  TEXT,
  parent_id       UUID REFERENCES research_areas(id),  -- hierarchical
  icon            TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. ACADEMIC SERVICES (บริการวิชาการ)
-- ============================================================
CREATE TYPE service_type AS ENUM (
  'consulting',       -- ที่ปรึกษา
  'training',         -- อบรม
  'design_install',   -- ออกแบบและติดตั้ง
  'inspection',       -- ตรวจสอบ
  'testing'           -- ทดสอบ
);

CREATE TABLE academic_services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_th        TEXT NOT NULL,
  title_en        TEXT,
  service_type    service_type NOT NULL,
  client          TEXT,                     -- หน่วยงานผู้รับบริการ
  description_th  TEXT,
  description_en  TEXT,
  capacity        TEXT,                     -- e.g. '45 kW', '3.3 kW'
  system_type     TEXT,                     -- e.g. 'On-Grid', 'Off-Grid', 'Hybrid'
  location        TEXT,
  start_date      DATE,
  end_date        DATE,
  budget          DECIMAL(15,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE service_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id      UUID NOT NULL REFERENCES academic_services(id) ON DELETE CASCADE,
  researcher_id   UUID NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, researcher_id)
);

-- ============================================================
-- 9. VIEWS (มุมมองสรุปข้อมูล)
-- ============================================================

-- Researcher profile summary view
CREATE OR REPLACE VIEW v_researcher_profile AS
SELECT
  r.id,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS full_name_th,
  COALESCE(r.title_en, '') || COALESCE(r.first_name_en, '') || ' ' || COALESCE(r.last_name_en, '') AS full_name_en,
  r.unit_role,
  r.expertise,
  r.email,
  r.orcid_id,
  -- Publication counts
  COUNT(DISTINCT pa.publication_id) FILTER (WHERE p.pub_type IN ('journal_international','journal_national')) AS journal_count,
  COUNT(DISTINCT pa.publication_id) FILTER (WHERE p.pub_type IN ('conference_international','conference_national')) AS conference_count,
  COUNT(DISTINCT pa.publication_id) FILTER (WHERE pa.author_role = 'first_author') AS first_author_count,
  COUNT(DISTINCT pa.publication_id) FILTER (WHERE pa.is_corresponding = true) AS corresponding_count,
  -- Grant counts
  COUNT(DISTINCT gm.grant_id) AS grant_count,
  COUNT(DISTINCT gm.grant_id) FILTER (WHERE gm.role = 'pi') AS pi_count
FROM researchers r
LEFT JOIN publication_authors pa ON pa.researcher_id = r.id
LEFT JOIN publications p ON p.id = pa.publication_id
LEFT JOIN grant_members gm ON gm.researcher_id = r.id
GROUP BY r.id;

-- Publications with author roles for a specific researcher
CREATE OR REPLACE VIEW v_publication_with_roles AS
SELECT
  pa.researcher_id,
  p.*,
  pa.author_role,
  pa.author_order,
  pa.is_corresponding,
  CASE
    WHEN pa.author_role = 'first_author' THEN 'First Author'
    WHEN pa.is_corresponding = true THEN 'Corresponding Author'
    WHEN pa.author_role = 'last_author' THEN 'Last Author'
    ELSE 'Co-Author'
  END AS role_display
FROM publication_authors pa
JOIN publications p ON p.id = pa.publication_id
ORDER BY p.year DESC, pa.author_order;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patents ENABLE ROW LEVEL SECURITY;

-- Public read access (profile is public)
CREATE POLICY "Public read researchers" ON researchers FOR SELECT USING (true);
CREATE POLICY "Public read publications" ON publications FOR SELECT USING (true);
CREATE POLICY "Public read pub_authors" ON publication_authors FOR SELECT USING (true);
CREATE POLICY "Public read grants" ON grants FOR SELECT USING (true);
CREATE POLICY "Public read grant_members" ON grant_members FOR SELECT USING (true);
CREATE POLICY "Public read patents" ON patents FOR SELECT USING (true);

-- ============================================================
-- 11. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_researchers_updated
  BEFORE UPDATE ON researchers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_publications_updated
  BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_grants_updated
  BEFORE UPDATE ON grants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patents_updated
  BEFORE UPDATE ON patents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
