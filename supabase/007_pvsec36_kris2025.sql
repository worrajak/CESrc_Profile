-- ============================================================
-- ผลงานจาก PVSEC-36 (Nov 2025) และ KRIS 2025 (Nov 2025)
-- ============================================================

-- ============================================================
-- A. PVSEC-36: 36th International Photovoltaic Science and
--    Engineering Conference, Nagoya, Japan, Nov 10-14, 2025
-- ============================================================

-- [PVSEC-1] Techno-Economics of Peak Shaving with PV and Battery
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000301',
  'Techno-Economics of Peak Shaving with PV and Battery with Arima Prediction Model',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'W. Muangjai, T. Somsak',
  false,
  ARRAY['peak shaving', 'PV', 'battery', 'ARIMA', 'techno-economics']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000301', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000301', 'a0000001-0000-0000-0000-000000000002', 'last_author', 2, false);

-- [PVSEC-2] Standalone PV for Off-Grid Highland Communities
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000302',
  'Viability and Performance Analysis of a Small-Scale Standalone Photovoltaic System for Enhancing Energy Resilience in Off-Grid Highland Communities of Thailand',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'W. Muangjai',
  false,
  ARRAY['standalone PV', 'off-grid', 'highland community', 'energy resilience', 'Thailand']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000302', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, true);

-- [PVSEC-3] Solar-LFP Hybrid Refrigeration for Highland Food Security
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000303',
  'Enhancing Food Security in Remote Highland Communities: Design, Performance, and Techno-Economic Analysis of a Dedicated Solar-LFP Hybrid Refrigeration System',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'W. Muangjai, T. Somsak',
  false,
  ARRAY['solar', 'LFP battery', 'hybrid refrigeration', 'food security', 'highland community']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000303', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000303', 'a0000001-0000-0000-0000-000000000002', 'last_author', 2, false);

-- [PVSEC-4] Solar PV + BESS for University Campus (RMUTL)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000304',
  'A Technical Design and Economic Evaluation of a Solar Photovoltaic and Battery Energy Storage System for University Campus: A Case Study of Rajamangala University of Technology Lanna, Thailand',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'N. Patcharaprakiti, W. Muangjai, W. Tippajorn, T. Somsak, J. Thongpron, Srasay, K. Nakaiam, M. Ngao-det, N. Patcharaprakiti',
  false,
  ARRAY['solar PV', 'battery energy storage', 'BESS', 'university campus', 'RMUTL', 'techno-economic']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000004', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000002', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000001', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000304', 'a0000001-0000-0000-0000-000000000008', 'co_author', 8, false);

-- [PVSEC-5] Solar-Powered Wireless Sensor for Wildfire Detection (LoRa Mesh)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000305',
  'An Autonomous, Solar-Powered Wireless Sensor Node for Early Wildfire Detection Using Thermostat Sensing and a Meshastic LoRa Mesh Network',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'W. Muangjai, V. Asanavijit, T. Somsak, M. Ngao-det, K. Nakaiam, J. Thongpron, N. Patcharaprakiti',
  false,
  ARRAY['solar', 'wireless sensor', 'wildfire detection', 'LoRa mesh', 'Meshtastic', 'IoT']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1, true),
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000008', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000001', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000305', 'a0000001-0000-0000-0000-000000000005', 'last_author', 7, false);

-- [PVSEC-6] Lightning Surge on PV Arrays (Wichet Thipprasert)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000306',
  'Analysis of Lightning Surge Impact on Photovoltaic Arrays via Controlled Impulse Simulation',
  'conference_international', 'published',
  '36th International Photovoltaic Science and Engineering Conference (PVSEC-36)',
  2025,
  'W. Thipprasert',
  false,
  ARRAY['lightning surge', 'photovoltaic', 'impulse simulation', 'PV protection', 'high voltage']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000306', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1, true);

-- ============================================================
-- B. KRIS 2025: Knowledge and Research for Inclusive Society
--    KMUTT, Nov 24-25, 2025 (พ.ศ. 2568)
-- ============================================================

-- [KRIS-1] Cape Gooseberry Dryer (โครงการหลวงแม่แฮ)
INSERT INTO publications (id, title, title_th, pub_type, status, journal_name, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000307',
  'Development of Cape Gooseberry Dryer for Increasing the Competitiveness of Agricultural Products on the Highland',
  'การพัฒนาเครื่องอบแห้งเคพกูสเบอร์รี่เพื่อเพิ่มขีดความสามารถในการแข่งขันของสินค้าเกษตรบนพื้นที่สูง',
  'conference_national', 'published',
  'KRIS 2025: Knowledge and Research for Inclusive Society (KMUTT)',
  2025,
  'W. Wannaphrom, M. Phattiyathanee, N. Salee, T. Aunjaijom, W. Maungjai, T. Mahawan, K. WuttiKitt, E. Krajangtimaporn',
  ARRAY['cape gooseberry', 'drying process', 'CFD simulation', 'highland agriculture', 'royal project']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000307', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5, false);

-- [KRIS-2] Community Enterprise - Black Sesame Oil (ปงยั้งม้า)
INSERT INTO publications (id, title, title_th, pub_type, status, journal_name, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000308',
  'Enhancing the Capacity of Community Enterprises through Agricultural Product Processing for Value Addition and Entrepreneurial Development: A Case Study of the Kon Pong Yang Ma Agricultural Community Enterprise Group, Chiang Mai Province',
  'การเสริมสร้างศักยภาพของวิสาหกิจชุมชนผ่านกระบวนการแปรรูปผลผลิตทางการเกษตรเพื่อเพิ่มมูลค่าและการพัฒนาผู้ประกอบการ กรณีศึกษากลุ่มวิสาหกิจชุมชนเกษตรกรคนปงยั้งม้า จังหวัดเชียงใหม่',
  'conference_national', 'published',
  'KRIS 2025: Knowledge and Research for Inclusive Society (KMUTT)',
  2025,
  'P. Lertbuaban, S. Salee, W. Wannaprom, W. Muangjai, J. Thongpron',
  ARRAY['community enterprise', 'cold-pressed black sesame oil', 'agricultural processing', 'value addition', 'entrepreneur', 'royal project']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000308', 'a0000001-0000-0000-0000-000000000009', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000308', 'a0000001-0000-0000-0000-000000000001', 'last_author', 5, false);
