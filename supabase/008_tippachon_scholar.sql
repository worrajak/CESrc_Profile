-- ============================================================
-- ผศ.ดร.วิวัฒน์ ทิพจร (Asst.Prof.Dr. Wiwat Tippachon)
-- Google Scholar: user=CllFDxIAAAAJ
-- Researcher ID: a0000001-0000-0000-0000-000000000004
-- ============================================================

-- Update profile
UPDATE researchers
SET
  google_scholar = 'https://scholar.google.co.th/citations?user=CllFDxIAAAAJ',
  expertise = ARRAY['Power Distribution System Protection', 'Ant Colony Optimization', 'Failure Analysis', 'Induction Motor', 'Wireless Power Transfer', 'IoT Systems'],
  bio_th = 'ผู้ช่วยศาสตราจารย์ สาขาวิชาวิศวกรรมไฟฟ้า มทร.ล้านนา ผู้เชี่ยวชาญด้านระบบป้องกันไฟฟ้า การวิเคราะห์ความเสียหาย และ Ant Colony Optimization Google Scholar: Citations 192+',
  bio_en = 'Assistant Professor, Electrical Engineering, RMUTL. Expert in Power Distribution Protection, Failure Analysis, Ant Colony Optimization. Google Scholar: 192+ citations'
WHERE id = 'a0000001-0000-0000-0000-000000000004';

-- ============================================================
-- NEW PUBLICATIONS — International Journals
-- ============================================================

-- [WT-1] 2009 — Multiobjective optimal placement (192 citations!) Journal
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000060',
  'Multiobjective optimal placement of switches and protective devices in electric power distribution systems using ant colony optimization',
  'journal_international', 'published',
  'Electric Power Systems Research',
  '79', '7', 'pp. 1171-1178', 2009,
  'W. Tippachon, D. Rerkpreedapong',
  true, true,
  ARRAY['ant colony optimization', 'protective devices', 'switches', 'power distribution', 'multiobjective']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000060', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- ============================================================
-- NEW PUBLICATIONS — International Conferences
-- ============================================================

