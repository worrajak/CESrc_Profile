-- ============================================================
-- 035: OpenAlex Publications Import — ครบ 14 นักวิจัย CESRU
-- พร้อม co-author detection อัตโนมัติภายในหน่วย
-- IMPORTANT: ต้องรัน 034_openalex_integration.sql ก่อน!
-- Generated: 2026-04-14 from OpenAlex API
-- ============================================================

-- [2026] CC–CV Wireless EV Charging Using Hamiltonian-Based Control on Vol (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'badf407e-adc2-55c0-cad8-1381d49f8aa7', 'CC–CV Wireless EV Charging Using Hamiltonian-Based Control on Voltage Mode Primary-side and Current Mode Secondary-side Buck Converters', 'IEEE Transactions on Industry Applications', 2026, '10.1109/tia.2026.3655651', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 0, 'W7125252457', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/tia.2026.3655651');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'badf407e-adc2-55c0-cad8-1381d49f8aa7', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'badf407e-adc2-55c0-cad8-1381d49f8aa7')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'badf407e-adc2-55c0-cad8-1381d49f8aa7' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] Systematic Optimize and Cost-Effective Design of a 100% Renewable (Cited: 11) [CESRU: 6]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'Systematic Optimize and Cost-Effective Design of a 100% Renewable Microgrid Hybrid System for Sustainable Rural Electrification in Khlong Ruea, Thailand', 'Energies', 2025, '10.3390/en18071628', 'journal', 'มนตรี เงาเดช, Jutturit Thongpron, Anon Namin, Nopporn Patcharaprakiti, Worrajak Muangjai, Teerasak Somsak', 'openalex', 11, 'W4408778089', true, 'https://www.mdpi.com/1996-1073/18/7/1628/pdf?version=1742827460'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.3390/en18071628');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000005', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '248fe5b4-941f-24f7-d307-35ac358aac10', 'a0000001-0000-0000-0000-000000000002', 'last_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '248fe5b4-941f-24f7-d307-35ac358aac10')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '248fe5b4-941f-24f7-d307-35ac358aac10' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2025] A techno-economic analysis of a 48 V mini shuttle electric vehicl (Cited: 1) [CESRU: 8]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'A techno-economic analysis of a 48 V mini shuttle electric vehicle with a solar-assisted system for a carbon-neutral green campus', 'Japanese Journal of Applied Physics', 2025, '10.35848/1347-4065/addf58', 'journal', 'มนตรี เงาเดช, Jutturit Thongpron, Anon Namin, Kan Nakaiam, Nattawat Panlawan, Worrajak Muangjai, Teerasak Somsak, Nopporn Patcharaprakiti', 'openalex', 1, 'W4410943856', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.35848/1347-4065/addf58');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000013', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000013');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000012', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000009', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000002', 'co_author', 7
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67d873f1-b5f1-5dc1-0a24-6b3315935f5d', 'a0000001-0000-0000-0000-000000000005', 'last_author', 8
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67d873f1-b5f1-5dc1-0a24-6b3315935f5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2025] Life Cycle Exergy and Economic Criteria of the Renewable Hybrid M (Cited: 0) [CESRU: 8]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'Life Cycle Exergy and Economic Criteria of the Renewable Hybrid Microgrid System for Rural Electrification in Khlong Ruea, Thailand', NULL, 2025, '10.23919/sicefes67750.2025.11236596', 'journal', 'มนตรี เงาเดช, Jutturit Thongpron, Anon Namin, Nopporn Patcharaprakiti, Worrajak Muangjai, Naris Khampangkaew, Nattawat Panlawan, Teerasak Somsak', 'openalex', 0, 'W4416676811', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/sicefes67750.2025.11236596');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000005', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000014', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000014');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000012', 'co_author', 7
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '74e02fac-30f2-18cb-7f19-0d8988b19348', 'a0000001-0000-0000-0000-000000000002', 'last_author', 8
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '74e02fac-30f2-18cb-7f19-0d8988b19348')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '74e02fac-30f2-18cb-7f19-0d8988b19348' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2025] Design and Development of Control System for Hybrid Charging Stat (Cited: 0) [CESRU: 6]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'Design and Development of Control System for Hybrid Charging Station for EV Shuttle Mini Bus in University Campus', NULL, 2025, '10.23919/sicefes67750.2025.11236600', 'journal', 'มนตรี เงาเดช, Jutturit Thongpron, Anon Namin, Worrajak Muangjai, Nopporn Patcharaprakiti, Teerasak Somsak', 'openalex', 0, 'W4416677636', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/sicefes67750.2025.11236600');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000009', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000005', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '792b5212-e3cd-a467-a595-0a0c90787ab0', 'a0000001-0000-0000-0000-000000000002', 'last_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '792b5212-e3cd-a467-a595-0a0c90787ab0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '792b5212-e3cd-a467-a595-0a0c90787ab0' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2025] CC–CV Wireless EV Charging With Power Balance Control in Primary- (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '4e98001f-e7d8-dcae-ace7-556f23e22649', 'CC–CV Wireless EV Charging With Power Balance Control in Primary- and Secondary-Side Converters', 'IEEE Access', 2025, '10.1109/access.2025.3602478', 'journal', 'อนนท์ นำอิน', 'openalex', 2, 'W4413554896', true, 'https://doi.org/10.1109/access.2025.3602478'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/access.2025.3602478');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4e98001f-e7d8-dcae-ace7-556f23e22649', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4e98001f-e7d8-dcae-ace7-556f23e22649')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4e98001f-e7d8-dcae-ace7-556f23e22649' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2025] Wireless charging Class-E inverter for zero-voltage switching ove (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b9bfc155-7619-28ce-c760-bcd6320280aa', 'Wireless charging Class-E inverter for zero-voltage switching over coupling coefficient range', 'International Journal of Power Electronics and Drive Systems/International Journal of Electrical and Computer Engineering', 2025, '10.11591/ijpeds.v16.i3.pp1752-1764', 'journal', 'อนนท์ นำอิน', 'openalex', 1, 'W4413960950', true, 'https://ijpeds.iaescore.com/index.php/IJPEDS/article/download/24053/15020'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.11591/ijpeds.v16.i3.pp1752-1764');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b9bfc155-7619-28ce-c760-bcd6320280aa', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b9bfc155-7619-28ce-c760-bcd6320280aa')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b9bfc155-7619-28ce-c760-bcd6320280aa' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2025] A comparison of circuit models for simulating and evaluating the  (Cited: 0) [CESRU: 5]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'A comparison of circuit models for simulating and evaluating the current–voltage characteristics of PERT N-type bifacial solar cell', 'Japanese Journal of Applied Physics', 2025, '10.35848/1347-4065/add600', 'journal', 'อนนท์ นำอิน, Worrajak Muangjai, Nattawat Panlawan, Teerasak Somsak, Jutturit Thongpron', 'openalex', 0, 'W4410198395', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.35848/1347-4065/add600');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3438f0b8-fa77-9b67-9100-6f27824e1d23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3438f0b8-fa77-9b67-9100-6f27824e1d23' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3438f0b8-fa77-9b67-9100-6f27824e1d23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3438f0b8-fa77-9b67-9100-6f27824e1d23' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'a0000001-0000-0000-0000-000000000012', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3438f0b8-fa77-9b67-9100-6f27824e1d23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3438f0b8-fa77-9b67-9100-6f27824e1d23' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'a0000001-0000-0000-0000-000000000002', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3438f0b8-fa77-9b67-9100-6f27824e1d23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3438f0b8-fa77-9b67-9100-6f27824e1d23' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3438f0b8-fa77-9b67-9100-6f27824e1d23', 'a0000001-0000-0000-0000-000000000001', 'last_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3438f0b8-fa77-9b67-9100-6f27824e1d23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3438f0b8-fa77-9b67-9100-6f27824e1d23' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] Enhanced adaptive Hamiltonian control strategy for battery-ultrac (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '66dedd84-0a61-30d8-5c27-11d59ce6c7de', 'Enhanced adaptive Hamiltonian control strategy for battery-ultracapacitor hybrid systems in electric vehicle applications', 'Journal of Energy Storage', 2025, '10.1016/j.est.2025.118775', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W4415064802', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.est.2025.118775');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '66dedd84-0a61-30d8-5c27-11d59ce6c7de', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '66dedd84-0a61-30d8-5c27-11d59ce6c7de')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '66dedd84-0a61-30d8-5c27-11d59ce6c7de' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '66dedd84-0a61-30d8-5c27-11d59ce6c7de', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '66dedd84-0a61-30d8-5c27-11d59ce6c7de')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '66dedd84-0a61-30d8-5c27-11d59ce6c7de' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] Optimized ensemble learning for non-destructive avocado ripeness  (Cited: 6)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ed901128-a65d-6703-8e99-82e38742d878', 'Optimized ensemble learning for non-destructive avocado ripeness classification', 'Smart Agricultural Technology', 2025, '10.1016/j.atech.2025.101114', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 6, 'W4411476315', true, 'https://doi.org/10.1016/j.atech.2025.101114'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.atech.2025.101114');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ed901128-a65d-6703-8e99-82e38742d878', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ed901128-a65d-6703-8e99-82e38742d878')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ed901128-a65d-6703-8e99-82e38742d878' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] Optimized Ensemble Learning for Non-Destructive Avocado Ripeness  (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'c0edf67c-3ccd-c83d-e458-011636e6c766', 'Optimized Ensemble Learning for Non-Destructive Avocado Ripeness Classifcation', 'SSRN Electronic Journal', 2025, '10.2139/ssrn.5244377', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 0, 'W4410177705', true, 'https://doi.org/10.2139/ssrn.5244377'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.2139/ssrn.5244377');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c0edf67c-3ccd-c83d-e458-011636e6c766', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c0edf67c-3ccd-c83d-e458-011636e6c766')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c0edf67c-3ccd-c83d-e458-011636e6c766' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] From Sensor to Growth: A Predictive Model for Green-Oak Hydroponi (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '66045e59-e04c-d320-b87c-bc8dccc3d3f0', 'From Sensor to Growth: A Predictive Model for Green-Oak Hydroponics', NULL, 2025, '10.23919/sicefes67750.2025.11236541', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 0, 'W4416677174', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/sicefes67750.2025.11236541');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '66045e59-e04c-d320-b87c-bc8dccc3d3f0', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '66045e59-e04c-d320-b87c-bc8dccc3d3f0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '66045e59-e04c-d320-b87c-bc8dccc3d3f0' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2025] Low-Cost NIR and AI for Avocado Ripeness Classification: A Cloud- (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '46764fa4-0511-51a4-9eba-acea1d4a2a83', 'Low-Cost NIR and AI for Avocado Ripeness Classification: A Cloud-Integrated Approach', NULL, 2025, '10.23919/sicefes67750.2025.11236512', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 0, 'W4416677579', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/sicefes67750.2025.11236512');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '46764fa4-0511-51a4-9eba-acea1d4a2a83', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '46764fa4-0511-51a4-9eba-acea1d4a2a83')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '46764fa4-0511-51a4-9eba-acea1d4a2a83' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] IoT and Peer-to-peer Signal Notification Methods Reduce the Time  (Cited: 0) [CESRU: 7]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'IoT and Peer-to-peer Signal Notification Methods Reduce the Time Needed to Detect Wildfire Heat Points', NULL, 2024, '10.1109/gtsd62346.2024.10674878', 'journal', 'มนตรี เงาเดช, Nattawat Panlawan, Teerasak Somsak, Jutturit Thongpron, Worrajak Muangjai, Kosol Oranpiroj, Kan Nakaiam', 'openalex', 0, 'W4402743797', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/gtsd62346.2024.10674878');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000012', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000003', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e2dadb11-32e6-6df8-79b0-71172c8cd15b', 'a0000001-0000-0000-0000-000000000013', 'last_author', 7
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e2dadb11-32e6-6df8-79b0-71172c8cd15b' AND researcher_id = 'a0000001-0000-0000-0000-000000000013');

