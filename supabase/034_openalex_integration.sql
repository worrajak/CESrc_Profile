-- ============================================================
-- 034: OpenAlex Integration + Fix publications columns
-- เพิ่ม source, openalex_id, cited_by_count, h_index, i10_index
-- ============================================================

-- 1) Add 'source' column to publications (orcid, openalex, manual, doi_import)
ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

COMMENT ON COLUMN publications.source IS 'แหล่งนำเข้า: manual, orcid, openalex, doi_import';

-- 2) Add 'source' column to grants
ALTER TABLE grants
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 3) Add OpenAlex fields to researchers
ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS openalex_id TEXT;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS cited_by_count INTEGER DEFAULT 0;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS h_index INTEGER DEFAULT 0;

ALTER TABLE researchers
  ADD COLUMN IF NOT EXISTS i10_index INTEGER DEFAULT 0;

COMMENT ON COLUMN researchers.openalex_id IS 'OpenAlex Author ID เช่น A5077950520';
COMMENT ON COLUMN researchers.cited_by_count IS 'จำนวนครั้งที่ถูกอ้างอิงรวม (จาก OpenAlex)';
COMMENT ON COLUMN researchers.h_index IS 'H-index (จาก OpenAlex)';
COMMENT ON COLUMN researchers.i10_index IS 'i10-index (จาก OpenAlex)';

CREATE INDEX IF NOT EXISTS idx_researchers_openalex ON researchers(openalex_id) WHERE openalex_id IS NOT NULL;

-- 4) Add cited_by_count to publications for individual paper citations
ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS cited_by_count INTEGER DEFAULT 0;

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS openalex_id TEXT;

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS is_open_access BOOLEAN DEFAULT false;

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS open_access_url TEXT;

COMMENT ON COLUMN publications.cited_by_count IS 'จำนวนครั้งที่บทความถูกอ้างอิง';
COMMENT ON COLUMN publications.openalex_id IS 'OpenAlex Work ID';

CREATE INDEX IF NOT EXISTS idx_publications_openalex ON publications(openalex_id) WHERE openalex_id IS NOT NULL;

-- 5) Add 'author' to author_role enum if not exists
DO $$ BEGIN
  ALTER TYPE author_role ADD VALUE IF NOT EXISTS 'author';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6) Add simple pub_type values to enum for ORCID/OpenAlex imports
DO $$ BEGIN
  ALTER TYPE publication_type ADD VALUE IF NOT EXISTS 'journal';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE publication_type ADD VALUE IF NOT EXISTS 'conference';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE publication_type ADD VALUE IF NOT EXISTS 'report';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7) Update OpenAlex stats for researchers found via API
-- อนนท์ นำอิน
UPDATE researchers SET openalex_id = 'A5077950520', cited_by_count = 241, h_index = 11, i10_index = 12
WHERE id = 'a0000001-0000-0000-0000-000000000007';

-- ธีระศักดิ์ สมศักดิ์
UPDATE researchers SET openalex_id = 'A5058157544', cited_by_count = 99, h_index = 6, i10_index = 5
WHERE id = 'a0000001-0000-0000-0000-000000000002';

-- วรจักร์ เมืองใจ
UPDATE researchers SET openalex_id = 'A5091379778', cited_by_count = 57, h_index = 5, i10_index = 2
WHERE id = 'a0000001-0000-0000-0000-000000000009';

-- นพพร พัชรประกิติ
UPDATE researchers SET openalex_id = 'A5113756255', cited_by_count = 507, h_index = 8, i10_index = 8
WHERE id = 'a0000001-0000-0000-0000-000000000005';

-- จัตตุฤทธิ์ ทองปรอน
UPDATE researchers SET openalex_id = 'A5088632438', cited_by_count = 346, h_index = 11, i10_index = 13
WHERE id = 'a0000001-0000-0000-0000-000000000001';

-- วิวัฒน์ ทิพจร
UPDATE researchers SET openalex_id = 'A5071880269', cited_by_count = 183, h_index = 6, i10_index = 4
WHERE id = 'a0000001-0000-0000-0000-000000000004';

-- มนตรี เงาเดช
UPDATE researchers SET openalex_id = 'A5056725678', cited_by_count = 18, h_index = 2, i10_index = 1
WHERE id = 'a0000001-0000-0000-0000-000000000008';

-- ณัฐวัฒน์ พัลวัล
UPDATE researchers SET openalex_id = 'A5028958900', cited_by_count = 4, h_index = 1, i10_index = 0
WHERE id = 'a0000001-0000-0000-0000-000000000012';

-- กัญจน์ นาคเอี่ยม
UPDATE researchers SET openalex_id = 'A5107439217', cited_by_count = 1, h_index = 1, i10_index = 0
WHERE id = 'a0000001-0000-0000-0000-000000000013';

-- นริศ กำแพงแก้ว
UPDATE researchers SET openalex_id = 'A5107439220', cited_by_count = 0, h_index = 0, i10_index = 0
WHERE id = 'a0000001-0000-0000-0000-000000000014';

-- วิเชษฐ์ ทิพย์ประเสริฐ (found by name search)
UPDATE researchers SET openalex_id = 'A5044294703', cited_by_count = 29, h_index = 2, i10_index = 1
WHERE id = 'a0000001-0000-0000-0000-000000000011';

-- เกษม ตรีภาค (found by name search)
UPDATE researchers SET openalex_id = 'A5077391503', cited_by_count = 0, h_index = 0, i10_index = 0
WHERE id = 'a0000001-0000-0000-0000-000000000010';

-- โกศล โอฬารไพโรจน์ (found by name search: "Kosol Oranpiroj")
UPDATE researchers SET openalex_id = 'A5065777731', cited_by_count = 90, h_index = 6, i10_index = 3
WHERE id = 'a0000001-0000-0000-0000-000000000003';

-- รัตนพล พรหมวัน ณ อยุธยา (found by name: "Rattanapol Panomwan Na Ayuthaya")
UPDATE researchers SET openalex_id = 'A5083509515', cited_by_count = 83, h_index = 1, i10_index = 0
WHERE id = 'a0000001-0000-0000-0000-000000000006';

-- All 14 researchers now have OpenAlex profiles!
