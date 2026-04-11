-- ============================================================
-- 025: Training & Service Platform with Blockchain + NFT
-- ระบบฝึกอบรม/ที่ปรึกษา แบบ SkillChain Pattern
-- CESRU — หน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา
-- ============================================================

-- ============================================================
-- 1. หลักสูตรอบรม (Training Courses)
-- ============================================================
CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,                     -- "SOLAR-PV-L2", "EV-CHARGE-101"
  title_th TEXT NOT NULL,
  title_en TEXT,
  description_th TEXT,
  description_en TEXT,

  -- ประเภท
  category TEXT DEFAULT 'workshop',     -- workshop, seminar, hands_on, online, certification
  skill_domain TEXT,                    -- solar_pv, ev_charger, energy_audit, battery, microgrid

  -- ระดับ/ข้อกำหนด
  level TEXT DEFAULT 'beginner',        -- beginner, intermediate, advanced, professional
  prerequisite_course_id UUID REFERENCES training_courses(id),
  grants_credential_level TEXT,         -- LEVEL_2, LEVEL_3 ที่ได้หลังผ่าน

  -- รายละเอียด
  duration_hours INT,                   -- ชั่วโมงรวม
  duration_days INT,                    -- จำนวนวัน
  max_participants INT DEFAULT 30,

  -- ค่าใช้จ่าย
  fee_internal DECIMAL(10,2) DEFAULT 0, -- บุคลากรภายใน
  fee_student DECIMAL(10,2) DEFAULT 0,  -- นักศึกษา
  fee_external DECIMAL(10,2) DEFAULT 0, -- บุคคลทั่วไป

  -- ผู้สอน
  instructor_id UUID REFERENCES researchers(id),
  instructor_name TEXT,                 -- กรณีวิทยากรภายนอก

  -- สื่อ
  image_url TEXT,
  syllabus_url TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. โมดูลในหลักสูตร (Course Modules)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
  module_number INT NOT NULL,           -- ลำดับโมดูล 1, 2, 3...
  title_th TEXT NOT NULL,
  title_en TEXT,
  description_th TEXT,
  duration_hours DECIMAL(4,1),
  module_type TEXT DEFAULT 'lecture',    -- lecture, lab, practice, exam
  passing_score DECIMAL(5,2) DEFAULT 60,-- คะแนนผ่าน
  max_score DECIMAL(5,2) DEFAULT 100,
  weight_pct DECIMAL(5,2) DEFAULT 0,    -- น้ำหนักคะแนน %
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, module_number)
);

