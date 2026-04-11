-- ============================================================
-- 020: Fix RLS for ALL tables missing public read policy
-- ปัญหา: หลายตารางมี RLS enabled (Supabase default) แต่ไม่มี policy
-- ทำให้ anon key query ไม่คืนข้อมูล
-- ============================================================

-- ===== academic_services =====
ALTER TABLE academic_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read academic_services" ON academic_services;
CREATE POLICY "Public read academic_services"
  ON academic_services FOR SELECT USING (true);

-- ===== service_members =====
ALTER TABLE service_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read service_members" ON service_members;
CREATE POLICY "Public read service_members"
  ON service_members FOR SELECT USING (true);

-- ===== research_areas =====
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read research_areas" ON research_areas;
CREATE POLICY "Public read research_areas"
  ON research_areas FOR SELECT USING (true);

-- ===== patent_inventors (อาจขาดเช่นกัน) =====
ALTER TABLE patent_inventors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read patent_inventors" ON patent_inventors;
CREATE POLICY "Public read patent_inventors"
  ON patent_inventors FOR SELECT USING (true);

-- ===== students (ถ้ามี) =====
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Public read students" ON students';
    EXECUTE 'CREATE POLICY "Public read students" ON students FOR SELECT USING (true)';
  END IF;
END $$;

-- ===== theses (ถ้ามี) =====
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theses') THEN
    ALTER TABLE theses ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Public read theses" ON theses';
    EXECUTE 'CREATE POLICY "Public read theses" ON theses FOR SELECT USING (true)';
  END IF;
END $$;

-- ===== project_topics (ถ้ามี) =====
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_topics') THEN
    ALTER TABLE project_topics ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Public read project_topics" ON project_topics';
    EXECUTE 'CREATE POLICY "Public read project_topics" ON project_topics FOR SELECT USING (true)';
  END IF;
END $$;

-- ===== datasets (ถ้ามี) =====
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'datasets') THEN
    ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Public read datasets" ON datasets';
    EXECUTE 'CREATE POLICY "Public read datasets" ON datasets FOR SELECT USING (true)';
  END IF;
END $$;
