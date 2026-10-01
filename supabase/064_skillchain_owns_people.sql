-- ═══════════════════════════════════════════════════════════════════
-- 064_skillchain_owns_people.sql
-- ให้ SkillChain (skc_users) เป็นเจ้าของข้อมูลคน
--
-- เดิมหน่วยวิจัยมีตาราง trainees ของตัวเอง (migration 025) ซึ่งซ้ำกับ
-- skc_users ที่มีคนจริงใช้งานอยู่ 38 คน ส่วน trainees ว่างเปล่ามาตลอด
-- จึงรื้อได้โดยไม่ต้องย้ายข้อมูล
--
-- กติกาหลังไฟล์นี้
--   · ถ้าอีเมลตรงกับ skc_users  → enrollments.skc_user_id ชี้ไปที่นั่น
--                                 ชื่อ/คณะ/วิทยาเขต อ่านจาก skc_users เสมอ
--   · ถ้าไม่มีใน skc_users      → ยังรับลงทะเบียนได้ เก็บเป็น trainees
--                                 (บุคคลภายนอกที่ไม่ได้เป็นนักศึกษาในระบบ)
--
-- หน่วยวิจัย "ไม่สร้าง" แถวใน skc_users เอง เพราะฝั่ง SkillChain มี
-- approval_status / pdpa_consented_at / email_verified ที่เป็นกระบวนการ
-- ของเขา การสร้างบัญชีจากฟอร์มสมัครอบรมจะข้ามขั้นตอนเหล่านั้น
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS skc_user_id TEXT REFERENCES skc_users(id);

CREATE INDEX IF NOT EXISTS idx_enrollments_skc_user ON enrollments(skc_user_id);

COMMENT ON COLUMN enrollments.skc_user_id IS
  'ผู้เรียนใน SkillChain (เจ้าของข้อมูลคน) — NULL เมื่อเป็นบุคคลภายนอกที่ยังไม่มีบัญชี';

COMMENT ON TABLE trainees IS
  'สำรองสำหรับผู้เข้าอบรมที่ยังไม่มีบัญชี SkillChain เท่านั้น — ถ้ามีบัญชีแล้วให้ยึด skc_users';

-- ── มุมมองรวมผู้เข้าอบรม ไม่ว่าจะมาจากฝั่งไหน ─────────────────────
-- ใช้แทนการ query trainees ตรง ๆ จะได้ชื่อจาก skc_users เมื่อผูกกันแล้ว
CREATE OR REPLACE VIEW cesru_enrollment_people AS
SELECT
  e.id                AS enrollment_id,
  e.session_id,
  e.tracking_code,
  e.status,
  e.skc_user_id,
  e.trainee_id,
  COALESCE(u.email, t.email)                                              AS email,
  COALESCE(u.name, t.first_name_th || ' ' || t.last_name_th)              AS display_name,
  COALESCE(u.campus,  NULL)                                               AS campus,
  COALESCE(u.faculty, t.organization)                                     AS affiliation,
  u.role              AS skc_role,
  u.trust_grade,
  st.tier             AS skc_tier,
  (e.skc_user_id IS NOT NULL) AS is_skillchain_member
FROM enrollments e
LEFT JOIN skc_users         u  ON u.id = e.skc_user_id
LEFT JOIN skc_student_tiers st ON st.student_id = e.skc_user_id
LEFT JOIN trainees          t  ON t.id = e.trainee_id;

COMMENT ON VIEW cesru_enrollment_people IS
  'ผู้เข้าอบรมของหน่วยวิจัย — ดึงชื่อจาก skc_users เมื่อผูกกันแล้ว ไม่งั้นใช้ trainees';

-- ── ใบรับรองที่หน่วยวิจัยออกให้ (เขียนลงตารางของ SkillChain) ──────
-- training_courses.grants_credential_level มีอยู่แล้วและใช้ค่า LEVEL_1..5
-- ชุดเดียวกับ enum CredentialLevel ของ SkillChain จึงส่งต่อได้ตรง ๆ
CREATE OR REPLACE VIEW cesru_issued_credentials AS
SELECT
  c.id                AS credential_id,
  c.student_id        AS skc_user_id,
  u.email,
  u.name              AS student_name,
  c.credential_level,
  c.certified_by,
  c.certificate_ref,
  c.specialization,
  c.issued_at,
  c.nft_tx_hash,
  c.is_active
FROM skc_student_credentials c
JOIN skc_users u ON u.id = c.student_id
WHERE c.certified_by = 'RMUTL_TEACHER';

COMMENT ON VIEW cesru_issued_credentials IS
  'ใบรับรองใน SkillChain ที่ออกโดยอาจารย์ มทร.ล้านนา — ใช้ certificate_ref เก็บ tracking_code ของหน่วยวิจัย';

GRANT SELECT ON cesru_enrollment_people, cesru_issued_credentials TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- ถอนออก:
--   DROP VIEW IF EXISTS cesru_issued_credentials;
--   DROP VIEW IF EXISTS cesru_enrollment_people;
--   ALTER TABLE enrollments DROP COLUMN IF EXISTS skc_user_id;
-- ═══════════════════════════════════════════════════════════════════
