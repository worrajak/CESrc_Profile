# เอกสารตรวจรับงาน (Acceptance Document)

## ระบบฐานข้อมูลโปรไฟล์นักวิจัย CESRU
### CESRU Researcher Profile System (CESrc_Profile)

---

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อระบบ** | CESRU Researcher Profile System |
| **หน่วยงาน** | หน่วยวิจัยระบบพลังงานสะอาด (CESRU) คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา |
| **Repository** | https://github.com/worrajak/CESrc_Profile |
| **วันที่เริ่มพัฒนา** | 27 มีนาคม 2569 |
| **วันที่ส่งมอบ** | 12 เมษายน 2569 |
| **จำนวน Commits** | 77 commits |
| **เวอร์ชัน** | 0.1.0 |

---

## 1. สถาปัตยกรรมระบบ (System Architecture)

| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **ภาษา** | TypeScript |
| **UI** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **AI System** | Multi-provider: Claude, Gemini, GPT, Local (Ollama) |
| **Blockchain** | TRON Nile Testnet (NFT Credentials) |
| **Analytics** | Google Analytics 4 |
| **File Storage** | Supabase Storage |

### สถิติโค้ด

| รายการ | จำนวน |
|--------|-------|
| หน้าเว็บ (Pages) | 31 หน้า |
| API Routes | 20 routes |
| Components | 7 components |
| SQL Migrations | 39 ไฟล์ |
| Database Tables | 52 ตาราง |
| TypeScript Code | ~16,775 บรรทัด |
| SQL Code | ~5,677 บรรทัด |

---

## 2. รายการโมดูลและฟีเจอร์ (Module Checklist)

### 2.1 โมดูลหน้าสาธารณะ (Public Pages)

| # | ฟีเจอร์ | หน้า | สถานะ |
|---|---------|------|--------|
| 1 | หน้าแรก — แสดงภาพรวม, ข่าวสาร, หลักสูตรอบรมที่กำลังจะมาถึง | `/` | ✅ |
| 2 | ข่าวสาร — รายการข่าว, รายละเอียดข่าว, รูปภาพ, แท็ก | `/news`, `/news/[id]` | ✅ |
| 3 | นักวิจัย — รายการนักวิจัย, โปรไฟล์รายบุคคล, ผลงาน, ทุน, สิทธิบัตร | `/researchers`, `/researchers/[id]` | ✅ |
| 4 | ผลงานตีพิมพ์ — รายการผลงาน, กรองตามประเภท/ปี, Scopus/WoS/TCI index | `/publications` | ✅ |
| 5 | สาขาวิจัย — รายการสาขา, รายละเอียดพร้อมผลงานที่เกี่ยวข้อง | `/research-areas`, `/research-areas/[id]` | ✅ |
| 6 | ทุนวิจัย — Multi-card layout, progress bar, S-Curve, milestone tracking | `/grants`, `/grants/[id]` | ✅ |
| 7 | สิทธิบัตร — รายการสิทธิบัตร/อนุสิทธิบัตร | `/patents` | ✅ |
| 8 | นักศึกษา — รายการ นศ. ป.ตรี-เอก, สถานะ, หัวข้อวิจัย | `/students` | ✅ |
| 9 | ครุภัณฑ์ — ทะเบียนครุภัณฑ์, ฟอร์มยืม-คืน | `/equipment`, `/equipment/borrow` | ✅ |
| 10 | บริการวิชาการ (ภาพรวม) — ผลงานบริการวิชาการทั้งหมด | `/services` | ✅ |
| 11 | หลักสูตรอบรม — รายการหลักสูตร, รายละเอียด, สมัครอบรม | `/services/training`, `/services/training/[code]` | ✅ |
| 12 | ที่ปรึกษาและออกแบบ — Portfolio ผลงานที่ปรึกษา | `/services/consulting` | ✅ |
| 13 | ส่งคำขอบริการ — ฟอร์มส่งคำขอ, AI แยกเอกสาร | `/services/request` | ✅ |
| 14 | ติดตามคำขอบริการ — สถานะ, Timeline, Blockchain TX | `/services/track/[code]` | ✅ |

