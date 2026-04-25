# Features Catalog

รายการฟีเจอร์ทั้งหมดของระบบ CESrc_Profile (อัพเดต เมษายน 2569)

## 1. หน้าสาธารณะ (Public Pages)

### หน้าแรก `/`
- Hero section with gradient blobs (2026 color trends)
- Stats cards: นักวิจัย, ผลงาน, Citations, Avg H-index, ทุนวิจัย
- **Energy Trends 2026** — 9 curated world energy news (Perovskite, Solid-state batteries, Green H₂, V2G, SMR, Fusion, ฯลฯ)
- Upcoming training sessions
- Latest news + IEEE Spectrum feed

### หน้านักวิจัย `/researchers` + `/researchers/[id]`
- รายชื่อแบ่ง 4 กลุ่ม: ที่ปรึกษา, หัวหน้าหน่วย, สมาชิก, นักศึกษาปริญญาเอก
- Card: avatar, role badge, ORCID/OpenAlex badges, citations/H-index/i10
- หน้า profile รายบุคคล:
  - Citation Stats banner (orange→purple gradient)
  - Identifier badges (ORCID, OpenAlex, Scopus, Google Scholar)
  - **PhD relationship section** (ถ้าเป็น นศ.ป.เอก ในหน่วย — แสดง advisor)
  - **PhD advisees section** (ถ้าเป็น advisor — แสดง นศ. ที่ดูแล)
  - Publications (จัดกลุ่มตาม pub_type + ปี)
  - Grants timeline
  - Thesis students (ป.โท/เอก) + projects (ป.ตรี)
  - Sidebar: ทำเนียบลูกศิษย์ที่จบการศึกษา
- **CV Download** (Word DOCX) — IEEE หรือ APA format

### หน้าผลงานตีพิมพ์ `/publications`
- Filter: ปี, ประเภท, ผู้แต่ง, journal
- Sort: ล่าสุด, citations
- DOI link, Open Access badge
- Show keywords + SDG goals

### หน้าทุนวิจัย `/grants`
- ทุนทั้งหมด + status (active/completed/pending)
- รายละเอียดทุน: งบ, ระยะเวลา, สมาชิก, deliverables
- Tracking page (admin): S-curve, milestones

### หน้าบริการวิชาการ `/services`
- Site references: งานบริการวิชาการที่ทำเสร็จแล้ว
- Sub-pages:
  - `/services/training` — หลักสูตรอบรม
  - `/services/consulting` — ที่ปรึกษา & ออกแบบ
  - `/services/request` — ส่งคำขอบริการ

### หน้าหลักสูตรอบรม `/services/training`
- รายการหลักสูตรเปิดรับสมัคร
- Detail page (`[code]`):
  - กำหนดการ (schedule)
  - Modules + competencies
  - เกณฑ์การประเมิน (rubrics)
  - NFT certificate level (Bronze/Silver/Gold/Diamond)
  - Online registration

### หน้าสาขาวิจัย `/research-areas`
- 8-12 areas (Solar, Battery, EV, Wireless Power, Smart Grid, ฯลฯ)
- แต่ละ area แสดง:
  - SDG goals tags
  - Researchers ที่เชี่ยวชาญ
  - Publications ที่เกี่ยวข้อง (matched by keywords)

### หน้าครุภัณฑ์ `/equipment`
- ทะเบียนครุภัณฑ์ + รูป
- ระบบยืม-คืน (`/equipment/borrow`)

### หน้าข่าวสาร `/news` + `/news/[id]`
- Latest news with images, tags, SDG goals
- **Travel Card** — ถ้าเป็นข่าวเดินทางไปราชการ:
  - 📍 สถานที่, 📅 ระยะเวลา, 📋 เลขที่อนุมัติ
  - 💰 งบประมาณ, แหล่งทุน
  - 👥 ผู้ร่วมเดินทาง (links to profiles)
  - 📄 ดูเอกสารอนุมัติ (PDF) + 🔗 ลิงก์ภายนอก
