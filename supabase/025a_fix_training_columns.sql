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

-- ============================================================
-- สร้าง view ใหม่ (ไม่ใช้ tc.* เพื่อหลีกเลี่ยง GROUP BY issue)
-- ============================================================

DROP VIEW IF EXISTS v_course_summary;
CREATE VIEW v_course_summary AS
SELECT
  tc.id,
  tc.code,
  tc.title_th,
  tc.title_en,
  tc.description_th,
  tc.category,
  tc.skill_domain,
  tc.level,
  tc.grants_credential_level,
  tc.duration_hours,
  tc.duration_days,
  tc.max_participants,
  tc.fee_internal,
  tc.fee_student,
  tc.fee_external,
  tc.is_active,
  tc.created_at,
  COUNT(DISTINCT ts.id) AS total_sessions,
  COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'open') AS open_sessions,
  COUNT(DISTINCT e.id) AS total_enrollments,
  COUNT(DISTINCT e.id) FILTER (WHERE e.passed = true) AS passed_count,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS instructor_fullname
FROM training_courses tc
LEFT JOIN training_sessions ts ON ts.course_id = tc.id
LEFT JOIN enrollments e ON e.session_id = ts.id
LEFT JOIN researchers r ON r.id = tc.instructor_id
WHERE tc.is_active = true
GROUP BY tc.id, tc.code, tc.title_th, tc.title_en, tc.description_th,
  tc.category, tc.skill_domain, tc.level, tc.grants_credential_level,
  tc.duration_hours, tc.duration_days, tc.max_participants,
  tc.fee_internal, tc.fee_student, tc.fee_external,
  tc.is_active, tc.created_at,
  r.title_th, r.first_name_th, r.last_name_th;

DROP VIEW IF EXISTS v_session_enrollment;
CREATE VIEW v_session_enrollment AS
SELECT
  ts.id, ts.course_id, ts.session_code, ts.batch_number,
  ts.start_date, ts.end_date, ts.location, ts.room,
  ts.max_participants, ts.min_participants,
  ts.registration_open, ts.registration_close,
  ts.status, ts.notes, ts.created_at,
  tc.title_th AS course_title, tc.code AS course_code,
  tc.fee_external, tc.fee_student, tc.fee_internal,
  COUNT(e.id) AS enrolled_count,
  COUNT(e.id) FILTER (WHERE e.status IN ('confirmed', 'attending')) AS confirmed_count
FROM training_sessions ts
JOIN training_courses tc ON tc.id = ts.course_id
LEFT JOIN enrollments e ON e.session_id = ts.id
GROUP BY ts.id, ts.course_id, ts.session_code, ts.batch_number,
  ts.start_date, ts.end_date, ts.location, ts.room,
  ts.max_participants, ts.min_participants,
  ts.registration_open, ts.registration_close,
  ts.status, ts.notes, ts.created_at,
  tc.title_th, tc.code, tc.fee_external, tc.fee_student, tc.fee_internal;