### 2.2 โมดูล Admin (Admin Pages)

| # | ฟีเจอร์ | หน้า | สถานะ |
|---|---------|------|--------|
| 15 | Admin Dashboard — ภาพรวม, Quick Actions, GA Analytics | `/admin` | ✅ |
| 16 | จัดการข่าวสาร — CRUD ข่าว, อัปโหลดรูป, AI แนะนำแท็ก | `/admin/news` | ✅ |
| 17 | นำเข้าผลงานตีพิมพ์ — DOI import, Citation parse (AI), จับคู่นักวิจัย | `/admin/publications` | ✅ |
| 18 | จัดการนักศึกษา — CRUD นักศึกษา ป.ตรี-เอก | `/admin/students` | ✅ |
| 19 | หัวข้อโครงงาน — ประกาศหัวข้อ, ออก Token, จับคู่ นศ. | `/admin/projects` | ✅ |
| 20 | จัดการทุนวิจัย — CRUD ทุน, แนบเอกสาร, AI กรอกข้อมูล, จัดการทีม | `/admin/grants` | ✅ |
| 21 | ติดตามทุนวิจัย — Milestones, S-Curve, AI วิเคราะห์เอกสาร, แจ้งเตือน | `/admin/grants/tracking` | ✅ |
| 22 | จัดการครุภัณฑ์ — ทะเบียนครุภัณฑ์, เพิ่ม/ลด/ตัดจำหน่าย | `/admin/equipment` | ✅ |
| 23 | ระบบยืม-คืนครุภัณฑ์ — อนุมัติ/คืน/ติดตามเกินกำหนด | `/admin/equipment/borrowing` | ✅ |
| 24 | จัดการบริการวิชาการ — อนุมัติ/มอบหมาย/ติดตามคำขอ, AI สร้างหลักสูตร | `/admin/services` | ✅ |
| 25 | ตั้งค่า AI — กรอก API Key, เลือกโมเดล, ทดสอบเชื่อมต่อ | `/admin/ai-settings` | ✅ |

### 2.3 API Routes

| # | API | Method | คำอธิบาย | สถานะ |
|---|-----|--------|----------|--------|
| 26 | `/api/admin/auth` | POST | ยืนยันตัวตน Admin | ✅ |
| 27 | `/api/admin/ai-config` | GET/POST/DELETE | CRUD ตั้งค่า AI Provider + API Key | ✅ |
| 28 | `/api/admin/ai-test` | POST | ทดสอบเชื่อมต่อ AI Provider | ✅ |
| 29 | `/api/admin/grants/upload` | POST | อัปโหลดเอกสารทุนวิจัย | ✅ |
| 30 | `/api/cv/[id]` | GET | สร้างไฟล์ CV (.docx) นักวิจัย | ✅ |
| 31 | `/api/news` | GET/POST | CRUD ข่าวสาร | ✅ |
| 32 | `/api/news/[id]` | PUT/DELETE | แก้ไข/ลบข่าว | ✅ |
| 33 | `/api/news/suggest-tags` | POST | AI แนะนำแท็กข่าว | ✅ |
| 34 | `/api/publications/import-doi` | POST | นำเข้าผลงานจาก DOI (CrossRef) | ✅ |
| 35 | `/api/publications/parse-citation` | GET/POST | AI แยกข้อมูลจาก Citation | ✅ |
| 36 | `/api/publications/match-authors` | POST | จับคู่ผู้แต่งกับนักวิจัยในระบบ | ✅ |
| 37 | `/api/publications/save` | POST | บันทึกผลงานตีพิมพ์ | ✅ |
| 38 | `/api/grants/parse-contract` | GET/POST | AI วิเคราะห์เอกสารข้อเสนอ/สัญญาทุน | ✅ |
| 39 | `/api/grants/tracking` | GET/POST | CRUD Milestones, Progress, Alerts | ✅ |
| 40 | `/api/services/request` | POST | ส่งคำขอบริการวิชาการ | ✅ |
| 41 | `/api/services/parse-document` | GET/POST | AI แยกข้อมูลจากเอกสารสมัคร | ✅ |
| 42 | `/api/services/parse-course` | GET/POST | AI วิเคราะห์เอกสารหลักสูตร | ✅ |
| 43 | `/api/services/enroll` | POST | สมัครอบรมออนไลน์ | ✅ |
| 44 | `/api/scholar-news` | GET | ข่าวสาร Google Scholar | ✅ |
| 45 | `/api/upload` | POST | อัปโหลดไฟล์ทั่วไป | ✅ |