-- [2024] Performance Analysis of a 6.6 kW Inductive Wireless Power Transmi (Cited: 1) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '4f1ff874-1a45-923c-b358-f9e8cd64d527', 'Performance Analysis of a 6.6 kW Inductive Wireless Power Transmission for Electric Vehicle Charging Using Power Balance Control', NULL, 2024, '10.1109/icome-ee64119.2024.10845258', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 1, 'W4406754634', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845258');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4f1ff874-1a45-923c-b358-f9e8cd64d527', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4f1ff874-1a45-923c-b358-f9e8cd64d527')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4f1ff874-1a45-923c-b358-f9e8cd64d527' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4f1ff874-1a45-923c-b358-f9e8cd64d527', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4f1ff874-1a45-923c-b358-f9e8cd64d527')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4f1ff874-1a45-923c-b358-f9e8cd64d527' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Analysis, Design and Implementation of Class-E Inverter for Wirel (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '87df2ea6-5976-c054-ad15-9180bc755724', 'Analysis, Design and Implementation of Class-E Inverter for Wireless Charging Application', NULL, 2024, '10.1109/ecti-con60892.2024.10594982', 'journal', 'อนนท์ นำอิน', 'openalex', 1, 'W4401110942', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con60892.2024.10594982');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '87df2ea6-5976-c054-ad15-9180bc755724', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '87df2ea6-5976-c054-ad15-9180bc755724')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '87df2ea6-5976-c054-ad15-9180bc755724' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2024] Hamiltonian Control for CC-CV Primary-side Buck Converter of Indu (Cited: 1) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'c5a2ce64-f3b4-0fca-c5de-83e785139b85', 'Hamiltonian Control for CC-CV Primary-side Buck Converter of Inductive Wireless EV Charging', NULL, 2024, '10.1109/icpsasia61913.2024.10761866', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 1, 'W4404915125', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icpsasia61913.2024.10761866');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5a2ce64-f3b4-0fca-c5de-83e785139b85', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5a2ce64-f3b4-0fca-c5de-83e785139b85')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5a2ce64-f3b4-0fca-c5de-83e785139b85' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5a2ce64-f3b4-0fca-c5de-83e785139b85', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5a2ce64-f3b4-0fca-c5de-83e785139b85')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5a2ce64-f3b4-0fca-c5de-83e785139b85' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Single-loop Power Balance Control for Secondary Side Buck Convert (Cited: 1) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0742f661-2c18-cd66-9118-c657efa3e7b0', 'Single-loop Power Balance Control for Secondary Side Buck Converter of Inductive Wireless EV Charging', NULL, 2024, '10.1109/icome-ee64119.2024.10845372', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 1, 'W4406754738', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845372');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0742f661-2c18-cd66-9118-c657efa3e7b0', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0742f661-2c18-cd66-9118-c657efa3e7b0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0742f661-2c18-cd66-9118-c657efa3e7b0' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0742f661-2c18-cd66-9118-c657efa3e7b0', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0742f661-2c18-cd66-9118-c657efa3e7b0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0742f661-2c18-cd66-9118-c657efa3e7b0' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Delayed WiFi Communications Feedback Control Primary-Side Buck Co (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'd55ef44d-a969-614c-da4e-88fa35a9c1f0', 'Delayed WiFi Communications Feedback Control Primary-Side Buck Converter for CC-CV Inductive Wireless EV Charging', NULL, 2024, '10.1109/ecti-con60892.2024.10595014', 'journal', 'อนนท์ นำอิน', 'openalex', 1, 'W4401111234', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con60892.2024.10595014');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'd55ef44d-a969-614c-da4e-88fa35a9c1f0', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'd55ef44d-a969-614c-da4e-88fa35a9c1f0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'd55ef44d-a969-614c-da4e-88fa35a9c1f0' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2024] Study on Temperature Effects of Batteries Lithium Ion NCR18650GA  (Cited: 0) [CESRU: 7]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'Study on Temperature Effects of Batteries Lithium Ion NCR18650GA Lifetime for Low Earth Orbit Satellites', NULL, 2024, '10.1109/gtsd62346.2024.10675241', 'journal', 'อนนท์ นำอิน, Teerasak Somsak, Jutturit Thongpron, Nopporn Patcharaprakiti, Worrajak Muangjai, Nattawat Panlawan, Naris Khampangkaew', 'openalex', 0, 'W4402743912', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/gtsd62346.2024.10675241');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000002', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000005', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000012', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8164111f-7e21-2c04-d5d1-06817f649888', 'a0000001-0000-0000-0000-000000000014', 'co_author', 7
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8164111f-7e21-2c04-d5d1-06817f649888')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8164111f-7e21-2c04-d5d1-06817f649888' AND researcher_id = 'a0000001-0000-0000-0000-000000000014');

