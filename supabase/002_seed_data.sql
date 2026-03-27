-- ============================================================
-- CES-RMUTL Seed Data — VERIFIED DATA ONLY
-- แหล่งข้อมูล: 2568 CESRU Profiles.pdf + Google Scholar/Scopus/DOI
-- หมายเหตุ: ข้อมูลทุกรายการผ่านการตรวจสอบจากแหล่งจริง
-- ข้อมูลที่ยังไม่ยืนยันจะใส่ NULL ไม่ใส่ข้อมูลสมมติ
-- ============================================================

-- ============================================================
-- 1. RESEARCHERS (จาก PDF หน้า 3 — แผนผังองค์กร)
-- ============================================================

-- Advisor (ที่ปรึกษา — ไม่ใช่สมาชิก)
INSERT INTO researchers (id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, unit_role, position_th, position_en, department, faculty, university, campus, expertise)
VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'รศ.ดร.', 'จัตตุฤทธิ์', 'ทองปรอน',
  'Assoc.Prof.Dr.', 'Juttrit', 'Thongpron',
  'advisor',
  'ที่ปรึกษาหน่วยวิจัยฯ', 'Research Unit Advisor',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Photovoltaic Systems', 'Solar Cell Characterization', 'Wireless Power Transfer', 'EV Charging']
);

-- Head (หัวหน้าหน่วยฯ)
INSERT INTO researchers (id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, unit_role, position_th, position_en, department, faculty, university, campus, expertise)
VALUES (
  'a0000001-0000-0000-0000-000000000002',
  'ผศ.ดร.', 'ธีระศักดิ์', 'สมศักดิ์',
  'Asst.Prof.Dr.', 'Teerasak', 'Somsak',
  'head',
  'หัวหน้าหน่วยวิจัยระบบพลังงานสะอาด', 'Head of Clean Energy System Research Unit',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Solar Energy Systems', 'Battery Energy Storage', 'Demand Side Management', 'Microgrid', 'Community Development']
);

-- Members (สมาชิก — 8 คนที่เหลือ)
INSERT INTO researchers (id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, unit_role, department, faculty, university, campus, expertise)
VALUES
(
  'a0000001-0000-0000-0000-000000000003',
  'รศ.ดร.', 'โกศล', 'โอฬารไพโรจน์',
  'Assoc.Prof.Dr.', 'Kosal', 'Oranpiroj',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Power Electronics', 'Electric Vehicles', 'Wireless Power Transfer']
),
(
  'a0000001-0000-0000-0000-000000000004',
  'ผศ.ดร.', 'วิวัฒน์', 'ทิพจร',
  'Asst.Prof.Dr.', 'Wiwat', 'Tippachon',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Electrical Engineering', 'Wireless Power Transfer']
),
(
  'a0000001-0000-0000-0000-000000000005',
  'ผศ.ดร.', 'นพพร', 'พัชรประกิติ',
  'Asst.Prof.Dr.', 'Nopporn', 'Patcharaprakiti',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['PV Grid-Connected Inverters', 'MPPT', 'Fuzzy Logic Control', 'Power Quality']
),
(
  'a0000001-0000-0000-0000-000000000006',
  'ดร.', 'รัตนพล', 'พรหมวัน ณ อยุธยา',
  'Dr.', 'Rattanapol', 'Promwan Na Ayutthaya',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Electrical Engineering']
),
(
  'a0000001-0000-0000-0000-000000000007',
  'ผศ.ดร.', 'อนนท์', 'นำอิน',
  'Asst.Prof.Dr.', 'Anon', 'Namin',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Solar Simulators', 'Wireless Power Transfer', 'EV Wireless Charging', 'Solar Cell Testing']
),
(
  'a0000001-0000-0000-0000-000000000008',
  'ผศ.', 'มนตรี', 'เงาเดช',
  'Asst.Prof.', 'Montri', 'Ngaodech',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Electrical Engineering']
),
(
  'a0000001-0000-0000-0000-000000000009',
  'ผศ.ดร.', 'วรจักร์', 'เมืองใจ',
  'Asst.Prof.Dr.', 'Worajak', 'Muangjai',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['IoT Systems', 'Smart Meter', 'Energy Monitoring', 'Smart Grid', 'NB-IoT', 'LoRaWAN']
),
(
  'a0000001-0000-0000-0000-000000000010',
  'อาจารย์', 'เกษม', 'ตรีภาค',
  'Lect.', 'Kasem', 'Treepak',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  ARRAY['Electrical Engineering']
);

