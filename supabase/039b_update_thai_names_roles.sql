-- ============================================================
-- 039b: Update Thai names + roles (PART 2 of 2)
-- !!! ต้องรัน 039_fix_thai_names_roles.sql ให้สำเร็จก่อน !!!
-- (เพราะใช้ enum value 'phd_student' ที่เพิ่งเพิ่มไป)
-- ============================================================

-- เสถียร ธัญญศรีรัตน์ (ที่ปรึกษา)
UPDATE researchers SET
  title_th = 'รศ.ดร.',
  first_name_th = 'เสถียร',
  last_name_th = 'ธัญญศรีรัตน์',
  unit_role = 'advisor',
  position_th = 'ที่ปรึกษาหน่วยวิจัยระบบพลังงานสะอาด',
  position_en = 'Research Unit Advisor'
WHERE id = 'a0000001-0000-0000-0000-000000000019';

-- ธเนศ ภู่กัน (นักศึกษาปริญญาเอก)
UPDATE researchers SET
  first_name_th = 'ธเนศ',
  last_name_th = 'ภู่กัน',
  unit_role = 'phd_student',
  position_th = 'นักศึกษาปริญญาเอก',
  position_en = 'PhD Student'
WHERE id = 'a0000001-0000-0000-0000-000000000015';

-- วุฒิไกร ธรรมวัน (นักศึกษาปริญญาเอก)
UPDATE researchers SET
  first_name_th = 'วุฒิไกร',
  last_name_th = 'ธรรมวัน',
  unit_role = 'phd_student',
  position_th = 'นักศึกษาปริญญาเอก',
  position_en = 'PhD Student'
WHERE id = 'a0000001-0000-0000-0000-000000000016';

-- กิตตินัน สระสวย (นักศึกษาปริญญาเอก)
UPDATE researchers SET
  first_name_th = 'กิตตินัน',
  last_name_th = 'สระสวย',
  unit_role = 'phd_student',
  position_th = 'นักศึกษาปริญญาเอก',
  position_en = 'PhD Student'
WHERE id = 'a0000001-0000-0000-0000-000000000017';

-- ณรงค์ นันทกุศล (นักศึกษาปริญญาเอก)
UPDATE researchers SET
  first_name_th = 'ณรงค์',
  last_name_th = 'นันทกุศล',
  unit_role = 'phd_student',
  position_th = 'นักศึกษาปริญญาเอก',
  position_en = 'PhD Student'
WHERE id = 'a0000001-0000-0000-0000-000000000018';

-- ============================================================
-- Summary:
--   1 advisor: เสถียร ธัญญศรีรัตน์
--   4 PhD students: ธเนศ, วุฒิไกร, กิตตินัน, ณรงค์
-- ============================================================
