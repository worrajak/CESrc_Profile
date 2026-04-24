-- ============================================================
-- 036: News Travel Attachments + Workload View
-- เพิ่มฟิลด์เดินทางไปราชการในตาราง news และ view ประเมินภาระงาน
-- ============================================================

-- 1) Add travel/official duty fields to news
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS is_official_travel BOOLEAN DEFAULT false;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_purpose TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_location TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_start_date DATE;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_end_date DATE;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_approval_number TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_approval_doc_url TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_approval_link TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_budget DECIMAL(12,2);

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_funding_source TEXT;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_participants JSONB DEFAULT '[]'::jsonb;
-- Array of researcher_id who participated in the travel

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS travel_activity_type TEXT;
-- Types: conference, seminar, training, field_work, meeting, inspection, exhibition, consulting, other

COMMENT ON COLUMN news.is_official_travel IS 'ข่าวนี้เป็นการเดินทางไปราชการหรือไม่';
COMMENT ON COLUMN news.travel_purpose IS 'วัตถุประสงค์การเดินทาง';
COMMENT ON COLUMN news.travel_location IS 'สถานที่เดินทาง';
COMMENT ON COLUMN news.travel_approval_number IS 'เลขที่หนังสืออนุมัติเดินทาง';
COMMENT ON COLUMN news.travel_approval_doc_url IS 'URL ของไฟล์ PDF หนังสืออนุมัติ';
COMMENT ON COLUMN news.travel_approval_link IS 'ลิงก์ภายนอก (Google Drive, SharePoint ฯลฯ)';
COMMENT ON COLUMN news.travel_budget IS 'งบประมาณการเดินทาง (บาท)';
COMMENT ON COLUMN news.travel_funding_source IS 'แหล่งงบประมาณ เช่น เงินรายได้, ทุนวิจัย ฯลฯ';
COMMENT ON COLUMN news.travel_participants IS 'JSONB array ของ researcher_id ที่ร่วมเดินทาง';
COMMENT ON COLUMN news.travel_activity_type IS 'ประเภทกิจกรรม: conference, seminar, training, field_work, meeting, inspection, exhibition, consulting, other';

-- Indexes for workload queries
CREATE INDEX IF NOT EXISTS idx_news_travel ON news(is_official_travel, travel_start_date DESC) WHERE is_official_travel = true;
CREATE INDEX IF NOT EXISTS idx_news_author_travel ON news(author_id, travel_start_date DESC) WHERE is_official_travel = true;
CREATE INDEX IF NOT EXISTS idx_news_travel_participants ON news USING GIN (travel_participants) WHERE is_official_travel = true;

-- 2) View: researcher_workload — aggregate all activities per researcher
-- ใช้สำหรับการประเมินภาระงาน, เอาไป export เป็น Excel/PDF
CREATE OR REPLACE VIEW v_researcher_workload AS
SELECT
  r.id AS researcher_id,
  r.title_th,
  r.first_name_th,
  r.last_name_th,
  r.unit_role,
  -- Publications
  (
    SELECT COUNT(DISTINCT pa.publication_id)
    FROM publication_authors pa
    WHERE pa.researcher_id = r.id
  ) AS total_publications,
  (
    SELECT COUNT(DISTINCT pa.publication_id)
    FROM publication_authors pa
    JOIN publications p ON p.id = pa.publication_id
    WHERE pa.researcher_id = r.id AND p.year = EXTRACT(YEAR FROM now())::integer
  ) AS publications_this_year,
  -- Citations
  COALESCE(r.cited_by_count, 0) AS total_citations,
  COALESCE(r.h_index, 0) AS h_index,
  -- Grants
  (
    SELECT COUNT(DISTINCT gm.grant_id)
    FROM grant_members gm
    WHERE gm.researcher_id = r.id
  ) AS total_grants,
  (
    SELECT COUNT(DISTINCT gm.grant_id)
    FROM grant_members gm
    JOIN grants g ON g.id = gm.grant_id
    WHERE gm.researcher_id = r.id AND g.status = 'active'
  ) AS active_grants,
  -- Travel (official duty)
  (
    SELECT COUNT(*)
    FROM news n
    WHERE n.is_official_travel = true
      AND (n.author_id = r.id OR n.travel_participants @> to_jsonb(r.id::text))
  ) AS total_travels,
  (
    SELECT COALESCE(SUM(
      CASE
        WHEN n.travel_end_date >= n.travel_start_date
        THEN (n.travel_end_date - n.travel_start_date)::integer + 1
        ELSE 1
      END
    ), 0)
    FROM news n
    WHERE n.is_official_travel = true
      AND (n.author_id = r.id OR n.travel_participants @> to_jsonb(r.id::text))
  ) AS total_travel_days,
  (
    SELECT COUNT(*)
    FROM news n
    WHERE n.is_official_travel = true
      AND (n.author_id = r.id OR n.travel_participants @> to_jsonb(r.id::text))
      AND EXTRACT(YEAR FROM n.travel_start_date) = EXTRACT(YEAR FROM now())
  ) AS travels_this_year,
  (
    SELECT COALESCE(SUM(
      CASE
        WHEN n.travel_end_date >= n.travel_start_date
        THEN (n.travel_end_date - n.travel_start_date)::integer + 1
        ELSE 1
      END
    ), 0)
    FROM news n
    WHERE n.is_official_travel = true
      AND (n.author_id = r.id OR n.travel_participants @> to_jsonb(r.id::text))
      AND EXTRACT(YEAR FROM n.travel_start_date) = EXTRACT(YEAR FROM now())
  ) AS travel_days_this_year,
  -- Training (as instructor)
  (
    SELECT COUNT(*)
    FROM training_courses tc
    WHERE tc.instructor_id = r.id
      OR tc.instructor_ids @> to_jsonb(r.id::text)
  ) AS total_courses_as_instructor,
  -- Academic services
  (
    SELECT COUNT(*)
    FROM service_members sm
    WHERE sm.researcher_id = r.id
  ) AS total_academic_services,
  -- Student supervision
  (
    SELECT COUNT(DISTINCT s.id)
    FROM students s
    WHERE s.advisor_id = r.id
       OR s.co_advisors @> to_jsonb(r.id::text)
  ) AS total_students
FROM researchers r
WHERE r.is_active = true;

COMMENT ON VIEW v_researcher_workload IS 'มุมมองสรุปภาระงานนักวิจัย สำหรับการประเมินและรายงานประจำปี';

-- 3) View: travel_log — detailed travel history with all participants
CREATE OR REPLACE VIEW v_travel_log AS
SELECT
  n.id AS news_id,
  n.title,
  n.content,
  n.travel_purpose,
  n.travel_location,
  n.travel_start_date,
  n.travel_end_date,
  CASE
    WHEN n.travel_end_date >= n.travel_start_date
    THEN (n.travel_end_date - n.travel_start_date)::integer + 1
    ELSE 1
  END AS days,
  n.travel_approval_number,
  n.travel_approval_doc_url,
  n.travel_approval_link,
  n.travel_budget,
  n.travel_funding_source,
  n.travel_activity_type,
  n.author_id AS primary_author_id,
  n.travel_participants,
  n.cover_image_url,
  n.published_at,
  n.category,
  -- Primary author info
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS primary_author_name,
  r.unit_role AS primary_author_role
FROM news n
LEFT JOIN researchers r ON r.id = n.author_id
WHERE n.is_official_travel = true
ORDER BY n.travel_start_date DESC;

COMMENT ON VIEW v_travel_log IS 'บันทึกการเดินทางไปราชการทั้งหมด เรียงจากล่าสุด';
