-- ============================================================
-- แก้ไขข้อมูลผู้แต่ง — ตรวจสอบจาก DOI/CrossRef API
-- วันที่ตรวจสอบ: 2026-03-28
-- ============================================================

-- ============================================================
-- PUB-4: Energies 2023 (10.3390/en16217388)
-- Varied-Frequency CC-CV Inductive Wireless Power Transfer
-- ผู้แต่งจริง: Thongpron, Kamnarn, Namin, Sriprom, Chaidee,
--   Janjornmanit, Yachiangkam, Karnjanapiboon, Thounthong, Takorabet
-- ❌ DB เดิมมี Yousawat, Tippachon, Oranpiroj, Somsak ซึ่งไม่ใช่ผู้แต่ง
-- ============================================================
UPDATE publications
SET authors_raw = 'J. Thongpron, U. Kamnarn, A. Namin, T. Sriprom, E. Chaidee, S. Janjornmanit, S. Yachiangkam, C. Karnjanapiboon, P. Thounthong, and N. Takorabet'
WHERE id = 'b0000001-0000-0000-0000-000000000004';

-- ลบผู้แต่งที่ไม่ถูกต้อง
DELETE FROM publication_authors
WHERE publication_id = 'b0000001-0000-0000-0000-000000000004'
  AND researcher_id IN (
    'a0000001-0000-0000-0000-000000000004',  -- Tippachon (ไม่ใช่ผู้แต่ง)
    'a0000001-0000-0000-0000-000000000003',  -- Oranpiroj (ไม่ใช่ผู้แต่ง)
    'a0000001-0000-0000-0000-000000000002'   -- Somsak (ไม่ใช่ผู้แต่ง)
  );

-- แก้ลำดับ Namin เป็น 3
UPDATE publication_authors
SET author_order = 3
WHERE publication_id = 'b0000001-0000-0000-0000-000000000004'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000007';

-- ============================================================
-- PUB-401: JJAP 2025 (10.35848/1347-4065/add600)
-- A comparison of circuit models for PERT N-type bifacial solar cells
-- ผู้แต่งจริง: Wiratsiri[1], Namin[2], Muangjai[3], Nakaiam[4],
--   Panlawan[5], Somsak[6], Thongpron[7]
-- ============================================================
UPDATE publications
SET authors_raw = 'P. Wiratsiri, A. Namin, W. Muangjai, K. Nakaiam, N. Panlawan, T. Somsak, and J. Thongpron'
WHERE id = 'b0000001-0000-0000-0000-000000000401';

-- แก้ Panlawan จาก first_author เป็น co_author order 5
UPDATE publication_authors
SET author_role = 'co_author', author_order = 5, is_corresponding = false
WHERE publication_id = 'b0000001-0000-0000-0000-000000000401'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000012';

-- เพิ่มสมาชิก CESRU ที่หายไป
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000007', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000009', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000013', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000002', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000001', 'last_author', 7, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- PUB-402: JJAP 2025 (10.35848/1347-4065/addf58)
-- A techno-economic analysis of a 48 V mini shuttle
-- ผู้แต่งจริง: Srasuay[1], Thongpron[2], Namin[3], Nakaiam[4],
--   Panlawan[5], Ngaodet[6], Muangjai[7], Somsak[8], Patcharaprakiti[9]
-- ============================================================
UPDATE publications
SET authors_raw = 'K. Srasuay, J. Thongpron, A. Namin, K. Nakaiam, N. Panlawan, M. Ngaodet, W. Muangjai, T. Somsak, and N. Patcharaprakiti'
WHERE id = 'b0000001-0000-0000-0000-000000000402';

-- แก้ Panlawan จาก first_author เป็น co_author order 5
UPDATE publication_authors
SET author_role = 'co_author', author_order = 5, is_corresponding = false
WHERE publication_id = 'b0000001-0000-0000-0000-000000000402'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000012';

-- เพิ่มสมาชิก CESRU ที่หายไป
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000013', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000008', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000009', 'co_author', 7, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000002', 'co_author', 8, false),
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000005', 'last_author', 9, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- PUB-403: GTSD 2024 (10.1109/GTSD62346.2024.10674878)
-- IoT and Peer-to-peer wildfire detection
-- ผู้แต่งจริง: Panlawan[1], Somsak[2], Thongpron[3], Muangjai[4],
--   Ngaodet[5], Assanavijit[6], Thanin[7], Sungkham[8],
--   Oranpiroj[9], Patcharaprakiti[10], P.Somsak[11], Nakaiam[12]
-- ============================================================
UPDATE publications
SET authors_raw = 'N. Panlawan, T. Somsak, J. Thongpron, W. Muangjai, M. Ngaodet, V. Assanavijit, P. Thanin, S. Sungkham, K. Oranpiroj, N. Patcharaprakiti, P. Somsak, and K. Nakaiam'
WHERE id = 'b0000001-0000-0000-0000-000000000403';

