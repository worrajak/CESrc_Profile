-- ============================================================
-- อ.อนนท์ นำอิน (Anon Namin) — WoS Author Record AAO-2295-2020
-- Publications from Web of Science (verified)
-- ============================================================

-- ============================================================
-- UPDATE existing publications with full author lists
-- ============================================================

-- PUB-2: Energies 2025 — Khlong Ruea (update authors_raw from "et al.")
UPDATE publications
SET authors_raw = 'M. Ngao-det, J. Thongpron, A. Namin, K. Oranpiroj, W. Tippachon, N. Patcharaprakiti, and T. Somsak',
    month = 3
WHERE id = 'b0000001-0000-0000-0000-000000000002';

-- Add missing publication_authors for PUB-2
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000005', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'last_author', 7, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- PUB-4: Energies 2023 — CC-CV Wireless (update authors_raw from "et al.")
UPDATE publications
SET authors_raw = 'J. Thongpron, U. Kamnarn, S. Yousawat, A. Namin, W. Tippachon, K. Oranpiroj, T. Somsak, P. Thounthong, and N. Takorabet',
    month = 11
WHERE id = 'b0000001-0000-0000-0000-000000000004';

-- Add missing publication_authors for PUB-4
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'first_author', 1, false),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000007', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', 'co_author', 7, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- ============================================================
-- NEW PUBLICATIONS from WoS
-- ============================================================

-- [WOS-1] J. Energy Storage 2025 — Enhanced adaptive Hamiltonian control
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, year, month, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000007',
  'Enhanced adaptive Hamiltonian control strategy for battery-ultracapacitor hybrid systems in electric vehicle applications',
  'journal_international', 'published',
  'Journal of Energy Storage',
  '138', 2025, 12,
  'P. Mungporn, S. Khomfoi, A. Namin, J. Thongpron, K. Oranpiroj, T. Somsak, and P. Thounthong',
  true, true,
  'This paper presents an enhanced Hamiltonian control law integrated with differential flatness theory, designed for hybrid vehicle systems utilizing batteries and ultracapacitors (UCs). Compared to conventional methods, the proposed approach improves transient stability, enables dynamic power sharing.',
  ARRAY['Hamiltonian control', 'battery-ultracapacitor', 'hybrid system', 'electric vehicle']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000003', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000002', 'co_author', 6, false);

-- [WOS-2] JJAP 2025 — 48V mini shuttle EV solar-assisted
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, year, month, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000008',
  'A techno-economic analysis of a 48 V mini shuttle electric vehicle with a solar-assisted system for a carbon-neutral green campus',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics',
  '64', '7', 2025, 7,
  'K. Srasuay, J. Thongpron, A. Namin, T. Somsak, and N. Patcharaprakiti',
  true, true,
  'This paper proposes the techno and economic analysis of a mini shuttle electric vehicle (EV) for public transportation in university campus utilization. The primary objectives are received energy efficiency and environmental sustainability.',
  ARRAY['mini shuttle EV', 'solar-assisted', 'techno-economic analysis', 'green campus', 'carbon-neutral']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000002', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000005', 'last_author', 5, false);

-- [WOS-3] JJAP 2025 — Bifacial solar cell circuit models
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, year, month, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000009',
  'A comparison of circuit models for simulating and evaluating the current-voltage characteristics of PERT N-type bifacial solar cell',
  'journal_international', 'published',
  'Japanese Journal of Applied Physics',
  '64', '6', 2025, 6,
  'P. Wiratsiri, A. Namin, J. Thongpron, and others',
  true, true,
  'This paper compares two simulation models for evaluating the current-voltage (I-V) characteristics of PERT N-type bifacial solar cells in outdoor conditions in accordance with the IEC 60904-1-2 TS and IEC 60891 standards.',
  ARRAY['bifacial solar cell', 'PERT N-type', 'circuit model', 'I-V characteristics']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000007', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3, false);

