-- ============================================================
-- 027: Grant Tracking System
-- ระบบติดตามทุนวิจัย: Milestones, Deliverables, Progress, S-Curve
-- ============================================================

-- 1) Grant Milestones — จุดตรวจสอบหลัก (เช่น ส่งรายงานรอบ 6 เดือน)
CREATE TABLE IF NOT EXISTS grant_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT NOT NULL DEFAULT 'deliverable',  -- deliverable, report, presentation, review, other
  planned_date DATE NOT NULL,
  actual_date DATE,
  planned_weight DECIMAL(5,2) DEFAULT 0,   -- % น้ำหนักของ milestone นี้ (สำหรับ S-Curve)
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, in_progress, completed, delayed, cancelled
  completion_pct DECIMAL(5,2) DEFAULT 0,   -- % ที่ทำเสร็จ 0-100
  notes TEXT,
  evidence_url TEXT,                       -- ไฟล์หลักฐาน
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_grant ON grant_milestones(grant_id);
CREATE INDEX idx_milestones_status ON grant_milestones(status);
CREATE INDEX idx_milestones_planned ON grant_milestones(planned_date);

-- 2) Grant Deliverables — สิ่งส่งมอบย่อย ภายใต้ Milestone
CREATE TABLE IF NOT EXISTS grant_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES grant_milestones(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT DEFAULT 'document',  -- document, prototype, software, dataset, paper, patent, other
  planned_date DATE,
  actual_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',    -- pending, in_progress, completed, delayed
  file_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliverables_milestone ON grant_deliverables(milestone_id);
CREATE INDEX idx_deliverables_grant ON grant_deliverables(grant_id);

-- 3) Grant Progress Log — บันทึกความก้าวหน้ารายเดือน (สำหรับ S-Curve actual)
CREATE TABLE IF NOT EXISTS grant_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  planned_pct DECIMAL(5,2) DEFAULT 0,    -- % แผนสะสม ณ วันนั้น
  actual_pct DECIMAL(5,2) DEFAULT 0,     -- % จริงสะสม ณ วันนั้น
  budget_spent DECIMAL(15,2) DEFAULT 0,  -- เงินที่ใช้ไปแล้ว
  summary TEXT,                          -- สรุปสิ่งที่ทำ
  issues TEXT,                           -- ปัญหาอุปสรรค
  logged_by TEXT,                        -- ผู้บันทึก
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grant_id, log_date)
);

CREATE INDEX idx_progress_grant ON grant_progress_logs(grant_id, log_date);

-- 4) Grant Alerts / Notifications
CREATE TABLE IF NOT EXISTS grant_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES grant_milestones(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'info',  -- info, warning, danger, success
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  auto_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_grant ON grant_alerts(grant_id);
CREATE INDEX idx_alerts_unread ON grant_alerts(is_read) WHERE NOT is_read;

-- 5) View: Grant overview with tracking stats
CREATE OR REPLACE VIEW v_grant_tracking AS
SELECT
  g.id,
  g.title_th,
  g.title_en,
  g.funding_agency,
  g.budget,
  g.start_date,
  g.end_date,
  g.status,
  g.fiscal_year,
  g.contract_number,
  COALESCE(ms.total_milestones, 0) AS total_milestones,
  COALESCE(ms.completed_milestones, 0) AS completed_milestones,
  COALESCE(ms.delayed_milestones, 0) AS delayed_milestones,
  COALESCE(ms.avg_completion, 0) AS avg_completion_pct,
  COALESCE(dl.total_deliverables, 0) AS total_deliverables,
  COALESCE(dl.completed_deliverables, 0) AS completed_deliverables,
  COALESCE(al.unread_alerts, 0) AS unread_alerts,
  latest_log.actual_pct AS latest_actual_pct,
  latest_log.planned_pct AS latest_planned_pct,
  latest_log.log_date AS latest_log_date,
  CASE
    WHEN g.status = 'completed' THEN 'completed'
    WHEN g.start_date IS NULL OR g.end_date IS NULL THEN 'unknown'
    WHEN COALESCE(latest_log.actual_pct, 0) >= COALESCE(latest_log.planned_pct, 0) THEN 'on_track'
    WHEN COALESCE(latest_log.planned_pct, 0) - COALESCE(latest_log.actual_pct, 0) > 20 THEN 'critical'
    WHEN COALESCE(latest_log.planned_pct, 0) - COALESCE(latest_log.actual_pct, 0) > 10 THEN 'delayed'
    ELSE 'slight_delay'
  END AS tracking_status
FROM grants g
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_milestones,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_milestones,
    COUNT(*) FILTER (WHERE status = 'delayed') AS delayed_milestones,
    AVG(completion_pct) AS avg_completion
  FROM grant_milestones WHERE grant_id = g.id
) ms ON TRUE
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_deliverables,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_deliverables
  FROM grant_deliverables WHERE grant_id = g.id
) dl ON TRUE
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS unread_alerts
  FROM grant_alerts WHERE grant_id = g.id AND NOT is_read
) al ON TRUE
LEFT JOIN LATERAL (
  SELECT actual_pct, planned_pct, log_date
  FROM grant_progress_logs WHERE grant_id = g.id
  ORDER BY log_date DESC LIMIT 1
) latest_log ON TRUE;

-- 6) RLS — Public read, admin write
ALTER TABLE grant_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read milestones" ON grant_milestones FOR SELECT USING (true);
CREATE POLICY "Public read deliverables" ON grant_deliverables FOR SELECT USING (true);
CREATE POLICY "Public read progress" ON grant_progress_logs FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON grant_alerts FOR SELECT USING (true);

-- Anon can insert/update (ใช้ร่วมกับ API auth)
CREATE POLICY "Anon manage milestones" ON grant_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage deliverables" ON grant_deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage progress" ON grant_progress_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage alerts" ON grant_alerts FOR ALL USING (true) WITH CHECK (true);

-- Done!
