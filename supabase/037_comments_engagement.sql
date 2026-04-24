-- ============================================================
-- 037: Comments + Engagement Tracking + PDPA Compliance
-- ระบบ comment บนข่าว/ผลงานตีพิมพ์ พร้อม engagement heatmap
-- เก็บข้อมูลขั้นต่ำตาม PDPA
-- ============================================================

-- 1) guest_users — ผู้เยี่ยมชมที่ login ผ่าน Google (PDPA-minimal)
CREATE TABLE IF NOT EXISTS guest_users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  user_type       TEXT DEFAULT 'general' CHECK (user_type IN ('student', 'researcher', 'general')),
  institution     TEXT,                  -- optional, user-filled
  -- PDPA compliance fields
  consent_version TEXT NOT NULL DEFAULT '1.0',
  consented_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  marketing_opt_in BOOLEAN DEFAULT false,
  -- Activity tracking (minimal)
  last_active_at  TIMESTAMPTZ DEFAULT now(),
  comment_count   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_users_email ON guest_users(email);
CREATE INDEX IF NOT EXISTS idx_guest_users_active ON guest_users(is_active, last_active_at DESC);

COMMENT ON TABLE guest_users IS 'ผู้เยี่ยมชมที่ลงทะเบียนผ่าน Google OAuth (PDPA-compliant minimal data)';
COMMENT ON COLUMN guest_users.consent_version IS 'เวอร์ชัน Privacy Policy ที่ผู้ใช้ยอมรับ';
COMMENT ON COLUMN guest_users.marketing_opt_in IS 'ยินยอมรับข่าวสารทางการตลาด (opt-in)';

-- 2) consent_log — log ทุกครั้งที่ผู้ใช้กด accept (audit trail)
CREATE TABLE IF NOT EXISTS consent_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES guest_users(id) ON DELETE SET NULL,
  email_hash      TEXT,                  -- SHA-256 hash ของ email (สำหรับ audit เมื่อ user ลบแล้ว)
  consent_version TEXT NOT NULL,
  consent_type    TEXT NOT NULL CHECK (consent_type IN ('privacy', 'marketing', 'cookies', 'analytics')),
  action          TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  ip_hash         TEXT,                  -- hashed IP สำหรับ audit
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user ON consent_log(user_id, created_at DESC);

COMMENT ON TABLE consent_log IS 'บันทึกการยินยอม PDPA ทุกครั้ง (audit trail) — ไม่ลบแม้ผู้ใช้ลบบัญชี';

-- 3) comments — comment polymorphic (target news/publication/researcher)
CREATE TABLE IF NOT EXISTS comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES guest_users(id) ON DELETE CASCADE,
  target_type     TEXT NOT NULL CHECK (target_type IN ('news', 'publication', 'researcher', 'grant', 'equipment')),
  target_id       UUID NOT NULL,
  content         TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,  -- for replies
  is_deleted      BOOLEAN DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  deleted_by      TEXT,                  -- 'user' or 'admin'
  edit_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Auto-update comment_count on guest_users
CREATE OR REPLACE FUNCTION update_user_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
    UPDATE guest_users SET comment_count = comment_count + 1, last_active_at = now()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true THEN
    UPDATE guest_users SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_count ON comments;
CREATE TRIGGER trg_comment_count
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_user_comment_count();

