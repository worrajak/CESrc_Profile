-- ============================================================
-- เพิ่ม รศ.วิเชษฐ์ ทิพย์ประเสริฐ (Assoc.Prof. Wichet Thipprasert)
-- แหล่งข้อมูล: ResearchGate, Google Scholar, IEEE Xplore
-- ============================================================

-- 1. RESEARCHER
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, position_th, position_en,
  department, faculty, university, campus,
  google_scholar, expertise, bio_th, bio_en
)
VALUES (
  'a0000001-0000-0000-0000-000000000011',
  'รศ.', 'วิเชษฐ์', 'ทิพย์ประเสริฐ',
  'Assoc.Prof.', 'Wichet', 'Thipprasert',
  'member',
  'รองศาสตราจารย์', 'Associate Professor',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Rai',
  'https://scholar.google.com/citations?user=cYyYhWYAAAAJ',
  ARRAY[
    'High Voltage Engineering',
    'Surge Arrester',
    'Insulator Testing',
    'Power System Protection',
    'High Voltage Applications in Agriculture'
  ],
  'รองศาสตราจารย์ สาขาวิศวกรรมไฟฟ้า ผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าแรงสูง อุปกรณ์ป้องกันระบบจำหน่าย และการประยุกต์ใช้ไฟฟ้าแรงสูงในการเกษตร',
  'Associate Professor in Electrical Engineering, specializing in high voltage engineering, surge arresters, insulator testing, and high voltage applications in agriculture.'
);

-- ============================================================
-- 2. RESEARCH AREAS — เพิ่มสาขาใหม่
-- ============================================================

INSERT INTO research_areas (id, name_th, name_en, description_th, description_en, icon, sort_order, sdg_goals, search_terms)
VALUES (
  'c0000001-0000-0000-0000-000000000010',
  'วิศวกรรมไฟฟ้าแรงสูง', 'High Voltage Engineering',
  'การวิจัยด้านฉนวนไฟฟ้า อุปกรณ์ป้องกันฟ้าผ่า และการทดสอบอุปกรณ์ไฟฟ้าแรงสูง',
  'Research on electrical insulation, lightning protection devices, and high voltage equipment testing',
  '⚡', 10,
  ARRAY['SDG 7', 'SDG 9'],
  ARRAY['high voltage', 'surge arrester', 'insulator', 'flashover', 'lightning', 'ZnO', 'porcelain', 'composite insulator', 'tracking wheel', 'leakage current', 'ไฟฟ้าแรงสูง', 'ฉนวน', 'ฟ้าผ่า']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. PUBLICATIONS — รศ.วิเชษฐ์ ทิพย์ประเสริฐ
-- ============================================================

-- [W-PUB-1] Lightning arrester modeling using ATP-EMTP (TENCON 2004)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000101',
  'Lightning arrester modeling using ATP-EMTP',
  'conference_international', 'published',
  '2004 IEEE Region 10 Conference (TENCON 2004)',
  2004, NULL,
  'T. Saengsirwan, W. Thipprasert',
  true, false,
  ARRAY['surge arrester', 'ATP-EMTP', 'metal oxide', 'lightning protection']
);

-- [W-PUB-2] Comparison of AC flashover performance (ECTI-CON 2012)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000102',
  'Comparison of AC flashover performance for line post and pin post insulators in distribution 22 kV',
  'conference_international', 'published',
  '9th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON 2012)',
  2012, '10.2316/P.2012.768-045',
  'W. Thipprasert, P. Jirapong',
  true, false,
  ARRAY['insulator', 'flashover', '22kV distribution', 'porcelain insulator']
);

-- [W-PUB-3] Pollution flashover of porcelain insulators (AMR 2012)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, pages, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000103',
  'Analysis and Comparison of Pollution Flashover Performance of Porcelain Insulators in Distribution System 22 kV',
  'journal_international', 'published',
  'Advanced Materials Research', '622-623', 'pp. 1901-1905', 2012,
  '10.4028/www.scientific.net/AMR.622-623.1901',
  'W. Thipprasert, P. Wimonthanasit, E. Chaidee, P. Jirapong',
  true, false,
  ARRAY['pollution flashover', 'porcelain insulator', '22kV', 'distribution system']
);

-- [W-PUB-4] ZnO surge arresters thermal image (AMR 2014)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, pages, year, doi, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000104',
  'Electrical Performance of Zinc Oxide Surge Arresters in 22 kV Distribution System Using Thermal Image Camera',
  'journal_international', 'published',
  'Advanced Materials Research', '931-932', 'pp. 857-861', 2014,
  '10.4028/www.scientific.net/AMR.931-932.857',
  'W. Thipprasert',
  true, false,
  ARRAY['ZnO surge arrester', 'thermal image', '22kV', 'leakage current']
);

