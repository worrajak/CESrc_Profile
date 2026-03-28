-- ============================================================
-- เพิ่มสมาชิกใหม่ 3 คน จาก ORCID
-- ============================================================

-- 1. Nattawat Panlawan
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, scopus_id, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000012',
  'อาจารย์', 'ณัฐวัฒน์', 'พัลวัล',
  'Lect.', 'Nattawat', 'Panlawan',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'nattawat@rmutl.ac.th',
  '0009-0004-3109-1328',
  '57226840899',
  ARRAY['Solar Cell Simulation', 'IoT Systems', 'Hybrid Power Systems', 'Battery Technology', 'Wildfire Detection']
);

-- 2. Kan Nakaiam
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000013',
  'อาจารย์', 'กัญจน์', 'นาคเอี่ยม',
  'Lect.', 'Kan', 'Nakaiam',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'Kannakaiam@rmutl.ac.th',
  '0009-0003-0273-8922',
  ARRAY['Electrical Engineering']
);

-- 3. Naris Khampangkaew
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000014',
  'อาจารย์', 'นริศ', 'กำแพงแก้ว',
  'Lect.', 'Naris', 'Khampangkaew',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'naris@rmutl.ac.th',
  '0009-0002-7344-2902',
  ARRAY['Electrical Engineering']
);

-- ============================================================
-- ผลงาน Nattawat Panlawan จาก ORCID (6 เรื่อง)
-- ============================================================

-- [NP-1] PERT N-type bifacial solar cells circuit models (JJAP 2025)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000401',
  'A comparison of circuit models for simulating PERT N-type bifacial solar cells',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics', 2025,
  '10.35848/1347-4065/add600',
  'N. Panlawan et al.',
  true,
  ARRAY['bifacial solar cell', 'PERT', 'N-type', 'circuit model', 'simulation']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- [NP-2] Techno-economic 48V mini shuttle with solar (JJAP 2025)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000402',
  'A techno-economic analysis of a 48 V mini shuttle with solar systems',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics', 2025,
  '10.35848/1347-4065/addf58',
  'N. Panlawan et al.',
  true,
  ARRAY['mini shuttle', '48V', 'solar system', 'techno-economic', 'electric vehicle']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- [NP-3] IoT Peer-to-peer wildfire detection (GTSD 2024, IEEE)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000403',
  'IoT and Peer-to-peer Signal Notification Methods for wildfire detection',
  'conference_international', 'published',
  'IEEE Green Technologies for Sustainable Development (GTSD 2024)', 2024,
  '10.1109/GTSD62346.2024.10674878',
  'N. Panlawan et al.',
  true,
  ARRAY['IoT', 'peer-to-peer', 'wildfire detection', 'notification', 'sensor']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000403', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- [NP-4] Battery temperature effects for LEO satellites (GTSD 2024, IEEE)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000404',
  'Study on Temperature Effects of Batteries for LEO satellites',
  'conference_international', 'published',
  'IEEE Green Technologies for Sustainable Development (GTSD 2024)', 2024,
  '10.1109/GTSD62346.2024.10675241',
  'N. Panlawan et al.',
  true,
  ARRAY['battery', 'temperature', 'LEO satellite', 'space technology']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000404', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- [NP-5] Optimal Hybrid power systems economic analysis (iEECON 2022, IEEE)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000405',
  'Economic and Sensitivity Analyses for an Optimal Hybrid power systems',
  'conference_international', 'published',
  '10th International Electrical Engineering Congress (iEECON 2022)', 2022,
  '10.1109/iEECON53204.2022.9741700',
  'N. Panlawan et al.',
  true,
  ARRAY['hybrid power', 'economic analysis', 'sensitivity analysis', 'renewable energy']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000405', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- [NP-6] Critical implications of longterm IoT applications (ECTI-CON 2021, IEEE)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000406',
  'Critical implications of longterm IoT applications',
  'conference_international', 'published',
  '18th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON 2021)', 2021,
  '10.1109/ECTI-CON51831.2021.9454755',
  'N. Panlawan et al.',
  true,
  ARRAY['IoT', 'long-term applications', 'critical implications']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000406', 'a0000001-0000-0000-0000-000000000012', 'first_author', 1, true);

-- ============================================================
-- เชื่อมโยง Kan Nakaiam กับ PVSEC-36 ที่มีชื่ออยู่แล้ว
-- (PVSEC-4 และ PVSEC-5)
-- ============================================================
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000013', 'co_author', 7, false),
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000013', 'co_author', 5, false);
