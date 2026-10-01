-- ═══════════════════════════════════════════════════════════════════
-- 062_egat_gasifier_workplan.sql
-- แผนดำเนินงานโครงการ Wat Chan: Pine-to-Power Solution (กฟผ.)
-- สัญญาเลขที่ 69-B702000-11-IO.SS03B3008752
--
-- ที่มา: ไฟล์ "690708_ตารางแผนงานแผนเงินวิจัย_ภายนอก v.20250203.ods"
--        sheet "1_แผนงาน-เงิน_"  (ช่วงเดือนของแต่ละกิจกรรมอ่านจากสีพื้นในเซลล์)
--
-- M1 = กันยายน 2569 (วันเริ่มสัญญา 1 ก.ย. 2569) ถึง M12 = สิงหาคม 2570
--
-- หมายเหตุตัวเลขที่ไม่ตรงกันระหว่างเอกสาร (เก็บไว้ในช่อง notes ด้วย)
--   · ผลรวมงบสองหมวดในตารางแผนงาน = 4,972,317 บาท
--     แต่สัญญาระบุวงเงินผู้รับทุน    = 4,972,300 บาท  (ต่างกัน 17 บาท)
--   · ปันส่วนฝั่ง กฟผ. ตารางระบุ      = 27,683 บาท
--     สัญญาระบุต้นทุนวิจัยทางการเงิน  = 27,500 บาท    (ต่างกัน 183 บาท)
--   · งวดโอนเงินรวม 3,392,400 + 1,117,700 + 462,200 = 4,972,300 ตรงกับสัญญา
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  g_id UUID;
  wp_id UUID;