-- ============================================================
-- 3. รุ่นการอบรม (Training Batches/Sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
  session_code TEXT,                    -- "SOLAR-PV-L2-R5" (รุ่นที่ 5)
  batch_number INT,                     -- รุ่นที่

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT DEFAULT 'มทร.ล้านนา',
  room TEXT,

  max_participants INT DEFAULT 30,
  min_participants INT DEFAULT 5,

  registration_open DATE,
  registration_close DATE,

  status TEXT DEFAULT 'planned',        -- planned, open, closed, in_progress, completed, cancelled

  -- Blockchain
  create_tx TEXT,                       -- tx hash สร้างรุ่น
  complete_tx TEXT,                     -- tx hash เสร็จสิ้น

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. ผู้เข้าอบรม (Trainees)
-- ============================================================
CREATE TABLE IF NOT EXISTS trainees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ข้อมูลส่วนตัว
  title_th TEXT,
  first_name_th TEXT NOT NULL,
  last_name_th TEXT NOT NULL,
  first_name_en TEXT,
  last_name_en TEXT,

  -- สถานะ
  trainee_type TEXT DEFAULT 'public',   -- student, staff, public, organization
  organization TEXT,                    -- สังกัด/บริษัท
  student_id TEXT,                      -- รหัสนักศึกษา (ถ้ามี)

  email TEXT,
  phone TEXT,
  avatar_url TEXT,

  -- Blockchain wallet
  wallet_address TEXT,
  wallet_private_key TEXT,              -- encrypted AES-256-GCM

  -- Credential
  credential_level TEXT DEFAULT 'LEVEL_1', -- LEVEL_1 to LEVEL_5

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. การลงทะเบียน (Enrollments)
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES trainees(id),

  enrollment_date TIMESTAMPTZ DEFAULT now(),
  tracking_code TEXT UNIQUE,            -- "ENR-2568-XXXXX" สำหรับติดตาม

  -- ค่าอบรม
  fee_type TEXT DEFAULT 'external',     -- internal, student, external
  fee_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',-- pending, paid, waived, refunded
  payment_method TEXT,                  -- transfer, cash, rl_token, qr
  payment_tx TEXT,                      -- blockchain tx hash (ถ้าจ่ายด้วย RLToken)
  payment_date TIMESTAMPTZ,
  receipt_number TEXT,

  -- สถานะ
  status TEXT DEFAULT 'registered',     -- registered, confirmed, attending, completed, failed, cancelled

  -- ผลรวม
  total_score DECIMAL(5,2),
  passed BOOLEAN,
  certificate_number TEXT,              -- "CESRU-CERT-2568-001"
  certificate_url TEXT,                 -- PDF cert

  -- NFT Certificate
  nft_tx_hash TEXT,                     -- tx hash ของ NFT บน TRON
  nft_token_id TEXT,
  nft_metadata_url TEXT,

  -- Blockchain
  enroll_tx TEXT,
  complete_tx TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, trainee_id)
);

-- ============================================================
-- 6. คะแนนรายโมดูล (Module Scores)
-- ============================================================
CREATE TABLE IF NOT EXISTS module_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id),

  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100,
  passed BOOLEAN,

  evaluated_by UUID REFERENCES researchers(id), -- ผู้ประเมิน
  evaluated_at TIMESTAMPTZ DEFAULT now(),

  -- Blockchain
  eval_tx TEXT,                         -- tx hash บันทึกการประเมิน
  content_hash TEXT,                    -- SHA-256 hash ของผลประเมิน

  feedback TEXT,
  UNIQUE(enrollment_id, module_id)
);

-- ============================================================
-- 7. Credential Levels (ระดับใบรับรอง — แบบ SkillChain)
-- ============================================================
CREATE TABLE IF NOT EXISTS credential_levels (
  level TEXT PRIMARY KEY,               -- LEVEL_1 to LEVEL_5
  level_num INT UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_th TEXT,
  nft_tier TEXT,                        -- none, bronze, silver, gold, diamond
  min_courses INT DEFAULT 0,            -- จำนวนหลักสูตรขั้นต่ำ
  min_avg_score DECIMAL(5,2),           -- คะแนนเฉลี่ยขั้นต่ำ
  icon TEXT
);

INSERT INTO credential_levels (level, level_num, name_th, name_en, description_th, nft_tier, min_courses, min_avg_score, icon) VALUES
  ('LEVEL_1', 1, 'ลงทะเบียน', 'Registered', 'ลงทะเบียนเข้าระบบ', 'none', 0, 0, '📋'),
  ('LEVEL_2', 2, 'ผ่านอบรมพื้นฐาน', 'Basic Certified', 'ผ่านหลักสูตรอบรมระดับพื้นฐาน', 'bronze', 1, 60, '🥉'),
  ('LEVEL_3', 3, 'ผ่านอบรมเฉพาะทาง', 'Specialist Certified', 'ผ่านหลักสูตรเฉพาะทาง + อาจารย์รับรอง', 'silver', 2, 70, '🥈'),
  ('LEVEL_4', 4, 'คุณวุฒิวิชาชีพ', 'Professional Qualified', 'ผ่านการทดสอบคุณวุฒิวิชาชีพระดับชาติ (TPQI)', 'gold', 3, 80, '🥇'),
  ('LEVEL_5', 5, 'ผู้เชี่ยวชาญ', 'Expert Technician', 'ช่างชำนาญการ ประสบการณ์ ≥2 ปี + สอนผู้อื่นได้', 'diamond', 5, 85, '💎')