-- [W-PUB-5] Porcelain surge arrester contaminated conditions (JPEE 2015)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000105',
  'Electrical Performance of Porcelain Surge Arrester in 22 kV Distribution System under Contaminated Conditions',
  'journal_international', 'published',
  'Journal of Power and Energy Engineering', '3', '5', 'pp. 75-81', 2015,
  '10.4236/jpee.2015.35007',
  'W. Thipprasert, P. Sritakaew',
  ARRAY['surge arrester', 'contamination', '22kV', 'porcelain']
);

-- [W-PUB-6] Metal Oxide Surge Arresters in Temporary Overvoltage (IJEEE 2016)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000106',
  'Metal Oxide Surge Arresters Modelling in Temporary Overvoltage Conditions',
  'journal_international', 'published',
  'International Journal of Electronics and Electrical Engineering', 2016,
  'W. Thipprasert, E. Chaidee',
  ARRAY['metal oxide', 'surge arrester', 'overvoltage', 'modelling']
);

-- [W-PUB-7] Line Post Insulators (IJEEE 2016)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000107',
  'Electrical Performances of Line Post Insulators in 22kV Distribution System',
  'journal_international', 'published',
  'International Journal of Electronics and Electrical Engineering', 2016,
  'P. Jirapong, W. Thipprasert',
  ARRAY['line post insulator', '22kV', 'porcelain', 'pollution']
);

-- [W-PUB-8] การศึกษาการออกดอกของเห็ดกระด้าง (JAT 2018)
INSERT INTO publications (id, title, title_th, pub_type, status, journal_name, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000108',
  'Study of Fruit Body Formation of Lentinus polychrous by High Voltage Stimulation',
  'การศึกษาการออกดอกของเห็ดกระด้างโดยการใช้การกระตุ้นด้วยไฟฟ้าแรงดันสูง',
  'journal_national', 'published',
  'Journal of Advanced Technology', 2018,
  'W. Thipprasert, R. Norarat, S. Wannachai',
  ARRAY['high voltage stimulation', 'mushroom', 'Lentinus polychrous', 'agriculture']
);

-- [W-PUB-9] Effects of HV Stimulation on Shiitake Mushroom (IJPEST 2019)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000109',
  'Effects of High Voltage Stimulation and Oxygen Rich Fine Bubble (FB) Water on Cultivated Shiitake Mushroom in Thailand',
  'journal_international', 'published',
  'International Journal of Plasma Environmental Science and Technology',
  '12', '2', 'pp. 69-73', 2019,
  '10.34343/ijpest.2019.12.02.069',
  'W. Thipprasert, R. Norarat, C. Mikhamlueang, T. Wanmanee, N. Nanta, N. Srijumpa',
  true,
  ARRAY['high voltage stimulation', 'fine bubble', 'shiitake mushroom', 'agriculture']
);

-- [W-PUB-10] Tracking wheel test composite insulator (iEECON 2020)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, doi, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000110',
  'Tracking Wheel Test of Composite Insulator in 22kV Distribution System',
  'conference_international', 'published',
  '8th International Electrical Engineering Congress (iEECON 2020)', 2020,
  NULL,
  'A. Rupdee, W. Thipprasert',
  true,
  ARRAY['composite insulator', 'tracking wheel test', '22kV', 'deterioration']
);

-- [W-PUB-11] Composite insulator IEC/TR 62730 (Przeglad Elektrotechniczny 2022)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000111',
  'Electrical performance of composite insulator under IEC/TR 62730 standard testing for 22 kV distribution system',
  'journal_international', 'published',
  'Przegląd Elektrotechniczny', 2022,
  'W. Thipprasert, A. Rupdee',
  true, true,
  ARRAY['composite insulator', 'IEC 62730', 'wheel test', '22kV', 'polymeric insulator']
);

-- [W-PUB-12] Wi-Fi and Bluetooth Delays Buck Converter (IEEE 2024)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000112',
  'Comparisons of Wi-Fi and Bluetooth Delays Feedback Voltage Controlled of Buck Converter',
  'conference_international', 'published',
  'IEEE Conference on Materials and Electronic Devices (ICMED 2024)', 2024,
  'O. Lueyos, W. Thipprasert, P. Suwan',
  true,
  ARRAY['Wi-Fi', 'Bluetooth', 'buck converter', 'wireless control', 'delay']
);

-- ============================================================
-- 4. PUBLICATION AUTHORS — เชื่อมโยง รศ.วิเชษฐ์ กับผลงาน
-- ============================================================

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000101', 'a0000001-0000-0000-0000-000000000011', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000102', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000103', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000104', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000105', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000106', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000107', 'a0000001-0000-0000-0000-000000000011', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000108', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000109', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000110', 'a0000001-0000-0000-0000-000000000011', 'co_author', 2, true),
('b0000001-0000-0000-0000-000000000111', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000112', 'a0000001-0000-0000-0000-000000000011', 'co_author', 2, false);