-- [2024] Comparisons of Wi-Fi and Bluetooth Delays Feedback Voltage Contro (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '12759c64-22cb-b24f-f0de-fa787f1b8a54', 'Comparisons of Wi-Fi and Bluetooth Delays Feedback Voltage Controlled of Buck Converter', NULL, 2024, '10.1109/icome-ee64119.2024.10845438', 'journal', 'อนนท์ นำอิน, Wichet Thipprasert', 'openalex', 0, 'W4406754401', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845438');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '12759c64-22cb-b24f-f0de-fa787f1b8a54', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '12759c64-22cb-b24f-f0de-fa787f1b8a54')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '12759c64-22cb-b24f-f0de-fa787f1b8a54' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '12759c64-22cb-b24f-f0de-fa787f1b8a54', 'a0000001-0000-0000-0000-000000000011', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '12759c64-22cb-b24f-f0de-fa787f1b8a54')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '12759c64-22cb-b24f-f0de-fa787f1b8a54' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2024] Enhancing Bidirectional DC-DC Converters and MPPT in PV/Battery M (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '60a3d683-17f1-a6c9-aee0-62a1dd279254', 'Enhancing Bidirectional DC-DC Converters and MPPT in PV/Battery Microgrids Using Power Balance Control Techniques', NULL, 2024, '10.1109/icome-ee64119.2024.10845650', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W4406754665', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845650');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '60a3d683-17f1-a6c9-aee0-62a1dd279254', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '60a3d683-17f1-a6c9-aee0-62a1dd279254')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '60a3d683-17f1-a6c9-aee0-62a1dd279254' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '60a3d683-17f1-a6c9-aee0-62a1dd279254', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '60a3d683-17f1-a6c9-aee0-62a1dd279254')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '60a3d683-17f1-a6c9-aee0-62a1dd279254' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Optimization of Magnetically Coupled Resonant Low Frequency Wirel (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0b787514-6823-ce75-8ad2-2c178b0b445d', 'Optimization of Magnetically Coupled Resonant Low Frequency Wireless Power Transfer Based on Mayfly Optimization Algorithm', NULL, 2024, '10.1109/icome-ee64119.2024.10845411', 'journal', 'อนนท์ นำอิน', 'openalex', 0, 'W4406754758', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845411');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0b787514-6823-ce75-8ad2-2c178b0b445d', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0b787514-6823-ce75-8ad2-2c178b0b445d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0b787514-6823-ce75-8ad2-2c178b0b445d' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2024] Hamiltonian Control Law for Enhanced Power Factor Correction in S (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14', 'Hamiltonian Control Law for Enhanced Power Factor Correction in Single-Phase AC/DC Boost Converters', NULL, 2024, '10.1109/icome-ee64119.2024.10845470', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W4406754760', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845470');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4bff8b1c-3ba8-27c8-f0ac-7e5f46b5ce14' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Dual-Port LCL-S with Very Low Frequency Resonant Wireless Power T (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ee2c51ec-b843-d015-e8ac-a552725e7d21', 'Dual-Port LCL-S with Very Low Frequency Resonant Wireless Power Transfer System for the Battery', NULL, 2024, '10.1109/icome-ee64119.2024.10845558', 'journal', 'อนนท์ นำอิน', 'openalex', 0, 'W4406755189', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845558');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ee2c51ec-b843-d015-e8ac-a552725e7d21', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ee2c51ec-b843-d015-e8ac-a552725e7d21')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ee2c51ec-b843-d015-e8ac-a552725e7d21' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2024] Non-Isolated Three-Port Converters for Renewable Energy Applicati (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e4130143-5f12-b6b0-d869-5b687bd3c31b', 'Non-Isolated Three-Port Converters for Renewable Energy Applications with Power Balance Control Techniques', NULL, 2024, '10.1109/icome-ee64119.2024.10845688', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W4406784385', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845688');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e4130143-5f12-b6b0-d869-5b687bd3c31b', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e4130143-5f12-b6b0-d869-5b687bd3c31b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e4130143-5f12-b6b0-d869-5b687bd3c31b' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e4130143-5f12-b6b0-d869-5b687bd3c31b', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e4130143-5f12-b6b0-d869-5b687bd3c31b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e4130143-5f12-b6b0-d869-5b687bd3c31b' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] A Comparative Study of Square and EE Shapes Coils on Inductive Wi (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '843ad187-fc6e-1c33-46a2-b815dda77628', 'A Comparative Study of Square and EE Shapes Coils on Inductive Wireless Power Transfer Systems', NULL, 2024, '10.1109/icome-ee64119.2024.10845498', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W4406784386', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845498');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '843ad187-fc6e-1c33-46a2-b815dda77628', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '843ad187-fc6e-1c33-46a2-b815dda77628')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '843ad187-fc6e-1c33-46a2-b815dda77628' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '843ad187-fc6e-1c33-46a2-b815dda77628', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '843ad187-fc6e-1c33-46a2-b815dda77628')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '843ad187-fc6e-1c33-46a2-b815dda77628' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2024] Water Pumping System Using DC Motor Pump with Full Bridge Convert (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e942c948-0a4b-4240-9ca1-ee535f21bc7c', 'Water Pumping System Using DC Motor Pump with Full Bridge Converter', NULL, 2024, '10.1109/ecti-con60892.2024.10594874', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 0, 'W4401111083', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con60892.2024.10594874');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e942c948-0a4b-4240-9ca1-ee535f21bc7c', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e942c948-0a4b-4240-9ca1-ee535f21bc7c')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e942c948-0a4b-4240-9ca1-ee535f21bc7c' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2024] Development of Lighting from LED Lamps for Growing Chrysanthemum  (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '9a3edc72-0d02-f3e2-cef9-e42e66b67055', 'Development of Lighting from LED Lamps for Growing Chrysanthemum Flowers', NULL, 2024, '10.1109/ecti-con60892.2024.10594996', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 0, 'W4401111137', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con60892.2024.10594996');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '9a3edc72-0d02-f3e2-cef9-e42e66b67055', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '9a3edc72-0d02-f3e2-cef9-e42e66b67055')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '9a3edc72-0d02-f3e2-cef9-e42e66b67055' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2024] Analysis for Optimization Loss of Induction Heating (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '8507e412-260c-78f7-fc58-f79ecc0960d2', 'Analysis for Optimization Loss of Induction Heating', NULL, 2024, '10.1109/icome-ee64119.2024.10845403', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 0, 'W4406784382', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icome-ee64119.2024.10845403');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8507e412-260c-78f7-fc58-f79ecc0960d2', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8507e412-260c-78f7-fc58-f79ecc0960d2')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8507e412-260c-78f7-fc58-f79ecc0960d2' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2023] Varied-Frequency CC–CV Inductive Wireless Power Transfer with Eff (Cited: 14) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '83af5171-dbf6-98f7-6089-8a4facc01c56', 'Varied-Frequency CC–CV Inductive Wireless Power Transfer with Efficiency-Regulated EV Charging for an Electric Golf Cart', 'Energies', 2023, '10.3390/en16217388', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 14, 'W4388183938', true, 'https://www.mdpi.com/1996-1073/16/21/7388/pdf?version=1698817324'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.3390/en16217388');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '83af5171-dbf6-98f7-6089-8a4facc01c56', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '83af5171-dbf6-98f7-6089-8a4facc01c56')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '83af5171-dbf6-98f7-6089-8a4facc01c56' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '83af5171-dbf6-98f7-6089-8a4facc01c56', 'a0000001-0000-0000-0000-000000000001', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '83af5171-dbf6-98f7-6089-8a4facc01c56')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '83af5171-dbf6-98f7-6089-8a4facc01c56' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2023] Stereo Vision-based Turn-Alignment Optimization for Wireless Powe (Cited: 7) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '3180d4b9-0570-356a-301e-0fd88310ba53', 'Stereo Vision-based Turn-Alignment Optimization for Wireless Power Transmission Positioning', NULL, 2023, '10.1109/itecasia-pacific59272.2023.10372364', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 7, 'W4390493838', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/itecasia-pacific59272.2023.10372364');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3180d4b9-0570-356a-301e-0fd88310ba53', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3180d4b9-0570-356a-301e-0fd88310ba53')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3180d4b9-0570-356a-301e-0fd88310ba53' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3180d4b9-0570-356a-301e-0fd88310ba53', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3180d4b9-0570-356a-301e-0fd88310ba53')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3180d4b9-0570-356a-301e-0fd88310ba53' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2023] Dynamic and Steady-State Behavior of Distributed Power Supply in  (Cited: 3)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f354be19-630c-4a30-5d8e-cfd466d24fc5', 'Dynamic and Steady-State Behavior of Distributed Power Supply in DC Architecture with Minimized DC Bus Capacitor', 'IEEJ Journal of Industry Applications', 2023, '10.1541/ieejjia.22008110', 'journal', 'อนนท์ นำอิน', 'openalex', 3, 'W4376463544', true, 'https://www.jstage.jst.go.jp/article/ieejjia/12/4/12_22008110/_pdf'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1541/ieejjia.22008110');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f354be19-630c-4a30-5d8e-cfd466d24fc5', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f354be19-630c-4a30-5d8e-cfd466d24fc5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f354be19-630c-4a30-5d8e-cfd466d24fc5' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2023] Switch Fault Detection in a Family of Non-isolated Single-Inducto (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e574dc17-10f0-f75d-cebf-8983866c1736', 'Switch Fault Detection in a Family of Non-isolated Single-Inductor Three-Port Converters for Low Power Electrification Applications', NULL, 2023, '10.1109/itecasia-pacific59272.2023.10372234', 'journal', 'อนนท์ นำอิน', 'openalex', 2, 'W4390493869', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/itecasia-pacific59272.2023.10372234');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e574dc17-10f0-f75d-cebf-8983866c1736', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e574dc17-10f0-f75d-cebf-8983866c1736')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e574dc17-10f0-f75d-cebf-8983866c1736' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2023] Design and Modeling of A Hamiltonian Control Law for A Bidirectio (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e0fd47c3-14ca-8a40-542b-8bcae09f695b', 'Design and Modeling of A Hamiltonian Control Law for A Bidirectional Converter in DC Distribution Applications', NULL, 2023, '10.1109/itecasia-pacific59272.2023.10372198', 'journal', 'อนนท์ นำอิน', 'openalex', 0, 'W4390494846', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/itecasia-pacific59272.2023.10372198');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e0fd47c3-14ca-8a40-542b-8bcae09f695b', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e0fd47c3-14ca-8a40-542b-8bcae09f695b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e0fd47c3-14ca-8a40-542b-8bcae09f695b' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] Analysis of the effect of charge and discharge LiFePO4 batteries  (Cited: 2) [CESRU: 5]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'Analysis of the effect of charge and discharge LiFePO4 batteries using BMS with and without Active balancer', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741615', 'journal', 'มนตรี เงาเดช, Worrajak Muangjai, Teerasak Somsak, Kosol Oranpiroj, Jutturit Thongpron', 'openalex', 2, 'W4220711429', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741615');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'a0000001-0000-0000-0000-000000000009', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0f1a3abc-7b70-d8be-90f3-9fa241996f08', 'a0000001-0000-0000-0000-000000000001', 'last_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0f1a3abc-7b70-d8be-90f3-9fa241996f08' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2022] Variable Frequency Control for Constant Current Constant Voltage  (Cited: 18) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5', 'Variable Frequency Control for Constant Current Constant Voltage Inductive Wireless EV Charging System', '2022 International Power Electronics Conference (IPEC-Himeji 2022- ECCE Asia)', 2022, '10.23919/ipec-himeji2022-ecce53331.2022.9806831', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 18, 'W4283748793', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/ipec-himeji2022-ecce53331.2022.9806831');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '6531e5f4-4b22-d112-bf71-9d7dcfdf07b5' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2022] 10 kW Inductive Wireless Power Transfer Prototype for EV Charging (Cited: 15) [CESRU: 5]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', '10 kW Inductive Wireless Power Transfer Prototype for EV Charging in Thailand', 'ECTI Transactions on Electrical Engineering Electronics and Communications', 2022, '10.37936/ecti-eec.2022201.246108', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron, Teerasak Somsak, Wiwat Tippachon, Kosol Oranpiroj', 'openalex', 15, 'W4213247709', true, 'https://ph02.tci-thaijo.org/index.php/ECTI-EEC/article/download/246108/166981'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.37936/ecti-eec.2022201.246108');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3b1f001f-2c96-f54c-2497-70f17f66fcff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3b1f001f-2c96-f54c-2497-70f17f66fcff' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', 'a0000001-0000-0000-0000-000000000001', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3b1f001f-2c96-f54c-2497-70f17f66fcff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3b1f001f-2c96-f54c-2497-70f17f66fcff' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3b1f001f-2c96-f54c-2497-70f17f66fcff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3b1f001f-2c96-f54c-2497-70f17f66fcff' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', 'a0000001-0000-0000-0000-000000000004', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3b1f001f-2c96-f54c-2497-70f17f66fcff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3b1f001f-2c96-f54c-2497-70f17f66fcff' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3b1f001f-2c96-f54c-2497-70f17f66fcff', 'a0000001-0000-0000-0000-000000000003', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3b1f001f-2c96-f54c-2497-70f17f66fcff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3b1f001f-2c96-f54c-2497-70f17f66fcff' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2022] Design and simulation of DC distributed power supply with power b (Cited: 13)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'fc65c55f-6fca-4218-fffb-970ba78b60cf', 'Design and simulation of DC distributed power supply with power balance control technique', 'International Journal of Power Electronics and Drive Systems/International Journal of Electrical and Computer Engineering', 2022, '10.11591/ijpeds.v13.i1.pp460-469', 'journal', 'อนนท์ นำอิน', 'openalex', 13, 'W4220819611', true, 'https://ijpeds.iaescore.com/index.php/IJPEDS/article/download/21821/13744'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.11591/ijpeds.v13.i1.pp460-469');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'fc65c55f-6fca-4218-fffb-970ba78b60cf', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'fc65c55f-6fca-4218-fffb-970ba78b60cf')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'fc65c55f-6fca-4218-fffb-970ba78b60cf' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] Wireless Golf Cart Charging Development in Thailand (Cited: 6) [CESRU: 4]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '76a152e9-975a-7bd9-aad6-8ab7f61be9cd', 'Wireless Golf Cart Charging Development in Thailand', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741670', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron, Kosol Oranpiroj, Teerasak Somsak', 'openalex', 6, 'W4221077697', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741670');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '76a152e9-975a-7bd9-aad6-8ab7f61be9cd', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '76a152e9-975a-7bd9-aad6-8ab7f61be9cd', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '76a152e9-975a-7bd9-aad6-8ab7f61be9cd', 'a0000001-0000-0000-0000-000000000003', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '76a152e9-975a-7bd9-aad6-8ab7f61be9cd', 'a0000001-0000-0000-0000-000000000002', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '76a152e9-975a-7bd9-aad6-8ab7f61be9cd' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2022] Dynamic and Steady-State Behavior of Distributed Power Supply in  (Cited: 6)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b6355c2d-c22f-4f90-fd01-7527fc671756', 'Dynamic and Steady-State Behavior of Distributed Power Supply in DC Architecture with Minimized DC Bus Capacitor', '2022 International Power Electronics Conference (IPEC-Himeji 2022- ECCE Asia)', 2022, '10.23919/ipec-himeji2022-ecce53331.2022.9806979', 'journal', 'อนนท์ นำอิน', 'openalex', 6, 'W4283752778', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/ipec-himeji2022-ecce53331.2022.9806979');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b6355c2d-c22f-4f90-fd01-7527fc671756', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b6355c2d-c22f-4f90-fd01-7527fc671756')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b6355c2d-c22f-4f90-fd01-7527fc671756' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] A Wide Bandgap Three-level Buck Converter with Power Balance Cont (Cited: 4)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '73f21a06-5fa5-f837-274f-bdf70031d3b7', 'A Wide Bandgap Three-level Buck Converter with Power Balance Control Technique for High Power Density Applications – Design and Simulation', '2022 25th International Conference on Electrical Machines and Systems (ICEMS)', 2022, '10.1109/icems56177.2022.9983186', 'journal', 'อนนท์ นำอิน', 'openalex', 4, 'W4312097382', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icems56177.2022.9983186');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '73f21a06-5fa5-f837-274f-bdf70031d3b7', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '73f21a06-5fa5-f837-274f-bdf70031d3b7')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '73f21a06-5fa5-f837-274f-bdf70031d3b7' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] Implementation of Half-Bridge Class D Voltage-Source Inverter for (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0335f201-e51f-157b-c126-37c7868a7ae1', 'Implementation of Half-Bridge Class D Voltage-Source Inverter for Domestic Medical Applications', '2022 19th International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)', 2022, '10.1109/ecti-con54298.2022.9795512', 'journal', 'อนนท์ นำอิน', 'openalex', 1, 'W4283018801', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con54298.2022.9795512');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0335f201-e51f-157b-c126-37c7868a7ae1', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0335f201-e51f-157b-c126-37c7868a7ae1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0335f201-e51f-157b-c126-37c7868a7ae1' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] Characteristics of Steady-state, Pulse, and Programmable of Tungs (Cited: 0) [CESRU: 6]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'Characteristics of Steady-state, Pulse, and Programmable of Tungsten Halogen Solar Simulator', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741570', 'journal', 'อนนท์ นำอิน, Worrajak Muangjai, Wiwat Tippachon, Kosol Oranpiroj, Jutturit Thongpron, Teerasak Somsak', 'openalex', 0, 'W4220862046', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741570');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000004', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000001', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b4e1403c-2e84-a523-1afb-d5660a7e2996', 'a0000001-0000-0000-0000-000000000002', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b4e1403c-2e84-a523-1afb-d5660a7e2996' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2022] Effect of Rear Irradiance on Series and Shunt Resistance of n-Typ (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'eb269b01-a621-56d1-4d40-403fe8495fff', 'Effect of Rear Irradiance on Series and Shunt Resistance of n-Type PERT Bifacial Silicon Module', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741703', 'journal', 'อนนท์ นำอิน', 'openalex', 0, 'W4221109851', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741703');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'eb269b01-a621-56d1-4d40-403fe8495fff', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'eb269b01-a621-56d1-4d40-403fe8495fff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'eb269b01-a621-56d1-4d40-403fe8495fff' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2022] Economic and Sensitivity Analyses for an Optimal Hybrid Power Gen (Cited: 1) [CESRU: 3]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '7f8bcd51-e620-4459-d280-56a92a55f08b', 'Economic and Sensitivity Analyses for an Optimal Hybrid Power Generation for Stand-Alone Power Systems: Case of Klongrua, Phato, Chumphon, Thailand', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741700', 'journal', 'ธีระศักดิ์ สมศักดิ์, Worrajak Muangjai, Nattawat Panlawan', 'openalex', 1, 'W4220715950', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741700');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '7f8bcd51-e620-4459-d280-56a92a55f08b', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '7f8bcd51-e620-4459-d280-56a92a55f08b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '7f8bcd51-e620-4459-d280-56a92a55f08b' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '7f8bcd51-e620-4459-d280-56a92a55f08b', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '7f8bcd51-e620-4459-d280-56a92a55f08b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '7f8bcd51-e620-4459-d280-56a92a55f08b' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '7f8bcd51-e620-4459-d280-56a92a55f08b', 'a0000001-0000-0000-0000-000000000012', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '7f8bcd51-e620-4459-d280-56a92a55f08b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '7f8bcd51-e620-4459-d280-56a92a55f08b' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');

-- [2022] An Experiment approach of Low Radiation Energy Management for Pho (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3', 'An Experiment approach of Low Radiation Energy Management for Photovoltaic Pumping system', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741645', 'journal', 'ธีระศักดิ์ สมศักดิ์, Worrajak Muangjai', 'openalex', 0, 'W4220916716', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741645');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'fd28f66d-1aaa-a4e7-9f38-5f817c8a93f3' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');

