-- ============================================================
-- ระบบเชื่อมโยงข่าว/กิจกรรม กับ งานวิจัย/วิทยานิพนธ์/บริการวิชาการ
-- + ระบบ Dataset (ข้อมูลดิบ) บน GitHub
-- CES-RMUTL Researcher Profile System
-- ============================================================
-- IDEMPOTENT: สามารถ run ซ้ำได้โดยไม่ error
-- ============================================================

-- ============================================================
-- 1. เพิ่ม service_type ใหม่ (เชิงพาณิชย์/รับเหมา)
-- ============================================================

ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'commercial';        -- รับจ้างเชิงพาณิชย์/รับเหมา
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'research_service';  -- บริการวิจัย/ทดสอบตามสัญญา

-- ============================================================
-- 2. NEWS ↔ THESIS (เชื่อมข่าวกับวิทยานิพนธ์)
-- เช่น นศ.ไปทดสอบที่หน้างาน, สอบวิทยานิพนธ์
-- ============================================================

CREATE TABLE IF NOT EXISTS news_theses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id     UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  thesis_id   UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
  description TEXT,              -- หมายเหตุ เช่น 'ทดสอบระบบ PV ที่หน้างาน'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(news_id, thesis_id)
);

CREATE INDEX IF NOT EXISTS idx_news_theses_news ON news_theses(news_id);
CREATE INDEX IF NOT EXISTS idx_news_theses_thesis ON news_theses(thesis_id);

-- ============================================================
-- 3. NEWS ↔ RESEARCH AREA (เชื่อมข่าวกับสาขาวิจัย)
-- ============================================================

CREATE TABLE IF NOT EXISTS news_research_areas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id          UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  research_area_id UUID NOT NULL REFERENCES research_areas(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(news_id, research_area_id)
);

CREATE INDEX IF NOT EXISTS idx_news_ra_news ON news_research_areas(news_id);
CREATE INDEX IF NOT EXISTS idx_news_ra_area ON news_research_areas(research_area_id);

-- ============================================================
-- 4. NEWS ↔ PUBLICATION (เชื่อมข่าวกับผลงานตีพิมพ์)
-- เช่น ข่าวตีพิมพ์บทความ, ข่าวนำเสนอในงานประชุม
-- ============================================================

CREATE TABLE IF NOT EXISTS news_publications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id         UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  publication_id  UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(news_id, publication_id)
);

CREATE INDEX IF NOT EXISTS idx_news_pub_news ON news_publications(news_id);
CREATE INDEX IF NOT EXISTS idx_news_pub_pub ON news_publications(publication_id);

-- ============================================================
-- 5. NEWS ↔ ACADEMIC SERVICE (เชื่อมข่าวกับบริการวิชาการ)
-- เช่น ข่าวไปออกแบบระบบ, ติดตั้งที่หน้างาน, ให้คำปรึกษา
-- ============================================================

