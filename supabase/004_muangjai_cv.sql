-- ============================================================
-- ผศ.ดร.วรจักร์ เมืองใจ (Asst.Prof.Dr. Worrajak Muangjai)
-- CV Data from 2025-03-05_CV-JakRev1-DB.pdf + Google Scholar
-- Researcher ID: a0000001-0000-0000-0000-000000000009
-- ============================================================

-- ============================================================
-- 1. UPDATE RESEARCHER PROFILE
-- ============================================================
UPDATE researchers
SET
  email = 'worrajak@gmail.com',
  phone = '08-9631-1424',
  google_scholar = 'https://scholar.google.com/citations?user=Worrajak_Muangjai',
  expertise = ARRAY[
    'Microcontroller',
    'Converter & Power Electronics',
    'Power Quality',
    'Automation System',
    'IoT Systems',
    'Smart Meter',
    'Energy Monitoring',
    'Smart Grid',
    'NB-IoT',
    'LoRaWAN'
  ],
  bio_th = 'ผู้ช่วยศาสตราจารย์ประจำสาขาวิชาวิศวกรรมไฟฟ้า คณะวิศวกรรมศาสตร์ มทร.ล้านนา ผู้อำนวยการสถาบันถ่ายทอดเทคโนโลยีสู่ชุมชน จบการศึกษา วศ.ด.วิศวกรรมไฟฟ้า มหาวิทยาลัยเชียงใหม่ Google Scholar: Citations 66, h-index 6, i10-index 3',
  bio_en = 'Assistant Professor, Division of Electrical Engineering, Faculty of Engineering, RMUTL. Director of Technology Transfer to Community Institute. Ph.D. in Electrical Engineering, Chiang Mai University. Google Scholar: Citations 66, h-index 6, i10-index 3'
WHERE id = 'a0000001-0000-0000-0000-000000000009';

-- ============================================================
-- 2. PUBLICATIONS — International Journals & Conferences (verified)
-- ============================================================

-- [WJ-1] Advanced Science Letters 2013 — Carrier-Based 3D Space Vector PWM
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000020',
  'An Apply Implementation of a Carrier-Based Three-Dimensional Space Vector PWM Technique for Three-Phase Four-Leg Voltage Sag Generator with Microcontroller',
  'journal_international', 'published',
  'Advanced Science Letters',
  '19', '5', 'pp. 1249-1254', 2013,
  'W. Muangjai, S. Premrudeepreechacharn, and K. Oranpiroj',
  true, true,
  ARRAY['space vector PWM', 'voltage sag generator', 'microcontroller', 'three-phase four-leg']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000003', 'last_author', 3, false);

-- [WJ-2] Advanced Science Letters 2013 — 3-Phase 4-Leg 4-Wire Voltage Sag Compensator
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000021',
  'A 3-Phase 4-Leg 4-Wire Voltage Sag Compensator Based on Three Dimensional Space Vector Modulation in abc Coordinates',
  'journal_international', 'published',
  'Advanced Science Letters',
  '19', '5', 'pp. 1330-1335', 2013,
  'K. Oranpiroj, K., et al.',
  true, true,
  ARRAY['voltage sag compensator', 'space vector modulation', 'three-phase', 'power quality']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000009', 'co_author', 4, false);

-- [WJ-3] Scientific Research and Essays 2011 — 3-phase 4-wire voltage sag generator
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000022',
  'Development of the 3-phase 4-wire voltage sag generator',
  'journal_international', 'published',
  'Scientific Research and Essays',
  '6', '23', 'pp. 4960-4974', 2011,
  'K. Oranpiroj, K., et al.',
  true,
  ARRAY['voltage sag generator', 'three-phase', 'power quality']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000009', 'co_author', 3, false);