### 2.4 ระบบ AI อัจฉริยะ (AI System)

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 46 | Multi-Provider AI | รองรับ Claude, Gemini, GPT, Local (Ollama) | ✅ |
| 47 | API Key จาก DB | เก็บ API Key ในฐานข้อมูล แทน .env | ✅ |
| 48 | เลือก Model ได้ | dropdown + พิมพ์ชื่อ model เองได้ | ✅ |
| 49 | AI วิเคราะห์ Citation | แยกชื่อ, ผู้แต่ง, วารสาร, DOI จาก citation text | ✅ |
| 50 | AI วิเคราะห์เอกสารทุน | แยก Milestones, สิ่งส่งมอบ, แผน S-Curve | ✅ |
| 51 | AI กรอกฟอร์มทุน | upload เอกสาร → กรอกข้อมูลทุนอัตโนมัติ | ✅ |
| 52 | AI สร้างหลักสูตร | วิเคราะห์เอกสารหลักสูตร → สร้างโมดูล/สมรรถนะ/ตัวชี้วัด | ✅ |
| 53 | AI แยกเอกสารสมัคร | scan เอกสารส่วนตัว → กรอกฟอร์มสมัครอบรม | ✅ |
| 54 | AI แนะนำแท็กข่าว | วิเคราะห์เนื้อหาข่าว → แนะนำแท็กที่เกี่ยวข้อง | ✅ |
| 55 | ทดสอบ AI Connection | ทดสอบเชื่อมต่อ + แสดง Latency | ✅ |

### 2.5 ระบบติดตามทุนวิจัย (Grant Tracking)

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 56 | Milestones | สร้าง/แก้ไข/ลบ จุดตรวจสอบ พร้อมน้ำหนัก % | ✅ |
| 57 | Deliverables | สิ่งส่งมอบย่อยภายใต้ Milestone | ✅ |
| 58 | Progress Logging | บันทึก % แผน vs จริง รายเดือน | ✅ |
| 59 | S-Curve Chart | กราฟ Canvas แสดง Planned vs Actual (ไม่ใช้ library ภายนอก) | ✅ |
| 60 | Auto-Alert System | แจ้งเตือนอัตโนมัติเมื่อล่าช้า >10% / >20% | ✅ |
| 61 | Tracking Status | ตามแผน / ล่าช้าเล็กน้อย / ล่าช้า / วิกฤต | ✅ |
| 62 | AI Import | Upload เอกสาร → นำเข้า Milestones + S-Curve baseline | ✅ |
| 63 | Multi-card Display | แสดงหลาย card แยกตามสถานะ Active/Completed | ✅ |

