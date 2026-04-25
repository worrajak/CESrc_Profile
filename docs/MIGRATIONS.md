# SQL Migrations Guide

ลำดับและความสัมพันธ์ของ migration files ใน `supabase/` directory

> **สำคัญ:** รันใน Supabase Dashboard → SQL Editor ตามลำดับเลข ทำเรียงทีละไฟล์
>
> **PostgreSQL gotcha:** `ALTER TYPE ENUM ADD VALUE` ต้อง commit ก่อนใช้ value นั้นในประโยคถัดไป → แยกเป็นคนละ migration

## ลำดับการรัน (สำหรับ DB ใหม่)

| # | File | Purpose | Required Before |
|---|---|---|---|
| 001 | `001_schema.sql` | Core schema (researchers, publications, grants, services) | - |
| 002 | `002_seed_data.sql` | Initial researchers + publications | 001 |
| 003 | `003_namin_wos_publications.sql` | Anon's publications from WoS | 002 |
| 004 | `004_muangjai_cv.sql` | Worrajak's CV data | 002 |
| 004b | `004b_muangjai_grants_patents.sql` | Worrajak's grants & patents | 004 |
| 004c | `004c_patents_only.sql` | Patent additions | 004b |
| 005 | `005_sdg_research_areas.sql` | Research areas + SDG mapping | 001 |
| 005b | `005_wichet_thipprasert.sql` | Wichet's data | 002 |
| 006 | `006_fix_missing_authors.sql` | Fix author links | 002 |
| 007 | `007_pvsec36_kris2025.sql` | PVSEC-36 publications | 002 |
| 008 | `008_new_members_orcid.sql` | +3 members + 6 publications | 002 |
| 008b | `008_tippachon_scholar.sql` | Wiwat's Scholar data | 002 |
| 009 | `009_research_area_search_terms.sql` | Search terms for areas | 005 |
| 009b | `009_update_orcid.sql` | Update ORCID for existing | 008 |
| 010 | `010_news_schema.sql` | News tables (later renamed to 003_news_schema.sql) | 001 |
| 011 | `011_fix_thai_names_avatar.sql` | Avatar URLs + name fixes | 002 |
| 014 | `014_students_theses.sql` | Students + theses + thesis_committee | 001 |
| 015 | `015_news_links_datasets.sql` | News linkages | news_schema |
| 016 | `016_project_topics_student_access.sql` | Project topics for ป.ตรี | 014 |
| 017 | `017_student_milestones_progress.sql` | Student timeline | 014 |
| 018 | `018_publication_authorship_index.sql` | Performance indexes | 002 |
| 019 | `019_academic_services_schema.sql` | Service requests | 001 |
| 020 | `020_fix_services_rls.sql` | RLS for services | 019 |
| 022 | `022_grants_full_schema.sql` | Grant management | 001 |
| 023 | `023_research_areas_orcid_seed.sql` | Seed research areas | 005 |
| 025 | `025_training_platform.sql` | Training courses + sessions | 001 |
| 026 | `026_competency_evaluation.sql` | Competency rubrics | 025 |
| 027 | `027_grant_tracking.sql` | Grant deliverables + S-curve | 022 |
| 028 | `028_grant_milestones.sql` | Milestone tracking | 027 |
| 029 | `029_fix_grants_rls.sql` | RLS for grants | 022 |
| 030 | `030_fix_training_rls.sql` | RLS for training tables | 025 |
| 031 | `031_training_multi_instructors.sql` | JSONB instructor_ids | 025 |
| 032 | `032_orcid_integration.sql` | ORCID column on researchers | 002 |
| 034 | `034_openalex_integration.sql` | OpenAlex columns + author IDs + enum extensions | 032 |
| 035 | `035_openalex_import.sql` | Import 131 publications from OpenAlex | 034 |
| 036 | `036_news_travel_workload.sql` | Travel fields on news + workload view | news + 014 |
| 037 | `037_comments_engagement.sql` | guest_users + comments + engagement_events + RLS | 002 |
| 038 | `038_add_new_researchers.sql` | +5 researchers (Thanet, Wuttikai, Kittinun, Narong, Satean) | 034 |
| **039** | `039_fix_thai_names_roles.sql` | **Add `phd_student` to researcher_role enum** (must run alone) | 038 |
| **039b** | `039b_update_thai_names_roles.sql` | **Use the new enum value to update roles** | 039 (commit) |
| 040 | `040_phd_advisor_relationships.sql` | Add phd_advisor_id, is_pursuing_phd columns | 002 |
| 041 | `041_phd_students_advisors.sql` | Assign advisors to 4 PhD students | 040 |

## Notes

- ลบไฟล์ที่ลงท้ายด้วย `(LenovoX1's conflicted copy ...)` ได้เลย — เป็น Dropbox conflict
- `033_orcid_import.sql` ถูกลบเพราะรวมเข้า 035 แล้ว
- หากเจอ error `42703 column does not exist`: ตรวจสอบว่า migration ก่อนหน้าผ่านหรือยัง
- หากเจอ error `55P04 unsafe use of new enum value`: แยก ALTER TYPE และ UPDATE เป็นคนละ migration
- RLS migrations (029, 030, 020) ป้องกัน "new row violates row-level security policy" — รันเสมอเมื่อสร้าง table ใหม่

## Common Errors

### "column 'xxx' does not exist"
Migration ที่เพิ่ม column ยังไม่ถูกรัน

### "violates row-level security policy"
Table เปิด RLS แต่ไม่มี INSERT/UPDATE policy — ต้องเพิ่ม policy

### "duplicate key value violates unique constraint"
ID ซ้ำ — ใช้ `ON CONFLICT (id) DO NOTHING` หรือ `ON CONFLICT (id) DO UPDATE`

### "type 'researcher_role' does not have value 'phd_student'"
Migration 039 ยังไม่ได้รัน — รันก่อนแล้วค่อยรัน 039b

## Backup before migrations

```bash
# Export current data
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup-$(date +%Y%m%d).sql
```

หรือใช้ Supabase Dashboard → Database → Backups

## เพิ่ม Migration ใหม่

1. ตั้งชื่อ `NNN_short_description.sql` ใช้เลขเรียง
2. เริ่มด้วย comment block อธิบายการเปลี่ยนแปลง
3. ใช้ `IF NOT EXISTS` / `IF EXISTS` เพื่อ idempotency
4. ทดสอบใน local Supabase project ก่อน production
5. Update ไฟล์นี้ + commit
