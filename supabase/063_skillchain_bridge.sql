-- ═══════════════════════════════════════════════════════════════════
-- 063_skillchain_bridge.sql
-- สะพานอ่านข้อมูลระหว่างหน่วยวิจัย (CESRU) กับ SkillChain
--
-- ทั้งสองระบบใช้ Supabase project เดียวกัน (vkiofmhddlzffgzstoml) และอยู่
-- schema public เหมือนกัน โดย SkillChain ใช้ prefix skc_ ผ่าน Prisma @@map
-- จึงไม่ต้องทำ API หรือ sync job ใด ๆ — เชื่อมด้วย view ได้เลย
--
-- ไฟล์นี้ "อ่านอย่างเดียว" ไม่แก้ไม่ลบข้อมูลของระบบไหนทั้งสิ้น
-- รันแล้วถอนได้ด้วย DROP VIEW สามบรรทัดท้ายไฟล์
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. ภาพรวม SkillChain สำหรับแสดงบนหน้าบริการวิชาการของหน่วยวิจัย ──
CREATE OR REPLACE VIEW cesru_skillchain_summary AS
SELECT
  (SELECT count(*) FROM skc_users WHERE role = 'student'  AND is_active) AS students,
  (SELECT count(*) FROM skc_users WHERE role = 'employer' AND is_active) AS employers,
  (SELECT count(*) FROM skc_users WHERE role = 'teacher'  AND is_active) AS teachers,
  (SELECT count(*) FROM skc_jobs)                                        AS jobs_total,
  (SELECT count(*) FROM skc_jobs WHERE status = 'completed')             AS jobs_completed,
  (SELECT coalesce(sum(pay_amount), 0) FROM skc_jobs)                    AS jobs_value_thb,
  (SELECT count(*) FROM skc_student_credentials)                         AS credentials_issued;

COMMENT ON VIEW cesru_skillchain_summary IS
  'ตัวเลขสรุปจาก SkillChain สำหรับแสดงบนหน้า /services ของหน่วยวิจัย — อ่านอย่างเดียว';

-- ── 2. จับคู่คนข้ามสองระบบด้วยอีเมล ──────────────────────────────
-- ใช้ดูว่านักวิจัย/ผู้เข้าอบรมของหน่วยวิจัยคนไหนมีตัวตนใน SkillChain แล้ว
CREATE OR REPLACE VIEW cesru_skillchain_people AS
SELECT
  u.id            AS skc_user_id,
  u.email,
  u.name          AS skc_name,
  u.role          AS skc_role,
  u.campus,
  u.faculty,
  u.year_level,
  u.trust_grade,
  u.trust_score,
  t.tier          AS skc_tier,
  t.training_jobs_completed,
  r.id            AS researcher_id,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS researcher_name_th,
  r.unit_role
FROM skc_users u
LEFT JOIN skc_student_tiers t ON t.student_id = u.id
LEFT JOIN researchers r       ON lower(r.email) = lower(u.email)
WHERE u.is_active;

COMMENT ON VIEW cesru_skillchain_people IS
  'คนใน SkillChain พร้อมชี้ว่าตรงกับนักวิจัยของหน่วยวิจัยคนไหน (จับคู่ด้วยอีเมล)';

-- ── 3. งานใน SkillChain ที่นักวิจัยของหน่วยวิจัยเกี่ยวข้องด้วย ──
-- ครอบคลุมทั้งกรณีเป็นผู้ว่าจ้าง (employer) และเป็นพี่เลี้ยง (mentor)
CREATE OR REPLACE VIEW cesru_skillchain_jobs AS
SELECT
  j.id,
  j.title,
  j.job_category,
  j.status,
  j.campus,
  j.pay_amount,
  j.required_workers,
  j.work_start_date,
  j.work_end_date,
  emp.email  AS employer_email,
  emp.name   AS employer_name,
  men.email  AS mentor_email,
  men.name   AS mentor_name,
  (re.id IS NOT NULL OR rm.id IS NOT NULL) AS involves_cesru_researcher
FROM skc_jobs j
LEFT JOIN skc_users emp ON emp.id = j.employer_id
LEFT JOIN skc_users men ON men.id = j.mentor_id
LEFT JOIN researchers re ON lower(re.email) = lower(emp.email)
LEFT JOIN researchers rm ON lower(rm.email) = lower(men.email);

COMMENT ON VIEW cesru_skillchain_jobs IS
  'งานใน SkillChain พร้อมธงว่ามีนักวิจัยของหน่วยวิจัยเป็นผู้ว่าจ้างหรือพี่เลี้ยงหรือไม่';

GRANT SELECT ON cesru_skillchain_summary, cesru_skillchain_people, cesru_skillchain_jobs TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- ถอนออก:
--   DROP VIEW IF EXISTS cesru_skillchain_jobs;
--   DROP VIEW IF EXISTS cesru_skillchain_people;
--   DROP VIEW IF EXISTS cesru_skillchain_summary;
-- ═══════════════════════════════════════════════════════════════════