-- [2022] An Air Force Cooling of Lithium–ion Battery Thermal Management Sy (Cited: 3)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '84d4d70e-8270-7c82-30f4-0a6f510c7464', 'An Air Force Cooling of Lithium–ion Battery Thermal Management System for Heat Eliminating in Modified Electric Vehicle', '2022 International Electrical Engineering Congress (iEECON)', 2022, '10.1109/ieecon53204.2022.9741680', 'journal', 'นพพร พัชรประกิติ', 'openalex', 3, 'W4220901873', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon53204.2022.9741680');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '84d4d70e-8270-7c82-30f4-0a6f510c7464', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '84d4d70e-8270-7c82-30f4-0a6f510c7464')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '84d4d70e-8270-7c82-30f4-0a6f510c7464' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2022] Modeling, Simulation and Development of Grid-Connected Voltage So (Cited: 10)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '7d26b5e4-3b7b-87b9-6fc8-d46caa6ba89f', 'Modeling, Simulation and Development of Grid-Connected Voltage Source Converter with Selective Harmonic Mitigation: HiL and Experimental Validations', 'Energies', 2022, '10.3390/en15072535', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 10, 'W4221108025', true, 'https://www.mdpi.com/1996-1073/15/7/2535/pdf?version=1649561208'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.3390/en15072535');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '7d26b5e4-3b7b-87b9-6fc8-d46caa6ba89f', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '7d26b5e4-3b7b-87b9-6fc8-d46caa6ba89f')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '7d26b5e4-3b7b-87b9-6fc8-d46caa6ba89f' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2022] Electrical Performance of Composite Insulator under IEC/TR 62730  (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0ef1552c-ee6d-77ec-f067-4b4e51c2b40b', 'Electrical Performance of Composite Insulator under IEC/TR 62730 Standard Testing for 22 kV Distribution System', 'PRZEGLĄD ELEKTROTECHNICZNY', 2022, '10.15199/48.2022.02.08', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 2, 'W4210563978', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.15199/48.2022.02.08');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0ef1552c-ee6d-77ec-f067-4b4e51c2b40b', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0ef1552c-ee6d-77ec-f067-4b4e51c2b40b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0ef1552c-ee6d-77ec-f067-4b4e51c2b40b' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2021] Critical Implications of Longterm IoT Applications in Thailand (Cited: 2) [CESRU: 6]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'Critical Implications of Longterm IoT Applications in Thailand', NULL, 2021, '10.1109/ecti-con51831.2021.9454755', 'journal', 'มนตรี เงาเดช, Worrajak Muangjai, Teerasak Somsak, Nattawat Panlawan, Jutturit Thongpron, Kosol Oranpiroj', 'openalex', 2, 'W3176284718', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con51831.2021.9454755');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000009', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000002', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000012', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000012');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000001', 'co_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c5d298e8-7550-4e23-b7bc-b3a17db35e33', 'a0000001-0000-0000-0000-000000000003', 'co_author', 6
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c5d298e8-7550-4e23-b7bc-b3a17db35e33' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2021] A Prototype of Block UU Shape Ferrite Cores Inductive Wireless Po (Cited: 10) [CESRU: 5]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'A Prototype of Block UU Shape Ferrite Cores Inductive Wireless Power Transfer for EV Charger', NULL, 2021, '10.1109/ecti-con51831.2021.9454859', 'journal', 'อนนท์ นำอิน, Teerasak Somsak, Jutturit Thongpron, Wiwat Tippachon, Kosol Oranpiroj', 'openalex', 10, 'W3173848158', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con51831.2021.9454859');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'a0000001-0000-0000-0000-000000000002', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'a0000001-0000-0000-0000-000000000004', 'co_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a5ece752-d3ec-32cc-176f-5414d9bbac67', 'a0000001-0000-0000-0000-000000000003', 'last_author', 5
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a5ece752-d3ec-32cc-176f-5414d9bbac67' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2021] Constant Current - voltage with Maximum Efficiency Inductive Wire (Cited: 11) [CESRU: 4]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'bceaeecb-6305-ced7-fe28-a16d142ed4e8', 'Constant Current - voltage with Maximum Efficiency Inductive Wireless EV Charging Control using Dual - sides DC Converters', NULL, 2021, '10.1109/ecti-con51831.2021.9454726', 'journal', 'อนนท์ นำอิน, Teerasak Somsak, Jutturit Thongpron, Nopporn Patcharaprakiti', 'openalex', 11, 'W3175398881', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecti-con51831.2021.9454726');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bceaeecb-6305-ced7-fe28-a16d142ed4e8', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bceaeecb-6305-ced7-fe28-a16d142ed4e8', 'a0000001-0000-0000-0000-000000000002', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bceaeecb-6305-ced7-fe28-a16d142ed4e8', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bceaeecb-6305-ced7-fe28-a16d142ed4e8', 'a0000001-0000-0000-0000-000000000005', 'last_author', 4
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bceaeecb-6305-ced7-fe28-a16d142ed4e8' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2020] Tracking Wheel Test of Composite Insulator In 22kV Distribution S (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '82b698fa-1547-a18e-a5ad-eb28ea2c6dc1', 'Tracking Wheel Test of Composite Insulator In 22kV Distribution System', NULL, 2020, '10.1109/ieecon48109.2020.229548', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 1, 'W3022951872', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon48109.2020.229548');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '82b698fa-1547-a18e-a5ad-eb28ea2c6dc1', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '82b698fa-1547-a18e-a5ad-eb28ea2c6dc1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '82b698fa-1547-a18e-a5ad-eb28ea2c6dc1' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2019] An Ammonia Removal for Red Craw Crayfish NurseryWater Pond by usi (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '44e17572-897f-3064-8302-4904935547a0', 'An Ammonia Removal for Red Craw Crayfish NurseryWater Pond by using Electrocoagulation Method', 'SHILAP Revista de lepidopterología', 2019, '10.14456/randk.2019.3', 'journal', 'นพพร พัชรประกิติ', 'openalex', 1, 'W4390690360', true, 'https://doaj.org/article/eda343315dac492a9fcc19df053c977f'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.14456/randk.2019.3');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '44e17572-897f-3064-8302-4904935547a0', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '44e17572-897f-3064-8302-4904935547a0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '44e17572-897f-3064-8302-4904935547a0' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2018] An Apply IoT for Collection and Analysis of Specific Energy Consu (Cited: 2) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '29ff60bf-8665-226c-d946-ca8dff64604d', 'An Apply IoT for Collection and Analysis of Specific Energy Consumption in Production Line of Ready-to-Drink Juice at the Second Royal Factory Mae Chan', NULL, 2018, '10.23919/icue-gesd.2018.8635775', 'journal', 'มนตรี เงาเดช, Worrajak Muangjai', 'openalex', 2, 'W2912400559', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.23919/icue-gesd.2018.8635775');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '29ff60bf-8665-226c-d946-ca8dff64604d', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '29ff60bf-8665-226c-d946-ca8dff64604d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '29ff60bf-8665-226c-d946-ca8dff64604d' AND researcher_id = 'a0000001-0000-0000-0000-000000000008');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '29ff60bf-8665-226c-d946-ca8dff64604d', 'a0000001-0000-0000-0000-000000000009', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '29ff60bf-8665-226c-d946-ca8dff64604d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '29ff60bf-8665-226c-d946-ca8dff64604d' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');

