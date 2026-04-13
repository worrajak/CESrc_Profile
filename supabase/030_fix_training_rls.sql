-- ============================================================
-- 030: Fix Training RLS — เพิ่ม INSERT/UPDATE/DELETE policy
-- ตาราง training ทั้งหมดมี RLS enabled แต่ไม่มี write policy
-- ทำให้ admin เพิ่ม/แก้ไข/ลบหลักสูตร/รุ่น/โมดูลไม่ได้
-- ============================================================

-- training_courses
DO $$ BEGIN
  ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all training_courses" ON training_courses
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- course_modules
DO $$ BEGIN
  ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all course_modules" ON course_modules
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- training_sessions
DO $$ BEGIN
  ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all training_sessions" ON training_sessions
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- enrollments
DO $$ BEGIN
  ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all enrollments" ON enrollments
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- trainees
DO $$ BEGIN
  ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all trainees" ON trainees
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- module_scores
DO $$ BEGIN
  ALTER TABLE module_scores ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all module_scores" ON module_scores
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- module_competencies
DO $$ BEGIN
  ALTER TABLE module_competencies ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all module_competencies" ON module_competencies
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- competency_indicators
DO $$ BEGIN
  ALTER TABLE competency_indicators ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all competency_indicators" ON competency_indicators
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- indicator_scores
DO $$ BEGIN
  ALTER TABLE indicator_scores ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all indicator_scores" ON indicator_scores
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- trainee_credentials
DO $$ BEGIN
  ALTER TABLE trainee_credentials ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all trainee_credentials" ON trainee_credentials
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- evaluation_templates
DO $$ BEGIN
  ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all evaluation_templates" ON evaluation_templates
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