- **Comments** (Google login required):
  - Real-time updates
  - User type badges (นักศึกษา / นักวิจัย / บุคคลทั่วไป)
  - User can delete own; admin can delete any

### หน้านักศึกษา `/students`
- รวม 2 แหล่ง:
  - **นักวิจัยที่เป็น นศ.ป.เอก** จาก researchers table (4 ท่าน + 2 ที่เป็น member ด้วย)
  - **นักศึกษาทั่วไป** จาก students table (ป.ตรี/ป.โท/ป.เอก)
- แสดง advisor + thesis/project + grade

## 2. หน้า Admin (`/admin`)

### Dashboard (`/admin`)
- Quick action cards (15 cards):
  - จัดการข่าวสาร, นำเข้าผลงานตีพิมพ์, จัดการนักศึกษา
  - หัวข้อโครงงาน, จัดการทุนวิจัย, ติดตามทุนวิจัย
  - จัดการครุภัณฑ์, ระบบยืม-คืน
  - จัดการหลักสูตรอบรม, จัดการคำขอบริการ
  - ORCID Integration, OpenAlex Sync
  - **ประเมินภาระงาน, Engagement Analytics**
  - ตั้งค่า AI, Supabase Dashboard
- Google Analytics embed
- Site info card

### จัดการข่าวสาร (`/admin/news`)
- เขียน/แก้ไข/ลบข่าว
- Upload cover + 4 รูป + AI-suggest tags + SDG
- **Travel attachment section** (toggle):
  - ประเภทกิจกรรม (conference/seminar/training/field/meeting/inspection/exhibition/consulting)
  - วัตถุประสงค์, สถานที่, วันที่
  - เลขที่หนังสืออนุมัติ + งบประมาณ + แหล่งทุน
  - **Upload PDF** หนังสืออนุมัติ → bucket `documents`
  - หรือใส่ลิงก์ภายนอก (Google Drive, SharePoint)
  - เลือกผู้ร่วมเดินทาง (multi-select 5+ ท่าน)

### นำเข้าผลงานตีพิมพ์ (`/admin/publications`)
- Bulk import via DOI lookup (Crossref)
- AI-powered author matching → researcher_id
- Preview before commit

### จัดการนักศึกษา (`/admin/students`)
- CRUD students + theses + project members

### หัวข้อโครงงาน (`/admin/projects`)
- ประกาศหัวข้อ ป.ตรี
- ออก token สำหรับ นศ. login มาเลือก

### จัดการทุนวิจัย (`/admin/grants`)
- CRUD grants
- AI parse contract docs
- Upload contracts

### ติดตามทุนวิจัย (`/admin/grants/tracking`)
- Milestones with planned/actual %
- S-curve chart
- Monthly progress logs
- AI analysis

### จัดการครุภัณฑ์ (`/admin/equipment`)
- ทะเบียน, เพิ่ม/ลด/ตัดจำหน่าย
- ระบบยืม-คืน (`/admin/equipment/borrowing`)

### จัดการหลักสูตรอบรม (`/admin/training`)
- CRUD courses + sessions
- Multi-instructor (max 5) from researchers list
- AI parse curriculum docs (file or text input)
  - แยก schedule, modules, evaluation criteria
- Preview before save

### จัดการคำขอบริการ (`/admin/services`)
- Approve/assign/track service requests

### ORCID Integration (`/admin/orcid`)
- Search by ORCID ID or email
- Preview profile + works + fundings (3 tabs)
- Select items + import to DB
- Match to existing researcher

### OpenAlex Sync (`/admin/openalex`)
- ตาราง 19 นักวิจัย: OpenAlex ID, Citations, H-index, i10
- ปุ่ม "Sync All Citations" — อัปเดต stats จาก OpenAlex
- ค้นหา + import publications
- แสดง topics + affiliations

