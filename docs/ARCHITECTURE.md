# Architecture Document

ภาพรวมสถาปัตยกรรมระบบ **CESrc_Profile** หน่วยวิจัยระบบพลังงานสะอาด (CESRU) มทร.ล้านนา

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Public Visitors                        │
│  (Students, Researchers, General Public — Thai-first UI)    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Next.js 14 (SSR)   │  Vercel Edge
        │   App Router + RSC   │
        └──────────┬───────────┘
                   │
       ┌───────────┼────────────┬─────────────┐
       │           │            │             │
       ▼           ▼            ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Supabase │ │  Google  │ │   ORCID  │ │ OpenAlex │
│   Auth   │ │  OAuth   │ │  Public  │ │   API    │
│   + DB   │ │ Provider │ │   API    │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Supabase Storage                             │
│  - images/ (news, equipment, profiles)        │
│  - documents/ (CVs, travel-approvals, grants) │
└──────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer
- **Public pages** — Server Components (default, SSR friendly)
  - `/` — Homepage (hero, energy trends, news feed)
  - `/researchers`, `/researchers/[id]` — Researcher profiles
  - `/publications`, `/news`, `/grants`, `/services`, `/students`
  - `/research-areas`, `/equipment`
- **Interactive components** — Client Components (`'use client'`)
  - `<Comments />`, `<EngagementTracker />`, `<ConsentBanner />`
  - `<ResearcherCard />`, `<Navbar />`
  - All admin pages (state + form interactions)
- **Public auth flow:**
  - `/auth/callback` — Google OAuth landing + consent form (PDPA)
  - `/account` — User profile + data export/delete

### 2. API Layer (`src/app/api/`)
| Endpoint | Purpose |
|---|---|
| `/api/researchers` | List all researchers |
| `/api/news` | CRUD news with travel attachments |
| `/api/upload` | File upload to Supabase Storage (images/documents buckets) |
| `/api/orcid/[id]` | ORCID profile + works/fundings lookup |
| `/api/openalex/[id]` | OpenAlex profile + works |
| `/api/openalex/sync` | Batch sync citations + h-index |
| `/api/workload/[id]` | Per-researcher workload report |
| `/api/engagement/track` | Anonymous event tracking |
| `/api/engagement/stats` | Heatmap + top pages aggregation |
| `/api/admin/comments` | Admin moderation |
| `/api/cv/[id]` | Generate Word DOCX CV |
| `/api/services/parse-course` | AI parse curriculum docs |
| `/api/publications/auto-classify` | Backfill keywords + SDG |

### 3. Data Layer (Supabase PostgreSQL)
- **52+ tables** across 41+ migrations
- **RLS (Row-Level Security)** on user-specific tables
- **JSONB** for flexible arrays (e.g., `instructor_ids`, `travel_participants`, `co_advisors`)
- **Custom enums** for status fields (`researcher_role`, `pub_type`, `student_status`)
- **Materialized views** for analytics (`v_researcher_workload`, `v_engagement_heatmap`, `v_top_pages`)
- **Triggers** for auto-update (e.g., `update_user_comment_count`)
- **Stored functions** for PDPA (`export_user_data`, `cleanup_inactive_guest_users`)

### 4. External Integrations

| Service | Purpose | Cost |
|---|---|---|
| Supabase | DB + Auth + Storage + Realtime | Free tier (500MB DB) |
| Vercel | Hosting + Edge functions | Free tier (100GB bandwidth) |
| Google OAuth | Public user auth | Free |
| ORCID Public API | Researcher works/fundings | Free, no API key |
| OpenAlex API | Citations, h-index, concepts | Free, polite pool with email |
| Google Analytics 4 | Web analytics | Free |
| Crossref API | DOI metadata | Free |
| Anthropic Claude | AI parsing (optional) | Pay-per-use |
| Google Gemini | AI parsing (optional) | Free tier |
| OpenAI | AI parsing (optional) | Pay-per-use |
| Ollama | Local AI (optional) | Free, self-hosted |

## Data Model Highlights

### Core Entities
```
researchers (19 records)
  ├──< publication_authors >── publications (130+ records)
  ├──< grant_members >── grants
  ├──< thesis_committee >── theses ──< students
  ├──< project_members >── project_groups ── project_topics
  ├──< service_members >── academic_services
  └──< training_courses (instructor)
```