-- [WOS-5] IEEE ACCESS 2025 — CC-CV Wireless EV Charging Power Balance
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, pages, year, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000010',
  'CC-CV Wireless EV Charging With Power Balance Control in Primary- and Secondary-Side Converters',
  'journal_international', 'published',
  'IEEE Access',
  '13', 'pp. 151597-151613', 2025,
  'U. Kamnarn, S. Yousawat, A. Namin, J. Thongpron, K. Oranpiroj, T. Somsak, W. Tippachon, and P. Thounthong',
  true, true,
  'This paper presents the design, simulation, and experimental validation of a constant current-constant voltage (CC-CV) wireless electric vehicle (EV) charging system utilizing Power Balance Control (PBC) in both primary-side (PS) and secondary-side (SS) converter configurations.',
  ARRAY['CC-CV charging', 'wireless EV charging', 'power balance control', 'IEEE Access']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000003', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000002', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000004', 'co_author', 7, false);

-- [WOS-6] IEEE/IAS I&CPS Asia 2024 — Hamiltonian Control CC-CV (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, pages, year, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000011',
  'Hamiltonian Control for CC-CV Primary-side Buck Converter of Inductive Wireless EV Charging',
  'conference_international', 'published',
  '2024 IEEE/IAS Industrial and Commercial Power System Asia (I&CPS Asia)',
  'pp. 319-324', 2024,
  'T. Sriprom, J. Thongpron, A. Namin, K. Oranpiroj, T. Somsak, and P. Thounthong',
  true, true,
  'This study presents a Hamiltonian control law for constant current - constant voltage (CC-CV) inductive wireless charging.',
  ARRAY['Hamiltonian control', 'CC-CV', 'wireless EV charging', 'buck converter']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000002', 'co_author', 5, false);

-- [WOS-7] ECTI-CON 2024 — Class-E Inverter Wireless Charging (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000012',
  'Analysis, Design and Implementation of Class-E Inverter for Wireless Charging Application',
  'conference_international', 'published',
  '2024 21st International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2024,
  'C. Donloei, E. Chaidee, A. Namin, and others',
  true, true,
  'This paper extensively investigates the analysis, design, and practical implementation of a class E resonant inverter with zero voltage switching (ZVS) capabilities, specifically tailored for wireless charging applications.',
  ARRAY['Class-E inverter', 'zero voltage switching', 'wireless charging']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false);

-- [WOS-8] ECTI-CON 2024 — Delayed WiFi Communications CC-CV (Conference)
INSERT INTO publications (id, title, pub_type, status, journal_name, year, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000013',
  'Delayed WiFi Communications Feedback Control Primary-side Buck Converter for CC-CV Inductive Wireless EV Charging',
  'conference_international', 'published',
  '2024 21st International Conference on Electrical Engineering/Electronics, Computer, Telecommunications and Information Technology (ECTI-CON)',
  2024,
  'P. Suwan, T. Phondee, A. Namin, and others',
  true, true,
  'This paper aimed to study the delayed WiFi communications for constant current and constant voltage (CC-CV) inductive wireless EV charging coupled to the primary side (PS) buck converter through the ESP 32 feedback controllers on the secondary side (SS).',
  ARRAY['WiFi communications', 'CC-CV charging', 'wireless EV charging', 'ESP32', 'buck converter']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000007', 'co_author', 3, false);

-- [WOS-10] IEEJ J. Industry Applications 2023 — DC Architecture
INSERT INTO publications (id, title, pub_type, status, journal_name, volume, issue, pages, year, authors_raw, scopus_indexed, wos_indexed, abstract, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000014',
  'Dynamic and Steady-State Behavior of Distributed Power Supply in DC Architecture with Minimized DC Bus Capacitor',
  'journal_international', 'published',
  'IEEJ Journal of Industry Applications',
  '12', '4', 'pp. 745-754', 2023,
  'U. Kamnarn, A. Namin, J. Thongpron, K. Oranpiroj, T. Somsak, W. Tippachon, and N. Takorabet',
  true, true,
  'The dynamic and steady-state behaviors of distributed power supply in a DC architecture with a minimized DC bus capacitor is investigated in this paper using the power balance control technique.',
  ARRAY['DC architecture', 'distributed power supply', 'DC bus capacitor', 'power balance control']
);

INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000007', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', 'co_author', 3, false),
('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000003', 'co_author', 4, false),
('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000002', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000004', 'co_author', 6, false);
