-- ============================================================
-- 039: Add 'phd_student' enum value (PART 1 of 2)
-- !!! IMPORTANT: ต้องรันไฟล์นี้ก่อน แล้วรอให้ commit เสร็จ
--     จากนั้นค่อยรัน 039b_update_thai_names_roles.sql
-- เพราะ PostgreSQL ไม่อนุญาตให้ใช้ enum value ใหม่ใน transaction
-- เดียวกับที่เพิ่มมัน
-- ============================================================

-- Add 'phd_student' to researcher_role enum
ALTER TYPE researcher_role ADD VALUE IF NOT EXISTS 'phd_student';

-- ============================================================
-- หลังรันสำเร็จ: รัน 039b_update_thai_names_roles.sql ต่อ
-- ============================================================
