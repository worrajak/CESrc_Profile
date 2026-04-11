-- ============================================================
-- 025a: Fix missing columns in training_courses
-- กรณี table ถูกสร้างจาก version เก่าที่ยังไม่มี column ครบ
-- รัน: 025a → 025 → 026
-- ============================================================

-- ทุก column ตาม schema ใน 025 (safe — skip ถ้ามีอยู่แล้ว)
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN code TEXT UNIQUE; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN title_en TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN description_th TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN description_en TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN category TEXT DEFAULT 'workshop'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN skill_domain TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN level TEXT DEFAULT 'beginner'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN prerequisite_course_id UUID REFERENCES training_courses(id); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN grants_credential_level TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN duration_hours INT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN duration_days INT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN max_participants INT DEFAULT 30; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN fee_internal DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN fee_student DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN fee_external DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN instructor_id UUID REFERENCES researchers(id); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN instructor_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN image_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN syllabus_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN is_active BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN created_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE training_courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ตั้งค่า default สำหรับ record เก่า
UPDATE training_courses SET is_active = true WHERE is_active IS NULL;
UPDATE training_courses SET level = 'beginner' WHERE level IS NULL;
UPDATE training_courses SET max_participants = 30 WHERE max_participants IS NULL;

-- NOTE: Views อยู่ใน 025_training_platform.sql (รันหลังจากไฟล์นี้)
