-- ═══════════════════════════════════════════════════════════════════
-- 065_issue_credential_rpc.sql
-- ประตูแคบให้หน่วยวิจัยออกใบรับรองลงตารางของ SkillChain
--
-- ตาราง skc_student_credentials มี RLS ปิดการเขียนจาก anon ไว้ ซึ่งถูกแล้ว
-- เพราะเป็นข้อมูลของ SkillChain แทนที่จะเปิดตารางทั้งใบหรือแจก service
-- role key ให้หน่วยวิจัย จึงเปิดเป็นฟังก์ชัน SECURITY DEFINER ตัวเดียว
-- ที่ทำได้อย่างเดียวคือ "ออกใบรับรองในนามอาจารย์ มทร.ล้านนา"
--
-- การตรวจสิทธิ์: ใช้ apos_is_admin() ที่มีอยู่แล้ว (migration 056) ซึ่งดู
-- จาก researchers.is_admin เทียบกับอีเมลใน JWT ผู้เรียก API ฝั่งหน่วยวิจัย
-- จึงต้องส่ง Bearer token ของแอดมินที่ล็อกอิน Supabase Auth มาด้วย
-- แอดมินที่ใช้รหัสผ่าน legacy อย่างเดียวจะออกใบรับรองไม่ได้ ซึ่งตั้งใจ
-- เพราะใบรับรองควรผูกกับตัวตนที่ตรวจสอบย้อนได้
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION skc_issue_rmutl_credential(
  p_email            TEXT,   -- อีเมลผู้เรียน ต้องมีบัญชีใน skc_users อยู่แล้ว
  p_credential_level TEXT,   -- LEVEL_1..LEVEL_5 ตรงกับ enum CredentialLevel
  p_certificate_ref  TEXT,   -- tracking_code ของหน่วยวิจัย เช่น ENR-690101-AB12
  p_specialization   TEXT DEFAULT NULL,
  p_expires_at       TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (credential_id TEXT, student_id TEXT, already_existed BOOLEAN)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id TEXT;
  v_issuer_id  TEXT;
  v_existing   TEXT;
BEGIN
  IF NOT apos_is_admin() THEN
    RAISE EXCEPTION 'ต้องเป็นแอดมินของหน่วยวิจัยที่ล็อกอิน Supabase Auth จึงจะออกใบรับรองได้';
  END IF;

  IF p_credential_level NOT IN ('LEVEL_1','LEVEL_2','LEVEL_3','LEVEL_4','LEVEL_5') THEN
    RAISE EXCEPTION 'credential_level ไม่ถูกต้อง: %', p_credential_level;
  END IF;

  SELECT u.id INTO v_student_id
    FROM skc_users u
   WHERE LOWER(u.email) = LOWER(p_email) AND u.is_active
   LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'ไม่พบบัญชี SkillChain ของอีเมล % — ผู้เรียนต้องสมัคร SkillChain ก่อน', p_email;
  END IF;

  -- ผู้ออกใบรับรอง = แอดมินที่เรียก ถ้ามีบัญชีฝั่ง SkillChain ด้วยก็บันทึกไว้
  SELECT u.id INTO v_issuer_id
    FROM skc_users u
   WHERE LOWER(u.email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
   LIMIT 1;

  -- กันออกซ้ำจาก tracking_code เดียวกัน
  SELECT c.id INTO v_existing
    FROM skc_student_credentials c
   WHERE c.certificate_ref = p_certificate_ref AND c.is_active
   LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT v_existing, v_student_id, TRUE;
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO skc_student_credentials (
    id, student_id, credential_level, certified_by, certified_by_user_id,
    certificate_ref, specialization, expires_at, is_active
  ) VALUES (
    gen_random_uuid()::TEXT, v_student_id, p_credential_level::"CredentialLevel",
    'RMUTL_TEACHER'::"CertifyingBody", v_issuer_id,
    p_certificate_ref, p_specialization, p_expires_at, TRUE
  )
  RETURNING skc_student_credentials.id, skc_student_credentials.student_id, FALSE;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION skc_issue_rmutl_credential(TEXT,TEXT,TEXT,TEXT,TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION skc_issue_rmutl_credential(TEXT,TEXT,TEXT,TEXT,TIMESTAMPTZ) TO authenticated;

COMMENT ON FUNCTION skc_issue_rmutl_credential IS
  'ออกใบรับรอง SkillChain ในนาม RMUTL_TEACHER — เรียกได้เฉพาะแอดมินหน่วยวิจัยที่ล็อกอิน Supabase Auth · กันออกซ้ำด้วย certificate_ref';

-- ═══════════════════════════════════════════════════════════════════
-- ถอนออก:
--   DROP FUNCTION IF EXISTS skc_issue_rmutl_credential(TEXT,TEXT,TEXT,TEXT,TIMESTAMPTZ);
-- ═══════════════════════════════════════════════════════════════════
