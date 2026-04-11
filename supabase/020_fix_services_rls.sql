-- ============================================================
-- 020: Fix RLS for academic_services and service_members
-- ปัญหา: ตาราง academic_services มี RLS enabled แต่ไม่มี policy
-- ทำให้ anon key query ไม่คืนข้อมูล
-- ============================================================

-- Enable RLS (ถ้ายังไม่ได้ enable)
ALTER TABLE academic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_members ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read academic_services"
  ON academic_services FOR SELECT USING (true);

CREATE POLICY "Public read service_members"
  ON service_members FOR SELECT USING (true);