-- ============================================================
-- 2. PUBLICATIONS — VERIFIED จาก Google Scholar / Scopus / DOI
-- เฉพาะข้อมูลที่ยืนยันได้จากฐานข้อมูลวิชาการจริงเท่านั้น
-- ============================================================

-- [PUB-1] ECTI Trans. 2022 — Wireless Power Transfer for EV
-- ที่มา: DOI 10.37936/ecti-eec.2022201.246108
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000001',
  'A 10 kW Inductive Wireless Power Transfer Prototype for EV Charging in Thailand',
  'journal_international', 'published',
  'ECTI Transactions on Electrical Engineering, Electronics, and Communications',
  '20', '1', 'pp. 83-95', 2022,
  '10.37936/ecti-eec.2022201.246108',
  'J. Thongpron, W. Tammawan, T. Somsak, W. Tippachon, K. Oranpiroj, E. Chaidee, and A. Namin',
  true,
  ARRAY['wireless power transfer', 'EV charging', 'inductive coupling', '10 kW']
);

-- [PUB-2] Energies 2025 — 100% Renewable Microgrid Khlong Ruea
-- ที่มา: DOI 10.3390/en18071628
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000002',
  'Systematic Optimize and Cost-Effective Design of a 100% Renewable Microgrid Hybrid System for Sustainable Rural Electrification in Khlong Ruea, Thailand',
  'journal_international', 'published',
  'Energies',
  '18', '7', '1628', 2025,
  '10.3390/en18071628',
  -- NOTE: ใส่ "et al." เพราะยังไม่ได้ยืนยัน full author list จากบทความจริง
  'T. Somsak et al.',
  true, true,
  ARRAY['microgrid', 'renewable energy', '100% renewable', 'rural electrification', 'Khlong Ruea']
);

-- [PUB-3] Int. J. Photoenergy 2012 — Solar Simulators
-- ที่มา: DOI 10.1155/2012/527820
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, pages, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000003',
  'Construction of Tungsten Halogen, Pulsed LED, and Combined Tungsten Halogen-LED Solar Simulators for Solar Cell I-V Characterization and Electrical Parameters Determination',
  'journal_international', 'published',
  'International Journal of Photoenergy',
  '2012', 'Article ID 527820, 9 pages', 2012,
  '10.1155/2012/527820',
  'A. Namin, C. Jivacate, D. Chenvidhya, K. Kirtikara, and J. Thongpron',
  true, true,
  ARRAY['solar simulator', 'solar cell', 'I-V characterization', 'LED']
);

-- [PUB-4] Energies 2023 — WPT CC-CV EV Golf Cart
-- ที่มา: DOI 10.3390/en16217388
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000004',
  'Varied-Frequency CC-CV Inductive Wireless Power Transfer with Efficiency-Regulated EV Charging for an Electric Golf Cart',
  'journal_international', 'published',
  'Energies',
  '16', '21', '7388', 2023,
  '10.3390/en16217388',
  -- NOTE: ใส่ "et al." เพราะยังไม่ได้ยืนยัน full author list จากบทความจริง
  'A. Namin et al.',
  true, true,
  ARRAY['wireless power transfer', 'CC-CV charging', 'electric golf cart', 'varied frequency']
);

-- [PUB-5] Renewable Energy 2005 — MPPT Fuzzy Logic (Nopporn)
-- ที่มา: ScienceDirect / Elsevier
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000005',
  'Maximum power point tracking using adaptive fuzzy logic control for grid-connected photovoltaic system',
  'journal_international', 'published',
  'Renewable Energy',
  '30', '11', 'pp. 1771-1788', 2005,
  'N. Patcharaprakiti, S. Premrudeepreechacharn, and Y. Sriuthaisiriwong',
  true, true,
  ARRAY['MPPT', 'fuzzy logic', 'photovoltaic', 'grid-connected']
);

-- [PUB-6] IntechOpen Book Chapter 2011
-- ที่มา: IntechOpen (open access, verified)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000006',
  'Modeling of Photovoltaic Grid Connected Inverters Based on Nonlinear System Identification for Power Quality Analysis',
  'book_chapter', 'published',
  'Electrical Generation and Distribution Systems and Power Quality Disturbances (IntechOpen)',
  2011,
  'N. Patcharaprakiti, K. Kirtikara, K. Tunlasakun, J. Thongpron, D. Chenvidhya, A. Sangswang, V. Monyakul, and B. Muenpinij',
  true,
  ARRAY['PV inverter', 'nonlinear system identification', 'power quality', 'grid-connected']
);

