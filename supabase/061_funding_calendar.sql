-- ═══════════════════════════════════════════════════════════════════
-- 061_funding_calendar.sql
-- ปฏิทินการประกาศรับข้อเสนอโครงการ — แหล่งทุนภายนอก (ในประเทศ)
-- ═══════════════════════════════════════════════════════════════════
--
-- ต่างจาก grant_calls อย่างไร
-- ---------------------------
-- grant_calls  = รอบทุน "รอบจริง" ที่มีวันเปิด/ปิดเป็นวันที่ชัดเจน
--                ใช้ติดตามรอบที่กำลังเปิดอยู่ตอนนี้
-- funding_calendar (ตารางนี้)
--              = "รูปแบบที่เกิดซ้ำทุกปี" เก็บเป็น *เดือน* ไม่ใช่วันที่
--                ช่วงเวลาแต่ละแหล่งทุนค่อนข้างคงที่ในแต่ละปี
--                แต่ธีม/กรอบวิจัยเปลี่ยนไปทุกปี
--                ใช้สำหรับ "วางแผนล่วงหน้า" ว่าเดือนไหนควรเริ่มเตรียมอะไร
--
-- จุดประสงค์หลัก: ทุนที่ต้องร่วมมือหลายหน่วยงาน/ต่างประเทศ ต้องเริ่ม
-- หาพาร์ตเนอร์ก่อนเปิดรับหลายเดือน คอลัมน์ prep_lead_months ทำให้
-- คำนวณย้อนได้ว่า "เดือนนี้ควรเริ่มคุยกับใคร"
--
-- ที่มาข้อมูล: ปฏิทินการประกาศรับสมัครทุนวิจัยแหล่งทุนภายนอก (ในประเทศ)
-- ปี 2569 — มทร.ล้านนา / TIL อ้างอิงการเปิดรับปี พ.ศ. 2568 จาก nriis.go.th
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS funding_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- แหล่งทุน
  agency_code TEXT NOT NULL,            -- NRCT, PMUC, PMUA, PMUB, ARDA, TCELS, NVI, HSRI
  agency_name_th TEXT NOT NULL,
  agency_url TEXT,

  -- ช่วงเวลาที่เกิดซ้ำทุกปี (เก็บเป็นเลขเดือน 1-12 ไม่มีปี)
  -- ถ้า close_month < open_month แปลว่าคาบเกี่ยวข้ามปี เช่น ธ.ค.-มี.ค.
  open_month  SMALLINT NOT NULL CHECK (open_month BETWEEN 1 AND 12),
  close_month SMALLINT          CHECK (close_month BETWEEN 1 AND 12),

  -- ธีม/กรอบวิจัย — ส่วนนี้เปลี่ยนทุกปี ต้องอัปเดตเมื่อมีประกาศใหม่
  program_th TEXT NOT NULL,
  proposal_stage TEXT CHECK (proposal_stage IN ('concept','full','report','other')),

  -- ความร่วมมือ — หัวใจของการวางแผนล่วงหน้า
  collaboration TEXT CHECK (collaboration IN ('international','multi_agency','industry_cofund')),
  partner_note_th TEXT,                 -- ต้องมีพาร์ตเนอร์แบบไหน
  prep_lead_months SMALLINT DEFAULT 2,  -- ควรเริ่มเตรียมก่อนเปิดรับกี่เดือน

  note_th TEXT,

  -- ที่มา + ความเชื่อมั่นของข้อมูล
  source_year_be SMALLINT,              -- ปี พ.ศ. ที่สังเกตรอบนี้
  source_label TEXT,
  source_url TEXT,
  needs_review BOOLEAN DEFAULT false,   -- true = ถอดความจากภาพ ยังไม่ยืนยันกับต้นฉบับ

  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_calendar_open  ON funding_calendar(open_month) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_funding_calendar_collab ON funding_calendar(collaboration) WHERE is_active;

CREATE OR REPLACE FUNCTION touch_funding_calendar()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_funding_calendar ON funding_calendar;
CREATE TRIGGER trg_touch_funding_calendar
  BEFORE UPDATE ON funding_calendar
  FOR EACH ROW EXECUTE FUNCTION touch_funding_calendar();

-- RLS — อ่านได้ทุกคน เขียนได้เฉพาะผู้ล็อกอิน (ตามรูปแบบเดียวกับ grant_calls)
ALTER TABLE funding_calendar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funding_calendar_public_read" ON funding_calendar;
CREATE POLICY "funding_calendar_public_read" ON funding_calendar
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "funding_calendar_auth_write" ON funding_calendar;
CREATE POLICY "funding_calendar_auth_write" ON funding_calendar
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE funding_calendar IS
  'รูปแบบการเปิดรับข้อเสนอที่เกิดซ้ำทุกปี เก็บเป็นเดือน ไม่ใช่วันที่ — ใช้วางแผนล่วงหน้า ไม่ใช่รอบทุนจริง (ดู grant_calls)';
COMMENT ON COLUMN funding_calendar.prep_lead_months IS
  'ควรเริ่มเตรียมก่อนเดือนเปิดรับกี่เดือน — ทุนร่วมต่างประเทศควรตั้งไว้สูงเพราะต้องหาพาร์ตเนอร์';
COMMENT ON COLUMN funding_calendar.needs_review IS
  'true = ถอดความจากอินโฟกราฟิก ยังไม่ได้ยืนยันกับประกาศต้นฉบับ';
