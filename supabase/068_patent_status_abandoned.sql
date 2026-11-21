-- ============================================================
-- 068: เพิ่มสถานะ 'abandoned' (ละทิ้งคำขอ) ให้ enum patent_status
-- ต้องรันไฟล์นี้ "ก่อน" 068b และรันแยกครั้ง — Postgres ไม่ยอมให้ใช้ค่า enum ใหม่
-- ใน transaction เดียวกับที่เพิ่มค่า (unsafe use of new value)
-- idempotent: IF NOT EXISTS
-- ============================================================
ALTER TYPE patent_status ADD VALUE IF NOT EXISTS 'abandoned';