-- [2018] Performance of Inductive Wireless Power Transfer Between Using Pu (Cited: 16)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '4377f142-e81e-4692-29a0-5b2adf7ec754', 'Performance of Inductive Wireless Power Transfer Between Using Pure Sine Wave and Square Wave Inverters', NULL, 2018, '10.1109/itec-ap.2018.8433306', 'journal', 'อนนท์ นำอิน', 'openalex', 16, 'W2887374324', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/itec-ap.2018.8433306');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4377f142-e81e-4692-29a0-5b2adf7ec754', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4377f142-e81e-4692-29a0-5b2adf7ec754')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4377f142-e81e-4692-29a0-5b2adf7ec754' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2018] Mutual Impedance Adaptation for Maximum Power Point Tracking on L (Cited: 14)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '632e5a1e-d18d-65ac-0317-8dec6c939902', 'Mutual Impedance Adaptation for Maximum Power Point Tracking on LED TV Wireless Power Transfer Vary with Distance', NULL, 2018, '10.1109/ecticon.2018.8619943', 'journal', 'อนนท์ นำอิน', 'openalex', 14, 'W2911723455', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2018.8619943');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '632e5a1e-d18d-65ac-0317-8dec6c939902', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '632e5a1e-d18d-65ac-0317-8dec6c939902')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '632e5a1e-d18d-65ac-0317-8dec6c939902' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2018] Solar Tricycle with Lateral Misalignment Maximum Power Point Trac (Cited: 11)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '06a5991f-f8be-7554-ca50-fc39ec0ac9ae', 'Solar Tricycle with Lateral Misalignment Maximum Power Point Tracking Wireless Power Transfer', NULL, 2018, '10.1109/ecticon.2018.8619926', 'journal', 'อนนท์ นำอิน', 'openalex', 11, 'W2914225801', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2018.8619926');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '06a5991f-f8be-7554-ca50-fc39ec0ac9ae', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '06a5991f-f8be-7554-ca50-fc39ec0ac9ae')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '06a5991f-f8be-7554-ca50-fc39ec0ac9ae' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- [2018] Optimal solar energy on thermoelectric cooler of water generator  (Cited: 6) [CESRU: 3]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '586db9c3-5da8-133d-6d82-f2d4bae69862', 'Optimal solar energy on thermoelectric cooler of water generator in case study on flood crisis', 'Japanese Journal of Applied Physics', 2018, '10.7567/jjap.57.08rh05', 'journal', 'ธีระศักดิ์ สมศักดิ์, Nopporn Patcharaprakiti, Jutturit Thongpron', 'openalex', 6, 'W2883654963', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7567/jjap.57.08rh05');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '586db9c3-5da8-133d-6d82-f2d4bae69862', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '586db9c3-5da8-133d-6d82-f2d4bae69862')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '586db9c3-5da8-133d-6d82-f2d4bae69862' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '586db9c3-5da8-133d-6d82-f2d4bae69862', 'a0000001-0000-0000-0000-000000000005', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '586db9c3-5da8-133d-6d82-f2d4bae69862')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '586db9c3-5da8-133d-6d82-f2d4bae69862' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '586db9c3-5da8-133d-6d82-f2d4bae69862', 'a0000001-0000-0000-0000-000000000001', 'last_author', 3
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '586db9c3-5da8-133d-6d82-f2d4bae69862')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '586db9c3-5da8-133d-6d82-f2d4bae69862' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2018] The Evaluation of Short Circuit Current to Achieve Optimal Design (Cited: 6) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e54488d7-23a1-5121-da6c-477a82c40640', 'The Evaluation of Short Circuit Current to Achieve Optimal Design and Protection for Elements in Power Network with Renewable Energy', NULL, 2018, '10.1109/ieecon.2018.8712280', 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 6, 'W2946572413', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon.2018.8712280');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e54488d7-23a1-5121-da6c-477a82c40640', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e54488d7-23a1-5121-da6c-477a82c40640')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e54488d7-23a1-5121-da6c-477a82c40640' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e54488d7-23a1-5121-da6c-477a82c40640', 'a0000001-0000-0000-0000-000000000003', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e54488d7-23a1-5121-da6c-477a82c40640')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e54488d7-23a1-5121-da6c-477a82c40640' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2018] The design of IoT system for icehouse manufacturing (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f523a99f-4589-8124-2271-3fe3035975ca', 'The design of IoT system for icehouse manufacturing', '2018 5th International Conference on Business and Industrial Research (ICBIR)', 2018, '10.1109/icbir.2018.8391157', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 0, 'W2809163857', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icbir.2018.8391157');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f523a99f-4589-8124-2271-3fe3035975ca', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f523a99f-4589-8124-2271-3fe3035975ca')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f523a99f-4589-8124-2271-3fe3035975ca' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2016] Techno evaluation on a grid connected 9.8 kWp PV rooftop at vario (Cited: 4)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '4b56d2db-fd8b-54b5-9814-93688ac6d2f9', 'Techno evaluation on a grid connected 9.8 kWp PV rooftop at various orientation in Thailand', NULL, 2016, '10.1109/ecticon.2016.7561465', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 4, 'W2521554979', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2016.7561465');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '4b56d2db-fd8b-54b5-9814-93688ac6d2f9', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '4b56d2db-fd8b-54b5-9814-93688ac6d2f9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '4b56d2db-fd8b-54b5-9814-93688ac6d2f9' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2016] Metal Oxide Surge Arresters Modelling in Temporary Overvoltage Co (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '557a449d-5f4d-ba57-4f2b-4367a44e4878', 'Metal Oxide Surge Arresters Modelling in Temporary Overvoltage Conditions', 'International Journal of Electronics and Electrical Engineering', 2016, '10.18178/ijeee.4.2.146-150', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 2, 'W2757643257', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.18178/ijeee.4.2.146-150');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '557a449d-5f4d-ba57-4f2b-4367a44e4878', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '557a449d-5f4d-ba57-4f2b-4367a44e4878')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '557a449d-5f4d-ba57-4f2b-4367a44e4878' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2016] Electrical Performances of Line Post Insulators in 22kV Distribut (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '2438f068-d493-e83f-1d4b-677a81732fb6', 'Electrical Performances of Line Post Insulators in 22kV Distribution System', 'International Journal of Electronics and Electrical Engineering', 2016, '10.18178/ijeee.4.2.140-145', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 0, 'W2757447736', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.18178/ijeee.4.2.140-145');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '2438f068-d493-e83f-1d4b-677a81732fb6', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '2438f068-d493-e83f-1d4b-677a81732fb6')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '2438f068-d493-e83f-1d4b-677a81732fb6' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2015] An economic evaluation comparison of solar water pumping system w (Cited: 13) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ae733a7d-6088-9fc5-f2a0-293a52581fe8', 'An economic evaluation comparison of solar water pumping system with engine pumping system for rice cultivation', 'Japanese Journal of Applied Physics', 2015, '10.7567/jjap.54.08kh01', 'journal', 'นพพร พัชรประกิติ, Jutturit Thongpron', 'openalex', 13, 'W1514948762', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7567/jjap.54.08kh01');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ae733a7d-6088-9fc5-f2a0-293a52581fe8', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ae733a7d-6088-9fc5-f2a0-293a52581fe8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ae733a7d-6088-9fc5-f2a0-293a52581fe8' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ae733a7d-6088-9fc5-f2a0-293a52581fe8', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ae733a7d-6088-9fc5-f2a0-293a52581fe8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ae733a7d-6088-9fc5-f2a0-293a52581fe8' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2015] A rainfall trend analysis for agriculture irrigation system manag (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '43a8a826-d3be-956d-2fd1-0d752f781f36', 'A rainfall trend analysis for agriculture irrigation system management case study: Sansai district - Chiangmai province', NULL, 2015, '10.1109/ticst.2015.7369409', 'journal', 'นพพร พัชรประกิติ', 'openalex', 2, 'W2207711256', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ticst.2015.7369409');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '43a8a826-d3be-956d-2fd1-0d752f781f36', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '43a8a826-d3be-956d-2fd1-0d752f781f36')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '43a8a826-d3be-956d-2fd1-0d752f781f36' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2015] Load Modeling based on System Identification with Kalman Filterin (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '65995609-13b3-7eca-620d-a44f20a70aae', 'Load Modeling based on System Identification with Kalman Filtering of Electrical Energy Consumption of Residential Air-Conditioning', 'International journal of advanced smart convergence', 2015, '10.7236/ijasc.2015.4.1.45', 'journal', 'นพพร พัชรประกิติ, Kasem Tripak', 'openalex', 0, 'W2371941510', true, 'http://koreascience.or.kr:80/article/JAKO201525249160455.pdf'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7236/ijasc.2015.4.1.45');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '65995609-13b3-7eca-620d-a44f20a70aae', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '65995609-13b3-7eca-620d-a44f20a70aae')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '65995609-13b3-7eca-620d-a44f20a70aae' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '65995609-13b3-7eca-620d-a44f20a70aae', 'a0000001-0000-0000-0000-000000000010', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '65995609-13b3-7eca-620d-a44f20a70aae')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '65995609-13b3-7eca-620d-a44f20a70aae' AND researcher_id = 'a0000001-0000-0000-0000-000000000010');

-- [2015] An Economic Evaluation under Thailand Feed in Tariff of Residenti (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ded87403-cb5d-f7ae-7d7e-d5e6e25aa9fc', 'An Economic Evaluation under Thailand Feed in Tariff of Residential Roof Top Photovoltaic Grid Connected System with Energy Storage for Voltage Stability Improving', 'The International Journal of Advanced Culture Technology', 2015, '10.17703/ijact.2015.3.1.120', 'journal', 'นพพร พัชรประกิติ', 'openalex', 0, 'W2404924359', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.17703/ijact.2015.3.1.120');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ded87403-cb5d-f7ae-7d7e-d5e6e25aa9fc', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ded87403-cb5d-f7ae-7d7e-d5e6e25aa9fc')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ded87403-cb5d-f7ae-7d7e-d5e6e25aa9fc' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2015] Electrical Performance of Porcelain Surge Arrester in 22 kV Distr (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '6e359182-2160-5386-1981-8e49d36ee4e3', 'Electrical Performance of Porcelain Surge Arrester in 22 kV Distribution System under Contaminated Conditions', 'Journal of Power and Energy Engineering', 2015, '10.4236/jpee.2015.35007', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 2, 'W1937610525', true, 'http://www.scirp.org/journal/PaperDownload.aspx?paperID=56486'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.4236/jpee.2015.35007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '6e359182-2160-5386-1981-8e49d36ee4e3', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '6e359182-2160-5386-1981-8e49d36ee4e3')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '6e359182-2160-5386-1981-8e49d36ee4e3' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2014] Voltage sag signal generator program for testing electrical equip (Cited: 2) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '5f46280b-01c8-075d-c919-dc88cf00509e', 'Voltage sag signal generator program for testing electrical equipment', NULL, 2014, '10.1109/ieecon.2014.6925871', 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 2, 'W2078334361', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ieecon.2014.6925871');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '5f46280b-01c8-075d-c919-dc88cf00509e', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '5f46280b-01c8-075d-c919-dc88cf00509e')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '5f46280b-01c8-075d-c919-dc88cf00509e' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '5f46280b-01c8-075d-c919-dc88cf00509e', 'a0000001-0000-0000-0000-000000000003', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '5f46280b-01c8-075d-c919-dc88cf00509e')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '5f46280b-01c8-075d-c919-dc88cf00509e' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2014] Leakage Currents of Zinc Oxide Surge Arresters in 22 kV Distribut (Cited: 8)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'c4d8e451-bee4-2e11-a5f6-f9477e323843', 'Leakage Currents of Zinc Oxide Surge Arresters in 22 kV Distribution System Using Thermal Image Camera', 'Journal of Power and Energy Engineering', 2014, '10.4236/jpee.2014.24095', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 8, 'W2013262782', true, 'https://doi.org/10.4236/jpee.2014.24095'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.4236/jpee.2014.24095');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c4d8e451-bee4-2e11-a5f6-f9477e323843', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c4d8e451-bee4-2e11-a5f6-f9477e323843')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c4d8e451-bee4-2e11-a5f6-f9477e323843' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2014] Electrical Performance of Zinc Oxide Surge Arresters in 22 kV Dis (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '38f6ae39-b8d3-9ae4-31a7-259bb4b3b6dd', 'Electrical Performance of Zinc Oxide Surge Arresters in 22 kV Distribution System Using Thermal Image Camera', 'Advanced materials research', 2014, '10.4028/www.scientific.net/amr.931-932.857', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 1, 'W2043157795', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.4028/www.scientific.net/amr.931-932.857');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '38f6ae39-b8d3-9ae4-31a7-259bb4b3b6dd', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '38f6ae39-b8d3-9ae4-31a7-259bb4b3b6dd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '38f6ae39-b8d3-9ae4-31a7-259bb4b3b6dd' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2013] High-Spatial Resolution Giant Magnetoresistive Sensors - Part I:  (Cited: 4)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f4d66448-8c35-1fad-1972-a07c7a04e2a7', 'High-Spatial Resolution Giant Magnetoresistive Sensors - Part I: Application in Non-Destructive Evaluation', 'Smart sensors, measurement and instrumentation', 2013, '10.1007/978-3-642-37172-1_9', 'book_chapter', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 4, 'W93968082', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1007/978-3-642-37172-1_9');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f4d66448-8c35-1fad-1972-a07c7a04e2a7', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f4d66448-8c35-1fad-1972-a07c7a04e2a7')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f4d66448-8c35-1fad-1972-a07c7a04e2a7' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2013] An implementation algorithm of a carrier-based PWM technique for  (Cited: 5) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '047879d8-72e1-0a91-ca29-3577e8e21074', 'An implementation algorithm of a carrier-based PWM technique for three-phase four-leg voltage sag generator with microcontroller', NULL, 2013, '10.1109/peds.2013.6527136', 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 5, 'W2084108983', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/peds.2013.6527136');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '047879d8-72e1-0a91-ca29-3577e8e21074', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '047879d8-72e1-0a91-ca29-3577e8e21074')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '047879d8-72e1-0a91-ca29-3577e8e21074' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '047879d8-72e1-0a91-ca29-3577e8e21074', 'a0000001-0000-0000-0000-000000000003', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '047879d8-72e1-0a91-ca29-3577e8e21074')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '047879d8-72e1-0a91-ca29-3577e8e21074' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2012] Construction of Tungsten Halogen, Pulsed LED, and Combined Tungst (Cited: 42) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ea76c8fa-900d-072b-94f6-5e9096f493dd', 'Construction of Tungsten Halogen, Pulsed LED, and Combined Tungsten Halogen-LED Solar Simulators for Solar Cell<mml:math xmlns:mml="http://www.w3.org/1998/Math/MathML"><mml:mi>I</mml:mi></mml:math>-<mml:math xmlns:mml="http://www.w3.org/1998/Math/MathML"><mml:mi>V</mml:mi></mml:math>Characterization and Electrical Parameters Determination', 'International Journal of Photoenergy', 2012, '10.1155/2012/527820', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 42, 'W2082514606', true, 'https://downloads.hindawi.com/journals/ijp/2012/527820.pdf'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1155/2012/527820');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ea76c8fa-900d-072b-94f6-5e9096f493dd', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ea76c8fa-900d-072b-94f6-5e9096f493dd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ea76c8fa-900d-072b-94f6-5e9096f493dd' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ea76c8fa-900d-072b-94f6-5e9096f493dd', 'a0000001-0000-0000-0000-000000000001', 'last_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ea76c8fa-900d-072b-94f6-5e9096f493dd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ea76c8fa-900d-072b-94f6-5e9096f493dd' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2012] Determination of solar cell electrical parameters and resistances (Cited: 27) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '056370fb-3da6-5d3f-a185-ac8896855cc0', 'Determination of solar cell electrical parameters and resistances using color and white LED-based solar simulators with high amplitude pulse input voltages', 'Renewable Energy', 2012, '10.1016/j.renene.2012.08.046', 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 27, 'W2011017664', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.renene.2012.08.046');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '056370fb-3da6-5d3f-a185-ac8896855cc0', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '056370fb-3da6-5d3f-a185-ac8896855cc0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '056370fb-3da6-5d3f-a185-ac8896855cc0' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '056370fb-3da6-5d3f-a185-ac8896855cc0', 'a0000001-0000-0000-0000-000000000001', 'last_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '056370fb-3da6-5d3f-a185-ac8896855cc0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '056370fb-3da6-5d3f-a185-ac8896855cc0' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2012] An Apply Implementation of a Carrier-Based Three-Dimensional Spac (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '612d63d1-4690-f9bd-118d-e0561ecf24f5', 'An Apply Implementation of a Carrier-Based Three-Dimensional Space Vector PWM Technique for Three-Phase Four-Leg Voltage Sag Generator with Microcontroller', 'Advanced Science Letters', 2012, '10.1166/asl.2013.4497', 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 0, 'W2323439034', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1166/asl.2013.4497');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '612d63d1-4690-f9bd-118d-e0561ecf24f5', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '612d63d1-4690-f9bd-118d-e0561ecf24f5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '612d63d1-4690-f9bd-118d-e0561ecf24f5' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '612d63d1-4690-f9bd-118d-e0561ecf24f5', 'a0000001-0000-0000-0000-000000000003', 'last_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '612d63d1-4690-f9bd-118d-e0561ecf24f5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '612d63d1-4690-f9bd-118d-e0561ecf24f5' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2012] Stability analysis of a photovoltaic grid connected inverter mode (Cited: 5)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '972a8dcb-4754-e793-1ddf-f354ac770511', 'Stability analysis of a photovoltaic grid connected inverter model based on system identification', NULL, 2012, '10.1109/tencon.2012.6412210', 'journal', 'นพพร พัชรประกิติ', 'openalex', 5, 'W2012816905', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/tencon.2012.6412210');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '972a8dcb-4754-e793-1ddf-f354ac770511', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '972a8dcb-4754-e793-1ddf-f354ac770511')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '972a8dcb-4754-e793-1ddf-f354ac770511' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2012] Model Predictive Control Based on System Identificationof Photovo (Cited: 5)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '08fe91d9-18f7-2dd9-826d-fd9d91c29696', 'Model Predictive Control Based on System Identificationof Photovoltaic Grid Connected Inverter', 'International Journal of Information and Electronics Engineering', 2012, '10.7763/ijiee.2012.v2.167', 'journal', 'นพพร พัชรประกิติ', 'openalex', 5, 'W2326711515', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7763/ijiee.2012.v2.167');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '08fe91d9-18f7-2dd9-826d-fd9d91c29696', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '08fe91d9-18f7-2dd9-826d-fd9d91c29696')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '08fe91d9-18f7-2dd9-826d-fd9d91c29696' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2012] Model Order Reduction of Grid Connected Inverter Model based on S (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'cad41a8a-b041-80f4-728c-c2e44f4213f3', 'Model Order Reduction of Grid Connected Inverter Model based on System Identification', 'Power and energy systems', 2012, '10.2316/p.2012.768-023', 'journal', 'นพพร พัชรประกิติ', 'openalex', 1, 'W2325963656', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.2316/p.2012.768-023');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'cad41a8a-b041-80f4-728c-c2e44f4213f3', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'cad41a8a-b041-80f4-728c-c2e44f4213f3')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'cad41a8a-b041-80f4-728c-c2e44f4213f3' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2012] Evaluation of Energy and Atmosphere Section forThailand Green Bui (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ffa3fc54-c5be-ebd5-cd8e-395c8923f8ff', 'Evaluation of Energy and Atmosphere Section forThailand Green Building Project Case Study', 'International Journal of Information and Electronics Engineering', 2012, '10.7763/ijiee.2012.v2.172', 'journal', 'นพพร พัชรประกิติ', 'openalex', 0, 'W2323886768', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7763/ijiee.2012.v2.172');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ffa3fc54-c5be-ebd5-cd8e-395c8923f8ff', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ffa3fc54-c5be-ebd5-cd8e-395c8923f8ff')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ffa3fc54-c5be-ebd5-cd8e-395c8923f8ff' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2012] Linear System Analysis and State Observer Design of Grid Connecte (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ac7ee016-6b8d-37ad-d4c9-61fa10e93c4a', 'Linear System Analysis and State Observer Design of Grid Connected Inverter Model based on System Identification', NULL, 2012, '10.2316/p.2012.769-027', 'journal', 'นพพร พัชรประกิติ', 'openalex', 0, 'W2330799125', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.2316/p.2012.769-027');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ac7ee016-6b8d-37ad-d4c9-61fa10e93c4a', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ac7ee016-6b8d-37ad-d4c9-61fa10e93c4a')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ac7ee016-6b8d-37ad-d4c9-61fa10e93c4a' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2012] Lightning impulse test of field-aged PV modules and simulation pa (Cited: 13)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '29f43273-b474-7509-f9ed-a1ec9caabfc8', 'Lightning impulse test of field-aged PV modules and simulation partial discharge within MATLAB', NULL, 2012, '10.1109/ecticon.2012.6254145', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 13, 'W2033862346', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2012.6254145');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '29f43273-b474-7509-f9ed-a1ec9caabfc8', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '29f43273-b474-7509-f9ed-a1ec9caabfc8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '29f43273-b474-7509-f9ed-a1ec9caabfc8' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2012] Analysis and Comparison of Pollution Flashover Performance of Por (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '5d3f4cc4-f99f-d65a-97a8-65c9531a570a', 'Analysis and Comparison of Pollution Flashover Performance of Porcelain Insulators in Distribution System 22 kV', 'Advanced materials research', 2012, '10.4028/www.scientific.net/amr.622-623.1901', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 1, 'W1984147059', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.4028/www.scientific.net/amr.622-623.1901');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '5d3f4cc4-f99f-d65a-97a8-65c9531a570a', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '5d3f4cc4-f99f-d65a-97a8-65c9531a570a')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '5d3f4cc4-f99f-d65a-97a8-65c9531a570a' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2012] Comparison of AC flashover performance for line post and pin post (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f4f861e1-e7f9-05a2-7461-5a18ed7af364', 'Comparison of AC flashover performance for line post and pin post insulators in distribution 22 kV', NULL, 2012, '10.1109/ecticon.2012.6254199', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 1, 'W1993549412', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2012.6254199');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f4f861e1-e7f9-05a2-7461-5a18ed7af364', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f4f861e1-e7f9-05a2-7461-5a18ed7af364')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f4f861e1-e7f9-05a2-7461-5a18ed7af364' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2012] AC flashover performance for line post and pin post insulators in (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'becb7255-160a-1c45-06c9-30fa15a7525e', 'AC flashover performance for line post and pin post insulators in distribution 22 kV', NULL, 2012, '10.1109/vppc.2012.6422794', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 0, 'W2091410748', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/vppc.2012.6422794');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'becb7255-160a-1c45-06c9-30fa15a7525e', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'becb7255-160a-1c45-06c9-30fa15a7525e')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'becb7255-160a-1c45-06c9-30fa15a7525e' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2012] Voltage Sag Waveform Using SagWave GUI (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'fd854f10-ffe7-13d6-aa16-a365d6591fe0', 'Voltage Sag Waveform Using SagWave GUI', 'InTech eBooks', 2012, '10.5772/46448', 'book_chapter', 'โกศล โอฬารไพโรจน์', 'openalex', 0, 'W1508821185', true, 'https://www.intechopen.com/citation-pdf-url/39331'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.5772/46448');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'fd854f10-ffe7-13d6-aa16-a365d6591fe0', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'fd854f10-ffe7-13d6-aa16-a365d6591fe0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'fd854f10-ffe7-13d6-aa16-a365d6591fe0' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2012] A 3-Phase 4-Leg 4-Wire Voltage Sag Compensator Based on Three Dim (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '3a45063a-2a8a-ddc4-8ecd-7f9f6056f4b2', 'A 3-Phase 4-Leg 4-Wire Voltage Sag Compensator Based on Three Dimensional Space Vector Modulation in <i>abc</i> Coordinates', 'Advanced Science Letters', 2012, '10.1166/asl.2013.4498', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 0, 'W2047139933', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1166/asl.2013.4498');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3a45063a-2a8a-ddc4-8ecd-7f9f6056f4b2', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3a45063a-2a8a-ddc4-8ecd-7f9f6056f4b2')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3a45063a-2a8a-ddc4-8ecd-7f9f6056f4b2' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2012] The thermal performance of an ethanol solar still with fin plate  (Cited: 83)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '7ce9248d-7ab1-d317-87fa-db0fc3b12ac6', 'The thermal performance of an ethanol solar still with fin plate to increase productivity', 'Renewable Energy', 2012, '10.1016/j.renene.2012.08.004', 'journal', 'รัตนพล พรหมวัน ณ อยุธยา', 'openalex', 83, 'W2036778673', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.renene.2012.08.004');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '7ce9248d-7ab1-d317-87fa-db0fc3b12ac6', 'a0000001-0000-0000-0000-000000000006', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '7ce9248d-7ab1-d317-87fa-db0fc3b12ac6')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '7ce9248d-7ab1-d317-87fa-db0fc3b12ac6' AND researcher_id = 'a0000001-0000-0000-0000-000000000006');

