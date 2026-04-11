-- ============================================================
-- 025a: Fix missing columns in training_courses
-- กรณี table ถูกสร้างจาก version เก่าที่ยังไม่มี column บางตัว
-- ============================================================

-- เพิ่ม is_active (ถ้ายังไม่มี)
DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- เพิ่ม column อื่นๆ ที่อาจขาด
DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN category TEXT DEFAULT 'workshop';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN skill_domain TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN grants_credential_level TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN fee_internal DECIMAL(10,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN fee_student DECIMAL(10,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN fee_external DECIMAL(10,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN image_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN syllabus_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE training_courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ตั้งค่า is_active = true สำหรับ record ที่มีอยู่แล้ว
UPDATE training_courses SET is_active = true WHERE is_active IS NULL;

-- NOTE: Views อยู่ใน 025_training_platform.sql (รันหลังจากไฟล์นี้)
