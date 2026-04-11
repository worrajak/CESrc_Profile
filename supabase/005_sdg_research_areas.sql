-- ============================================================
-- เพิ่ม SDG (Sustainable Development Goals) ในสาขาวิจัย
-- และเพิ่ม icon + SDG mapping
-- ============================================================

-- เพิ่มคอลัมน์ sdg_goals ใน research_areas (ถ้ายังไม่มี)
ALTER TABLE research_areas ADD COLUMN IF NOT EXISTS sdg_goals TEXT[];

-- อัปเดตสาขาวิจัยเดิมให้มี SDG
UPDATE research_areas SET icon = '☀️', sdg_goals = ARRAY['SDG 7', 'SDG 13'] WHERE name_en = 'Solar Energy & Solar Rooftop';
UPDATE research_areas SET icon = '🔋', sdg_goals = ARRAY['SDG 7', 'SDG 9'] WHERE name_en = 'Battery Energy Storage Systems';
UPDATE research_areas SET icon = '🚗', sdg_goals = ARRAY['SDG 7', 'SDG 11', 'SDG 13'] WHERE name_en = 'Electric Vehicles & Charging Stations';
UPDATE research_areas SET icon = '📡', sdg_goals = ARRAY['SDG 7', 'SDG 9'] WHERE name_en = 'Wireless Power Transfer';
UPDATE research_areas SET icon = '🏘️', sdg_goals = ARRAY['SDG 7', 'SDG 11', 'SDG 13'] WHERE name_en = 'Microgrid & Community Energy';
UPDATE research_areas SET icon = '💧', sdg_goals = ARRAY['SDG 6', 'SDG 12'] WHERE name_en = 'Electrocoagulation Water Treatment';
UPDATE research_areas SET icon = '📲', sdg_goals = ARRAY['SDG 9', 'SDG 11'] WHERE name_en = 'IoT & Smart Metering';
UPDATE research_areas SET icon = '🏢', sdg_goals = ARRAY['SDG 7', 'SDG 11', 'SDG 12'] WHERE name_en = 'Smart Building & Energy Conservation';
UPDATE research_areas SET icon = '🌱', sdg_goals = ARRAY['SDG 1', 'SDG 7', 'SDG 11'] WHERE name_en = 'Sustainable Community Development';