CREATE TABLE IF NOT EXISTS news_services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id     UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES academic_services(id) ON DELETE CASCADE,
  description TEXT,              -- เช่น 'ลงพื้นที่สำรวจ', 'ส่งมอบงาน'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(news_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_news_svc_news ON news_services(news_id);
CREATE INDEX IF NOT EXISTS idx_news_svc_service ON news_services(service_id);

-- ============================================================
-- 6. DATASETS (ข้อมูลดิบ — เก็บ metadata, ไฟล์จริงอยู่ใน GitHub)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE dataset_status AS ENUM (
    'draft',        -- กำลังเก็บข้อมูล
    'complete',     -- ข้อมูลครบ พร้อมใช้
    'published',    -- เผยแพร่แล้ว (ใช้ในบทความ)
    'archived'      -- เก็บถาวร
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS datasets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- ข้อมูลทั่วไป
  title           TEXT NOT NULL,           -- ชื่อชุดข้อมูล
  description     TEXT,                    -- รายละเอียด
  -- ที่อยู่ไฟล์บน GitHub
  github_repo     TEXT,                    -- เช่น 'worrajak/CESrc-datasets'
  github_path     TEXT,                    -- เช่น 'solar-pv/site-A/2025-03/'
  github_branch   TEXT DEFAULT 'main',
  -- ข้อมูลเชิงเทคนิค
  file_format     TEXT,                    -- เช่น 'CSV', 'JSON', 'HDF5'
  file_count      INTEGER DEFAULT 1,
  total_size_mb   DECIMAL(10,2),           -- ขนาดรวม (MB)
  data_columns    TEXT[],                  -- คอลัมน์ข้อมูล เช่น {'timestamp','voltage','current','power'}
  sampling_rate   TEXT,                    -- เช่น '1 min', '15 min', '1 hour'
  date_range_start DATE,                   -- ช่วงเวลาข้อมูล
  date_range_end   DATE,
  -- เชื่อมกับงาน
  thesis_id       UUID REFERENCES theses(id) ON DELETE SET NULL,
  research_area_id UUID REFERENCES research_areas(id) ON DELETE SET NULL,
  -- สถานะ
  status          dataset_status NOT NULL DEFAULT 'draft',
  -- ใครเก็บ
  collector_id    UUID REFERENCES researchers(id) ON DELETE SET NULL,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datasets_thesis ON datasets(thesis_id) WHERE thesis_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_datasets_area ON datasets(research_area_id) WHERE research_area_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);

-- ============================================================
-- 7. DATASET ↔ PUBLICATION (ข้อมูลดิบที่ใช้ในบทความ)
-- ============================================================

CREATE TABLE IF NOT EXISTS dataset_publications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id      UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  publication_id  UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  usage_note      TEXT,           -- เช่น 'ใช้ใน Fig.3 และ Table 2'
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dataset_id, publication_id)
);

CREATE INDEX IF NOT EXISTS idx_ds_pub_dataset ON dataset_publications(dataset_id);
CREATE INDEX IF NOT EXISTS idx_ds_pub_pub ON dataset_publications(publication_id);

-- ============================================================
-- 8. DATASET ↔ NEWS (ข้อมูลที่เก็บจากกิจกรรม)
-- ============================================================

CREATE TABLE IF NOT EXISTS dataset_news (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id  UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  news_id     UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  description TEXT,              -- เช่น 'ข้อมูลที่เก็บระหว่างลงพื้นที่'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dataset_id, news_id)
);

CREATE INDEX IF NOT EXISTS idx_ds_news_dataset ON dataset_news(dataset_id);
CREATE INDEX IF NOT EXISTS idx_ds_news_news ON dataset_news(news_id);

-- ============================================================
-- 9. RLS (idempotent — ซ้ำได้ไม่ error)
-- ============================================================

ALTER TABLE news_theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_news ENABLE ROW LEVEL SECURITY;

-- Public read (DROP IF EXISTS + CREATE)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read news_theses" ON news_theses;
  CREATE POLICY "Public read news_theses" ON news_theses FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read news_research_areas" ON news_research_areas;
  CREATE POLICY "Public read news_research_areas" ON news_research_areas FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read news_publications" ON news_publications;
  CREATE POLICY "Public read news_publications" ON news_publications FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read news_services" ON news_services;
  CREATE POLICY "Public read news_services" ON news_services FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read datasets" ON datasets;
  CREATE POLICY "Public read datasets" ON datasets FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read dataset_publications" ON dataset_publications;
  CREATE POLICY "Public read dataset_publications" ON dataset_publications FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public read dataset_news" ON dataset_news;
  CREATE POLICY "Public read dataset_news" ON dataset_news FOR SELECT USING (true);
END $$;