-- [2011] INDUCTANCE EFFECTS ON INTENSITY MODULATION TRANSFER IMPEDANCE SPE (Cited: 1) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '8516334d-d6dc-9063-5a56-a8a577784408', 'INDUCTANCE EFFECTS ON INTENSITY MODULATION TRANSFER IMPEDANCE SPECTROSCOPY IN DYNAMIC PARAMETERS DETERMINATION OF MONO-CRYSTALLINE SILICON SOLAR CELL', 'AFORE', 2011, NULL, 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 1, 'W2394694057', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('INDUCTANCE EFFECTS ON INTENSITY MODULATION TRANSFER IMPEDANCE SPECTROSCOPY IN DYNAMIC PARAMETERS DETERMINATION OF MONO-CRYSTALLINE SILICON SOLAR CELL'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8516334d-d6dc-9063-5a56-a8a577784408', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8516334d-d6dc-9063-5a56-a8a577784408')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8516334d-d6dc-9063-5a56-a8a577784408' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '8516334d-d6dc-9063-5a56-a8a577784408', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '8516334d-d6dc-9063-5a56-a8a577784408')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '8516334d-d6dc-9063-5a56-a8a577784408' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2011] DETERMINATION OF SOLAR CELL RESISTANCES USING LEDS OF DIFFERENT C (Cited: 0) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'dfffc202-f2f0-030a-545a-c2009c6d8dc9', 'DETERMINATION OF SOLAR CELL RESISTANCES USING LEDS OF DIFFERENT COLORS WITH HIGH AMPLITUDE SINGLE PULSE VOLTAGES', 'AFORE', 2011, NULL, 'journal', 'อนนท์ นำอิน, Jutturit Thongpron', 'openalex', 0, 'W2395307966', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('DETERMINATION OF SOLAR CELL RESISTANCES USING LEDS OF DIFFERENT COLORS WITH HIGH AMPLITUDE SINGLE PULSE VOLTAGES'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'dfffc202-f2f0-030a-545a-c2009c6d8dc9', 'a0000001-0000-0000-0000-000000000007', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'dfffc202-f2f0-030a-545a-c2009c6d8dc9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'dfffc202-f2f0-030a-545a-c2009c6d8dc9' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'dfffc202-f2f0-030a-545a-c2009c6d8dc9', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'dfffc202-f2f0-030a-545a-c2009c6d8dc9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'dfffc202-f2f0-030a-545a-c2009c6d8dc9' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2011] Development of the 3-phase 4-wire voltage sag generator (Cited: 1) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '122e7ba9-54d5-5527-9852-a1c3515f04fa', 'Development of the 3-phase 4-wire voltage sag generator', 'eSpace (Curtin University)', 2011, NULL, 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 1, 'W2141710109', true, 'http://hdl.handle.net/20.500.11937/21145'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('Development of the 3-phase 4-wire voltage sag generator'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '122e7ba9-54d5-5527-9852-a1c3515f04fa', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '122e7ba9-54d5-5527-9852-a1c3515f04fa')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '122e7ba9-54d5-5527-9852-a1c3515f04fa' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '122e7ba9-54d5-5527-9852-a1c3515f04fa', 'a0000001-0000-0000-0000-000000000003', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '122e7ba9-54d5-5527-9852-a1c3515f04fa')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '122e7ba9-54d5-5527-9852-a1c3515f04fa' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2011] Modeling of Photovoltaic Grid Connected Inverters Based on Nonlin (Cited: 12)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '1e31710e-446c-d018-6f55-32a32e053ff1', 'Modeling of Photovoltaic Grid Connected Inverters Based on Nonlinear System Identification for Power Quality Analysis', 'InTech eBooks', 2011, '10.5772/16914', 'book_chapter', 'นพพร พัชรประกิติ', 'openalex', 12, 'W1506626072', true, 'https://doi.org/10.5772/16914'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.5772/16914');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '1e31710e-446c-d018-6f55-32a32e053ff1', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '1e31710e-446c-d018-6f55-32a32e053ff1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '1e31710e-446c-d018-6f55-32a32e053ff1' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2011] A Multi Input Multi output (MIMO) Hammerstein -Wiener Model Based (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'faf51c28-affb-1473-de1a-a704008823a6', 'A Multi Input Multi output (MIMO) Hammerstein -Wiener Model Based Predictive Control of Single Phase Grid Connected Inverter', 'International Journal of Modeling and Optimization', 2011, '10.7763/ijmo.2011.v1.6', 'journal', 'นพพร พัชรประกิติ', 'openalex', 0, 'W2317202918', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.7763/ijmo.2011.v1.6');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'faf51c28-affb-1473-de1a-a704008823a6', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'faf51c28-affb-1473-de1a-a704008823a6')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'faf51c28-affb-1473-de1a-a704008823a6' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2011] Performance assessment of PV modules after long field exposure in (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'd7d2d768-3e3f-bf02-f19d-d536224b50dd', 'Performance assessment of PV modules after long field exposure in north eastern of Thailand', NULL, 2011, '10.1109/ecticon.2011.5947795', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 0, 'W2087373890', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2011.5947795');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'd7d2d768-3e3f-bf02-f19d-d536224b50dd', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'd7d2d768-3e3f-bf02-f19d-d536224b50dd')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'd7d2d768-3e3f-bf02-f19d-d536224b50dd' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2011] Failure Statistics and Condition Evaluation for Power Transformer (Cited: 12)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '498627e2-928f-ff42-1276-8388b1535e85', 'Failure Statistics and Condition Evaluation for Power Transformer Maintenance', NULL, 2011, '10.1109/appeec.2011.5749108', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 12, 'W2167046009', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/appeec.2011.5749108');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '498627e2-928f-ff42-1276-8388b1535e85', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '498627e2-928f-ff42-1276-8388b1535e85')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '498627e2-928f-ff42-1276-8388b1535e85' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2010] Design and implementation of a distributed solar controller using (Cited: 7) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'a4981766-d519-237d-996f-34c2986452d1', 'Design and implementation of a distributed solar controller using modular buck converter with Maximum Power Point tracking', 'International Universities Power Engineering Conference', 2010, NULL, 'journal', 'ธีระศักดิ์ สมศักดิ์, Worrajak Muangjai', 'openalex', 7, 'W1548568819', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('Design and implementation of a distributed solar controller using modular buck converter with Maximum Power Point tracking'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a4981766-d519-237d-996f-34c2986452d1', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a4981766-d519-237d-996f-34c2986452d1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a4981766-d519-237d-996f-34c2986452d1' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a4981766-d519-237d-996f-34c2986452d1', 'a0000001-0000-0000-0000-000000000009', 'co_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a4981766-d519-237d-996f-34c2986452d1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a4981766-d519-237d-996f-34c2986452d1' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');

