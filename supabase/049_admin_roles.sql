-- ============================================================
-- 049: Admin roles tied to Supabase Auth identity
-- เปลี่ยนจาก "ใครก็ตามที่รู้รหัสผ่าน = admin" → "เฉพาะนักวิจัยจริงที่ login
-- ผ่าน Supabase ด้วย email ที่ตรงกับ researchers.email = admin อัตโนมัติ"
-- + superadmin ระบุ explicit ผ่าน column ใหม่ is_admin
-- ============================================================

-- === Add admin flag ===
ALTER TABLE researchers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_researchers_is_admin ON researchers(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_researchers_email_lower ON researchers(lower(email));

-- === Seed superadmin ===
-- กรณีไม่มี row นี้อยู่ จะไม่ทำอะไร (no-op)
UPDATE researchers
SET is_admin = true
WHERE lower(email) = lower('worrajak@rmutl.ac.th');

-- === Optional: add Gmail as backup superadmin (commented out — uncomment if needed)
-- UPDATE researchers SET is_admin = true WHERE lower(email) = 'worrajak@gmail.com';

-- ============================================================
-- Helper function: check if a given email is an active admin
-- ใช้ใน RLS policies หรือ API server-side check
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin_email(p_email TEXT)
RETURNS TABLE (
  is_admin BOOLEAN,
  is_superadmin BOOLEAN,
  researcher_id UUID,
  matched_email TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    (r.is_active = true OR r.is_admin = true)::BOOLEAN AS is_admin,
    COALESCE(r.is_admin, false)::BOOLEAN AS is_superadmin,
    r.id AS researcher_id,
    r.email AS matched_email
  FROM researchers r
  WHERE lower(r.email) = lower(p_email)
    AND (r.is_active = true OR r.is_admin = true)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO anon, authenticated;

-- === Allow anon to read is_admin/is_active flag of own researcher row by email ===
-- (RLS on researchers is already public-read in most setups, so this should already work,
--  but documenting for clarity)

-- Verify
SELECT
  id, lower(email) AS email_lc, is_admin, is_active, unit_role
FROM researchers
WHERE is_admin = true OR lower(email) = 'worrajak@rmutl.ac.th'
ORDER BY is_admin DESC, email;