### Roles & Permissions
- `unit_role` enum: `head` | `member` | `advisor` | `phd_student`
- Optional flag: `is_pursuing_phd` (member who's also PhD student)
- `phd_advisor_id` — internal PhD supervision relationships

### Public/Anonymous Tracking
```
auth.users (Supabase) ←→ guest_users (PDPA-minimal)
                              │
                              ▼
                          comments (polymorphic)
                          engagement_events (anonymous)
                          consent_log (audit, 5-year retention)
```

## Key Design Decisions

### 1. Why Supabase over Firebase/AWS?
- PostgreSQL with full SQL (no NoSQL limits)
- Built-in RLS — clean user isolation without lambda layers
- Realtime subscriptions for live comments
- Free tier is generous; OSS escape hatch (can self-host)

### 2. Why Next.js App Router (not Pages)?
- Server Components reduce client JS — faster page loads
- Streaming SSR — no waterfall waits
- Layout nesting — shared providers (AuthProvider) without re-mount
- Better for SEO of public pages

### 3. Why ORCID + OpenAlex (not Scopus/WoS)?
- Both **free**, no API key needed (or simple email-based politeness)
- OpenAlex has 250M+ works (more complete than Scopus)
- ORCID is canonical "self-curated" researcher identity
- Scopus/WoS APIs cost USD 5,000-15,000/year

### 4. Why polymorphic comments?
- Same `comments` table works for news/publications/researchers/grants/equipment
- New "commentable" entities = no schema change, just add `target_type` value
- RLS policies are uniform

### 5. Why custom heatmap (not just GA4)?
- GA4 doesn't show day×hour heatmap natively
- Need fine-grained aggregation per page
- PDPA: keep raw events on our servers, not third party

## Performance Considerations

### Bottlenecks identified
- Researcher profile page: N+1 queries for thesis students + publications → use `select('...,nested(...)')` joins
- OpenAlex sync: 100+ API calls in a row → throttle 100ms between calls
- Comments realtime: Supabase channels per page → unsubscribe on unmount

### Caching strategy
- Next.js `dynamic = 'force-dynamic'` for admin/realtime pages
- `fetchCache = 'force-no-store'` to bypass Next.js fetch cache
- Public pages (researcher list, publications) use SSR with revalidation

### Database indexes
- All FK columns have indexes
- Composite indexes for common filters: `(target_type, target_id, created_at DESC)`
- Partial indexes for nullable filters: `WHERE phd_advisor_id IS NOT NULL`

## Security

### Authentication
- **Public users:** Google OAuth → Supabase auth.users → guest_users profile
- **Admin:** simple password compared to env var (single admin model)
- **API endpoints:** check `password` field in body for admin routes

### Authorization
- RLS on `comments`, `guest_users`, `consent_log`, `engagement_events`
- `auth.uid() = user_id` policies for ownership
- `service_role` for admin write access (server-side only)

### Storage
- Two buckets: `images` (public read), `documents` (public read)
- Filename sanitization: `${timestamp}-${random}.${ext}`

### PDPA Compliance
- Consent versioning (`consent_version`)
- Audit trail (`consent_log` retained 5 years)
- Right to access: `export_user_data()` RPC
- Right to erasure: cascade delete via FK
- Storage limitation: auto-cleanup function (run via pg_cron)
- Data minimization: no IP raw, no UA raw, hashed session IDs
- Cookie banner with opt-out

## Deployment Pipeline

```
Local Dev (npm run dev)
        ↓
git commit + push (main branch)
        ↓
GitHub → Vercel (auto-deploy preview/production)
        ↓
Production: https://ce-src-profile.vercel.app
```

### Environment promotion
- **Preview** (pull request): each PR gets unique URL
- **Production** (`main`): auto-deploy on merge

### Database migrations
- Manual: copy-paste SQL into Supabase Dashboard → SQL Editor
- Run in order (see `docs/MIGRATIONS.md`)
- No automated migration tool currently — opportunity to use `supabase migration` in future

## Observability

- Vercel logs (function logs, build logs)
- Supabase Dashboard (slow query log, Auth events)
- GA4 dashboard (`/admin/engagement` aggregation)
- No APM yet — could add Sentry/Datadog if scale grows

## Future Architecture Improvements

1. **Background jobs:** Use Supabase Edge Functions for OpenAlex daily sync
2. **Search:** Add Postgres full-text search or Algolia/Meilisearch
3. **CDN:** Move images to Cloudflare R2 / AWS S3 for global edge
4. **Notification:** Email digest via Resend/SendGrid
5. **Multi-tenancy:** If extending to other research units, add `unit_id` FK
6. **API versioning:** Separate `/api/v1/` once external apps need stability
