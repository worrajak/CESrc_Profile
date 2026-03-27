-- ============================================================
-- เพิ่ม search_terms สำหรับจับคู่ publications กับสาขาวิจัย
-- และเพิ่มสาขาวิจัยใหม่ที่ยังขาด
-- ============================================================

ALTER TABLE research_areas ADD COLUMN IF NOT EXISTS search_terms TEXT[];

-- 1. พลังงานแสงอาทิตย์
UPDATE research_areas SET search_terms = ARRAY[
  'solar', 'photovoltaic', 'PV', 'MPPT', 'solar cell', 'solar rooftop',
  'solar simulator', 'solar energy', 'solar water pump', 'solar air conditioning',
  'bifacial', 'I-V characterization', 'tungsten halogen', 'irradiance',
  'pvsec', 'solar powered', 'thermoelectric cooler'
] WHERE name_en = 'Solar Energy & Solar Rooftop';

-- 2. ระบบกักเก็บพลังงานแบตเตอรี่
UPDATE research_areas SET search_terms = ARRAY[
  'battery', 'energy storage', 'LiFePO4', 'BMS', 'lithium',
  'charge discharge', 'active balancer', 'NCR18650',
  'demand response', 'demand side management', 'DSM',
  'ultracapacitor', 'home battery'
] WHERE name_en = 'Battery Energy Storage Systems';

-- 3. ยานยนต์ไฟฟ้า
UPDATE research_areas SET search_terms = ARRAY[
  'electric vehicle', 'EV', 'EV charging', 'charging station',
  'golf cart', 'mini shuttle', 'electric golf',
  'CC-CV', 'constant current', 'constant voltage',
  'buck converter charging'
] WHERE name_en = 'Electric Vehicles & Charging Stations';

-- 4. การส่งกำลังไฟฟ้าไร้สาย
UPDATE research_areas SET search_terms = ARRAY[
  'wireless power transfer', 'WPT', 'wireless charging', 'wireless EV',
  'inductive', 'inductive coupling', 'ferrite core',
  'Class-E inverter', 'WiFi communications feedback',
  'primary-side', 'secondary-side', 'power balance control',
  'Hamiltonian control'
] WHERE name_en = 'Wireless Power Transfer';

-- 5. ไมโครกริด
UPDATE research_areas SET search_terms = ARRAY[
  'microgrid', 'community energy', 'rural electrification',
  'off-grid', 'stand-alone power', 'hybrid power generation',
  'renewable microgrid', 'Khlong Ruea', 'คลองเรือ',
  'pico hydro', 'HOMER'
] WHERE name_en = 'Microgrid & Community Energy';

-- 6. การบำบัดน้ำ
UPDATE research_areas SET search_terms = ARRAY[
  'electrocoagulation', 'water treatment', 'water purification',
  'TDS', 'แม่เมาะ', 'Mae Moh', 'ammonia removal',
  'ของแข็งละลายน้ำ', 'lignite'
] WHERE name_en = 'Electrocoagulation Water Treatment';

-- 7. IoT
UPDATE research_areas SET search_terms = ARRAY[
  'IoT', 'smart meter', 'energy monitoring', 'smart grid',
  'NB-IoT', 'LoRaWAN', 'internet of things',
  'icehouse', 'data logger', 'RFID',
  'อินเทอร์เน็ตของทุกสรรพสิ่ง'
] WHERE name_en = 'IoT & Smart Metering';

-- 8. อาคารอัจฉริยะ
UPDATE research_areas SET search_terms = ARRAY[
  'smart building', 'energy conservation', 'energy management',
  'load modeling', 'air conditioning', 'LED lamp',
  'lighting', 'energy consumption', 'green building',
  'BCG model'
] WHERE name_en = 'Smart Building & Energy Conservation';

-- 9. การพัฒนาชุมชน
UPDATE research_areas SET search_terms = ARRAY[
  'community development', 'sustainable development', 'community',
  'ชุมชน', 'ห้วยต้า', 'บ้านปง', 'พัฒนาชุมชน',
  'ลมหายใจเชิงดอย', 'participatory', 'อุทกภัย', 'flood'
] WHERE name_en = 'Sustainable Community Development';

-- ============================================================
-- เพิ่มสาขาวิจัยใหม่ที่ขาด
-- ============================================================

-- 10. ระบบป้องกันไฟฟ้าและคุณภาพไฟฟ้า (Power System Protection)
INSERT INTO research_areas (name_th, name_en, icon, sort_order, sdg_goals, search_terms)
VALUES (
  'ระบบป้องกันไฟฟ้าและคุณภาพไฟฟ้า',
  'Power System Protection & Power Quality',
  '🛡️', 10,
  ARRAY['SDG 7', 'SDG 9'],
  ARRAY[
    'protective devices', 'overcurrent relay', 'directional relay',
    'power quality', 'voltage sag', 'failure analysis',
    'transformer', 'power distribution', 'ant colony',
    'fault', 'reliability', 'coordination',
    'space vector', 'PWM', 'inverter',
    'แรงดันตก', 'รีเลย์', 'ป้องกัน'
  ]
);

-- 11. การจำลองระบบและ System Identification
INSERT INTO research_areas (name_th, name_en, icon, sort_order, sdg_goals, search_terms)
VALUES (
  'การจำลองระบบและระบุเอกลักษณ์',
  'System Modeling & Identification',
  '📊', 11,
  ARRAY['SDG 9'],
  ARRAY[
    'system identification', 'Hammerstein-Wiener', 'nonlinear',
    'model predictive control', 'stability analysis',
    'cross validation', 'Kalman filter', 'ARIMA',
    'circuit model', 'simulation'
  ]
);

-- 12. เกษตรอัจฉริยะและเทคโนโลยีการเกษตร
INSERT INTO research_areas (name_th, name_en, icon, sort_order, sdg_goals, search_terms)
VALUES (
  'เกษตรอัจฉริยะและเทคโนโลยีการเกษตร',
  'Smart Agriculture & Agri-Technology',
  '🌾', 12,
  ARRAY['SDG 2', 'SDG 12'],
  ARRAY[
    'agriculture', 'irrigation', 'chrysanthemum', 'hydrangea',
    'rice cultivation', 'water pumping', 'rainfall',
    'Royal Project', 'มูลนิธิโครงการหลวง', 'ดอกไฮเดรนเยีย',
    'crayfish', 'oolong tea'
  ]
);