BEGIN
  SELECT id INTO g_id FROM grants
   WHERE contract_number = '69-B702000-11-IO.SS03B3008752';

  IF g_id IS NULL THEN
    RAISE EXCEPTION 'ไม่พบโครงการสัญญาเลขที่ 69-B702000-11-IO.SS03B3008752 ในตาราง grants';
  END IF;

  -- ล้างของเดิมของโครงการนี้ก่อน เพื่อให้รันซ้ำได้
  DELETE FROM grant_workplan_wp_calendar WHERE grant_id = g_id;
  DELETE FROM grant_workplan_milestones  WHERE grant_id = g_id;
  DELETE FROM grant_disbursement         WHERE grant_id = g_id;
  DELETE FROM grant_budget               WHERE grant_id = g_id;
  DELETE FROM grant_workplan_wp          WHERE grant_id = g_id;

  -- ── Work packages + ปฏิทิน WP × เดือน ───────────────────────────
  -- รูปแบบ: (wp_code, ชื่อกิจกรรม, ระยะ/น้ำหนักงาน, เดือนที่ทำ)

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP0','จัดทำสาระและเอกสารแผนการดำเนินงาน','เตรียมการ',0)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  VALUES (g_id, wp_id, 1, 'medium');

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP1','สำรวจพื้นที่ รพ.วัดจันทร์ และประเมินปริมาณชีวมวลใบสน','ระยะที่ 1: ศึกษา สำรวจ และออกแบบระบบ · น้ำหนักงาน 5%',1)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'medium' FROM unnest(ARRAY[1,2]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP2','วิเคราะห์คุณสมบัติเชื้อเพลิงใบสน (Proximate / Ultimate)','ระยะที่ 1: ศึกษา สำรวจ และออกแบบระบบ · น้ำหนักงาน 5%',2)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'medium' FROM unnest(ARRAY[1,2]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP3','ออกแบบระบบแก๊สซิฟิเคชันแบบไหลลง และระบบอัดเม็ดเชื้อเพลิง','ระยะที่ 1: ศึกษา สำรวจ และออกแบบระบบ · น้ำหนักงาน 10%',3)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'medium' FROM unnest(ARRAY[2,3]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP4','สร้างระบบอัดเม็ด/อัดแท่งชีวมวลใบสน (Pelletizing/Briquetting)','ระยะที่ 2: สร้างระบบต้นแบบ · น้ำหนักงาน 10%',4)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'high' FROM unnest(ARRAY[3,4,5]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP5','สร้างเตา Downdraft Gasifier ขนาด 30 kW พร้อมระบบทำความสะอาดแก๊ส','ระยะที่ 2: สร้างระบบต้นแบบ · น้ำหนักงาน 15%',5)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'high' FROM unnest(ARRAY[4,5,6]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP6','สร้างระบบผลิตไฟฟ้า (Generator Set) และระบบตรวจวัดแสดงผล','ระยะที่ 2: สร้างระบบต้นแบบ · น้ำหนักงาน 10%',6)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'high' FROM unnest(ARRAY[5,6,7]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP7','Commissioning ทดสอบและปรับแต่งระบบ ณ มทร.ล้านนา ดอยสะเก็ด','ระยะที่ 3: ทดสอบ ปรับปรุง และติดตั้งในพื้นที่จริง · น้ำหนักงาน 15%',7)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'high' FROM unnest(ARRAY[6,7,8]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP8','ติดตั้งและทดสอบเดินเครื่องในพื้นที่จริง รพ.วัดจันทร์','ระยะที่ 3: ทดสอบ ปรับปรุง และติดตั้งในพื้นที่จริง · น้ำหนักงาน 10%',8)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'high' FROM unnest(ARRAY[8,9,10]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP9','ประเมินประสิทธิภาพรวม: วิศวกรรม (LCOE, Net Electrical Efficiency)','ระยะที่ 4: ประเมินผล สรุป และเผยแพร่ · น้ำหนักงาน 10%',9)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'medium' FROM unnest(ARRAY[10,11]) m;

  INSERT INTO grant_workplan_wp (grant_id, wp_code, title, description, sort_order)
  VALUES (g_id,'WP10','จัดทำรายงานวิจัยฉบับสมบูรณ์ คู่มือการใช้งาน/บำรุงรักษา','ระยะที่ 4: ประเมินผล สรุป และเผยแพร่ · น้ำหนักงาน 10%',10)
  RETURNING id INTO wp_id;
  INSERT INTO grant_workplan_wp_calendar (grant_id, wp_id, month_no, load)
  SELECT g_id, wp_id, m, 'medium' FROM unnest(ARRAY[11,12]) m;

  -- ── Milestones (แถว "ส่งรายงานความก้าวหน้าและรายงานฉบับสมบูรณ์") ──
  INSERT INTO grant_workplan_milestones (grant_id, month_no, title, due_date) VALUES
    (g_id,  5, 'ส่งรายงานความก้าวหน้า งวดที่ 1',                   DATE '2027-01-31'),
    (g_id, 10, 'ส่งร่างรายงานวิจัยฉบับสมบูรณ์',                     DATE '2027-06-30'),
    (g_id, 12, 'ส่งรายงานวิจัยฉบับสมบูรณ์ ต้นแบบ และคู่มือ',        DATE '2027-08-31');

  -- ── งบประมาณรายหมวด ──────────────────────────────────────────────
  INSERT INTO grant_budget (grant_id, category_no, category_name, budget_agency_thb, budget_in_kind_thb, notes) VALUES
    (g_id, 1, '1. ค่าตอบแทนนักวิจัยและผู้ช่วยนักวิจัย', 1171800, 0, NULL),
    (g_id, 2, '2. ค่าใช้จ่ายในการดำเนินการวิจัย',        3800517, 0,
       'ผลรวมสองหมวดในตารางแผนงาน 4,972,317 บาท สูงกว่าวงเงินผู้รับทุนตามสัญญา 4,972,300 บาท อยู่ 17 บาท'),
    (g_id, 3, '3. ปันส่วนเงินเดือนและสวัสดิการ (ฝั่ง กฟผ.)', 0, 27683,
       'ตารางแผนงานระบุ 27,683 บาท สัญญาระบุต้นทุนวิจัยทางการเงินของผู้ให้ทุน 27,500 บาท');

  -- ── งวดการโอนเงิน ────────────────────────────────────────────────
  INSERT INTO grant_disbursement (grant_id, period_no, month_range, description, amount_agency_thb, conditions) VALUES
    (g_id, 1, 'M1',  'งวดที่ 1 — เมื่อลงนามสัญญา',                               3392400,
       'สัญญาเลขที่ 69-B702000-11-IO.SS03B3008752 ลงนาม 13 ส.ค. 2569'),
    (g_id, 2, 'M7',  'งวดที่ 2 — หลังส่งรายงานความก้าวหน้า',                     1117700,
       'ผูกกับ milestone เดือนที่ 5'),
    (g_id, 3, 'M12', 'งวดที่ 3 — หลังส่งรายงานฉบับสมบูรณ์ ต้นแบบ และคู่มือ',      462200,
       'ผูกกับ milestone เดือนที่ 12');

  RAISE NOTICE 'นำเข้าแผนงานโครงการ Wat Chan (กฟผ.) เรียบร้อย — grant_id %', g_id;
END $$;