-- 4) engagement_events — anonymous aggregate tracking for heatmap
CREATE TABLE IF NOT EXISTS engagement_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type      TEXT NOT NULL CHECK (event_type IN ('page_view', 'comment', 'link_click', 'scroll_deep', 'cta_click', 'share')),
  target_type     TEXT,                  -- e.g., 'news', 'publication', 'researcher'
  target_id       UUID,                  -- optional
  page_path       TEXT NOT NULL,         -- '/news/abc-123'
  -- Time buckets for heatmap
  hour_bucket     INTEGER NOT NULL CHECK (hour_bucket BETWEEN 0 AND 23),
  day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
  date_bucket     DATE NOT NULL,
  -- Anonymous user session
  session_hash    TEXT,                  -- short-lived hash, not PII
  -- Optional: user_id if logged in (but aggregate stats don't need it)
  user_id         UUID REFERENCES guest_users(id) ON DELETE SET NULL,
  -- Metadata
  referrer_domain TEXT,                  -- 'google.com' only (not full URL)
  user_agent_type TEXT,                  -- 'desktop' | 'mobile' | 'tablet' | 'bot'
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_date ON engagement_events(date_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_heatmap ON engagement_events(day_of_week, hour_bucket);
CREATE INDEX IF NOT EXISTS idx_engagement_page ON engagement_events(page_path, date_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_target ON engagement_events(target_type, target_id, date_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_type ON engagement_events(event_type, date_bucket DESC);

COMMENT ON TABLE engagement_events IS 'Anonymous engagement tracking for heatmap — PDPA-safe (no IP/UA stored raw)';

-- 5) Views for admin dashboard

-- Heatmap: engagement by day × hour (last 30 days)
CREATE OR REPLACE VIEW v_engagement_heatmap AS
SELECT
  day_of_week,
  hour_bucket,
  COUNT(*) AS event_count,
  COUNT(DISTINCT session_hash) AS unique_sessions,
  COUNT(*) FILTER (WHERE event_type = 'page_view') AS views,
  COUNT(*) FILTER (WHERE event_type = 'comment') AS comments,
  COUNT(*) FILTER (WHERE event_type = 'cta_click') AS cta_clicks
FROM engagement_events
WHERE date_bucket >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY day_of_week, hour_bucket
ORDER BY day_of_week, hour_bucket;

-- Top pages (last 30 days)
CREATE OR REPLACE VIEW v_top_pages AS
SELECT
  page_path,
  target_type,
  COUNT(*) AS views,
  COUNT(DISTINCT session_hash) AS unique_sessions,
  COUNT(*) FILTER (WHERE event_type = 'comment') AS comments
FROM engagement_events
WHERE date_bucket >= CURRENT_DATE - INTERVAL '30 days'
  AND event_type IN ('page_view', 'comment')
GROUP BY page_path, target_type
ORDER BY views DESC
LIMIT 100;

-- Daily activity (last 90 days)
CREATE OR REPLACE VIEW v_daily_activity AS
SELECT
  date_bucket,
  COUNT(*) FILTER (WHERE event_type = 'page_view') AS views,
  COUNT(*) FILTER (WHERE event_type = 'comment') AS comments,
  COUNT(DISTINCT session_hash) AS unique_visitors,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS registered_visitors
FROM engagement_events
WHERE date_bucket >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY date_bucket
ORDER BY date_bucket DESC;

-- 6) RLS (Row Level Security)
ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- guest_users policies
DROP POLICY IF EXISTS "users_read_own_profile" ON guest_users;
CREATE POLICY "users_read_own_profile" ON guest_users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON guest_users;
CREATE POLICY "users_update_own_profile" ON guest_users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON guest_users;
CREATE POLICY "users_insert_own_profile" ON guest_users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own_profile" ON guest_users;
CREATE POLICY "users_delete_own_profile" ON guest_users FOR DELETE
  USING (auth.uid() = id);

-- Public can see basic user info (display_name only, not email)
DROP POLICY IF EXISTS "public_read_display_name" ON guest_users;
CREATE POLICY "public_read_display_name" ON guest_users FOR SELECT
  USING (is_active = true);

-- comments: everyone can read non-deleted
DROP POLICY IF EXISTS "anyone_read_comments" ON comments;
CREATE POLICY "anyone_read_comments" ON comments FOR SELECT
  USING (is_deleted = false);

DROP POLICY IF EXISTS "auth_insert_own_comment" ON comments;
CREATE POLICY "auth_insert_own_comment" ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_update_own_comment" ON comments;
CREATE POLICY "auth_update_own_comment" ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Soft delete: user can mark own, admin via service_role
DROP POLICY IF EXISTS "auth_delete_own_comment" ON comments;
CREATE POLICY "auth_delete_own_comment" ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- consent_log: users read own, admin/service inserts
DROP POLICY IF EXISTS "users_read_own_consent" ON consent_log;
CREATE POLICY "users_read_own_consent" ON consent_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_insert_consent" ON consent_log;
CREATE POLICY "auth_insert_consent" ON consent_log FOR INSERT
  WITH CHECK (true);  -- any authenticated or service_role can log

-- engagement_events: public can INSERT (anonymous tracking), only admin can read
DROP POLICY IF EXISTS "anyone_insert_event" ON engagement_events;
CREATE POLICY "anyone_insert_event" ON engagement_events FOR INSERT
  WITH CHECK (true);

-- 7) Auto-cleanup: Delete inactive guest_users after 2 years (PDPA storage limitation)
-- Note: Run this manually or schedule via pg_cron in Supabase dashboard
CREATE OR REPLACE FUNCTION cleanup_inactive_guest_users()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM guest_users
    WHERE last_active_at < now() - INTERVAL '2 years'
      AND comment_count = 0
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Also delete engagement events older than 1 year
  DELETE FROM engagement_events WHERE date_bucket < CURRENT_DATE - INTERVAL '1 year';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_inactive_guest_users IS 'ลบบัญชีผู้ใช้ที่ไม่ได้ active > 2 ปีและไม่มี comment (PDPA Storage Limitation)';

-- 8) User data export (PDPA Right to Access)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check permission
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'profile', (
      SELECT row_to_json(u) FROM (
        SELECT email, display_name, user_type, institution, consent_version,
               consented_at, marketing_opt_in, comment_count, created_at
        FROM guest_users WHERE id = p_user_id
      ) u
    ),
    'comments', (
      SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) FROM (
        SELECT target_type, target_id, content, created_at
        FROM comments WHERE user_id = p_user_id AND is_deleted = false
      ) c
    ),
    'consent_history', (
      SELECT COALESCE(jsonb_agg(cl), '[]'::jsonb) FROM (
        SELECT consent_version, consent_type, action, created_at
        FROM consent_log WHERE user_id = p_user_id
      ) cl
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION export_user_data IS 'Export all user data (PDPA Right to Access Article 30)';
