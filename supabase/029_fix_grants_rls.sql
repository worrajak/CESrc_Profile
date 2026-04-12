-- ============================================================
-- 029: Fix Grants RLS — เพิ่ม INSERT/UPDATE/DELETE policy
-- ปัญหา: grants + grant_members มีแค่ SELECT policy
-- ทำให้ admin insert/update/delete ไม่ได้
-- ============================================================

-- grants: อนุญาต INSERT/UPDATE/DELETE (ผ่าน API auth)
DO $$ BEGIN
  CREATE POLICY "Anon manage grants" ON grants
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- grant_members: อนุญาต INSERT/UPDATE/DELETE
DO $$ BEGIN
  CREATE POLICY "Anon manage grant_members" ON grant_members
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ตรวจสอบ researchers, publications, publication_authors ด้วย
-- (เผื่อมีปัญหาเดียวกัน)
DO $$ BEGIN
  CREATE POLICY "Anon manage researchers" ON researchers
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anon manage publications" ON publications
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anon manage publication_authors" ON publication_authors
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anon manage patents" ON patents
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