-- [WJ-4] IEEE ISIE 2009 — 3-phase 4-wire voltage sag generator (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000023',
  'The 3-phase 4-wire voltage sag generator based on three dimensions space vector modulation in abc coordinates',
  'conference_international', 'published',
  '2009 IEEE International Symposium on Industrial Electronics (ISIE)',
  'pp. 275-280', 2009,
  'K. Oranpiroj, S. Premrudeepreechacharn, M. Ngoudech, W. Muangjai',
  true, true,
  ARRAY['voltage sag generator', 'space vector modulation', 'IEEE']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000009', 'last_author', 4, false);

-- [WJ-5] IEEE ICIEA 2009 — Carrier-based 3D space vector PWM (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000024',
  'Implementation of a carrier-based three-dimensional space vector PWM technique for three-phase four-leg voltage source converter with microcontroller',
  'conference_international', 'published',
  '2009 4th IEEE Conference on Industrial Electronics and Applications (ICIEA)',
  'pp. 837-841', 2009,
  'W. Muangjai, and S. Premrudeepreechacharn',
  true, true,
  ARRAY['space vector PWM', 'voltage source converter', 'microcontroller', 'IEEE']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false);

-- [WJ-6] IEEE PEDS 2013 — PWM for Voltage Sag Generator (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000025',
  'An Implementation Algorithm of a Carrier-Based PWM Technique for Three-Phase Four-Leg Voltage Sag Generator with Microcontroller',
  'conference_international', 'published',
  '2013 IEEE 10th International Conference on Power Electronics and Drive Systems (PEDS)',
  2013,
  'W. Muangjai, S. Premrudeepreechacharn, K. Higuchi, K. Oranpiroj, W. Jantee',
  true, true,
  ARRAY['PWM technique', 'voltage sag generator', 'microcontroller', 'power electronics']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4, false);

-- [WJ-7] UPEC 2010 — Distributed solar controller (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000026',
  'Design and implementation of a distributed solar controller using modular buck converter with maximum power point tracking',
  'conference_international', 'published',
  '2010 45th International Universities Power Engineering Conference (UPEC)',
  'pp. 1-6', 2010,
  'U. Kamnarn, S. Yousawat, S. Sreata, W. Muangjai, T. Somsak',
  true, true,
  ARRAY['distributed solar controller', 'buck converter', 'MPPT', 'photovoltaic']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000026', 'a0000001-0000-0000-0000-000000000009', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000026', 'a0000001-0000-0000-0000-000000000002', 'last_author', 5, false);

-- [WJ-8] ICPSE 2017 — Over Current Relays (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000027',
  'The Proper Coordination of Over Current Relays and Directional Over Current Relays for 24 kV Power Distribution Network',
  'conference_international', 'published',
  'The ICPSE 2017: 19th International Conference on Power Systems Engineering, Tokyo, Japan',
  2017,
  'N. Khattijit, K. Oranpiroj, W. Muangjai',
  true,
  ARRAY['over current relays', 'power distribution network', 'protection coordination']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000027', 'a0000001-0000-0000-0000-000000000003', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000027', 'a0000001-0000-0000-0000-000000000009', 'last_author', 3, false);

-- [WJ-9] GMSARN 2019 — Solar Home Battery DSM (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000028',
  'A Solar Home Battery Energy Storage for Demand Response Management',
  'conference_international', 'published',
  'GMSARN International Conference on Smart Energy, Environment, and Development for Sustainable GMS',
  2019,
  'J. Thongpron, W. Muangjai, T. Somsak, and N. Patcharaprakiti',
  true,
  ARRAY['solar home battery', 'energy storage', 'demand response management']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000028', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000028', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000028', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000028', 'a0000001-0000-0000-0000-000000000005', 'last_author', 4, false);

-- [WJ-10] GMSARN 2019 — Intelligent Appliance Direct Load Control (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000029',
  'An Intelligent Appliance Direct load control Classification for Residential Customer Demand Response Management',
  'conference_international', 'published',
  'GMSARN International Conference on Smart Energy, Environment, and Development for Sustainable GMS',
  2019,
  'N. Patcharaprakiti, W. Muangjai, and J. Saelao',
  true,
  ARRAY['demand response', 'direct load control', 'smart appliance', 'residential']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000029', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000029', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2, false);

-- [WJ-11] ECTI-CON 2021 — IoT Applications Thailand (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000030',
  'Critical Implications of Longterm IoT Applications in Thailand',
  'conference_international', 'published',
  '2021 18th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  'pp. 751-754', 2021,
  'W. Muangjai, T. Somsak, T. Panlawan, N. Aroonchai, T. Jeenthanom, P. Nak-iam, K., ... and P. Thanin',
  true, true,
  ARRAY['IoT', 'long-term applications', 'Thailand', 'smart energy']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000030', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000030', 'a0000001-0000-0000-0000-000000000002', 'co_author', 2, false);

-- [WJ-12] iEECON 2022 — LiFePO4 batteries BMS (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000031',
  'Analysis of the effect of charge and discharged LiFePO4 batteries using BMS with and without Active balancer',
  'conference_international', 'published',
  '2022 International Electrical Engineering Congress (iEECON)',
  2022,
  'W. Muangjai et al.',
  true, true,
  ARRAY['LiFePO4', 'battery management system', 'active balancer', 'charge discharge']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000031', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, false);

-- [WJ-13] iEECON 2022 — Solar Simulator Characteristics (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000032',
  'Characteristics of Steady-state, Pulse, and Programmable of Tungsten Halogen Solar Simulator',
  'conference_international', 'published',
  '2022 International Electrical Engineering Congress (iEECON)',
  'pp. 1-4', 2022,
  'S. Yachiangkam, S. Sriprom, T. Muangjai, W. Tammawan, W. Tippachon, W. Oranpiroj, K., ... and A. Namin',
  true, true,
  ARRAY['solar simulator', 'tungsten halogen', 'steady-state', 'pulse']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000009', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000004', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000003', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000007', 'last_author', 8, false);

-- [WJ-14] iEECON 2022 — PV Pumping System (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000033',
  'An Experiment approach of Low Radiation Energy Management for Photovoltaic Pumping system',
  'conference_international', 'published',
  '2022 International Electrical Engineering Congress (iEECON)',
  'pp. 1-4', 2022,
  'W. Aiaoheng, W. Jinakran, T. Muangjai, W. Thongpron, J., and T. Somsak',
  true, true,
  ARRAY['photovoltaic pumping', 'low radiation', 'energy management']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000033', 'a0000001-0000-0000-0000-000000000009', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000033', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000033', 'a0000001-0000-0000-0000-000000000002', 'last_author', 5, false);

-- [WJ-15] iEECON 2022 — Hybrid Power Klongrua (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000034',
  'Economic and Sensitivity Analyses for an Optimal Hybrid Power Generation for Stand-Alone Power Systems: Case of Klongrua, Phato, Chumphon, Thailand',
  'conference_international', 'published',
  '2022 International Electrical Engineering Congress (iEECON)',
  2022,
  'P. Jeenthanom and W. Muangjai et al.',
  true, true,
  ARRAY['hybrid power generation', 'stand-alone power', 'Klongrua', 'economic analysis']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000034', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2, false);

-- ============================================================
-- 3. GRANTS — from CV page 10-11
-- ============================================================

-- Grant: การพัฒนาระบบและกลไกการบริหารจัดการภัยพิบัติน้ำท่วม (2567)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000010',
  'การพัฒนาระบบและกลไกการบริหารจัดการภัยพิบัติน้ำท่วมจังหวัดลำปางที่สอดคล้องกับสถานการณ์เฉพาะพื้นที่อย่างมีส่วนร่วมและถอดบทเรียนการบริหารจัดการอุทกภัยจังหวัดเชียงใหม่',
  'หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่ (บพท.)', 'PMUA',
  1100000.00, 2567, 'active',
  ARRAY['flood management', 'disaster', 'community development']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000009', 'co_pi');

-- Grant: ลมหายใจเชิงดอย (2566)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000011',
  'ลมหายใจเชิงดอย: การเพิ่มประสิทธิภาพกลไกการทำงานให้บริการสาธารณะเพื่อส่งเสริมสุขภาวะประชาชนของเครือข่ายเทศบาลลุ่มน้ำแม่กวงด้วยเทคโนโลยีดิจิทัล',
  'หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่ (บพท.)', 'PMUA',
  1520000.00, 2566, 'completed',
  ARRAY['digital technology', 'public health', 'community development']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000009', 'co_pi');

-- Grant: การผลิตไฟฟ้าแบบผสมผสานแบบไม่เชื่อมต่อสายส่ง บ้านคลองเรือ (2565)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000012',
  'การผลิตไฟฟ้าแบบผสมผสานแบบไม่เชื่อมต่อสายส่งโดยคำนึงถึงต้นทุนการผลิตไฟฟ้าเชิงภูมิศาสตร์กรณีบ้านคลองเรือ',
  'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'EGAT',
  4984386.00, 2565, 'completed',
  ARRAY['hybrid power generation', 'off-grid', 'Khlong Ruea', 'renewable energy']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000009', 'co_pi');

-- Grant: BCG Model (2565)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000013',
  'BCG Model',
  'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)', 'MHESI',
  800000.00, 2565, 'completed',
  ARRAY['BCG model', 'bio-circular-green economy']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000009', 'pi');

-- Grant: โครงการสร้างพื้นที่เรียนรู้เพื่อยกกระดับเศรษฐกิจ สังคม บ้านปง (2564)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000014',
  'โครงการสร้างพื้นที่เรียนรู้เพื่อยกกระดับราคฐานด้านเศรษฐกิจ สังคม การใช้ประโยชน์จากต้นทุนสิ่งแวดล้อม และการพัฒนาทักษะอาชีพสู่การปรับตัวและดำเนินชีวิตแบบวิสิใหม่ ต.บ้านปง อ.หางดง จ.เชียงใหม่',
  'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)', 'MHESI',
  3220000.00, 2564, 'completed',
  ARRAY['community development', 'sustainable livelihood', 'Chiang Mai']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000009', 'pi');

-- Grant: พัฒนาและทดสอบเครื่องมือลดการใช้แรงงาน ดอกไฮเดรนเยีย (2564)
INSERT INTO grants (id, title_th, funding_agency, funding_agency_en, budget, fiscal_year, status, research_areas)
VALUES (
  'c0000001-0000-0000-0000-000000000015',
  'โครงการพัฒนาและทดสอบเครื่องมือสำหรับลดการใช้แรงงานและเพิ่มความแม่นยำในการเพาะปลูกดอกไฮเดรนเยีย',
  'มูลนิธิโครงการหลวง', 'Royal Project Foundation',
  854240.00, 2564, 'completed',
  ARRAY['automation', 'agriculture', 'hydrangea', 'Royal Project']
);

INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000009', 'pi');

-- Grant: การลดค่าผลรวมของแข็งละลายน้ำ แม่เมาะ (2563) — already exists as c...03 but add Worrajak
INSERT INTO grant_members (grant_id, researcher_id, role) VALUES
('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000009', 'co_pi')
ON CONFLICT (grant_id, researcher_id) DO NOTHING;

-- ============================================================
-- 4. PATENTS / PETTY PATENTS — from CV page 11-12
-- ============================================================

INSERT INTO patents (id, title_th, title_en, patent_type, status, application_no)
VALUES
(
  'd0000001-0000-0000-0000-000000000001',
  'เรือพร้อมอุปกรณ์สำรวจความลึกน้ำด้วย Digital Echosounder ชนิด 2 ความถี่ ความแม่นยำสูงสำหรับงานสำรวจทำแผนที่ภูมิศาสตร์ใต้น้ำ',
  'Survey boat with dual-frequency Digital Echosounder for underwater mapping',
  'petty_patent', 'pending',
  '2003000526'
),
(
  'd0000001-0000-0000-0000-000000000002',
  'เครื่องอ่านและบันทึกค่าหลายชนิดโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'Multi-type reader and recorder using IoT technology',
  'petty_patent', 'pending',
  '2003000527'
),
(
  'd0000001-0000-0000-0000-000000000003',
  'เครื่องอ่านค่าข้อมูลการไหลของของเหลวในท่อโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'Liquid flow data reader using IoT technology',
  'petty_patent', 'pending',
  NULL
),
(
  'd0000001-0000-0000-0000-000000000004',
  'เครื่องวัดค่าพลังงานแสงอาทิตย์อย่างง่ายโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'Simple solar energy meter using IoT technology',
  'petty_patent', 'pending',
  NULL
),
(
  'd0000001-0000-0000-0000-000000000005',
  'เครื่องอ่านค่าอาร์เอฟไอดีโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'RFID reader using IoT technology',
  'petty_patent', 'pending',
  NULL
),
(
  'd0000001-0000-0000-0000-000000000006',
  'เครื่องวัดค่าความเอียงเสาไฟฟ้าโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'Electric pole tilt meter using IoT technology',
  'petty_patent', 'pending',
  NULL
),
(
  'd0000001-0000-0000-0000-000000000007',
  'เครื่องอ่านค่าจากอุปกรณ์ไฟฟ้าระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์หลากหลายผ่านการเชื่อมต่อมาตรฐานโดยใช้เทคโนโลยีอินเทอร์เน็ตของทุกสรรพสิ่ง',
  'Multi-standard solar PV system data reader using IoT technology',
  'petty_patent', 'pending',
  NULL
);

-- Link patents to Worrajak
INSERT INTO patent_inventors (patent_id, researcher_id, inventor_order) VALUES
('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000009', 1),
('d0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000009', 1);

-- Add RLS policies for patents if not exists
CREATE POLICY IF NOT EXISTS "Public read patent_inventors" ON patent_inventors FOR SELECT USING (true);
