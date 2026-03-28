-- ============================================================
-- แก้ชื่อภาษาไทย 3 คน + เพิ่ม avatar_url ของ Worrajak
-- ============================================================

-- 1. ณัฐวัฒน์ พันละวัน → พัลวัล
UPDATE researchers
SET last_name_th = 'พัลวัล'
WHERE id = 'a0000001-0000-0000-0000-000000000012';

-- 2. กันต์ นาคาเอี่ยม → กัญจน์ นาคเอี่ยม
UPDATE researchers
SET first_name_th = 'กัญจน์',
    last_name_th = 'นาคเอี่ยม'
WHERE id = 'a0000001-0000-0000-0000-000000000013';

-- 3. นริศ คำแปงแก้ว → กำแพงแก้ว
UPDATE researchers
SET last_name_th = 'กำแพงแก้ว'
WHERE id = 'a0000001-0000-0000-0000-000000000014';

-- 4. เพิ่มรูป avatar ของ Worrajak (ไฟล์อยู่ที่ public/researchers/worrajak.jpg)
UPDATE researchers
SET avatar_url = '/avatars/worrajak.jpg'
WHERE id = 'a0000001-0000-0000-0000-000000000009';