-- ============================================================
-- 3. PUBLICATION AUTHORS — ตาม author order จริงจากบทความ
-- ============================================================

-- PUB-1: ECTI 2022 (7 authors: Thongpron[1], Tammawan[2], Somsak[3], Tippachon[4], Oranpiroj[5], Chaidee[6], Namin[7])
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000007', 'last_author', 7, false);

-- PUB-3: Int. J. Photoenergy 2012 (Namin[1], Jivacate[2], Chenvidhya[3], Kirtikara[4], Thongpron[5])
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'last_author', 5, false);

-- PUB-5: Renewable Energy 2005 (Patcharaprakiti[1], Premrudeepreechacharn[2], Sriuthaisiriwong[3])
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false);

-- PUB-6: IntechOpen 2011 (Patcharaprakiti[1], ... Thongpron[4] ...)
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false);

-- ============================================================
-- 4. GRANTS — VERIFIED จาก PDF
-- ============================================================

-- Grant 1: EGAT Battery DSM (PDF p.8, สัญญาเลขที่ชัดเจน)
INSERT INTO grants (id, title_th, title_en, contract_number, funding_agency, funding_agency_en, budget, start_date, end_date, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'การศึกษาแนวทางการบริหารจัดการความต้องการการใช้ไฟฟ้าด้วยระบบแบตเตอรี่ในระดับครัวเรือนในประเทศไทย',
  'Study of Demand Side Management with Home Battery Systems in Thailand',
  '61-K102000-11-IO.SS03K3008333',
  'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'Electricity Generating Authority of Thailand (EGAT)',
  6932792.00, '2018-03-01', '2019-02-28', 2561, 'completed',
  ARRAY['battery energy storage', 'demand side management', 'household']
);

-- Grant 2: ห้วยต้า (PDF p.16)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, start_date, end_date, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000002',
  'การศึกษาแนวทางการพัฒนาชุมชนบ้านห้วยต้าแบบมีส่วนร่วมอย่างยั่งยืน',
  'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'Electricity Generating Authority of Thailand (EGAT)',
  '2019-10-01', '2020-09-30', 2562, 'completed',
  ARRAY['community development', 'sustainable development']
);

-- Grant 3: Mae Moh Electrocoagulation (PDF p.30)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, status, research_areas, description_th)
VALUES (
  'c0000001-0000-0000-0000-000000000003',
  'การลดค่าผลรวมของแข็งละลายน้ำในน้ำทิ้งจากการทำเหมืองแร่ลิกไนต์แม่เมาะด้วยวิธีตกตะกอนทางไฟฟ้าพลังงานแสงอาทิตย์',
  'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'Electricity Generating Authority of Thailand (EGAT)',
  4321714.52, 'completed',
  ARRAY['electrocoagulation', 'water treatment', 'solar energy', 'Mae Moh'],
  'ระยะเวลาดำเนินการ 15 เดือน'
);

-- Grant 4: คลองเรือโมเดล (PDF p.22)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000004',
  'การศึกษารูปแบบการพัฒนาด้านพลังงานเพื่อชุมชนบ้านคลองเรือแบบมีส่วนร่วมอย่างยั่งยืน (คลองเรือโมเดล)',
  'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'Electricity Generating Authority of Thailand (EGAT)',
  'completed',
  ARRAY['community development', 'renewable energy', 'microgrid', 'Khlong Ruea']
);

-- Grant 5: EV Wireless Charger (PDF p.40, หัวหน้า: อนนท์ นำอิน)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000005',
  'โครงการพัฒนาสถานีอัดประจุแบตเตอรี่ยานยนต์ไฟฟ้าแบบไร้สาย',
  'กระทรวงพลังงาน', 'Ministry of Energy',
  3800000.00, 'completed',
  ARRAY['EV wireless charging', 'wireless power transfer', 'charging station']
);

-- Grant 6: EV Charging Chiang Rai (PDF p.45)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, status, research_areas, description_th)
VALUES (
  'c0000001-0000-0000-0000-000000000006',
  'โครงการรับการสนับสนุนติดตั้งสถานีอัดประจุยานยนต์ไฟฟ้า (เชียงราย)',
  'กระทรวงพลังงาน / สมาคมยานยนต์ไฟฟ้าไทย (EVAT)',
  'Ministry of Energy / Electric Vehicle Association of Thailand (EVAT)',
  'completed',
  ARRAY['EV charging station', 'Chiang Rai'],
  'พิกัด 22 kW 380 V, Nissan Leaf 40 kWh, เวลาอัดประจุไม่ถึง 2 ชม.'
);