### 2.6 ระบบฝึกอบรม (Training Platform)

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 64 | หลักสูตรอบรม | รายการหลักสูตร, โมดูล, สมรรถนะ, ตัวชี้วัด | ✅ |
| 65 | 3-Step Enrollment | เลือกประเภท → กรอกข้อมูล → ยืนยัน | ✅ |
| 66 | แยกประเภทผู้อบรม | นักศึกษา / บุคลากร / บุคคลทั่วไป / องค์กร (ราคาต่างกัน) | ✅ |
| 67 | AI กรอกฟอร์มสมัคร | scan เอกสาร → auto-fill ข้อมูลส่วนตัว | ✅ |
| 68 | Competency Evaluation | สมรรถนะ 3 ด้าน (ความรู้/ทักษะ/เจตคติ) + Rubric 4 ระดับ | ✅ |
| 69 | NFT Credentials | 5 ระดับ: none/bronze/silver/gold/diamond | ✅ |
| 70 | หลักสูตรบนหน้าแรก | แสดงหลักสูตรที่กำลังจะเปิด + countdown | ✅ |

### 2.7 ระบบบริการวิชาการ (Academic Services)

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 71 | ส่งคำขอบริการ | ฟอร์มออนไลน์ + tracking code (TRN-YYMM-XXXX) | ✅ |
| 72 | ติดตามคำขอ | Timeline + สถานะ + Blockchain TX links | ✅ |
| 73 | Portfolio ที่ปรึกษา | ผลงานที่ปรึกษา, ขั้นตอนบริการ, CTA | ✅ |
| 74 | Admin จัดการคำขอ | อนุมัติ/มอบหมาย/ติดตาม | ✅ |

### 2.8 ระบบครุภัณฑ์ (Equipment System)

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 75 | ทะเบียนครุภัณฑ์ | รายการ, สถานะ, รูปภาพ, QR Code | ✅ |
| 76 | ระบบยืม-คืน | ฟอร์มยืม, อนุมัติ, คืน, ติดตามเกินกำหนด | ✅ |
| 77 | Admin จัดการ | เพิ่ม/แก้ไข/ตัดจำหน่าย | ✅ |

### 2.9 Components & Shared

| # | ฟีเจอร์ | รายละเอียด | สถานะ |
|---|---------|-----------|--------|
| 78 | Navbar | Responsive, dropdown บริการวิชาการ, mobile menu | ✅ |
| 79 | Footer | 4 คอลัมน์, ลิงก์บริการ, ที่อยู่ | ✅ |
| 80 | S-Curve Chart | Canvas component, Planned vs Actual, Today line | ✅ |
| 81 | Google Analytics | GA4 tracking ทุกหน้า | ✅ |
| 82 | CV Export | สร้าง .docx CV นักวิจัย (IEEE/APA format) | ✅ |

---

## 3. ฐานข้อมูล (Database Schema)

### ตารางหลัก (52 ตาราง)

| กลุ่ม | ตาราง | จำนวน |
|-------|-------|-------|
| **นักวิจัย** | researchers, publications, publication_authors, patents, patent_inventors | 5 |
| **ทุนวิจัย** | grants, grant_members, grant_milestones, grant_deliverables, grant_progress_logs, grant_alerts | 6 |
| **สาขาวิจัย** | research_areas, research_area_search_terms | 2 |
| **ข่าวสาร** | news, news_images, news_theses, news_research_areas, news_publications, news_services | 6 |
| **นักศึกษา** | students, theses, thesis_committee, thesis_publications, external_persons, student_milestones | 6 |
| **โครงงาน** | project_topics, project_groups, project_members, project_committee, project_publications, student_access_tokens | 6 |
| **ฝึกอบรม** | training_courses, training_sessions, course_modules, credential_levels, trainees, enrollments, module_scores, trainee_credentials | 8 |
| **สมรรถนะ** | module_competencies, competency_indicators, indicator_scores, evaluation_templates | 4 |
| **บริการ** | academic_services, service_members, service_requests, service_timeline | 4 |
| **ครุภัณฑ์** | equipment, borrow_requests | 2 |
| **อื่นๆ** | datasets, dataset_publications, dataset_news, ai_config | 4 |

### SQL Migrations (39 ไฟล์)