-- [WT-2] 2011 — Failure statistics transformer maintenance (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000061',
  'Failure statistics and condition evaluation for power transformer maintenance',
  'conference_international', 'published',
  '2011 Asia-Pacific Power and Energy Engineering Conference (APPEEC)',
  'pp. 1-4', 2011,
  'E. Chaidee, W. Tippachon',
  true, true,
  ARRAY['failure statistics', 'power transformer', 'condition evaluation', 'maintenance']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000061', 'a0000001-0000-0000-0000-000000000004', 'last_author', 2, false);

-- [WT-3] 2021 — Block UU shape ferrite cores WPT (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000062',
  'A prototype of block UU shape ferrite cores inductive wireless power transfer for EV charger',
  'conference_international', 'published',
  '2021 18th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2021,
  'T. Somsak, A. Namin, W. Tammawan, J. Thongpron, W. Tippachon, K. Oranpiroj, et al.',
  true, true,
  ARRAY['ferrite cores', 'UU shape', 'wireless power transfer', 'EV charger']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000007', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000004', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000003', 'co_author', 6, false);

-- [WT-4] 2006 — Failure analysis protective devices (TENCON Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000063',
  'Failure analysis of protective devices in power distribution systems for reliability purpose',
  'conference_international', 'published',
  'TENCON 2006 - 2006 IEEE Region 10 Conference',
  'pp. 1-4', 2006,
  'W. Tippachon, R. Boonruang, S. Boonpun, C. Khamtang, N. Klairuang, et al.',
  true, true,
  ARRAY['failure analysis', 'protective devices', 'power distribution', 'reliability']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000063', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- [WT-5] 2006 — Failure mode distribution transformers Thailand (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000064',
  'Failure mode distribution of transformers in Thailand',
  'conference_international', 'published',
  '2006 International Conference on Power System Technology (POWERCON)',
  'pp. 1-5', 2006,
  'W. Tippachon, N. Klairuang, T. Khatsaeng, N. Teera-achariyakul, J. Hokierti',
  true, true,
  ARRAY['failure mode', 'transformer', 'Thailand', 'power system']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000064', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- [WT-6] 2006 — Failure analysis power distribution Thailand (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000065',
  'Failure analysis of power distribution systems in Thailand',
  'conference_international', 'published',
  '2006 International Conference on Power System Technology (POWERCON)',
  'pp. 1-5', 2006,
  'W. Tippachon, A. Kwansawaitham, N. Klairuang, D. Rerkpreedapong, et al.',
  true, true,
  ARRAY['failure analysis', 'power distribution', 'Thailand']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000065', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- [WT-7] 2018 — IoT system for icehouse manufacturing (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000066',
  'The design of IoT system for icehouse manufacturing',
  'conference_international', 'published',
  '2018 5th International Conference on Business and Industrial Research (ICBIR)',
  2018,
  'A. Yodjaiphet, W. Tippachon',
  true,
  ARRAY['IoT', 'icehouse', 'manufacturing', 'monitoring']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000066', 'a0000001-0000-0000-0000-000000000004', 'last_author', 2, false);

-- [WT-8] 2024 — Analysis Optimization Loss Induction Heating (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000067',
  'Analysis for Optimization Loss of Induction Heating',
  'conference_international', 'published',
  '2024 International Conference on Materials and Energy: Energy in Electrical Engineering',
  2024,
  'T. Hongtong, W. Tammawan, T. Thammapanya, W. Tippachon, T. Pussadee, et al.',
  true,
  ARRAY['induction heating', 'optimization', 'loss analysis']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000067', 'a0000001-0000-0000-0000-000000000004', 'co_author', 4, false);

-- [WT-9] 2024 — LED Lamps Growing Chrysanthemum (ECTI-CON Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000068',
  'Development of Lighting from LED Lamps for Growing Chrysanthemum Flowers',
  'conference_international', 'published',
  '2024 21st International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2024,
  'T. Thammapanya, P. Jansuya, T. Hongthong, W. Thammawan, W. Tippachon, et al.',
  true,
  ARRAY['LED lamps', 'chrysanthemum', 'lighting', 'agriculture']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000068', 'a0000001-0000-0000-0000-000000000004', 'co_author', 5, false);

-- [WT-10] 2024 — Water Pumping DC Motor Full Bridge (ECTI-CON Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000069',
  'Water Pumping System Using DC Motor Pump with Full Bridge Converter',
  'conference_international', 'published',
  '2024 21st International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2024,
  'P. Jansuya, T. Thammapanya, T. Hongtong, W. Tippachon, C. Takeang, et al.',
  true,
  ARRAY['water pumping', 'DC motor', 'full bridge converter']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000069', 'a0000001-0000-0000-0000-000000000004', 'co_author', 4, false);

-- [WT-11] 2017 — Current Only Directional Relay (GMSARN Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000070',
  'Current Only Directional Relay by Positive-Sequence Current Detecting',
  'conference_international', 'published',
  '12th GMSARN International Conference 2017',
  'E-51', 2017,
  'W. Tippachon, T. Pussadee',
  ARRAY['directional relay', 'positive-sequence current', 'protection']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000070', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- ============================================================
-- NATIONAL PUBLICATIONS (Thai journals)
-- ============================================================

-- [WT-12] 2018 — การลดการประสานสัมพันธ์ที่ผิดพลาด (วารสาร มศว)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, tci_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000071',
  'การลดการประสานสัมพันธ์ที่ผิดพลาดของรีเลย์ป้องกันกระแสเกินแบบมีทิศทางด้วยขั้นตอนวิธีมีมีติก',
  'journal_national', 'published',
  'วารสารวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ',
  '13', '2', 'pp. 1-11', 2018,
  'เฉลิมวุฒิ แก้วตา, วิวัฒน์ ทิพจร, อนุสรณ์ ยอดใจเพ็ชร, สมนึก หม่อโป๊ะกู่',
  true,
  ARRAY['directional overcurrent relay', 'memetic algorithm', 'coordination']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000071', 'a0000001-0000-0000-0000-000000000004', 'co_author', 2, false);

-- [WT-13] 2018 — มีมีติกอัลกอริทึมเพื่อประมาณค่าพารามิเตอร์มอเตอร์ (วารสาร มนร)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, tci_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000072',
  'การประยุกต์ใช้มีมีติกอัลกอริทึมเพื่อประมาณค่าพารามิเตอร์ของมอเตอร์เหนี่ยวนำ',
  'journal_national', 'published',
  'วิศวกรรมสาร มหาวิทยาลัยนเรศวร',
  '13', '1', 'pp. 43-52', 2018,
  'วิวัฒน์ ทิพจร',
  true,
  ARRAY['memetic algorithm', 'parameter estimation', 'induction motor']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000072', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1, true);

-- [WT-14] 2018 — ประเมินประสิทธิภาพมอเตอร์ bacteria foraging (วารสาร มทร.อีสาน)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, tci_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000073',
  'การประเมินประสิทธิภาพมอเตอร์ไฟฟ้าเหนี่ยวนำขณะใช้งานด้วยการหาค่าเหมาะสมที่สุดแบบการหาอาหารของแบคทีเรียแบบปรับตัวเอง',
  'journal_national', 'published',
  'วารสาร มทร.อีสาน',
  '11', '1', 'pp. 44-56', 2018,
  'ณัฐดนัย เลิศชมภู, กิตติพงศ ตั๋นเมือง, อนุสรณ ยอดใจเพ็ชร, วิวัฒน์ ทิพจร',
  true,
  ARRAY['bacteria foraging optimization', 'induction motor', 'efficiency evaluation']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000073', 'a0000001-0000-0000-0000-000000000004', 'last_author', 4, false);

-- [WT-15] 2018 — ประเมินประสิทธิภาพมอเตอร์ genetic algorithm (พะเยาวิจัย)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, pages, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000074',
  'การประเมินประสิทธิภาพมอเตอร์เหนี่ยวนำสามเฟสขณะใช้งาน ภายใต้สภาวะแรงดันไม่สมดุล ด้วยวิธีเชิงพันธุกรรมแบบหลายวัตถุประสงค์',
  'conference_national', 'published',
  'การประชุมทางวิชาการระดับชาติ พะเยาวิจัย ครั้งที่ 7',
  '7', 'pp. 817-829', 2018,
  'ธีระวัฒน์ ผุสดี, กฤษดา ทัศกานิเวศน์, อนันต์ชัย ขอเตชะ, วิวัฒน์ ทิพจร',
  ARRAY['genetic algorithm', 'multiobjective', 'induction motor', 'voltage unbalance']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000074', 'a0000001-0000-0000-0000-000000000004', 'last_author', 4, false);