ON CONFLICT (level) DO NOTHING;

-- ============================================================
-- 8. ประวัติ Credential (Credential History)
-- ============================================================
CREATE TABLE IF NOT EXISTS trainee_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id),
  credential_level TEXT REFERENCES credential_levels(level),

  certified_by TEXT,                    -- 'system', 'instructor', 'tpqi', 'expert'
  certified_by_researcher_id UUID REFERENCES researchers(id),

  certificate_ref TEXT,                 -- เลขใบรับรอง
  specialization TEXT,                  -- "Solar PV - Level 2"

  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,

  -- NFT
  nft_tx_hash TEXT,
  nft_token_id TEXT,
  nft_metadata JSONB,                   -- { name, description, image, attributes }

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. Service Requests (คำขอบริการ — แบบ SkillChain Job)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT UNIQUE,            -- "SR-2568-XXXXX"

  -- ผู้ขอ
  requester_name TEXT NOT NULL,
  requester_org TEXT,
  requester_email TEXT,
  requester_phone TEXT,

  -- รายละเอียด
  service_type TEXT NOT NULL,           -- training, consulting, design_install, inspection
  title TEXT NOT NULL,
  description TEXT,

  -- กรณีอบรม
  preferred_course_id UUID REFERENCES training_courses(id),
  num_participants INT,
  preferred_date_start DATE,
  preferred_date_end DATE,

  -- กรณีที่ปรึกษา/ออกแบบ/ตรวจสอบ
  estimated_budget DECIMAL(12,2),
  location TEXT,

  -- Lifecycle (แบบ SkillChain)
  status TEXT DEFAULT 'submitted',
  -- submitted → reviewing → approved → assigned → in_progress → completed → settled → closed
  -- หรือ → rejected / cancelled

  assigned_researcher_id UUID REFERENCES researchers(id),
  approved_by TEXT,
  approved_date TIMESTAMPTZ,

  -- ผลงาน
  satisfaction_score DECIMAL(3,2),
  feedback TEXT,

  -- เอกสาร
  proposal_url TEXT,
  contract_url TEXT,
  report_url TEXT,

  -- การเงิน (ตามระเบียบ ข้อ 15)
  contract_amount DECIMAL(12,2),
  facility_usage TEXT DEFAULT 'both',   -- both, partial, none

  -- Blockchain
  create_tx TEXT,
  approve_tx TEXT,
  assign_tx TEXT,
  complete_tx TEXT,
  revenue_tx TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. Service Request Timeline (Log ทุก event)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,             -- status_change, document_upload, comment, payment, evaluation
  old_value TEXT,
  new_value TEXT,
  description TEXT,

  performed_by TEXT,                    -- ชื่อผู้ทำ
  researcher_id UUID REFERENCES researchers(id),

  -- Blockchain
  tx_hash TEXT,
  doc_hash TEXT,                        -- SHA-256 ของเอกสาร

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Views
-- ============================================================

CREATE OR REPLACE VIEW v_course_summary AS
SELECT
  tc.id, tc.code, tc.title_th, tc.title_en, tc.description_th,
  tc.category, tc.skill_domain, tc.level, tc.grants_credential_level,
  tc.duration_hours, tc.duration_days, tc.max_participants,
  tc.fee_internal, tc.fee_student, tc.fee_external,
  tc.is_active, tc.created_at,
  COUNT(DISTINCT ts.id) AS total_sessions,
  COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'open') AS open_sessions,
  COUNT(DISTINCT e.id) AS total_enrollments,
  COUNT(DISTINCT e.id) FILTER (WHERE e.passed = true) AS passed_count,
  r.title_th || r.first_name_th || ' ' || r.last_name_th AS instructor_fullname
