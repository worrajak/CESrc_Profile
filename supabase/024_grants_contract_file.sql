-- ============================================================
-- 024: เพิ่ม column สำหรับแนบไฟล์สัญญาทุนวิจัย
-- ============================================================

-- เพิ่ม column เก็บ URL ไฟล์สัญญาทุน
ALTER TABLE grants ADD COLUMN IF NOT EXISTS contract_file_url TEXT;

-- เพิ่ม column progress report URL (ถ้าต้องการแนบรายงานความก้าวหน้า)
ALTER TABLE grants ADD COLUMN IF NOT EXISTS progress_report_url TEXT;

-- เพิ่ม column final report URL
ALTER TABLE grants ADD COLUMN IF NOT EXISTS final_report_url TEXT;

-- สร้าง Storage bucket สำหรับเอกสารทุนวิจัย (รันใน Supabase Dashboard → Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
-- หรือสร้างผ่าน Dashboard แล้วตั้งชื่อ bucket = "documents", ตั้งเป็น public

-- RLS สำหรับ storage bucket (ถ้าต้องการ)
-- CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
-- CREATE POLICY "Auth insert documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
