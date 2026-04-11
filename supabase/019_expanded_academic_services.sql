-- ============================================================
-- 019: Expanded Academic Services from CES Site Reference PDF
-- แหล่งข้อมูล: 2025 CES Site Referance.pdf (37 pages)
-- ============================================================

-- ลบข้อมูลเดิมที่มีน้อย แล้วใส่ข้อมูลครบตาม PDF
DELETE FROM service_members;
DELETE FROM academic_services;

-- ============================================================
-- 1. DESIGN & INSTALLATION — Solar Rooftop (12+ โครงการ)
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('Solar Rooftop 3.3 kW บ้านพักอาศัย เชียงใหม่', 'Solar Rooftop 3.3 kW Residential, Chiang Mai', 'design_install', '3.3 kW', 'On-Grid', 'เชียงใหม่', 'บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับบ้านพักอาศัย'),
('Solar Rooftop 3.3 kW บ้านพักอาศัย ลำพูน', 'Solar Rooftop 3.3 kW Residential, Lamphun', 'design_install', '3.3 kW', 'On-Grid', 'ลำพูน', 'บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับบ้านพักอาศัย'),
('Solar Rooftop 5 kW บ้านพักอาศัย เชียงใหม่', 'Solar Rooftop 5 kW Residential, Chiang Mai', 'design_install', '5 kW', 'On-Grid', 'เชียงใหม่', 'บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับบ้านพักอาศัย'),
('Solar Rooftop 6 kW บ้านพักอาศัย เชียงใหม่', 'Solar Rooftop 6 kW Residential, Chiang Mai', 'design_install', '6 kW', 'On-Grid', 'เชียงใหม่', 'บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับบ้านพักอาศัย'),
('Solar Rooftop 12 kW บ้านพักอาศัย เชียงใหม่', 'Solar Rooftop 12 kW Residential, Chiang Mai', 'design_install', '12 kW', 'On-Grid', 'เชียงใหม่', 'บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับบ้านพักอาศัย'),
('Solar Rooftop 45 kW มทร.ล้านนา', 'Solar Rooftop 45 kW RMUTL', 'design_install', '45 kW', 'On-Grid', 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา', 'มทร.ล้านนา', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับอาคารมหาวิทยาลัย'),
('Solar Rooftop 23 kW มทร.ธัญบุรี', 'Solar Rooftop 23 kW RMUTT', 'design_install', '23 kW', 'On-Grid', 'มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี', 'มทร.ธัญบุรี', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid'),
('Solar Rooftop 6 kW Farm Story House Coffee', 'Solar Rooftop 6 kW Farm Story House Coffee Shop', 'design_install', '6 kW', 'On-Grid', 'Farm Story House Coffee Shop', 'Farm Story House Coffee', 'ออกแบบและติดตั้งระบบ Solar Rooftop On-Grid สำหรับร้านกาแฟ');

-- ============================================================
-- 2. DESIGN & INSTALLATION — Solar Pumping
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('ระบบสูบน้ำพลังงานแสงอาทิตย์ กรมทรัพยากรน้ำ 23 โครงการ', 'Solar Pumping Systems - Department of Water Resources (23 projects)', 'design_install', 'หลายขนาด', 'Off-Grid Solar Pumping', 'หลายพื้นที่ทั่วประเทศ', 'กรมทรัพยากรน้ำ', 'ออกแบบและติดตั้งระบบสูบน้ำพลังงานแสงอาทิตย์ จำนวน 23 โครงการ');

-- ============================================================
-- 3. DESIGN & INSTALLATION — Microgrid
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('ระบบไมโครกริดบ้านคลองเรือ ร่วมกับ กฟผ.', 'Microgrid System for Khlong Ruea Village with EGAT', 'design_install', 'Microgrid', 'Hybrid Microgrid', 'บ้านคลองเรือ ต.ปากทรง อ.พะโต๊ะ จ.ชุมพร', 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)', 'ร่วมกับ กฟผ. ออกแบบ ติดตั้ง และประเมินผลระบบไมโครกริดสำหรับหมู่บ้านคลองเรือ');

-- ============================================================
-- 4. CONSULTING — Solar Consultant
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th, budget) VALUES
('ที่ปรึกษาระบบโซล่าเซลล์ 4 มหาวิทยาลัย (มจธ., มจพ., มพ., มน.)', 'Solar System Consultant for 4 Universities (KMUTT, KMUTNB, UP, NU)', 'consulting', '~1 MW', 'On-Grid', 'กรุงเทพฯ / พะเยา / พิษณุโลก', 'มจธ., มจพ., ม.พะเยา, ม.นเรศวร', 'ที่ปรึกษาและประเมินระบบโซล่าเซลล์ที่ติดตั้งในมหาวิทยาลัย 4 แห่ง (พ.ศ. 2558-2559): 1.มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี 2.มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ 3.มหาวิทยาลัยพะเยา 4.มหาวิทยาลัยนเรศวร รวมกำลังติดตั้งประมาณ 1 MW', 400000000.00),
('ที่ปรึกษา บ. AT SOLAR POWER (50 MW)', 'Consultant for AT SOLAR POWER Co., Ltd. (50 MW)', 'consulting', '50 MW', 'Solar Farm', 'ประเทศไทย', 'บริษัท AT SOLAR POWER', 'ออกแบบ ติดตั้ง และประเมินทางเศรษฐศาสตร์ สิ่งแวดล้อม ประมาณกำลังติดตั้ง 50 MW (พ.ศ. 2559)', 2810000000.00),
('ที่ปรึกษา บ. Chanakit East of Thailand Solar Cell (500 MW EIA)', 'Consultant for Chanakit East of Thailand Solar Cell (500 MW EIA)', 'consulting', '500 MW', 'Solar Farm', 'ภาคตะวันออก', 'บริษัท Chanakit East of Thailand Solar Cell', 'ประเมินผลกระทบทางสิ่งแวดล้อม (EIA) จำนวน 10 แห่ง รวมประมาณกำลังติดตั้ง 500 MW (พ.ศ. 2559)', 20000000.00),
('ที่ปรึกษา บ. VARS (729 kW)', 'Consultant for VARS Co., Ltd. (729 kW)', 'consulting', '729 kW', 'On-Grid', 'โรงงานอุตสาหกรรม', 'บริษัท VARS', 'ออกแบบ ตรวจสอบ และ Commissioning ระบบ Solar Rooftop โรงงานอุตสาหกรรม กำลังติดตั้ง 729 kW (พ.ศ. 2559)', NULL),
('ที่ปรึกษา ม.มหาจุฬาลงกรณราชวิทยาลัย วิทยาเขตเชียงใหม่ (40 kW)', 'Consultant for MCU Chiang Mai Campus (40 kW)', 'consulting', '40 kW', 'On-Grid', 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย วิทยาเขตเชียงใหม่', 'ม.มหาจุฬาลงกรณราชวิทยาลัย', 'ออกแบบ และตรวจสอบ ระบบ Solar Rooftop กำลังติดตั้ง 40 kW', NULL);

-- ============================================================
-- 5. INSPECTION — Solar Inspector
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('ตรวจสอบระบบ Solar Rooftop (8+ แห่ง)', 'Solar Rooftop Inspection (8+ sites)', 'inspection', 'หลายขนาด', 'On-Grid', 'หลายพื้นที่', 'หลายหน่วยงาน', 'ตรวจสอบการติดตั้งระบบ Solar Rooftop ตามมาตรฐานวิศวกรรม');

-- ============================================================
-- 6. INSPECTION — Electric & Building Inspector
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('ตรวจสอบบริภัณฑ์ไฟฟ้า ท่าอากาศยานเชียงใหม่', 'Electrical Equipment Inspection - Chiang Mai Airport', 'inspection', 'อาคารท่าอากาศยาน', 'ระบบไฟฟ้าอาคาร', 'ท่าอากาศยานเชียงใหม่', 'ท่าอากาศยานเชียงใหม่ (ทอท.)', 'ตรวจสอบบริภัณฑ์ไฟฟ้า ท่าอากาศยานเชียงใหม่ (พ.ศ. 2560-2567)'),
('ตรวจสอบบริภัณฑ์ไฟฟ้า ท่าอากาศยานเชียงราย', 'Electrical Equipment Inspection - Chiang Rai Airport', 'inspection', 'อาคารท่าอากาศยาน', 'ระบบไฟฟ้าอาคาร', 'ท่าอากาศยานเชียงราย', 'ท่าอากาศยานเชียงราย (ทอท.)', 'ตรวจสอบบริภัณฑ์ไฟฟ้า ท่าอากาศยานเชียงราย (พ.ศ. 2564)'),
('ตรวจสอบอาคารผู้โดยสารและคลังสินค้า ท่าอากาศยานนานาชาติเชียงใหม่', 'Building Inspection - Chiang Mai International Airport Terminal & Cargo', 'inspection', 'อาคารผู้โดยสาร + คลังสินค้า', 'โครงสร้างอาคาร', 'ท่าอากาศยานนานาชาติเชียงใหม่', 'ท่าอากาศยานเชียงใหม่ (ทอท.)', 'ตรวจสอบอาคารผู้โดยสาร อาคารคลังสินค้า ท่าอากาศยานนานาชาติเชียงใหม่ (พ.ศ. 2564-2567)');

-- ============================================================
-- 7. TRAINING
-- ============================================================
INSERT INTO academic_services (title_th, title_en, service_type, capacity, system_type, location, client, description_th) VALUES
('อบรมการติดตั้ง ซ่อม บำรุงรักษาระบบเซลล์แสงอาทิตย์ (คุณวุฒิวิชาชีพ ระดับ 2-5)', 'Solar PV Installation, Repair & Maintenance Training (Professional Qualification Level 2-5)', 'training', '> 1,000 คน', 'การอบรม', 'มทร.ล้านนา', 'บุคคลทั่วไป / ช่างเทคนิค', 'จัดอบรมการติดตั้ง ซ่อม และบำรุงรักษาระบบเซลล์แสงอาทิตย์ ตามมาตรฐานคุณวุฒิวิชาชีพ ระดับ 2-5'),
('อบรมการออกแบบระบบโซล่าเซลล์ และ PV SYST', 'Solar System Design & PV SYST Software Training', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'วิศวกร / นักศึกษา', 'จัดอบรมการออกแบบระบบโซล่าเซลล์ และการใช้โปรแกรม PV SYST'),
('อบรมระบบสูบน้ำพลังงานแสงอาทิตย์', 'Solar Pumping System Training', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'บุคคลทั่วไป', 'จัดอบรมระบบสูบน้ำพลังงานแสงอาทิตย์ สาธิตระบบโซล่าเซลล์ชุดนอนนา'),
('อบรมติดตั้งแผงโซล่าเซลล์บนหลังคา สำหรับนักศึกษาและบุคคลทั่วไป', 'Solar Rooftop Installation Training for Students & Public', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'นักศึกษา / บุคคลทั่วไป', 'จัดอบรมการติดตั้งแผงโซล่าเซลล์บนหลังคาให้กับนักศึกษาและบุคคลทั่วไป'),
('อบรมเทคโนโลยีพลังงานแสงอาทิตย์ สจล. (KMITL)', 'Solar Technology Training at KMITL', 'training', 'นักศึกษา KMITL', 'การอบรม', 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', 'สจล. (KMITL)', 'จัดอบรมเทคโนโลยีพลังงานแสงอาทิตย์ การออกแบบ การติดตั้งแผงโซล่าเซลล์บนหลังคาอย่างปลอดภัย ให้กับนักศึกษา ภาควิชาอิเลคทรอนิกส์ สจล.'),
('อบรมเทคโนโลยีอัดประจุแบตเตอรี่สำหรับยานยนต์ไฟฟ้า (EV)', 'Battery Charging Technologies for EV Training', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'หน่วยงานเอกชน / บุคคลทั่วไป', 'จัดโครงการฝึกอบรมเทคโนโลยีอัดประจุแบตเตอรี่สำหรับยานยนต์ไฟฟ้า ร่วมกับหน่วยงานเอกชน'),
('อบรม DC Charger Technology', 'DC Charger Technology Training', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'หน่วยงานเอกชน', 'จัดอบรม DC Charger Technology ร่วมกับหน่วยงานเอกชน'),
('อบรมการใช้งานระบบโซล่าเซลล์กับแบตเตอรี่', 'Solar + Battery System Training', 'training', 'หลายรุ่น', 'การอบรม', 'มทร.ล้านนา', 'หน่วยงานเอกชน', 'จัดอบรมการใช้งานระบบโซล่าเซลล์กับแบตเตอรี่ ร่วมกับหน่วยงานเอกชน');