-- เพิ่มสมาชิก CESRU ที่หายไป (Panlawan order 1 มีอยู่แล้ว)
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000002', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000009', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000008', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000003', 'co_author', 9, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000005', 'co_author', 10, false),
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000013', 'last_author', 12, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- PUB-404: GTSD 2024 (10.1109/GTSD62346.2024.10675241)
-- Study on Temperature Effects of Batteries for LEO satellites
-- ผู้แต่งจริง: Somsak[1], Sriyoaruean[2], Ngaodet[3], Thongpron[4],
--   Namin[5], Patcharaprakiti[6], Yousawat[7], Muangjai[8],
--   Nakaiam[9], Panlawan[10], Khampangkaew[11], Srasuay[12]
-- ============================================================
UPDATE publications
SET authors_raw = 'T. Somsak, N. Sriyoaruean, M. Ngaodet, J. Thongpron, A. Namin, N. Patcharaprakiti, S. Yousawat, W. Muangjai, K. Nakaiam, N. Panlawan, N. Khampangkaew, and K. Srasuay'
WHERE id = 'b0000001-0000-0000-0000-000000000404';

-- แก้ Panlawan จาก first_author เป็น co_author order 10
UPDATE publication_authors
SET author_role = 'co_author', author_order = 10, is_corresponding = false
WHERE publication_id = 'b0000001-0000-0000-0000-000000000404'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000012';

-- เพิ่มสมาชิก CESRU ที่หายไป
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000008', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000007', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000005', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000009', 'co_author', 8, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000013', 'co_author', 9, false),
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000014', 'co_author', 11, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- PUB-405: iEECON 2022 (10.1109/iEECON53204.2022.9741700)
-- Economic and Sensitivity Analyses for Optimal Hybrid Power
-- ผู้แต่งจริง: Jeenthanom[1], Saelao[2], Muangjai[3],
--   Thongpron[4], Panlawan[5], Somsak[6]
-- ============================================================
UPDATE publications
SET authors_raw = 'P. Jeenthanom, J. Saelao, W. Muangjai, J. Thongpron, N. Panlawan, and T. Somsak'
WHERE id = 'b0000001-0000-0000-0000-000000000405';

-- แก้ Panlawan จาก first_author เป็น co_author order 5
UPDATE publication_authors
SET author_role = 'co_author', author_order = 5, is_corresponding = false
WHERE publication_id = 'b0000001-0000-0000-0000-000000000405'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000012';

-- เพิ่มสมาชิก CESRU ที่หายไป
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000405', 'a0000001-0000-0000-0000-000000000009', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000405', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000405', 'a0000001-0000-0000-0000-000000000002', 'last_author', 6, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- PUB-406: ECTI-CON 2021 (10.1109/ECTI-CON51831.2021.9454755)
-- Critical Implications of Longterm IoT Applications
-- ผู้แต่งจริง: Muangjai[1], Somsak[2], Panlawan[3], Aroonchai[4],
--   Jeenthanom[5], Nakaiam[6], Thongpron[7], Ngaodet[8],
--   Oranpiroj[9], Thanin[10]
-- ============================================================
UPDATE publications
SET authors_raw = 'W. Muangjai, T. Somsak, N. Panlawan, T. Aroonchai, P. Jeenthanom, K. Nakaiam, J. Thongpron, M. Ngaodet, K. Oranpiroj, and P. Thanin'
WHERE id = 'b0000001-0000-0000-0000-000000000406';

-- แก้ Panlawan จาก first_author เป็น co_author order 3
UPDATE publication_authors
SET author_role = 'co_author', author_order = 3, is_corresponding = false
WHERE publication_id = 'b0000001-0000-0000-0000-000000000406'
  AND researcher_id = 'a0000001-0000-0000-0000-000000000012';

-- เพิ่มสมาชิก CESRU ที่หายไป
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000002', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000013', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000001', 'co_author', 7, false),
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000008', 'co_author', 8, false),
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000003', 'co_author', 9, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;
