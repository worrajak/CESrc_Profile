# CESRU Researcher Profile System

ระบบฐานข้อมูลนักวิจัย หน่วยวิจัยระบบพลังงานสะอาด (CESRU)
คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **CV Export**: docx (IEEE & APA formats)
- **Deployment**: Docker / Dokploy / RepoCloud

## Features

- Researcher profiles with Thai/English names
- Publication listing with Scopus/WoS indexing
- Author role classification (First/Corresponding/Co/Last Author)
- Research grant management
- Academic services tracking
- CV export as .docx (IEEE and APA citation formats)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/worrajak/CESrc_Profile.git
cd CESrc_Profile

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Set up Supabase database
# Run supabase/001_schema.sql in Supabase SQL Editor
# Run supabase/002_seed_data.sql for verified seed data

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to RepoCloud (Dokploy)

1. Deploy **Dokploy** on RepoCloud (one-click)
2. In Dokploy, create a new Project → Application → connect this GitHub repo
3. Set Build Type: **Dockerfile**
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy → set custom domain + SSL

## Deploy with Docker

```bash
docker build -t cesru-profile .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  cesru-profile
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page
│   │   ├── researchers/        # Researcher list & profile
│   │   ├── publications/       # Publications list
│   │   ├── grants/             # Grants list
│   │   ├── services/           # Academic services
│   │   └── api/cv/[id]/        # CV download API (IEEE/APA)
│   ├── components/             # Shared UI components
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client + types
│   │   └── roleResolver.ts     # Author role classification
│   └── utils/
│       └── generateCV.js       # Standalone CV generator (CLI)
├── supabase/
│   ├── 001_schema.sql          # Database schema
│   └── 002_seed_data.sql       # Verified seed data
├── Dockerfile                  # Production Docker build
├── docker-compose.yml          # Docker Compose config
└── .env.local.example          # Environment template
```

## Data Policy

All data in this system is verified from academic databases (Scopus, Web of Science, DOI).
No fabricated or simulated data is used, even for testing purposes.

## License

MIT
