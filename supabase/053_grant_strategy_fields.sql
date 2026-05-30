-- 053_grant_strategy_fields.sql
-- ════════════════════════════════════════════════════════════════════
-- Add hierarchical strategy fields + submission/result details to
-- grant_calls. Driven by NRIIS-style announcements which carry up to
-- 5 nested levels: ยุทธศาสตร์ → แผนงาน → แผนงานย่อย →
-- แผนงานย่อยรายประเด็น → กลุ่มเรื่อง.
--
-- Stored as a single JSONB column so we can model the nesting freely
-- without a multi-row schema, plus two scalar fields for the two
-- pieces of context that don't fit the nesting (how to submit + where
-- results are announced).
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE grant_calls
  ADD COLUMN IF NOT EXISTS strategy JSONB,
  ADD COLUMN IF NOT EXISTS submission_details_th TEXT,
  ADD COLUMN IF NOT EXISTS result_channels TEXT[];

COMMENT ON COLUMN grant_calls.strategy IS
  'Hierarchical strategy info extracted from the announcement.
   Shape:
     {
       "strategy_no": "ยุทธศาสตร์ที่ 2 ...",
       "program": "P9 พัฒนาสังคมสูงวัย...",
       "sub_programs": [
         {
           "code": "F8 (S2P9)",
           "name": "พัฒนาผู้สูงอายุ...",
           "topic": "การพัฒนาผู้สูงอายุ...",  -- แผนงานย่อยรายประเด็น
           "groups": ["นวัตกรรมทางสังคม...", "เปลี่ยนเกษียณเป็นพลัง..."]
         }
       ]
     }';

COMMENT ON COLUMN grant_calls.submission_details_th IS
  'Instructions on how to submit (registration URL, required attachments,
   confirmation step). AI-extracted free text.';

COMMENT ON COLUMN grant_calls.result_channels IS
  'URLs / channels where results will be announced (e.g.
   www.nrct.go.th, https://nriis.go.th).';
