-- ============================================================
-- 022: Seed Equipment Data from Lab Solar Spreadsheet
-- แหล่งข้อมูล: 2567 ครุภัณฑ์ใน Lab Solar.xlsx
-- ============================================================

-- === เครื่องมือวัดทางไฟฟ้า (Test & Measurement) ===
INSERT INTO equipment (name_th, name_en, brand, model, category, quantity_total, quantity_available, notes) VALUES
('มัลติมิเตอร์ Fluke 289', 'Fluke 289 True-RMS Industrial Logging Multimeter', 'Fluke', '289', 'test_measurement', 4, 3, 'เสีย 1 เครื่อง'),
('เครื่องวัดพลังงานไฟฟ้า 3 เฟส Fluke 1730', 'Fluke 1730 Three-Phase Energy Logger', 'Fluke', '1730', 'test_measurement', 2, 2, NULL),
('แคลมป์มิเตอร์ Fluke 376 FC', 'Fluke 376 FC True-RMS AC/DC Clamp Meter', 'Fluke', '376 FC', 'test_measurement', 2, 2, NULL),
('แคลมป์มิเตอร์ Fluke 337', 'Fluke 337 True-RMS Clamp Meter', 'Fluke', '337', 'test_measurement', 1, 1, NULL),
('เครื่องวัดอุณหภูมิอินฟราเรด Fluke 62 MAX+', 'Fluke 62 MAX+ Infrared Thermometer', 'Fluke', '62 MAX+', 'test_measurement', 1, 1, NULL),
('เครื่องวัดอุณหภูมิและความชื้น Fluke 971', 'Fluke 971 Temperature & Humidity Meter', 'Fluke', '971', 'test_measurement', 1, 1, NULL),
('กล้องถ่ายภาพความร้อน Fluke Ti25', 'Fluke Ti25 Thermal Imager', 'Fluke', 'Ti25', 'test_measurement', 1, 1, NULL),
('เครื่องวัดความต้านทานดิน Fluke 1625-2', 'Fluke 1625-2 GEO Earth Ground Tester Kit', 'Fluke', '1625-2', 'test_measurement', 1, 1, NULL),
('เครื่องบันทึกข้อมูล HIOKI LR8450-01', 'HIOKI Memory HiLogger LR8450-01', 'HIOKI', 'LR8450-01', 'test_measurement', 1, 1, NULL),
('แคลมป์มิเตอร์วัดกำลังไฟฟ้า MS2203', 'Digital Power Clamp Meter MS2203', 'Mastech', 'MS2203', 'test_measurement', 4, 4, NULL),
('LCR มิเตอร์ BK Precision 879B', 'BK Precision 879B Handheld LCR Meter', 'BK Precision', '879B', 'test_measurement', 2, 2, NULL),
('มัลติมิเตอร์ DIGICON DM-690', 'DIGICON DM-690 Digital Multimeter', 'DIGICON', 'DM-690', 'test_measurement', 1, 1, NULL);

-- === เครื่องมือทดสอบระบบ PV (Solar PV Test) ===
INSERT INTO equipment (name_th, name_en, brand, model, category, quantity_total, quantity_available, description_th) VALUES
('ชุดทดสอบระบบ PV Seaward PV150', 'Seaward PV150 Solar Complete Kit', 'Seaward', 'PV150', 'solar_pv_test', 1, 1, 'ชุดทดสอบระบบ PV ครบชุด (Voc, Isc, Insulation, Continuity)'),
('เครื่องตรวจสอบระบบ PV HT PV CHECKs', 'HT PV CHECKs', 'HT Instruments', 'PV CHECKs', 'solar_pv_test', 1, 1, 'ตรวจสอบความปลอดภัยระบบ PV'),
('เครื่องวัดกราฟ I-V HT I-V 400W', 'HT I-V 400W I-V Curve Tracer', 'HT Instruments', 'I-V 400W', 'solar_pv_test', 1, 1, 'วัดกราฟ I-V ของแผงโซล่าเซลล์ได้ถึง 400W'),
('เครื่องวัดความเข้มแสง HT Solar 300N', 'HT Solar 300N Irradiance Meter', 'HT Instruments', 'Solar 300N', 'solar_pv_test', 1, 1, 'วัดความเข้มแสงอาทิตย์และอุณหภูมิแผง'),
('เครื่องวิเคราะห์ MPPT HT MPP300', 'HT MPP300 MPPT Analyzer', 'HT Instruments', 'MPP300', 'solar_pv_test', 1, 1, 'วิเคราะห์จุดทำงานสูงสุดของระบบ PV'),
('เครื่องทดสอบ PV ระยะไกล Metrel A1378', 'Metrel EurotestPV Remote A1378', 'Metrel', 'A1378', 'solar_pv_test', 1, 1, 'ทดสอบระบบ PV ระยะไกล'),
('เครื่องทดสอบ PV แบบพกพา Metrel MI 3109', 'Metrel MI 3109 EurotestPV Lite', 'Metrel', 'MI 3109', 'solar_pv_test', 1, 1, 'ทดสอบระบบ PV แบบพกพา'),
('เครื่องวิเคราะห์แผงโซล่าเซลล์ PROVA 210', 'PROVA 210 Solar Module Analyzer', 'PROVA', '210', 'solar_pv_test', 1, 1, 'วิเคราะห์แผงโซล่าเซลล์');

-- === อุปกรณ์ครุภัณฑ์ใน Lab ===
INSERT INTO equipment (name_th, name_en, brand, model, category, asset_number, quantity_total, quantity_available) VALUES
('คอมพิวเตอร์ All In One', 'Computer All-in-One', NULL, NULL, 'computer_it', '2-11150000-FA19-744000102/001-61', 1, 1),
('คอมพิวเตอร์ All In One', 'Computer All-in-One', NULL, NULL, 'computer_it', '2-11150000-FA19-744000102/002-61', 1, 1),
('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/001-61', 1, 1),
('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/002-61', 1, 1),
('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/003-61', 1, 1),
('อินเวอร์เตอร์ Hybrid 3000W', 'Hybrid Inverter 3000W', NULL, NULL, 'lab_facility', '2-11150000-FA08-6115000401/004-61', 1, 1),
('เครื่องปรับอากาศชนิดติดผนัง', 'Wall-Mounted Air Conditioner', NULL, NULL, 'lab_facility', '2-11150000-FA06-412000104/001-61', 1, 1),
('เครื่องปรับอากาศชนิดติดผนัง', 'Wall-Mounted Air Conditioner', NULL, NULL, 'lab_facility', '2-11150000-FA06-412000104/002-61', 1, 1),
('โทรทัศน์ LED TV', 'LED TV', NULL, NULL, 'lab_facility', '2-11150000-FA08-773000301/001-61', 1, 1),
('โทรทัศน์ LED Smart TV', 'LED Smart TV', NULL, NULL, 'lab_facility', '2-11150000-FA08-773000301/002-61', 1, 1),
('เครื่องดูดควันมาตรฐาน', 'Fume Hood', NULL, NULL, 'lab_facility', '2-11150000-FA21-414000701/001-61', 1, 1),
('ตู้เย็น', 'Refrigerator', NULL, NULL, 'lab_facility', '2-11150000-FA06-411000101/001-61', 1, 1),
('ตู้เย็น', 'Refrigerator', NULL, NULL, 'lab_facility', '2-11150000-FA06-411000101/002-61', 1, 1);
