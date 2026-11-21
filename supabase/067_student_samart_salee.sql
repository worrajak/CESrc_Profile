-- ═══════════════════════════════════════════════════════════════════
-- 067_student_samart_salee.sql
-- เพิ่ม นายสามารถ สาลี เป็นนักศึกษาปริญญาโท
--
-- ที่มา: คำสั่งคณะวิศวกรรมศาสตร์ มทร.ล้านนา ที่ 227/2565 (27 ก.ย. 2565)
--        เรื่อง แต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์ — หลักสูตรวิศวกรรมศาสตร
--        มหาบัณฑิต สาขาวิศวกรรมไฟฟ้า · ที่ปรึกษาหลัก ผศ.วรจักร์ เมืองใจ
--
-- แถวใน researchers (id e3b3f9ca-…) สร้างไว้แล้วผ่าน API เพื่อลิงก์เป็น
-- ผู้แต่งลำดับแรกของบทความ The Journal of KMUTNB 37(4) ตาราง students
-- เปิดให้ anon อ่านอย่างเดียว จึงต้องรันไฟล์นี้ใน SQL Editor
--
-- สมมติฐาน: enrollment_year 2565 อนุมานจากเลขรหัสนักศึกษาขึ้นต้น 65
--          status = active (ยังไม่มีหลักฐานว่าสำเร็จการศึกษา)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO students (
  student_code, title_th, first_name_th, last_name_th,
  title_en, first_name_en, last_name_en,
  degree_level, program_th, program_en,
  enrollment_year, status, researcher_id
) VALUES (
  '65553281003-4', 'นาย', 'สามารถ', 'สาลี',
  'Mr.', 'Samart', 'Salee',
  'master', 'วิศวกรรมไฟฟ้า', 'Electrical Engineering',
  2565, 'active', 'e3b3f9ca-805e-424f-9592-5a0bd0cdcf71'
)
ON CONFLICT (student_code) DO UPDATE SET researcher_id = EXCLUDED.researcher_id;

-- ตรวจผล
SELECT s.student_code, s.title_th || s.first_name_th || ' ' || s.last_name_th AS name,
       s.degree_level, s.program_th, r.position_th
  FROM students s JOIN researchers r ON r.id = s.researcher_id
 WHERE s.student_code = '65553281003-4';
