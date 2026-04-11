-- ============================================================
-- ผศ.ดร.นพพร พัชรประกิติ (Nopporn Patcharaprakiti)
-- Google Scholar: user=VMmq9J4AAAAJ
-- Researcher ID: a0000001-0000-0000-0000-000000000005
-- ============================================================

-- Update profile
UPDATE researchers
SET
  google_scholar = 'https://scholar.google.co.th/citations?user=VMmq9J4AAAAJ',
  expertise = ARRAY['PV Grid-Connected Inverters', 'MPPT', 'Fuzzy Logic Control', 'Power Quality', 'System Identification', 'Solar Water Pumping', 'Electrocoagulation'],
  bio_th = 'ผู้ช่วยศาสตราจารย์ สาขาวิชาวิศวกรรมไฟฟ้า มทร.ล้านนา ผู้เชี่ยวชาญด้าน PV Grid-Connected Inverter, MPPT และ Fuzzy Logic Control Google Scholar: Citations 474+',
  bio_en = 'Assistant Professor, Electrical Engineering, RMUTL. Expert in PV Grid-Connected Inverters, MPPT, Fuzzy Logic Control. Google Scholar: 474+ citations'
WHERE id = 'a0000001-0000-0000-0000-000000000005';

-- Update DOI for existing Renewable Energy 2005 (PUB-5)
UPDATE publications
SET doi = '10.1016/j.renene.2005.01.009'
WHERE id = 'b0000001-0000-0000-0000-000000000005';

-- ============================================================
-- NEW PUBLICATIONS
-- ============================================================