FROM training_courses tc
LEFT JOIN training_sessions ts ON ts.course_id = tc.id
LEFT JOIN enrollments e ON e.session_id = ts.id
LEFT JOIN researchers r ON r.id = tc.instructor_id
WHERE tc.is_active = true
GROUP BY tc.id, tc.code, tc.title_th, tc.title_en, tc.description_th,
  tc.category, tc.skill_domain, tc.level, tc.grants_credential_level,
  tc.duration_hours, tc.duration_days, tc.max_participants,
  tc.fee_internal, tc.fee_student, tc.fee_external,
  tc.is_active, tc.created_at,
  r.title_th, r.first_name_th, r.last_name_th;

CREATE OR REPLACE VIEW v_session_enrollment AS
SELECT
  ts.id, ts.course_id, ts.session_code, ts.batch_number,
  ts.start_date, ts.end_date, ts.location, ts.room,
  ts.max_participants, ts.min_participants,
  ts.registration_open, ts.registration_close,
  ts.status, ts.notes, ts.created_at,
  tc.title_th AS course_title, tc.code AS course_code,
  tc.fee_external, tc.fee_student, tc.fee_internal,
  COUNT(e.id) AS enrolled_count,
  COUNT(e.id) FILTER (WHERE e.status IN ('confirmed', 'attending')) AS confirmed_count