-- ============================================================
-- 5. GRANT MEMBERS — ตามข้อมูลจาก PDF ที่ระบุชื่อชัดเจน
-- ============================================================
INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'pi'),
('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'pi'),
('c0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000007', 'pi');

-- ============================================================
-- 6. RESEARCH AREAS (จาก PDF p.5)
-- ============================================================
INSERT INTO research_areas (name_th, name_en, sort_order) VALUES
('พลังงานแสงอาทิตย์และ Solar Rooftop', 'Solar Energy & Solar Rooftop', 1),
('ระบบกักเก็บพลังงานแบตเตอรี่', 'Battery Energy Storage Systems', 2),
('ยานยนต์ไฟฟ้าและสถานีอัดประจุ', 'Electric Vehicles & Charging Stations', 3),
('การส่งกำลังไฟฟ้าไร้สาย', 'Wireless Power Transfer', 4),
('ไมโครกริดและพลังงานชุมชน', 'Microgrid & Community Energy', 5),
('การบำบัดน้ำด้วยวิธีตกตะกอนทางไฟฟ้า', 'Electrocoagulation Water Treatment', 6),
('IoT และ Smart Meter', 'IoT & Smart Metering', 7),
('อาคารอัจฉริยะและประหยัดพลังงาน', 'Smart Building & Energy Conservation', 8),
('การพัฒนาชุมชนอย่างยั่งยืน', 'Sustainable Community Development', 9);

-- ============================================================
-- 7. ACADEMIC SERVICES (จาก CES Site Reference PDF)
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location) VALUES
('Solar Rooftop 3.3 kW เชียงใหม่', 'Solar Rooftop 3.3 kW Chiang Mai', 'design_install', '3.3 kW', 'On-Grid', 'Chiang Mai, Thailand'),
('Solar Rooftop 3.3 kW ลำพูน', 'Solar Rooftop 3.3 kW Lamphun', 'design_install', '3.3 kW', 'On-Grid', 'Lamphun, Thailand'),
('Solar Rooftop 5 kW เชียงใหม่', 'Solar Rooftop 5 kW Chiang Mai', 'design_install', '5 kW', 'On-Grid', 'Chiang Mai, Thailand'),
('Solar Rooftop 6 kW เชียงใหม่', 'Solar Rooftop 6 kW Chiang Mai', 'design_install', '6 kW', 'On-Grid', 'Chiang Mai, Thailand'),
('Solar Rooftop 12 kW เชียงใหม่', 'Solar Rooftop 12 kW Chiang Mai', 'design_install', '12 kW', 'On-Grid', 'Chiang Mai, Thailand'),
('Solar Rooftop 45 kW มทร.ล้านนา', 'Solar Rooftop 45 kW RMUTL', 'design_install', '45 kW', 'On-Grid', 'Rajamangala University of Technology Lanna'),
('Solar Rooftop 23 kW มทร.ธัญบุรี', 'Solar Rooftop 23 kW RMUTT', 'design_install', '23 kW', 'On-Grid', 'Rajamangala University of Technology Thanyaburi'),
('Solar Rooftop 6 kW Farm Story Coffee', 'Solar Rooftop 6 kW Farm Story House Coffee Shop', 'design_install', '6 kW', 'On-Grid', 'Farm Story House Coffee Shop');

-- ============================================================
-- DATA VERIFICATION NOTES (หมายเหตุข้อมูลที่ยังต้องยืนยัน)
-- ============================================================
-- ข้อมูลที่ยังไม่ได้ใส่เพราะยังไม่ยืนยัน:
-- 1. สิทธิบัตร/อนุสิทธิบัตร — ไม่พบในฐานข้อมูล DIP ผ่าน web search
-- 2. ORCID / Scopus ID / Google Scholar ID — ต้องให้สมาชิกยืนยัน
-- 3. Email สมาชิก — ต้องให้สมาชิกยืนยัน (ยกเว้น worrajak@gmail.com จาก PDF p.47)
-- 4. Full author list ของ PUB-2 (Energies 2025) และ PUB-4 (Energies 2023)
--    ใส่ "et al." เพราะต้องเปิดบทความจริงเพื่อยืนยัน
-- 5. Worajak มี 23 publications + 53 citations ใน ResearchGate
--    แต่ไม่สามารถดึงรายละเอียดแต่ละบทความจาก web search
-- 6. ที่ปรึกษากระทรวงการคลัง เลขที่ 807/2561 (PDF p.4) — ยืนยันจาก PDF