-- Allow write (DROP IF EXISTS + CREATE)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow insert news_theses" ON news_theses;
  CREATE POLICY "Allow insert news_theses" ON news_theses FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update news_theses" ON news_theses;
  CREATE POLICY "Allow update news_theses" ON news_theses FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete news_theses" ON news_theses;
  CREATE POLICY "Allow delete news_theses" ON news_theses FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert news_research_areas" ON news_research_areas;
  CREATE POLICY "Allow insert news_research_areas" ON news_research_areas FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update news_research_areas" ON news_research_areas;
  CREATE POLICY "Allow update news_research_areas" ON news_research_areas FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete news_research_areas" ON news_research_areas;
  CREATE POLICY "Allow delete news_research_areas" ON news_research_areas FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert news_publications" ON news_publications;
  CREATE POLICY "Allow insert news_publications" ON news_publications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update news_publications" ON news_publications;
  CREATE POLICY "Allow update news_publications" ON news_publications FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete news_publications" ON news_publications;
  CREATE POLICY "Allow delete news_publications" ON news_publications FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert news_services" ON news_services;
  CREATE POLICY "Allow insert news_services" ON news_services FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update news_services" ON news_services;
  CREATE POLICY "Allow update news_services" ON news_services FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete news_services" ON news_services;
  CREATE POLICY "Allow delete news_services" ON news_services FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert datasets" ON datasets;
  CREATE POLICY "Allow insert datasets" ON datasets FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update datasets" ON datasets;
  CREATE POLICY "Allow update datasets" ON datasets FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete datasets" ON datasets;
  CREATE POLICY "Allow delete datasets" ON datasets FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert dataset_publications" ON dataset_publications;
  CREATE POLICY "Allow insert dataset_publications" ON dataset_publications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update dataset_publications" ON dataset_publications;
  CREATE POLICY "Allow update dataset_publications" ON dataset_publications FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete dataset_publications" ON dataset_publications;
  CREATE POLICY "Allow delete dataset_publications" ON dataset_publications FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Allow insert dataset_news" ON dataset_news;
  CREATE POLICY "Allow insert dataset_news" ON dataset_news FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update dataset_news" ON dataset_news;
  CREATE POLICY "Allow update dataset_news" ON dataset_news FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete dataset_news" ON dataset_news;
  CREATE POLICY "Allow delete dataset_news" ON dataset_news FOR DELETE USING (true);
END $$;

-- ============================================================
-- 10. UPDATED_AT TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS trg_datasets_updated ON datasets;
CREATE TRIGGER trg_datasets_updated
  BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. VIEW: ภาพรวมข่าว + ความเชื่อมโยงทั้งหมด
-- ============================================================

CREATE OR REPLACE VIEW v_news_connections AS
SELECT
  n.id AS news_id,
  n.title,
  n.category,
  n.published_at,
  -- จำนวนเชื่อมโยงแต่ละประเภท
  (SELECT COUNT(*) FROM news_theses nt WHERE nt.news_id = n.id) AS thesis_count,
  (SELECT COUNT(*) FROM news_research_areas nra WHERE nra.news_id = n.id) AS research_area_count,
  (SELECT COUNT(*) FROM news_publications np WHERE np.news_id = n.id) AS publication_count,
  (SELECT COUNT(*) FROM news_services ns WHERE ns.news_id = n.id) AS service_count,
  (SELECT COUNT(*) FROM dataset_news dn WHERE dn.news_id = n.id) AS dataset_count,
  (SELECT COUNT(*) FROM news_images ni WHERE ni.news_id = n.id) AS image_count
FROM news n
WHERE n.is_published = true
ORDER BY n.published_at DESC;

-- ============================================================
-- 12. VIEW: Dataset ภาพรวม + เชื่อมโยง
-- ============================================================

CREATE OR REPLACE VIEW v_dataset_overview AS
SELECT
  d.id AS dataset_id,
  d.title,
  d.description,
  d.github_repo,
  d.github_path,
  d.file_format,
  d.status,
  d.date_range_start,
  d.date_range_end,
  -- วิทยานิพนธ์
  t.title_th AS thesis_title,
  -- สาขาวิจัย
  ra.name_th AS research_area,
  -- ผู้เก็บข้อมูล
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS collector_name,
  -- จำนวนบทความที่ใช้ข้อมูลนี้
  (SELECT COUNT(*) FROM dataset_publications dp WHERE dp.dataset_id = d.id) AS used_in_publications,
  -- จำนวนข่าวที่เกี่ยวข้อง
  (SELECT COUNT(*) FROM dataset_news dn WHERE dn.dataset_id = d.id) AS related_news_count
FROM datasets d
LEFT JOIN theses t ON t.id = d.thesis_id
LEFT JOIN research_areas ra ON ra.id = d.research_area_id
LEFT JOIN researchers r ON r.id = d.collector_id;