FROM training_sessions ts
JOIN training_courses tc ON tc.id = ts.course_id
LEFT JOIN enrollments e ON e.session_id = ts.id
GROUP BY ts.id, ts.course_id, ts.session_code, ts.batch_number,
  ts.start_date, ts.end_date, ts.location, ts.room,
  ts.max_participants, ts.min_participants,
  ts.registration_open, ts.registration_close,
  ts.status, ts.notes, ts.created_at,
  tc.title_th, tc.code, tc.fee_external, tc.fee_student, tc.fee_internal;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_course ON training_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_session ON enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_trainee ON enrollments(trainee_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tracking ON enrollments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_scores_enrollment ON module_scores(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_credentials_trainee ON trainee_credentials(trainee_id);
CREATE INDEX IF NOT EXISTS idx_requests_tracking ON service_requests(tracking_code);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_timeline_request ON service_timeline(request_id);

-- ============================================================
-- Sample Training Courses (จาก academic_services ที่มีอยู่)
-- ============================================================

INSERT INTO training_courses (code, title_th, title_en, category, skill_domain, level, duration_hours, duration_days, fee_external, grants_credential_level, description_th) VALUES
('SOLAR-PV-L2',
 'การติดตั้ง ซ่อม บำรุงรักษาระบบเซลล์แสงอาทิตย์ (คุณวุฒิวิชาชีพ ระดับ 2)',
 'Solar PV Installation, Repair & Maintenance (Professional Qualification Level 2)',
 'certification', 'solar_pv', 'beginner', 30, 5, 3500, 'LEVEL_2',
 'หลักสูตรอบรมการติดตั้ง ซ่อม และบำรุงรักษาระบบเซลล์แสงอาทิตย์ ตามมาตรฐานคุณวุฒิวิชาชีพ ระดับ 2'),

('SOLAR-PV-L3',
 'การติดตั้ง ซ่อม บำรุงรักษาระบบเซลล์แสงอาทิตย์ (คุณวุฒิวิชาชีพ ระดับ 3)',
 'Solar PV Installation, Repair & Maintenance (Professional Qualification Level 3)',
 'certification', 'solar_pv', 'intermediate', 30, 5, 4500, 'LEVEL_3',
 'หลักสูตรอบรมระดับ 3 ต้องผ่านระดับ 2 ก่อน — ออกแบบระบบ PV, ติดตั้งขนาดใหญ่, การ commissioning'),

('SOLAR-DESIGN',
 'การออกแบบระบบโซล่าเซลล์ และ PV SYST',
 'Solar System Design & PV SYST Software',
 'workshop', 'solar_pv', 'intermediate', 12, 2, 2500, NULL,
 'อบรมการออกแบบระบบโซล่าเซลล์ และการใช้โปรแกรม PV SYST สำหรับวิศวกรและนักศึกษา'),

('SOLAR-PUMP',
 'ระบบสูบน้ำพลังงานแสงอาทิตย์',
 'Solar Pumping System',
 'hands_on', 'solar_pv', 'beginner', 6, 1, 1500, NULL,
 'อบรมระบบสูบน้ำพลังงานแสงอาทิตย์ สาธิตระบบโซล่าเซลล์ชุดนอนนา'),

('SOLAR-ROOFTOP',
 'ติดตั้งแผงโซล่าเซลล์บนหลังคา',
 'Solar Rooftop Installation',
 'hands_on', 'solar_pv', 'beginner', 12, 2, 2000, 'LEVEL_2',
 'อบรมเชิงปฏิบัติการการติดตั้งแผงโซล่าเซลล์บนหลังคา ทั้งภาคทฤษฎีและปฏิบัติ'),

('EV-CHARGE-101',
 'เทคโนโลยีอัดประจุแบตเตอรี่สำหรับยานยนต์ไฟฟ้า (EV)',
 'Battery Charging Technologies for Electric Vehicles',
 'workshop', 'ev_charger', 'intermediate', 12, 2, 3000, NULL,
 'อบรมเทคโนโลยีอัดประจุแบตเตอรี่สำหรับยานยนต์ไฟฟ้า AC/DC Charger'),

('DC-CHARGER',
 'DC Charger Technology',
 'DC Fast Charger Technology',
 'workshop', 'ev_charger', 'advanced', 6, 1, 3500, NULL,
 'อบรมเทคโนโลยี DC Fast Charger สำหรับยานยนต์ไฟฟ้า'),

('SOLAR-BATTERY',
 'ระบบโซล่าเซลล์กับแบตเตอรี่',
 'Solar + Battery Energy Storage System',
 'hands_on', 'battery', 'intermediate', 12, 2, 2500, NULL,
 'อบรมการใช้งานระบบโซล่าเซลล์กับแบตเตอรี่ ระบบ Hybrid Inverter')

ON CONFLICT (code) DO NOTHING;

-- Sample modules for SOLAR-PV-L2
INSERT INTO course_modules (course_id, module_number, title_th, title_en, duration_hours, module_type, passing_score, weight_pct, sort_order)
SELECT tc.id, m.num, m.title_th, m.title_en, m.hours, m.mtype, m.pass, m.weight, m.num
FROM training_courses tc,
(VALUES
  (1, 'ความรู้พื้นฐานพลังงานแสงอาทิตย์', 'Solar Energy Fundamentals', 4, 'lecture', 60, 15),
  (2, 'อุปกรณ์ในระบบ PV', 'PV System Components', 4, 'lecture', 60, 15),
  (3, 'การออกแบบระบบเบื้องต้น', 'Basic System Design', 4, 'lecture', 60, 15),
  (4, 'ปฏิบัติการติดตั้ง', 'Installation Practice', 8, 'lab', 60, 25),
  (5, 'ความปลอดภัยและมาตรฐาน', 'Safety & Standards', 4, 'lecture', 60, 10),
  (6, 'การทดสอบและ Commissioning', 'Testing & Commissioning', 4, 'lab', 60, 10),
  (7, 'สอบข้อเขียนและปฏิบัติ', 'Written & Practical Exam', 2, 'exam', 60, 10)
) AS m(num, title_th, title_en, hours, mtype, pass, weight)
WHERE tc.code = 'SOLAR-PV-L2'
ON CONFLICT DO NOTHING;
