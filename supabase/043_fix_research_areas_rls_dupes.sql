-- ============================================================
-- 043: Fix research_areas — RLS + Remove duplicates
-- ปัญหา: หน้า /research-areas โชว์ "0 สาขา" แม้ DB มีข้อมูล
-- สาเหตุ:
--   1) RLS ไม่อนุญาต anon SELECT (migration 020 ยังไม่รัน)
--   2) Migration 009 ถูกรันซ้ำ ทำให้มีข้อมูลซ้ำ
-- ============================================================

-- 1) ลบข้อมูลซ้ำ — เก็บเฉพาะแถวแรกของแต่ละ name_en
WITH ranked AS (
  SELECT id, name_en,
    ROW_NUMBER() OVER (PARTITION BY name_en ORDER BY sort_order, id) AS rn
  FROM research_areas
)
DELETE FROM research_areas
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2) เปิด RLS + Public SELECT policy (สำหรับ public page)
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read research_areas" ON research_areas;
CREATE POLICY "Public read research_areas"
  ON research_areas FOR SELECT USING (true);

-- 3) Anon manage policy (สำหรับ admin)
DROP POLICY IF EXISTS "Anon manage research_areas" ON research_areas;
CREATE POLICY "Anon manage research_areas"
  ON research_areas FOR ALL USING (true) WITH CHECK (true);

-- 4) เผื่อ table อื่นที่มีปัญหาคล้ายกัน — ตรวจสอบ news_research_areas
ALTER TABLE IF EXISTS news_research_areas ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read news_research_areas" ON news_research_areas
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5) Verify: ตรวจดูว่ามีข้อมูลกี่แถวหลังลบซ้ำ
DO $$
DECLARE
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM research_areas;
  RAISE NOTICE '✅ Research areas remaining after dedup: %', cnt;
END $$;

-- ============================================================
-- หลังรัน: refresh หน้า /research-areas → ควรแสดงสาขาวิจัยแล้ว
-- ============================================================
