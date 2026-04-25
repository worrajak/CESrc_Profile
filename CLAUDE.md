# CLAUDE.md — CESrc_Profile Project Guide for AI Assistants

โปรเจกต์ระบบฐานข้อมูลนักวิจัย หน่วยวิจัยระบบพลังงานสะอาด (CESRU) มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา

> **บริบทสำคัญ:** ไฟล์นี้สรุปสถาปัตยกรรม, schema, features, และวิธีพัฒนาระบบ — สำหรับ AI assistant ที่มาช่วยพัฒนาต่อ

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Auth:** Google OAuth via Supabase Auth (สำหรับ public users)
- **Admin:** Password-based auth (env `ADMIN_PASSWORD`)
- **AI:** Multi-provider (Claude/Gemini/OpenAI/Ollama) ผ่าน `src/lib/ai-provider.ts`
- **External APIs:** ORCID Public API v3.0, OpenAlex API (ฟรีทั้งคู่)
- **Analytics:** Google Analytics 4 + custom heatmap (PDPA-compliant)
- **Deployment:** Vercel + Dropbox sync (development)

## โครงสร้างหลัก

```
src/
├── app/                        # Next.js App Router
│   ├── (public pages)/         # หน้าสาธารณะ — researchers, publications, news, ฯลฯ
│   ├── admin/                  # Admin dashboard (password-protected)
│   │   ├── news/               # จัดการข่าวสาร + travel attachment
│   │   ├── publications/       # นำเข้า DOI + matching
│   │   ├── orcid/              # ORCID import UI
│   │   ├── openalex/           # OpenAlex sync UI
│   │   ├── workload/           # ประเมินภาระงาน
│   │   ├── engagement/         # Heatmap + comments moderation
│   │   ├── training/           # หลักสูตรอบรม
│   │   ├── grants/             # ทุนวิจัย + tracking
│   │   └── ai-settings/        # AI provider config
│   ├── api/                    # Backend API routes
│   ├── auth/callback/          # Google OAuth post-login + consent
│   ├── account/                # User profile + PDPA rights
│   ├── privacy-policy/         # PDPA-compliant
│   └── terms/                  # Terms of Service
├── components/                 # Shared React components
├── lib/                        # Utilities (supabase client, AuthContext, ai-provider)
├── data/                       # Static data (energy-trends.ts)
└── utils/                      # Helper functions

supabase/
├── 001_schema.sql              # Core schema (researchers, publications, grants, services)
├── 002_seed_data.sql           # Initial data
├── ...                         # Numbered migrations (chronological)
└── 041_phd_students_advisors.sql  # Latest as of April 2026
```

## ฟีเจอร์หลัก

### 1. Researcher Profiles
- 19 นักวิจัยใน 4 roles: `advisor`, `head`, `member`, `phd_student`
- ORCID + OpenAlex IDs + citations + h-index ดึงอัตโนมัติ
- PhD advisor relationships ภายในหน่วย (`phd_advisor_id`)
- CV download (Word DOCX) สำหรับแต่ละท่าน

### 2. Publications
- Manual entry หรือ import ผ่าน:
  - DOI lookup (Crossref API)
  - ORCID API (ดึง works ของแต่ละท่าน)
  - OpenAlex API (มากกว่า, รวม citations + concepts)
- Auto-classify keywords + SDG goals จาก title/abstract/concepts

### 3. News & Travel Tracking
- Admin posts news with attachments (images, PDFs)
- **Official travel** (ไปราชการ): purpose, location, dates, approval doc, budget, participants
- ใช้ในการประเมินภาระงาน (`/admin/workload`)

### 4. Comments + Engagement (PDPA)
- Public users login ผ่าน Google OAuth
- Comment บน news/publication/researcher แสดงทันที (admin ลบได้)
- Heatmap: page views ตาม day×hour (anonymous, รักษา PDPA)
- Auto-classify SDG จาก content

### 5. Workload Evaluation
- ต่อนักวิจัย/ปี: publications, grants, travels, courses, services, students
- Print-friendly report (PDF export)

### 6. Training Platform
- Multi-instructor courses (max 5 per course)
- AI parsing of curriculum docs (Gemini/Claude)
- Sessions + enrollments + competency rubrics
- NFT certificates (Bronze/Silver/Gold/Diamond)

## Schema ที่สำคัญ

