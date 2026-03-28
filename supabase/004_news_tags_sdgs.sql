-- ============================================================
-- Add tags and SDG goals to news table
-- ============================================================

ALTER TABLE news ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE news ADD COLUMN IF NOT EXISTS sdg_goals TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_news_tags ON news USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_sdgs ON news USING GIN(sdg_goals);