-- [2010] Modeling of Single Phase Inverter of Photovoltaic System Using Sy (Cited: 39)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e8f5b77e-2510-1c6e-10c9-4d169dd3bcdb', 'Modeling of Single Phase Inverter of Photovoltaic System Using System Identification', NULL, 2010, '10.1109/iccnt.2010.120', 'journal', 'นพพร พัชรประกิติ', 'openalex', 39, 'W2100559478', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/iccnt.2010.120');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e8f5b77e-2510-1c6e-10c9-4d169dd3bcdb', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e8f5b77e-2510-1c6e-10c9-4d169dd3bcdb')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e8f5b77e-2510-1c6e-10c9-4d169dd3bcdb' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2010] Modeling of single phase inverter of photovoltaic system using Ha (Cited: 37)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b5419170-3497-e101-61d9-6628931cf1ea', 'Modeling of single phase inverter of photovoltaic system using Hammerstein–Wiener nonlinear system identification', 'Current Applied Physics', 2010, '10.1016/j.cap.2010.02.025', 'journal', 'นพพร พัชรประกิติ', 'openalex', 37, 'W2021698481', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.cap.2010.02.025');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b5419170-3497-e101-61d9-6628931cf1ea', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b5419170-3497-e101-61d9-6628931cf1ea')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b5419170-3497-e101-61d9-6628931cf1ea' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2010] System identification with cross validation technique for modelin (Cited: 5)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'a6113885-5f47-044a-a528-c770ea8204b9', 'System identification with cross validation technique for modeling inverter of photovoltaic system', NULL, 2010, '10.1109/icmet.2010.5598430', 'journal', 'นพพร พัชรประกิติ', 'openalex', 5, 'W2042794648', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icmet.2010.5598430');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a6113885-5f47-044a-a528-c770ea8204b9', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a6113885-5f47-044a-a528-c770ea8204b9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a6113885-5f47-044a-a528-c770ea8204b9' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2010] Distributed Generation and Islanding – Study on Converter Modelin (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '32395e63-380e-76a6-7c99-62690fe324f1', 'Distributed Generation and Islanding – Study on Converter Modeling of PV Grid-Connected Systems under Islanding Phenomena', 'InTech eBooks', 2010, '10.5772/8890', 'book_chapter', 'นพพร พัชรประกิติ', 'openalex', 0, 'W1607531505', true, 'https://www.intechopen.com/citation-pdf-url/10143'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.5772/8890');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '32395e63-380e-76a6-7c99-62690fe324f1', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '32395e63-380e-76a6-7c99-62690fe324f1')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '32395e63-380e-76a6-7c99-62690fe324f1' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2010] SagWave for the 3-phase 4-wire voltage sag generator prototype (Cited: 4)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f103414a-7c05-5012-aad9-d1b0e3b64b13', 'SagWave for the 3-phase 4-wire voltage sag generator prototype', NULL, 2010, '10.1109/cca.2010.5611146', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 4, 'W2069426099', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/cca.2010.5611146');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f103414a-7c05-5012-aad9-d1b0e3b64b13', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f103414a-7c05-5012-aad9-d1b0e3b64b13')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f103414a-7c05-5012-aad9-d1b0e3b64b13' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2009] Application of Giant Magnetoresistance Sensor for Micro Material  (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b7d43f9f-ff78-a4fd-6827-659e2e8d93a5', 'Application of Giant Magnetoresistance Sensor for Micro Material Detection', 'Journal of the Japan Society of Applied Electromagnetics and Mechanics', 2009, NULL, 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 0, 'W2964070619', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('Application of Giant Magnetoresistance Sensor for Micro Material Detection'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b7d43f9f-ff78-a4fd-6827-659e2e8d93a5', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b7d43f9f-ff78-a4fd-6827-659e2e8d93a5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b7d43f9f-ff78-a4fd-6827-659e2e8d93a5' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2009] Application of Giant Magnetoresistance Sensor for Micro Material  (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '174e47a7-ab02-ef04-ba88-ff3ffcba4512', 'Application of Giant Magnetoresistance Sensor for Micro Material Detection( Asia-Pacific Symposium on Applied Electromagnetics and Mechanics (APSAEM08))', 'Applied and Environmental Microbiology', 2009, NULL, 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 0, 'W584532033', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('Application of Giant Magnetoresistance Sensor for Micro Material Detection( Asia-Pacific Symposium on Applied Electromagnetics and Mechanics (APSAEM08))'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '174e47a7-ab02-ef04-ba88-ff3ffcba4512', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '174e47a7-ab02-ef04-ba88-ff3ffcba4512')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '174e47a7-ab02-ef04-ba88-ff3ffcba4512' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2009] The 3-phase 4-wire voltage sag generator based on three dimension (Cited: 10) [CESRU: 2]
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'a4542ab2-c9bf-c384-18e4-70728595f7c9', 'The 3-phase 4-wire voltage sag generator based on three dimensions space vector modulation in abc coordinates', NULL, 2009, '10.1109/isie.2009.5219057', 'journal', 'วรจักร์ เมืองใจ, Kosol Oranpiroj', 'openalex', 10, 'W2117563701', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/isie.2009.5219057');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a4542ab2-c9bf-c384-18e4-70728595f7c9', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a4542ab2-c9bf-c384-18e4-70728595f7c9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a4542ab2-c9bf-c384-18e4-70728595f7c9' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a4542ab2-c9bf-c384-18e4-70728595f7c9', 'a0000001-0000-0000-0000-000000000003', 'first_author', 2
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a4542ab2-c9bf-c384-18e4-70728595f7c9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a4542ab2-c9bf-c384-18e4-70728595f7c9' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2009] Implementation of a carrier-based three-dimensional space vector  (Cited: 7)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '0558dc23-d68b-ae7d-4c8f-5eb8e5aa06d2', 'Implementation of a carrier-based three-dimensional space vector PWM technique for three-phase four-leg voltage source converter with microcontroller', NULL, 2009, '10.1109/iciea.2009.5138320', 'journal', 'วรจักร์ เมืองใจ', 'openalex', 7, 'W2122106883', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/iciea.2009.5138320');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '0558dc23-d68b-ae7d-4c8f-5eb8e5aa06d2', 'a0000001-0000-0000-0000-000000000009', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '0558dc23-d68b-ae7d-4c8f-5eb8e5aa06d2')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '0558dc23-d68b-ae7d-4c8f-5eb8e5aa06d2' AND researcher_id = 'a0000001-0000-0000-0000-000000000009');

-- [2009] Multiobjective optimal placement of switches and protective devic (Cited: 124)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '9cdec9b0-d2c1-ad22-1b65-b4eb19810ec8', 'Multiobjective optimal placement of switches and protective devices in electric power distribution systems using ant colony optimization', 'Electric Power Systems Research', 2009, '10.1016/j.epsr.2009.02.006', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 124, 'W2132373412', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.epsr.2009.02.006');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '9cdec9b0-d2c1-ad22-1b65-b4eb19810ec8', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '9cdec9b0-d2c1-ad22-1b65-b4eb19810ec8')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '9cdec9b0-d2c1-ad22-1b65-b4eb19810ec8' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2009] A power quality monitoring system for real-time fault detection (Cited: 13)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '166188be-4529-4fc2-2713-3141aacfee5d', 'A power quality monitoring system for real-time fault detection', NULL, 2009, '10.1109/isie.2009.5213582', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 13, 'W2116913111', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/isie.2009.5213582');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '166188be-4529-4fc2-2713-3141aacfee5d', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '166188be-4529-4fc2-2713-3141aacfee5d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '166188be-4529-4fc2-2713-3141aacfee5d' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2009] The 3-phase 4-wire voltage sag generator based on abc algorithm (Cited: 9)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f718756e-366f-b8fa-ad0a-9e8129fe0d6f', 'The 3-phase 4-wire voltage sag generator based on abc algorithm', NULL, 2009, '10.1109/ecticon.2009.5136971', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 9, 'W2167667069', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/ecticon.2009.5136971');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f718756e-366f-b8fa-ad0a-9e8129fe0d6f', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f718756e-366f-b8fa-ad0a-9e8129fe0d6f')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f718756e-366f-b8fa-ad0a-9e8129fe0d6f' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2007] Spin-valve GMR Sensor with Improved Ferrite core Exciter for Cond (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'bd0652a9-199f-46f4-6d00-be25e2f6cfea', 'Spin-valve GMR Sensor with Improved Ferrite core Exciter for Conductive Microbead Detection by Eddy-current Testing Technique', 'Journal of the Magnetics Society of Japan', 2007, '10.3379/jmsjmag.31.398', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 1, 'W2020778144', true, 'https://www.jstage.jst.go.jp/article/jmsjmag/31/5/31_5_398/_pdf'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.3379/jmsjmag.31.398');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bd0652a9-199f-46f4-6d00-be25e2f6cfea', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bd0652a9-199f-46f4-6d00-be25e2f6cfea')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bd0652a9-199f-46f4-6d00-be25e2f6cfea' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2007] Applications of SV-GMR sensor for detecting micro non-magnetic an (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'dff003f6-50b0-486e-fc2a-604032abb289', 'Applications of SV-GMR sensor for detecting micro non-magnetic and ferromagnetic material', 'International Journal of Intelligent Systems Technologies and Applications', 2007, '10.1504/ijista.2007.014133', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 0, 'W2069356067', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1504/ijista.2007.014133');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'dff003f6-50b0-486e-fc2a-604032abb289', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'dff003f6-50b0-486e-fc2a-604032abb289')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'dff003f6-50b0-486e-fc2a-604032abb289' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2007] Power Quality Monitoring System Using Real-Time Operating System (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '67507231-5585-3839-32ae-72d1beadd473', 'Power Quality Monitoring System Using Real-Time Operating System', NULL, 2007, '10.1109/peds.2007.4487681', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 2, 'W2135599868', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/peds.2007.4487681');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '67507231-5585-3839-32ae-72d1beadd473', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '67507231-5585-3839-32ae-72d1beadd473')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '67507231-5585-3839-32ae-72d1beadd473' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2006] Conductive Microbead Array Detection Based on Eddy-Current Testin (Cited: 10)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'f725ce4d-692c-628d-1b6a-00b5f39aa10b', 'Conductive Microbead Array Detection Based on Eddy-Current Testing Using SV-GMR Sensor and Helmholtz Coil Exciter', 'IEEE Transactions on Magnetics', 2006, '10.1109/tmag.2006.879966', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 10, 'W4238133151', true, 'https://kanazawa-u.repo.nii.ac.jp/records/9541'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/tmag.2006.879966');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'f725ce4d-692c-628d-1b6a-00b5f39aa10b', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'f725ce4d-692c-628d-1b6a-00b5f39aa10b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'f725ce4d-692c-628d-1b6a-00b5f39aa10b' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2006] Conductive Microbead Array Detection Based on Eddy-Current Testin (Cited: 5)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '3ac4e534-935e-f56d-f1ce-088391365749', 'Conductive Microbead Array Detection Based on Eddy-Current Testing Using SV-GMR Sensor and Helmhlotz Coil Exciter', NULL, 2006, '10.1109/intmag.2006.376267', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 5, 'W1994232840', true, 'https://kanazawa-u.repo.nii.ac.jp/records/29434'
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/intmag.2006.376267');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '3ac4e534-935e-f56d-f1ce-088391365749', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '3ac4e534-935e-f56d-f1ce-088391365749')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '3ac4e534-935e-f56d-f1ce-088391365749' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2006] Conductive microbead detection by Helmholtz coil technique with S (Cited: 3)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ff1200c9-fcd3-2d14-380f-ad520fd248a6', 'Conductive microbead detection by Helmholtz coil technique with SV-GMR sensor', NULL, 2006, '10.1109/delta.2006.25', 'journal', 'ธีระศักดิ์ สมศักดิ์', 'openalex', 3, 'W2145187984', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/delta.2006.25');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ff1200c9-fcd3-2d14-380f-ad520fd248a6', 'a0000001-0000-0000-0000-000000000002', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ff1200c9-fcd3-2d14-380f-ad520fd248a6')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ff1200c9-fcd3-2d14-380f-ad520fd248a6' AND researcher_id = 'a0000001-0000-0000-0000-000000000002');

