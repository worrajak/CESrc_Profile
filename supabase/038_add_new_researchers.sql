-- ============================================================
-- 038: Add 5 New Researchers + ORCID/OpenAlex
-- เพิ่มสมาชิกใหม่ 5 ท่านพร้อม ORCID และ OpenAlex IDs
-- หมายเหตุ: ชื่อภาษาไทยเป็นการถอดเสียงเบื้องต้น — กรุณาตรวจสอบและแก้ไขที่หน้า admin หากไม่ตรง
-- ============================================================

-- 1. Thanet Phugun (thanet_ph65@rmutl.ac.th)
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000015',
  'อาจารย์', 'ธเนต', 'ภูคุณ',
  'Lect.', 'Thanet', 'Phugun',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'thanet_ph65@rmutl.ac.th',
  '0009-0007-7256-0663',
  ARRAY['Electrical Engineering']
) ON CONFLICT (id) DO NOTHING;

-- 2. Wuttikai Tammawan (wuttikai.ta@rmutl.ac.th)
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, openalex_id, cited_by_count, h_index, i10_index, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000016',
  'อาจารย์', 'วุฒิไกร', 'ทำมะวัน',
  'Lect.', 'Wuttikai', 'Tammawan',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'wuttikai.ta@rmutl.ac.th',
  '0009-0003-8965-3648',
  'A5030252784',
  48, 4, 2,
  ARRAY['Electrical Engineering']
) ON CONFLICT (id) DO NOTHING;

-- 3. Kittinun Srasuay (kittinun.s@rmutl.ac.th)
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, openalex_id, cited_by_count, h_index, i10_index, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000017',
  'อาจารย์', 'กิตตินันท์', 'ศรีสวย',
  'Lect.', 'Kittinun', 'Srasuay',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'kittinun.s@rmutl.ac.th',
  '0009-0008-9187-2870',
  'A5107439221',
  1, 1, 0,
  ARRAY['Electrical Engineering']
) ON CONFLICT (id) DO NOTHING;

-- 4. Narong Nanthakusol (narong@rmutl.ac.th)
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000018',
  'อาจารย์', 'ณรงค์', 'นันทกุศล',
  'Lect.', 'Narong', 'Nanthakusol',
  'member',
  'Division of Electrical Engineering', 'Faculty of Engineering',
  'Rajamangala University of Technology Lanna', 'Chiang Mai',
  'narong@rmutl.ac.th',
  '0009-0001-4951-7962',
  ARRAY['Electrical Engineering']
) ON CONFLICT (id) DO NOTHING;

-- 5. Satean Tunyasrirut (satean@ptwit.ac.th — สถาบันเทคโนโลยีปทุมวัน, Bangkok)
-- หมายเหตุ: ผู้นี้สังกัดสถาบันอื่น แต่ร่วมงานวิจัยกับ CESRU
INSERT INTO researchers (
  id, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  unit_role, department, faculty, university, campus,
  email, orcid_id, openalex_id, cited_by_count, h_index, i10_index, expertise
)
VALUES (
  'a0000001-0000-0000-0000-000000000019',
  'รศ.ดร.', 'สเถียร', 'ตัณยะศิรุต',
  'Assoc.Prof.Dr.', 'Satean', 'Tunyasrirut',
  'member',
  'Department of Instrumentation and Control Engineering',
  'Faculty of Engineering',
  'Pathumwan Institute of Technology',
  'Bangkok',
  'satean@ptwit.ac.th',
  '0000-0002-0902-9382',
  'A5007286617',
  406, 12, 12,
  ARRAY['Power Electronics', 'Control Systems', 'Renewable Energy', 'Instrumentation']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Verify ORCID IDs for existing researchers (no-op if already correct)
-- ============================================================

-- จัตตุฤทธิ์ ทองปรอน
UPDATE researchers SET orcid_id = '0009-0008-9235-1137', email = COALESCE(email, 'jutturit@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000001' AND (orcid_id IS NULL OR orcid_id != '0009-0008-9235-1137');

-- ธีระศักดิ์ สมศักดิ์
UPDATE researchers SET orcid_id = '0009-0008-0393-6257', email = COALESCE(email, 'dhirasak@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000002' AND (orcid_id IS NULL OR orcid_id != '0009-0008-0393-6257');

-- วิวัฒน์ ทิพจร
UPDATE researchers SET orcid_id = '0009-0000-8549-9725', email = COALESCE(email, 'wiwat@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000004' AND (orcid_id IS NULL OR orcid_id != '0009-0000-8549-9725');

-- นพพร พัชรประกิติ
UPDATE researchers SET orcid_id = '0000-0002-9693-8161', email = COALESCE(email, 'pnopporn@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000005' AND (orcid_id IS NULL OR orcid_id != '0000-0002-9693-8161');

-- อนนท์ นำอิน
UPDATE researchers SET orcid_id = '0000-0003-4568-3178', email = COALESCE(email, 'anamin@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000007' AND (orcid_id IS NULL OR orcid_id != '0000-0003-4568-3178');

-- มนตรี เงาเดช
UPDATE researchers SET orcid_id = '0009-0001-7842-4159', email = COALESCE(email, 'montri@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000008' AND (orcid_id IS NULL OR orcid_id != '0009-0001-7842-4159');

-- วรจักร์ เมืองใจ
UPDATE researchers SET orcid_id = '0009-0006-5318-567X', email = COALESCE(email, 'worrajak@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000009' AND (orcid_id IS NULL OR orcid_id != '0009-0006-5318-567X');

-- ณัฐวัฒน์ พัลวัล
UPDATE researchers SET orcid_id = '0009-0004-3109-1328', email = COALESCE(email, 'nattawat@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000012' AND (orcid_id IS NULL OR orcid_id != '0009-0004-3109-1328');

-- กัญจน์ นาคเอี่ยม
UPDATE researchers SET orcid_id = '0009-0003-0273-8922', email = COALESCE(email, 'Kannakaiam@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000013' AND (orcid_id IS NULL OR orcid_id != '0009-0003-0273-8922');

-- นริศ กำแพงแก้ว
UPDATE researchers SET orcid_id = '0009-0002-7344-2902', email = COALESCE(email, 'naris@rmutl.ac.th')
WHERE id = 'a0000001-0000-0000-0000-000000000014' AND (orcid_id IS NULL OR orcid_id != '0009-0002-7344-2902');

-- ============================================================
-- Summary:
--   New researchers added: 5 (Thanet, Wuttikai, Kittinun, Narong, Satean)
--   3 of them already in OpenAlex (Wuttikai, Kittinun, Satean)
--   2 not yet in OpenAlex (Thanet, Narong) — will be picked up in next sync
--   Pre-loaded total citations from new researchers: 455
--   Total researchers in CESRU now: 19 (14 existing + 5 new)
--
-- After running:
--   1. Visit /admin/openalex and click "Sync All Citations" to refresh
--   2. Edit Thai names if transliteration is incorrect
--      (ในกรณีที่ชื่อไทยที่ถอดเสียงไว้ไม่ถูกต้อง สามารถแก้ใน Supabase Dashboard
--       หรือสร้าง UPDATE query เพิ่มเติม)
-- ============================================================