### researchers
```sql
id UUID PK
title_th, first_name_th, last_name_th  TEXT NOT NULL
unit_role researcher_role  -- enum: head, member, advisor, phd_student
orcid_id, openalex_id, scopus_id, google_scholar  TEXT
cited_by_count, h_index, i10_index  INTEGER
is_pursuing_phd  BOOLEAN
phd_advisor_id  UUID → researchers(id)  -- ที่ปรึกษา ป.เอก ในหน่วย
```

### publications
```sql
id UUID PK
title TEXT NOT NULL
pub_type publication_type  -- enum: journal, conference, journal_international, etc.
year INTEGER
doi TEXT UNIQUE
keywords TEXT[]
source TEXT  -- 'manual', 'orcid', 'openalex', 'doi_import'
openalex_id TEXT
cited_by_count INTEGER
is_open_access BOOLEAN
```

### news + travel
```sql
id UUID PK
title, content TEXT NOT NULL
category TEXT
is_official_travel BOOLEAN  -- ไปราชการ?
travel_purpose, travel_location TEXT
travel_start_date, travel_end_date DATE
travel_approval_number, travel_approval_doc_url, travel_approval_link TEXT
travel_budget DECIMAL
travel_participants JSONB  -- array of researcher_ids
```

### guest_users (PDPA-minimal)
```sql
id UUID PK → auth.users(id)
email TEXT UNIQUE
display_name TEXT
user_type ENUM('student','researcher','general')
consent_version, consented_at
marketing_opt_in BOOLEAN
```

### comments (polymorphic)
```sql
target_type TEXT  -- 'news', 'publication', 'researcher', 'grant'
target_id UUID
content TEXT (1-2000 chars)
is_deleted, deleted_at, deleted_by
```

### engagement_events (anonymous)
```sql
event_type TEXT  -- 'page_view', 'comment', 'cta_click'
hour_bucket, day_of_week, date_bucket  -- for heatmap
session_hash TEXT  -- daily-rotating, no PII
user_id UUID nullable
```

## Pattern สำคัญ

### Adding a new feature
1. Create SQL migration in `supabase/NNN_feature_name.sql`
2. Create API route in `src/app/api/.../route.ts`
3. Create UI in `src/app/(...)/page.tsx`
4. Add entry to admin dashboard if applicable
5. Update CLAUDE.md + docs

### RLS Pattern
- Most tables have RLS enabled
- Public read for non-sensitive data
- INSERT/UPDATE/DELETE require auth (Supabase auth.uid())
- Admin bypass via service_role or `ADMIN_PASSWORD` check in API

### Common gotchas
- **Server vs Client components:** event handlers (onClick) need `'use client'`
- **Enum changes:** new enum values must be in separate migration (commit before use)
- **Missing columns:** wrap queries in try/catch when feature flagged
- **Bot-style URLs:** be careful with `[id]` routes — validate UUID

## Migration Order (latest at top)

| # | File | Purpose |
|---|---|---|
| 041 | phd_students_advisors | Assign advisors to PhD students |
| 040 | phd_advisor_relationships | Add `phd_advisor_id` field |
| 039b | update_thai_names_roles | Update names + assign roles |
| 039 | fix_thai_names_roles | Add `phd_student` enum |
| 038 | add_new_researchers | +5 researchers |
| 037 | comments_engagement | Comments + heatmap + PDPA |
| 036 | news_travel_workload | Travel attachments + workload view |
| 035 | openalex_import | Import OpenAlex publications |
| 034 | openalex_integration | OpenAlex columns + IDs |
| 033 | (removed; merged into 035) | - |
| 032 | orcid_integration | ORCID columns |
| 031 | training_multi_instructors | JSONB instructor_ids |
| 030 | fix_training_rls | RLS for training tables |
| 029 | fix_grants_rls | RLS for grants |
| 028 | grant_milestones | S-curve tracking |
| 027 | grant_tracking | Grant deliverables |
| ... | (older migrations) | See docs/MIGRATIONS.md |

See `docs/MIGRATIONS.md` for full list and dependencies.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_PASSWORD=secret
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
```

## Conventions

- **Thai-first UI:** all user-facing text in Thai (English secondary)
- **Date format:** Buddhist era (พ.ศ.) for Thai context, Gregorian for international
- **Numbering:** Buddhist era for fiscal years (`fiscal_year` field)
- **Avatar fallback:** gradient circle with first letter of `first_name_th`
- **No third-party tracking** without explicit user consent (PDPA)
