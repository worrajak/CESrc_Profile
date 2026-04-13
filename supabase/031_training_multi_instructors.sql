-- ============================================================
-- 031: Training Multi-Instructors
-- เพิ่มคอลัมน์ instructor_ids (JSONB array of researcher UUIDs)
-- รองรับวิทยากรหลายคน (สูงสุด 5)
-- ============================================================

ALTER TABLE training_courses
  ADD COLUMN IF NOT EXISTS instructor_ids JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN training_courses.instructor_ids IS 'Array of researcher UUIDs — วิทยากรจากนักวิจัยในหน่วย (สูงสุด 5)';