### ประเมินภาระงาน (`/admin/workload`)
- เลือกนักวิจัย + ปี
- Stat cards 8 ใบ:
  - ผลงานปีนี้ / Citations / ทุน active
  - เดินทางปีนี้ + จำนวนวัน
  - หลักสูตรเป็นวิทยากร / งานบริการ / นักศึกษา / เดินทางสะสม
- Travel log (มี PDF/link ปุ่ม)
- Publications, grants, students lists
- 🖨️ Print/PDF button

### Engagement Analytics (`/admin/engagement`)
- 7×24 Heatmap (วัน × ชั่วโมง) gradient intensity
- 30-day activity bar chart
- Top 20 pages
- Live comments + admin delete

### ตั้งค่า AI (`/admin/ai-settings`)
- Provider: Claude / Gemini / OpenAI / Ollama
- API key management
- Model selection
- Test connection

## 3. ระบบ Auth + PDPA

### Google OAuth
- Sign-in button ใน Navbar
- Post-login: `/auth/callback` แสดง consent form (Privacy + Terms + optional marketing)
- Profile creation: display name, user type, institution

### บัญชีของฉัน (`/account`)
- ดู/แก้ไขโปรไฟล์
- 📋 Export ข้อมูล (PDPA Right to Access)
- 🚪 Sign out
- 🗑️ ลบบัญชีและข้อมูลทั้งหมด (Right to Erasure)

### Privacy / Terms (`/privacy-policy`, `/terms`)
- Thai PDPA-compliant content
- Versioned (v1.0)
- Audit log สำหรับการยินยอม

### Cookie Banner
- 2 options: ยอมรับทั้งหมด / เฉพาะที่จำเป็น
- Respects Do Not Track
- localStorage `analytics_opt_out` flag

## 4. AI-Powered Features

### News tag suggestion
- POST `/api/news/suggest-tags`
- Input: title + content
- Output: tags + SDG goals

### Course parsing
- POST `/api/services/parse-course`
- Input: PDF/DOCX file or text
- Output: schedule, modules, evaluation criteria

### Publication auto-classify
- POST `/api/publications/auto-classify`
- Backfill keywords from OpenAlex concepts
- Tag with SDG goals + research areas

### Author matching
- AI matches authors_raw to researcher records

### Grant analysis
- AI analyzes grant progress logs

## 5. CV Generation

- POST `/api/cv/[id]?format=ieee|apa`
- Generates Word DOCX with:
  1. Personal info + ORCID
  2. Education
  3. Position
  4. Expertise
  5. Publications (formatted by style)
  6. Grants
  7. Patents
  8. **Academic services** (with hours, dates)
  9. **Instructor history** (training courses + sessions)
  10. References

## 6. NFT Credentials (Training)

- Levels: Bronze (LEVEL_2), Silver (LEVEL_3), Gold (LEVEL_4), Diamond (LEVEL_5)
- Issued via blockchain (separate service)
- Linked to competency assessment

## 7. Public APIs

| Endpoint | Use case |
|---|---|
| `GET /api/researchers` | List for dropdowns |
| `GET /api/news` | News feed |
| `GET /api/orcid/[id]` | ORCID lookup |
| `GET /api/openalex/[id]` | OpenAlex lookup |
| `GET /api/workload/[id]?year=YYYY` | Workload report |
| `GET /api/engagement/stats` | Public stats (admin only) |
| `POST /api/engagement/track` | Anonymous event |

## Roadmap (เพิ่มเติม)

### Done
- ✅ ORCID + OpenAlex integration
- ✅ Travel attachment + workload
- ✅ Comments + heatmap (PDPA)
- ✅ Multi-instructor training
- ✅ AI document parsing

### In progress / Next
- ⏳ Publication auto-classify (keyword extraction from OpenAlex)
- ⏳ Email notifications (Resend/SendGrid)
- ⏳ Mobile app (read-only)
- ⏳ Search (full-text PostgreSQL or Algolia)
- ⏳ Multi-tenancy (other research units)