-- [2006] Daylight Predicting Program of Tropical Climate Zone (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '30dd76a9-7d22-dcb6-2702-1b7feade3478', 'Daylight Predicting Program of Tropical Climate Zone', NULL, 2006, '10.1109/isie.2006.296040', 'journal', 'นพพร พัชรประกิติ', 'openalex', 0, 'W2020325557', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/isie.2006.296040');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '30dd76a9-7d22-dcb6-2702-1b7feade3478', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '30dd76a9-7d22-dcb6-2702-1b7feade3478')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '30dd76a9-7d22-dcb6-2702-1b7feade3478' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2006] A method for the determination of dynamic resistance of photovolt (Cited: 83)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'aaaf1687-1b3a-8c76-c3d2-23161cc37aee', 'A method for the determination of dynamic resistance of photovoltaic modules under illumination', 'Solar Energy Materials and Solar Cells', 2006, '10.1016/j.solmat.2006.06.029', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 83, 'W1975210159', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.solmat.2006.06.029');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'aaaf1687-1b3a-8c76-c3d2-23161cc37aee', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'aaaf1687-1b3a-8c76-c3d2-23161cc37aee')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'aaaf1687-1b3a-8c76-c3d2-23161cc37aee' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2006] Effects of low radiation on the power quality of a distributed PV (Cited: 21)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'c79c01bc-9aff-4dfa-13aa-63a0448b22c0', 'Effects of low radiation on the power quality of a distributed PV-grid connected system', 'Solar Energy Materials and Solar Cells', 2006, '10.1016/j.solmat.2006.03.022', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 21, 'W1991794564', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.solmat.2006.03.022');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'c79c01bc-9aff-4dfa-13aa-63a0448b22c0', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'c79c01bc-9aff-4dfa-13aa-63a0448b22c0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'c79c01bc-9aff-4dfa-13aa-63a0448b22c0' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2006] Voltage and Frequency Dependent Impedances of Monocrystalline, Po (Cited: 9)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'bcb2ec12-00cd-412f-007b-278daae3127b', 'Voltage and Frequency Dependent Impedances of Monocrystalline, Polycrystalline and Amorphous Silicon Solar Cells', NULL, 2006, '10.1109/wcpec.2006.279922', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 9, 'W2113189874', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/wcpec.2006.279922');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bcb2ec12-00cd-412f-007b-278daae3127b', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bcb2ec12-00cd-412f-007b-278daae3127b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bcb2ec12-00cd-412f-007b-278daae3127b' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2006] Static Parameters of Solar Cells Determined from Solar Simulators (Cited: 8)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '903f837e-121f-ea4d-a2e2-dae08f6ca18d', 'Static Parameters of Solar Cells Determined from Solar Simulators Using Quartz Tungsten Halogen Lamps and Super Bright Light Emitting Diodes', NULL, 2006, '10.1109/wcpec.2006.279954', 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 8, 'W2111409864', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/wcpec.2006.279954');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '903f837e-121f-ea4d-a2e2-dae08f6ca18d', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '903f837e-121f-ea4d-a2e2-dae08f6ca18d')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '903f837e-121f-ea4d-a2e2-dae08f6ca18d' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- [2006] Failure Mode Distribution of Transformers in Thailand (Cited: 8)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'bc9446d4-e94f-c188-60e0-5a8b1609b30c', 'Failure Mode Distribution of Transformers in Thailand', NULL, 2006, '10.1109/icpst.2006.321726', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 8, 'W2004138741', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icpst.2006.321726');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'bc9446d4-e94f-c188-60e0-5a8b1609b30c', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'bc9446d4-e94f-c188-60e0-5a8b1609b30c')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'bc9446d4-e94f-c188-60e0-5a8b1609b30c' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2006] Failure Analysis of Protective Devices in Power Distribution Syst (Cited: 8)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '6b0421f9-c284-0eba-cc7f-fd7ff2c1397b', 'Failure Analysis of Protective Devices in Power Distribution Systems for Reliability Purpose', NULL, 2006, '10.1109/tencon.2006.343764', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 8, 'W2053233382', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/tencon.2006.343764');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '6b0421f9-c284-0eba-cc7f-fd7ff2c1397b', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '6b0421f9-c284-0eba-cc7f-fd7ff2c1397b')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '6b0421f9-c284-0eba-cc7f-fd7ff2c1397b' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2006] Failure Analysis of Power Distribution Systems in Thailand (Cited: 6)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '9bd81dc8-78ac-51eb-651c-6bc92e5de82a', 'Failure Analysis of Power Distribution Systems in Thailand', NULL, 2006, '10.1109/icpst.2006.321725', 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 6, 'W2090897060', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/icpst.2006.321725');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '9bd81dc8-78ac-51eb-651c-6bc92e5de82a', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '9bd81dc8-78ac-51eb-651c-6bc92e5de82a')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '9bd81dc8-78ac-51eb-651c-6bc92e5de82a' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2006] FailureMode Distribution ofTransformersin (Cited: 0)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'ee584196-8a13-ef64-ab0b-2d8d08d557b5', 'FailureMode Distribution ofTransformersin', NULL, 2006, NULL, 'journal', 'วิวัฒน์ ทิพจร', 'openalex', 0, 'W2187456862', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('FailureMode Distribution ofTransformersin'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'ee584196-8a13-ef64-ab0b-2d8d08d557b5', 'a0000001-0000-0000-0000-000000000004', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'ee584196-8a13-ef64-ab0b-2d8d08d557b5')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'ee584196-8a13-ef64-ab0b-2d8d08d557b5' AND researcher_id = 'a0000001-0000-0000-0000-000000000004');

-- [2006] A Direct Torque Control of Induction Motor Using V/f PWM Techniqu (Cited: 2)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'd2c22e26-045f-a5ef-82a7-5209cd7a7ab9', 'A Direct Torque Control of Induction Motor Using V/f PWM Technique', NULL, 2006, '10.1109/peds.2005.1619785', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 2, 'W2540138975', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/peds.2005.1619785');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'd2c22e26-045f-a5ef-82a7-5209cd7a7ab9', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'd2c22e26-045f-a5ef-82a7-5209cd7a7ab9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'd2c22e26-045f-a5ef-82a7-5209cd7a7ab9' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2006] A 3-Phase 4-Wire Voltage Sag Compensator Based on Three Dimension (Cited: 1)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '506cf5c8-b0f0-35c8-9af4-03595ee680c3', 'A 3-Phase 4-Wire Voltage Sag Compensator Based on Three Dimensions Space Vector', NULL, 2006, '10.1109/peds.2005.1619888', 'journal', 'โกศล โอฬารไพโรจน์', 'openalex', 1, 'W2536504613', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/peds.2005.1619888');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '506cf5c8-b0f0-35c8-9af4-03595ee680c3', 'a0000001-0000-0000-0000-000000000003', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '506cf5c8-b0f0-35c8-9af4-03595ee680c3')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '506cf5c8-b0f0-35c8-9af4-03595ee680c3' AND researcher_id = 'a0000001-0000-0000-0000-000000000003');

-- [2005] Maximum power point tracking using adaptive fuzzy logic control f (Cited: 232)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'a6d52e6e-2987-fe2e-ca6a-3386707e2019', 'Maximum power point tracking using adaptive fuzzy logic control for grid-connected photovoltaic system', 'Renewable Energy', 2005, '10.1016/j.renene.2004.11.018', 'journal', 'นพพร พัชรประกิติ', 'openalex', 232, 'W2009002756', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1016/j.renene.2004.11.018');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'a6d52e6e-2987-fe2e-ca6a-3386707e2019', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'a6d52e6e-2987-fe2e-ca6a-3386707e2019')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'a6d52e6e-2987-fe2e-ca6a-3386707e2019' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2004] Lightning arrester modeling using ATP-EMTP (Cited: 11)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'e46daa96-573f-3c0a-276c-fd43dc96dca0', 'Lightning arrester modeling using ATP-EMTP', NULL, 2004, '10.1109/tencon.2004.1414786', 'journal', 'วิเชษฐ์ ทิพย์ประเสริฐ', 'openalex', 11, 'W2124771181', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/tencon.2004.1414786');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'e46daa96-573f-3c0a-276c-fd43dc96dca0', 'a0000001-0000-0000-0000-000000000011', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'e46daa96-573f-3c0a-276c-fd43dc96dca0')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'e46daa96-573f-3c0a-276c-fd43dc96dca0' AND researcher_id = 'a0000001-0000-0000-0000-000000000011');

-- [2003] Maximum power point tracking using adaptive fuzzy logic control f (Cited: 123)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT '83e4535b-17f7-2e68-a6d4-85ebfe5212d9', 'Maximum power point tracking using adaptive fuzzy logic control for grid-connected photovoltaic system', '2002 IEEE Power Engineering Society Winter Meeting. Conference Proceedings (Cat. No.02CH37309)', 2003, '10.1109/pesw.2002.985022', 'journal', 'นพพร พัชรประกิติ', 'openalex', 123, 'W2103176034', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE doi = '10.1109/pesw.2002.985022');
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT '83e4535b-17f7-2e68-a6d4-85ebfe5212d9', 'a0000001-0000-0000-0000-000000000005', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = '83e4535b-17f7-2e68-a6d4-85ebfe5212d9')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = '83e4535b-17f7-2e68-a6d4-85ebfe5212d9' AND researcher_id = 'a0000001-0000-0000-0000-000000000005');

-- [2003] A Thai National Demonstration Project on PV grid-interactive syst (Cited: 7)
INSERT INTO publications (id, title, journal_name, year, doi, pub_type, authors_raw, source, cited_by_count, openalex_id, is_open_access, open_access_url)
  SELECT 'b5d9fa50-4d90-f7e5-6e56-d97b92444f23', 'A Thai National Demonstration Project on PV grid-interactive systems: power quality observation', '3rd World Conference onPhotovoltaic Energy Conversion, 2003. Proceedings of', 2003, NULL, 'journal', 'จัตตุฤทธิ์ ทองปรอน', 'openalex', 7, 'W1875463402', false, NULL
  WHERE NOT EXISTS (SELECT 1 FROM publications WHERE lower(title) = lower('A Thai National Demonstration Project on PV grid-interactive systems: power quality observation'));
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order)
  SELECT 'b5d9fa50-4d90-f7e5-6e56-d97b92444f23', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1
  WHERE EXISTS (SELECT 1 FROM publications WHERE id = 'b5d9fa50-4d90-f7e5-6e56-d97b92444f23')
  AND NOT EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = 'b5d9fa50-4d90-f7e5-6e56-d97b92444f23' AND researcher_id = 'a0000001-0000-0000-0000-000000000001');

-- === Funding: อนนท์ นำอิน ===
INSERT INTO grants (id, title_th, title_en, funding_agency, fiscal_year, start_date, end_date, status, source)
  SELECT 'e0b14f7d-d88c-379d-8e1e-91044008a85b', 'Development of Wireless Electric Vehicle Battery Charging Station', 'Development of Wireless Electric Vehicle Battery Charging Station', 'Energy Policy and Planning Office', 2561, '2018-01-01', '2021-12-31', 'completed', 'openalex'
  WHERE NOT EXISTS (SELECT 1 FROM grants WHERE title_en ILIKE '%Wireless Electric Vehicle Battery Charging%');
INSERT INTO grant_members (grant_id, researcher_id, role)
  SELECT 'e0b14f7d-d88c-379d-8e1e-91044008a85b', 'a0000001-0000-0000-0000-000000000007', 'pi'
  WHERE EXISTS (SELECT 1 FROM grants WHERE id = 'e0b14f7d-d88c-379d-8e1e-91044008a85b')
  AND NOT EXISTS (SELECT 1 FROM grant_members WHERE grant_id = 'e0b14f7d-d88c-379d-8e1e-91044008a85b' AND researcher_id = 'a0000001-0000-0000-0000-000000000007');

-- ============================================================
-- Summary: 131 unique pubs, 230 author links, 43 co-authored within CESRU, 1 grant
-- ============================================================