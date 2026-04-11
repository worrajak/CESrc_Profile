-- ============================================================
-- 025a: Drop old training tables (schema ไม่ตรง version ใหม่)
-- แล้วให้ 025_training_platform.sql สร้างใหม่ทั้งหมด
-- รัน: 025a → 025 → 026
-- ============================================================

-- Drop views ก่อน
DROP VIEW IF EXISTS v_course_summary CASCADE;
DROP VIEW IF EXISTS v_session_enrollment CASCADE;
DROP VIEW IF EXISTS v_module_competency_summary CASCADE;
DROP VIEW IF EXISTS v_enrollment_evaluation CASCADE;

-- Drop tables (ลำดับ dependency: ลูกก่อนแม่)
DROP TABLE IF EXISTS indicator_scores CASCADE;
DROP TABLE IF EXISTS competency_indicators CASCADE;
DROP TABLE IF EXISTS module_competencies CASCADE;
DROP TABLE IF EXISTS evaluation_templates CASCADE;
DROP TABLE IF EXISTS service_timeline CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS trainee_credentials CASCADE;
DROP TABLE IF EXISTS module_scores CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS trainees CASCADE;
DROP TABLE IF EXISTS credential_levels CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS training_sessions CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS ai_config CASCADE;

-- ตอนนี้ tables ว่างหมด — รัน 025 แล้วตาม 026 ได้เลย
