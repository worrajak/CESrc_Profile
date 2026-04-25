# Setup & Deployment Guide

วิธี setup โปรเจกต์ CESrc_Profile ตั้งแต่ local development ถึง production deployment

## Prerequisites

- Node.js 18+ (recommend 20 LTS)
- npm หรือ pnpm
- Supabase account (free tier OK)
- Vercel account (free tier OK)
- Google Cloud Console account (for OAuth)

## 1. Local Development Setup

### Clone & install

```bash
git clone https://github.com/worrajak/CESrc_Profile.git
cd CESrc_Profile
npm install
```

### Environment variables

สร้างไฟล์ `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Admin (required)
ADMIN_PASSWORD=your_secure_password

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# AI Providers (optional, choose one or more)
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...

# Default AI provider for AI-suggest features
DEFAULT_AI_PROVIDER=gemini  # or 'claude', 'openai', 'ollama'
```

### Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

## 2. Supabase Setup

### Create project
1. https://supabase.com/dashboard → New Project
2. Choose region: Singapore (closest to Thailand)
3. Save the URL + anon key for `.env.local`

### Run database migrations
1. Open Supabase Dashboard → SQL Editor
2. Run each `supabase/*.sql` file in order (see `docs/MIGRATIONS.md`)
3. ลำดับสำคัญ — หากเจอ error อ่านวิธีแก้ใน MIGRATIONS.md

### Enable Storage buckets
1. Storage → New Bucket
2. Create:
   - `images` (public)
   - `documents` (public — for travel approvals, CVs, contracts)

### Enable Google OAuth (สำหรับ public comments)
1. Authentication → Providers → Google → Enable
2. Get Client ID + Secret from Google Cloud Console:
   - https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (Web application)
   - **Authorized redirect URIs**:
     ```
     https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback
     ```
3. Paste Client ID + Secret into Supabase
4. **Site URL** (Auth settings):
   - Production: `https://your-domain.com`
   - Preview: leave blank or use Vercel preview URL pattern
5. **Additional Redirect URLs**:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://your-domain.com/auth/callback` (prod)

### Optional: Schedule cleanup
Supabase Dashboard → Database → Extensions → Enable `pg_cron`

```sql
-- Run cleanup daily at 3 AM
SELECT cron.schedule(
  'cleanup-inactive-users',
  '0 3 * * *',
  $$ SELECT cleanup_inactive_guest_users(); $$
);
```

## 3. Production Deployment (Vercel)

### Initial deploy
1. Push to GitHub: `git push origin main`
2. Vercel Dashboard → New Project → Import GitHub repo
3. Framework Preset: Next.js (auto-detected)
4. Add environment variables (same as `.env.local`)
5. Deploy

### Custom domain
1. Vercel → Settings → Domains → Add `your-domain.com`
2. Update DNS A record to Vercel IP
3. Update Supabase **Site URL** + **Authorized Redirects**

### Auto-deploy on push
- Default: every push to `main` triggers deploy
- Pull requests: get preview deploy URL
- Configure in Vercel → Settings → Git

## 4. Initial Data Setup

### Add researchers
1. Run `002_seed_data.sql` — adds 10 initial researchers
2. Run `008_new_members_orcid.sql` — adds 3 more with publications
3. Run `038_add_new_researchers.sql` — adds 5 more (Apr 2026)

### Sync with ORCID/OpenAlex
1. Login as admin (use `ADMIN_PASSWORD`)
2. Visit `/admin/orcid` → search by ORCID ID → import
3. Visit `/admin/openalex` → "Sync All Citations" → updates stats

### Add publications
- Manual: `/admin/publications` → enter DOI → fetch metadata
- Bulk: import via SQL migrations (see existing patterns)
- Auto-classify: `POST /api/publications/auto-classify` (admin)

## 5. Daily Operations

### Adding news
1. `/admin/news` → "+ เขียนข่าวใหม่"
2. Fill content, upload images
3. (Optional) Toggle "เป็นการเดินทางไปราชการ" + upload PDF
4. AI-suggest tags → review → publish

### Approve service requests
1. `/admin/services` → see pending requests
2. Assign to researcher → mark in_progress → completed

### Sync external data
- ORCID/OpenAlex citations: monthly via `/admin/openalex` → "Sync All"
- Or set up cron job (Supabase Edge Function in future)

### Backup
```bash
# Manual backup
supabase db dump -f backup-$(date +%Y%m%d).sql --data-only

# Or use Supabase Dashboard → Backups (auto-daily on paid plans)
```

## 6. Monitoring

### Vercel
- Real-time logs: Vercel Dashboard → Project → Logs
- Function metrics: Speed Insights tab

### Supabase
- Database: Dashboard → Database → Performance
- Auth events: Authentication → Users
- Storage usage: Storage → Settings

### Google Analytics
- https://analytics.google.com → select property
- Realtime users + behavior flow

### Custom analytics
- `/admin/engagement` → heatmap + top pages

## 7. Common Issues

### "Application error: a server-side exception has occurred"
- Check Vercel logs for actual error
- Common cause: SQL migration not yet run → column doesn't exist
- Fix: Run pending migrations in `supabase/`

### "row-level security policy violation"
- RLS policies missing or wrong
- Run RLS fix migrations (e.g., `029_fix_grants_rls.sql`)

### Google OAuth redirect mismatch
- Check Supabase Auth Settings → Site URL + Redirects match Google Console
- Verify: `https://...supabase.co/auth/v1/callback` is in Google's authorized redirects

### Slow initial page load
- Check Supabase region (should be Singapore for TH users)
- Enable Vercel Edge functions for static pages
- Reduce SSR payload (use `export const revalidate = 60` for cacheable pages)

### "No publications shown on research-areas page"
- Publications need `keywords` populated to match
- Run `POST /api/publications/auto-classify` (admin password) to backfill

## 8. Maintenance Checklist

### Weekly
- [ ] Review pending service requests
- [ ] Approve new comments (or delete inappropriate)
- [ ] Check `/admin/engagement` for unusual traffic

### Monthly
- [ ] Run OpenAlex Sync (`/admin/openalex`)
- [ ] Update news cover images for old posts
- [ ] Review `/admin/workload` reports

### Quarterly
- [ ] Update Privacy Policy version if changed
- [ ] Review and rotate AI API keys
- [ ] Backup full database
- [ ] Review user feedback (`/admin/engagement` comments)

### Yearly
- [ ] Generate annual workload reports for all researchers
- [ ] Update stats in `data/energy-trends.ts`
- [ ] Renew domain + SSL (if not auto-renew)

## 9. Troubleshooting Commands

```bash
# View dependencies
npm list --depth=0

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (for production preview)
npm run build && npm start

# Reset Tailwind cache
rm -rf .next/

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

## 10. Contact & Support

- **Maintainer:** Worrajak Muangjai (worrajak@rmutl.ac.th)
- **Repository:** https://github.com/worrajak/CESrc_Profile
- **Production:** https://ce-src-profile.vercel.app
- **Issues:** https://github.com/worrajak/CESrc_Profile/issues