```
001_schema.sql              → ตารางหลัก (researchers, publications, grants, patents)
002_seed_researchers.sql    → ข้อมูลนักวิจัยเริ่มต้น
003-013                     → ข้อมูลผลงาน, ข่าว, นักวิจัยเพิ่มเติม
014_students_theses.sql     → ระบบนักศึกษา/วิทยานิพนธ์
015_news_links_datasets.sql → เชื่อมโยงข่าว + datasets
016_project_topics.sql      → ระบบหัวข้อโครงงาน
017_student_milestones.sql  → ความก้าวหน้า นศ.
018-020                     → บริการวิชาการ, สิทธิบัตร, RLS
021-023                     → ระบบครุภัณฑ์ + ยืม-คืน
024_grants_contract_file.sql→ เอกสารแนบทุนวิจัย
025_training_platform.sql   → ระบบฝึกอบรม
025a_fix_training_columns.sql → แก้ไข schema ฝึกอบรม
026_competency_evaluation.sql → ระบบสมรรถนะ + AI config
027_grant_tracking.sql      → ระบบติดตามทุนวิจัย
028_update_ai_models.sql    → อัปเดต AI models ล่าสุด
029_fix_grants_rls.sql      → แก้ไข RLS policy
```

---

## 4. รายการ AI Models ที่รองรับ

| Provider | Default Model | Models ทั้งหมด |
|----------|--------------|---------------|
| **Anthropic Claude** | claude-sonnet-4-20250514 | claude-sonnet-4, claude-opus-4, claude-haiku-3.5 |
| **Google Gemini** | gemini-2.5-flash | gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash |
| **OpenAI GPT** | gpt-4.1 | gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o4-mini |
| **Local (Ollama)** | llama4-scout | llama4-scout, llama4-maverick, llama3.3, gemma3, mistral |

สามารถเพิ่ม/แก้ไข model ได้จากหน้า Admin AI Settings โดยไม่ต้องแก้โค้ด

---

## 5. ข้อกำหนดการติดตั้ง (Deployment Requirements)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase Anon Key
ADMIN_PASSWORD=                  # รหัสผ่าน Admin
NEXT_PUBLIC_GA_ID=              # Google Analytics 4 ID (optional)
```

### ขั้นตอนการติดตั้ง

1. Clone repository
2. `npm install`
3. ตั้งค่า `.env.local`
4. รัน SQL migrations ตามลำดับ (001 → 029) ใน Supabase Dashboard
5. `npm run build && npm start`

---

## 6. สรุปผลการส่งมอบ

| รายการ | จำนวน | สถานะ |
|--------|-------|--------|
| หน้าเว็บสาธารณะ | 14 หน้า | ✅ ครบ |
| หน้า Admin | 11 หน้า | ✅ ครบ |
| API Routes | 20 routes | ✅ ครบ |
| ระบบ AI | 10 ฟีเจอร์ | ✅ ครบ |
| ระบบติดตามทุน | 8 ฟีเจอร์ | ✅ ครบ |
| ระบบฝึกอบรม | 7 ฟีเจอร์ | ✅ ครบ |
| ระบบบริการวิชาการ | 4 ฟีเจอร์ | ✅ ครบ |
| ระบบครุภัณฑ์ | 3 ฟีเจอร์ | ✅ ครบ |
| Components | 5 shared components | ✅ ครบ |
| Database | 52 ตาราง, 39 migrations | ✅ ครบ |
| **รวมทั้งหมด** | **82 รายการ** | **✅ ครบทั้งหมด** |

---

## 7. ลงนามตรวจรับ

| | ผู้ส่งมอบ | ผู้ตรวจรับ |
|---|----------|----------|
| **ชื่อ** | _________________________ | _________________________ |
| **ตำแหน่ง** | _________________________ | _________________________ |
| **วันที่** | ____/____/________ | ____/____/________ |
| **ลายเซ็น** | _________________________ | _________________________ |

---

*เอกสารฉบับนี้สร้างโดยอัตโนมัติจากข้อมูลระบบ CESrc_Profile*
*Generated: 12 April 2026*
