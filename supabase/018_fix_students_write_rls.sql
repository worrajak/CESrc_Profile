-- ============================================================
-- Fix: เพิ่ม INSERT/UPDATE/DELETE policies สำหรับตาราง 014
-- students, theses, thesis_committee, thesis_publications, external_persons
-- ============================================================
-- IDEMPOTENT: สามารถ run ซ้ำได้

DO $$ BEGIN
  -- students
  DROP POLICY IF EXISTS "Allow insert students" ON students;
  CREATE POLICY "Allow insert students" ON students FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update students" ON students;
  CREATE POLICY "Allow update students" ON students FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete students" ON students;
  CREATE POLICY "Allow delete students" ON students FOR DELETE USING (true);

  -- theses
  DROP POLICY IF EXISTS "Allow insert theses" ON theses;
  CREATE POLICY "Allow insert theses" ON theses FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update theses" ON theses;
  CREATE POLICY "Allow update theses" ON theses FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete theses" ON theses;
  CREATE POLICY "Allow delete theses" ON theses FOR DELETE USING (true);

  -- thesis_committee
  DROP POLICY IF EXISTS "Allow insert thesis_committee" ON thesis_committee;
  CREATE POLICY "Allow insert thesis_committee" ON thesis_committee FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update thesis_committee" ON thesis_committee;
  CREATE POLICY "Allow update thesis_committee" ON thesis_committee FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete thesis_committee" ON thesis_committee;
  CREATE POLICY "Allow delete thesis_committee" ON thesis_committee FOR DELETE USING (true);

  -- thesis_publications
  DROP POLICY IF EXISTS "Allow insert thesis_publications" ON thesis_publications;
  CREATE POLICY "Allow insert thesis_publications" ON thesis_publications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update thesis_publications" ON thesis_publications;
  CREATE POLICY "Allow update thesis_publications" ON thesis_publications FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete thesis_publications" ON thesis_publications;
  CREATE POLICY "Allow delete thesis_publications" ON thesis_publications FOR DELETE USING (true);

  -- external_persons
  DROP POLICY IF EXISTS "Allow insert external_persons" ON external_persons;
  CREATE POLICY "Allow insert external_persons" ON external_persons FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Allow update external_persons" ON external_persons;
  CREATE POLICY "Allow update external_persons" ON external_persons FOR UPDATE USING (true);
  DROP POLICY IF EXISTS "Allow delete external_persons" ON external_persons;
  CREATE POLICY "Allow delete external_persons" ON external_persons FOR DELETE USING (true);
END $$;
