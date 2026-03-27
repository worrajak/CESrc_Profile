-- ============================================================
-- Fix missing publication_authors links
-- Link researchers who appear in authors_raw but not in publication_authors
-- ============================================================

-- Montri Ngaodech (008) = "M. Ngao-det" in Energies 2025 (PUB-2) — first author
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding)
VALUES ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000008', 'first_author', 1, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- Montri Ngaodech (008) = "M. Ngoudech" in IEEE ISIE 2009 (WJ-4)
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding)
VALUES ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000008', 'co_author', 3, false)
ON CONFLICT (publication_id, researcher_id) DO NOTHING;

-- Update Montri's expertise based on his actual research
UPDATE researchers
SET expertise = ARRAY['Power Quality', 'Voltage Sag', 'Microgrid Design', 'Renewable Energy Systems']
WHERE id = 'a0000001-0000-0000-0000-000000000008';

-- ============================================================
-- Add Nopporn (005) DOI for Renewable Energy 2005 paper
-- ============================================================
UPDATE publications
SET doi = '10.1016/j.renene.2005.01.009'
WHERE id = 'b0000001-0000-0000-0000-000000000005';

-- ============================================================
-- Ensure Teerasak Somsak (002) is linked to Energies 2025 properly
-- Already has last_author from 003 SQL, verify
-- ============================================================

-- ============================================================
-- Add publication_authors for iEECON 2022 papers (WJ-13, WJ-14)
-- Tammawan = external, but Tippachon (004) is in WJ-13 Solar Simulator
-- Already added in 004_muangjai_cv.sql
-- ============================================================

-- ============================================================
-- Update expertise for researchers with limited info
-- ============================================================

-- Rattanapol Promwan (006) — based on department info
UPDATE researchers
SET expertise = ARRAY['Electrical Power Systems', 'Electrical Engineering']
WHERE id = 'a0000001-0000-0000-0000-000000000006'
AND expertise = ARRAY['Electrical Engineering'];

-- Kasem Treepak (010) — based on department info
UPDATE researchers
SET expertise = ARRAY['Electrical Engineering', 'Electrical Installation']
WHERE id = 'a0000001-0000-0000-0000-000000000010'
AND expertise = ARRAY['Electrical Engineering'];
