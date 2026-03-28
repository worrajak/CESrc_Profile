-- ============================================================
-- แก้ข้อมูลผู้แต่ง Energies 2025 (PUB-2) — Khlong Ruea
-- ผู้แต่งจริง: M. Ngao-det, J. Thongpron, A. Namin,
--   N. Patcharaprakiti, W. Muangjai, T. Somsak*
-- ============================================================

-- 1. Update authors_raw
UPDATE publications
SET authors_raw = 'M. Ngao-det, J. Thongpron, A. Namin, N. Patcharaprakiti, W. Muangjai, and T. Somsak'
WHERE id = 'b0000001-0000-0000-0000-000000000002';

-- 2. ลบ Kosal Oranpiroj และ Wiwat Tippachon (ไม่ได้เป็นผู้แต่ง)
DELETE FROM publication_authors
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id IN (
    'a0000001-0000-0000-0000-000000000003',  -- Kosal
    'a0000001-0000-0000-0000-000000000004'   -- Wiwat
  );

-- 3. แก้ลำดับผู้แต่งให้ตรงกับบทความจริง
-- Montri (008) = 1, first_author
UPDATE publication_authors
SET author_order = 1, author_role = 'first_author'
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000008';

-- Thongpron (001) = 2
UPDATE publication_authors
SET author_order = 2, author_role = 'co_author'
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000001';

-- Namin (007) = 3
UPDATE publication_authors
SET author_order = 3, author_role = 'co_author'
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000007';

-- Patcharaprakiti (005) = 4
UPDATE publication_authors
SET author_order = 4, author_role = 'co_author'
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000005';

-- 4. เพิ่ม Worrajak Muangjai (009) = 5
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding)
VALUES ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5, false)
ON CONFLICT (publication_id, researcher_id) DO UPDATE
SET author_order = 5, author_role = 'co_author';

-- Teerasak Somsak (002) = 6, corresponding author
UPDATE publication_authors
SET author_order = 6, author_role = 'last_author', is_corresponding = true
WHERE publication_id = 'b0000001-0000-0000-0000-000000000002'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000002';
