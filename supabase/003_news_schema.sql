-- ============================================================
-- NEWS & ACTIVITIES (ข่าวสารและกิจกรรม)
-- ============================================================

CREATE TYPE news_category AS ENUM (
  'team_activity',      -- กิจกรรมทีม CESrc
  'energy_news',        -- ข่าวสารพลังงาน
  'academic',           -- ข่าววิชาการ
  'announcement'        -- ประกาศทั่วไป
);

CREATE TABLE news (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,              -- เนื้อหาข่าว
  category        news_category NOT NULL DEFAULT 'team_activity',
  cover_image_url TEXT,                       -- รูปปก
  is_published    BOOLEAN DEFAULT true,
  published_at    TIMESTAMPTZ DEFAULT now(),
  author_id       UUID REFERENCES researchers(id) ON DELETE SET NULL,
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_category ON news(category);

-- ข่าวแต่ละเรื่องมีรูปได้สูงสุด 4 รูป
CREATE TABLE news_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id         UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  caption         TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_news_images_news ON news_images(news_id);

-- RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Public read news_images" ON news_images FOR SELECT USING (true);

-- Allow insert/update/delete for anon (admin uses password check via API)
CREATE POLICY "Allow insert news" ON news FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update news" ON news FOR UPDATE USING (true);
CREATE POLICY "Allow delete news" ON news FOR DELETE USING (true);

CREATE POLICY "Allow insert news_images" ON news_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update news_images" ON news_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete news_images" ON news_images FOR DELETE USING (true);

-- Updated trigger
CREATE TRIGGER trg_news_updated
  BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