-- [NP-1] 2010 — Modeling single phase inverter (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000040',
  'Modeling of single phase inverter of photovoltaic system using system identification',
  'conference_international', 'published',
  '2010 Second International Conference on Computer and Network Technology',
  'pp. 462-466', 2010,
  'N. Patcharaprakiti, K. Kirtikara, D. Chenvidhya, V. Monyakul, B. Muenpinij',
  true,
  ARRAY['PV inverter', 'system identification', 'single phase']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000040', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false);

-- [NP-2] 2010 — Hammerstein-Wiener nonlinear system identification (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000041',
  'Modeling of single phase inverter of photovoltaic system using Hammerstein-Wiener nonlinear system identification',
  'journal_international', 'published',
  'Current Applied Physics',
  '10', '3', 'pp. S532-S536', 2010,
  'N. Patcharaprakiti, K. Kirtikara, V. Monyakul, D. Chenvidhya, J. Thongpron, et al.',
  true, true,
  ARRAY['Hammerstein-Wiener', 'nonlinear system identification', 'PV inverter']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000041', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000041', 'a0000001-0000-0000-0000-000000000001', 'co_author', 5, false);

-- [NP-3] 2015 — Solar water pumping vs engine (with Kasem Treepak!) (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000042',
  'An economic evaluation comparison of solar water pumping system with engine pumping system for rice cultivation',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics',
  '54', '8S1', '08KH01', 2015,
  'K. Treephak, J. Thongpron, D. Somsak, J. Saelao, N. Patcharaprakiti',
  true, true,
  ARRAY['solar water pumping', 'economic evaluation', 'rice cultivation']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000010', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000005', 'last_author', 5, false);

-- [NP-4] 2021 — CC-CV Wireless EV Charging dual-sides (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000043',
  'Constant current-voltage with maximum efficiency inductive wireless EV charging control using dual-sides DC converters',
  'conference_international', 'published',
  '2021 18th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2021,
  'T. Somsak, A. Namin, T. Sriprom, J. Thongpron, U. Kamnarn, N. Patcharaprakiti, et al.',
  true, true,
  ARRAY['wireless EV charging', 'CC-CV', 'dual-sides DC converter', 'inductive']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000007', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000005', 'co_author', 6, false);

-- [NP-5] 2010 — System identification with cross validation (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000044',
  'System identification with cross validation technique for modeling inverter of photovoltaic system',
  'conference_international', 'published',
  '2010 International Conference on Mechanical and Electrical Technology',
  'pp. 594-598', 2010,
  'N. Patcharaprakiti, K. Kirtikara, C. Jivacate, A. Sangswang, K. Tunlasakun, J. Thongpron, et al.',
  true,
  ARRAY['system identification', 'cross validation', 'PV inverter']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000044', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000044', 'a0000001-0000-0000-0000-000000000001', 'co_author', 6, false);

-- [NP-6] 2018 — Solar thermoelectric cooler water generator (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000045',
  'Optimal solar energy on thermoelectric cooler of water generator in case study on flood crisis',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics',
  '57', '8S3', '08RH05', 2018,
  'C. Uttasilp, N. Patcharaprakiti, T. Somsak, J. Thongpron',
  true, true,
  ARRAY['thermoelectric cooler', 'solar energy', 'water generator', 'flood']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000045', 'a0000001-0000-0000-0000-000000000005', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000045', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000045', 'a0000001-0000-0000-0000-000000000001', 'last_author', 4, false);

-- [NP-7] 2012 — Stability analysis PV inverter (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000046',
  'Stability analysis of a photovoltaic grid connected inverter model based on system identification',
  'conference_international', 'published',
  'TENCON 2012 IEEE Region 10 Conference',
  'pp. 1-4', 2012,
  'N. Patcharaprakiti, K. Kirtikara, A. Sangswang, S. Boonto',
  true, true,
  ARRAY['stability analysis', 'PV inverter', 'grid connected', 'system identification']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000046', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false);

-- [NP-8] 2012 — Model predictive control PV inverter (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000047',
  'Model predictive control based on system identification of photovoltaic grid connected inverter',
  'journal_international', 'published',
  'International Journal of Information and Electronics Engineering',
  '2', '4', 'pp. 591-595', 2012,
  'N. Patcharaprakiti, J. Thongpron, K. Kirtikara, D. Chenvidhya, A. Sangswang',
  true,
  ARRAY['model predictive control', 'system identification', 'PV inverter', 'grid connected']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000047', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000047', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false);

-- [NP-9] 2022 — Air Force Cooling LiFePO4 EV (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000048',
  'An Air Force Cooling of Lithium-ion Battery Thermal Management System for Heat Eliminating in Modified Electric Vehicle',
  'conference_international', 'published',
  '2022 International Electrical Engineering Congress (iEECON)',
  'pp. 1-4', 2022,
  'E. Siriboonpanit, K. Sasiwimonrit, J. Saelao, N. Patcharaprakiti',
  true, true,
  ARRAY['lithium-ion battery', 'thermal management', 'air cooling', 'electric vehicle']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000048', 'a0000001-0000-0000-0000-000000000005', 'last_author', 4, false);

-- [NP-10] 2017 — Water purification electrocoagulation (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000049',
  'Water purification by solar powered electrocoagulation system',
  'journal_international', 'published',
  'Iranian Journal of Energy and Environment',
  '8', '3', 'pp. 224-229', 2017,
  'N. Patcharaprakiti',
  true,
  ARRAY['water purification', 'electrocoagulation', 'solar powered']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000049', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, true);

-- [NP-11] 2015 — Load Modeling air-conditioning (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000050',
  'Load Modeling based on System Identification with Kalman Filtering of Electrical Energy Consumption of Residential Air-Conditioning',
  'journal_international', 'published',
  'International Journal of Advanced Smart Convergence',
  '4', '1', 'pp. 45-53', 2015,
  'N. Patcharaprakiti, K. Tripak, J. Saelao',
  ARRAY['load modeling', 'system identification', 'Kalman filter', 'air-conditioning']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000050', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000050', 'a0000001-0000-0000-0000-000000000010', 'co_author', 2, false);

-- [NP-12] 2024 — Temperature Effects Batteries LEO Satellites (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000051',
  'Study on Temperature Effects of Batteries Lithium Ion NCR18650GA Lifetime for Low Earth Orbit Satellites',
  'conference_international', 'published',
  '2024 7th International Conference on Green Technology and Sustainable Development',
  2024,
  'T. Somsak, N. Sriyoaruean, M. Ngao-det, J. Thongpron, A. Namin, N. Patcharaprakiti, et al.',
  true,
  ARRAY['lithium ion battery', 'temperature effects', 'LEO satellite', 'NCR18650GA']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000008', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000007', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000005', 'co_author', 6, false);

-- [NP-13] 2019 — Ammonia Removal Electrocoagulation (Journal)
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000052',
  'An Ammonia Removal for Red Craw Crayfish Nursery Water Pond by using Electrocoagulation Method',
  'journal_national', 'published',
  'Food Agricultural Sciences and Technology',
  '5', '1', 'pp. 10-15', 2019,
  'N. Patcharaprakiti, J. Saelao',
  ARRAY['ammonia removal', 'electrocoagulation', 'crayfish', 'water treatment']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000052', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false);

-- [NP-14] 2016 — DC Solar Air Conditioning (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000053',
  'A Technical Design and Economic Evaluation of DC Solar Air Conditioning',
  'conference_international', 'published',
  'Vth International Symposium on Fusion of Science & Technology',
  'pp. 18-22', 2016,
  'N. Patcharaprakiti, J. Saelao',
  ARRAY['DC solar', 'air conditioning', 'economic evaluation']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000053', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1, false);

-- [NP-15] 2015 — Rainfall trend analysis agriculture (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000054',
  'A rainfall trend analysis for agriculture irrigation system management case study: Sansai district-Chiangmai province',
  'conference_international', 'published',
  '2015 International Conference on Science and Technology (TICST)',
  'pp. 519-522', 2015,
  'J. Saelao, N. Patcharaprakiti',
  true,
  ARRAY['rainfall trend', 'agriculture', 'irrigation', 'Sansai', 'Chiang Mai']
);
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000054', 'a0000001-0000-0000-0000-000000000005', 'last_author', 2, false);

-- ============================================================
-- NOTE: K. Treephak = Kasem Treepak (010) — found as first author!
-- Also "K. Tripak" in NP-11 is likely Kasem Treepak
-- Update Kasem's expertise
-- ============================================================
UPDATE researchers
SET expertise = ARRAY['Solar Water Pumping', 'Electrical Engineering', 'Energy Economics']
WHERE id = 'a0000001-0000-0000-0000-000000000010';
