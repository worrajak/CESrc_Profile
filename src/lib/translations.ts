/**
 * Translation Dictionaries — Thai/English
 *
 * Organize by namespace. Use dot notation: 'nav.home', 'footer.copyright', etc.
 * Add new strings here, then use t('namespace.key') in components.
 */

export type Locale = 'th' | 'en';

export const TRANSLATIONS = {
  // === Navbar ===
  'nav.home': { th: 'หน้าแรก', en: 'Home' },
  'nav.news': { th: 'ข่าวสาร', en: 'News' },
  'nav.researchers': { th: 'นักวิจัย', en: 'Researchers' },
  'nav.research_areas': { th: 'สาขาวิจัย', en: 'Research Areas' },
  'nav.publications': { th: 'ผลงานตีพิมพ์', en: 'Publications' },
  'nav.grants': { th: 'ทุนวิจัย', en: 'Grants' },
  'nav.research_plan': { th: 'แผนวิจัย', en: 'Research Plan' },
  'nav.students': { th: 'นักศึกษา', en: 'Students' },
  'nav.equipment': { th: 'ครุภัณฑ์', en: 'Equipment' },
  'nav.services': { th: 'บริการวิชาการ', en: 'Services' },
  'nav.services.references': { th: 'ผลงานบริการวิชาการ', en: 'Site References' },
  'nav.services.references_subtitle': { th: 'Site References', en: 'Past projects' },
  'nav.services.training': { th: 'หลักสูตรอบรม', en: 'Training Courses' },
  'nav.services.training_subtitle': { th: 'Training & NFT Certificate', en: 'Training & NFT Certificate' },
  'nav.services.consulting': { th: 'ที่ปรึกษา & ออกแบบ', en: 'Consulting & Design' },
  'nav.services.consulting_subtitle': { th: 'Consulting & Design', en: 'Engineering services' },
  'nav.services.request': { th: 'ส่งคำขอบริการ', en: 'Service Request' },
  'nav.services.request_subtitle': { th: 'Service Request', en: 'Submit a request' },
  'nav.signin': { th: 'เข้าสู่ระบบ', en: 'Sign in' },
  'nav.signout': { th: 'ออกจากระบบ', en: 'Sign out' },
  'nav.account': { th: 'บัญชีของฉัน', en: 'My Account' },
  'nav.user_type.student': { th: '🎓 นักศึกษา', en: '🎓 Student' },
  'nav.user_type.researcher': { th: '🔬 นักวิจัย', en: '🔬 Researcher' },
  'nav.user_type.general': { th: '👤 บุคคลทั่วไป', en: '👤 General Public' },

  // === Footer ===
  'footer.unit_subtitle': { th: 'หน่วยวิจัยระบบพลังงานสะอาด', en: 'Clean Energy System Research Unit' },
  'footer.faculty': {
    th: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา',
    en: 'Faculty of Engineering, Rajamangala University of Technology Lanna',
  },
  'footer.research_areas_title': { th: 'สาขาวิจัย', en: 'Research Areas' },
  'footer.services_title': { th: 'บริการวิชาการ', en: 'Services' },
  'footer.address_title': { th: 'ที่อยู่', en: 'Address' },
  'footer.address_line1': { th: 'Faculty of Engineering', en: 'Faculty of Engineering' },
  'footer.address_line2': { th: 'Rajamangala University of Technology Lanna', en: 'Rajamangala University of Technology Lanna' },
  'footer.address_line3': { th: '128 ถ.ห้วยแก้ว ต.ช้างเผือก', en: '128 Huai Kaeo Rd., Chang Phueak' },
  'footer.address_line4': { th: 'อ.เมือง จ.เชียงใหม่ 50300', en: 'Mueang District, Chiang Mai 50300, Thailand' },
  'footer.copyright': {
    th: '© {year} CESRU - RMUTL. All rights reserved.',
    en: '© {year} CESRU - RMUTL. All rights reserved.',
  },
  'footer.verified_only': {
    th: 'แสดงเฉพาะผลงานที่ผ่านการยืนยันจากฐานข้อมูลวิชาการ',
    en: 'Only verified publications from academic databases are shown',
  },
  'footer.contact': { th: 'ติดต่อเรา', en: 'Contact Us' },
  'footer.privacy': { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
  'footer.terms': { th: 'ข้อกำหนดการใช้งาน', en: 'Terms of Service' },

  // === Common buttons & actions ===
  'common.save': { th: 'บันทึก', en: 'Save' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'common.delete': { th: 'ลบ', en: 'Delete' },
  'common.edit': { th: 'แก้ไข', en: 'Edit' },
  'common.add': { th: 'เพิ่ม', en: 'Add' },
  'common.close': { th: 'ปิด', en: 'Close' },
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'common.view_all': { th: 'ดูทั้งหมด', en: 'View All' },
  'common.search': { th: 'ค้นหา', en: 'Search' },
  'common.back': { th: 'ย้อนกลับ', en: 'Back' },
  'common.next': { th: 'ถัดไป', en: 'Next' },
  'common.read_more': { th: 'อ่านเพิ่มเติม', en: 'Read More' },
  'common.see_details': { th: 'ดูรายละเอียด', en: 'See Details' },
  'common.no_data': { th: 'ยังไม่มีข้อมูล', en: 'No data available' },

  // === Researcher Card / Profile ===
  'researcher.role.advisor': { th: 'ที่ปรึกษา', en: 'Advisor' },
  'researcher.role.head': { th: 'หัวหน้าหน่วยฯ', en: 'Unit Head' },
  'researcher.role.member': { th: 'สมาชิก', en: 'Member' },
  'researcher.role.phd_student': { th: 'นศ. ปริญญาเอก', en: 'PhD Student' },
  'researcher.role.researcher_phd': { th: '+ นศ.ป.เอก', en: '+ PhD Student' },
  'researcher.cited': { th: 'cited', en: 'cited' },
  'researcher.expertise': { th: 'สาขาความเชี่ยวชาญ', en: 'Areas of Expertise' },
  'researcher.publications': { th: 'ผลงานตีพิมพ์', en: 'Publications' },
  'researcher.grants': { th: 'ทุนวิจัย', en: 'Research Grants' },
  'researcher.email': { th: 'Email', en: 'Email' },
  'researcher.phd_section': { th: 'กำลังศึกษาปริญญาเอก', en: 'Pursuing PhD' },
  'researcher.phd_advisor': { th: 'อาจารย์ที่ปรึกษาวิทยานิพนธ์', en: 'PhD Advisor' },
  'researcher.phd_advisees': { th: 'นักศึกษา ป.เอก ในความดูแล', en: 'PhD Advisees' },
  'researcher.download_cv': { th: 'Download CV', en: 'Download CV' },

  // === Researchers List Page ===
  'researchers.page_title': { th: 'ทีมนักวิจัย', en: 'Research Team' },
  'researchers.page_subtitle': {
    th: 'สมาชิกหน่วยวิจัยระบบพลังงานสะอาด (CESRU) คณะวิศวกรรมศาสตร์ มทร.ล้านนา',
    en: 'Clean Energy System Research Unit (CESRU), Faculty of Engineering, RMUTL',
  },
  'researchers.section.advisor': { th: 'ที่ปรึกษาหน่วยวิจัย', en: 'Advisors' },
  'researchers.section.head': { th: 'หัวหน้าหน่วยวิจัย', en: 'Unit Head' },
  'researchers.section.member': { th: 'สมาชิก', en: 'Members' },
  'researchers.section.phd_student': { th: 'นักศึกษาปริญญาเอก', en: 'PhD Students' },
  'researchers.count_unit': { th: 'คน', en: 'people' },

  // === Homepage (Hero + Sections) ===
  'home.hero.title': { th: 'Clean Energy System Research Unit', en: 'Clean Energy System Research Unit' },
  'home.hero.subtitle_th': { th: 'หน่วยวิจัยระบบพลังงานสะอาด', en: 'Clean Energy Research' },
  'home.hero.affiliation': {
    th: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา',
    en: 'Faculty of Engineering, Rajamangala University of Technology Lanna',
  },
  'home.hero.badge': { th: 'หน่วยวิจัย • ก่อตั้ง 2565', en: 'Research Unit • Est. 2022' },
  'home.stats.researchers': { th: 'นักวิจัย', en: 'Researchers' },
  'home.stats.publications': { th: 'ผลงาน', en: 'Publications' },
  'home.stats.citations': { th: 'Citations', en: 'Citations' },
  'home.stats.h_index': { th: 'Avg H-index', en: 'Avg H-index' },
  'home.stats.grants': { th: 'ทุนวิจัย', en: 'Grants' },
  'home.energy_trends.title': { th: 'Energy Trends & Innovation 2026', en: 'Energy Trends & Innovation 2026' },
  'home.energy_trends.subtitle': {
    th: 'ข่าวสารและเทรนด์พลังงานสะอาดระดับโลก — Curated weekly',
    en: 'Curated global clean energy news & innovation — Updated weekly',
  },
  'home.energy_trends.global': { th: 'Global', en: 'Global' },
  'home.energy_trends.updated': { th: 'อัปเดต เมษายน 2569', en: 'Updated April 2026' },

  // === Homepage: CESRU's own work ===
  'home.featured.title': { th: 'ผลงานวิจัยเด่นของหน่วย', en: 'Featured Research from CESRU' },
  'home.featured.subtitle': {
    th: 'ผลงานตีพิมพ์ของนักวิจัย CESRU ที่ได้รับการอ้างอิงสูง (5 ปีล่าสุด)',
    en: 'High-impact publications by CESRU researchers (last 5 years)',
  },
  'home.featured.badge': { th: 'CESRU', en: 'CESRU' },
  'home.featured.see_all': { th: 'ดูผลงานทั้งหมด', en: 'See all publications' },
  'home.featured.cited_label': { th: 'อ้างอิง', en: 'cited' },
  'home.featured.year': { th: 'ปี', en: 'Year' },
  'home.grants.title': { th: 'ทุนวิจัยที่กำลังดำเนินการ', en: 'Active Research Grants' },
  'home.grants.see_all': { th: 'ดูทั้งหมด', en: 'See all grants' },
  'home.grants.budget': { th: 'งบประมาณ', en: 'Budget' },
  'home.training.title': { th: 'หลักสูตรอบรมเร็วๆ นี้', en: 'Upcoming Training Courses' },
  'home.training.badge': { th: 'การอบรม', en: 'Training' },
  'home.training.open_for_registration': { th: 'เปิดรับสมัคร', en: 'Open for Registration' },
  'home.training.coming_soon': { th: 'เร็วๆ นี้', en: 'Coming Soon' },
  'home.training.register_now': { th: 'สมัครเลย', en: 'Register Now' },
  'home.training.free': { th: 'ฟรี', en: 'Free' },
  'home.news.title': { th: 'ข่าวสารและกิจกรรม', en: 'News & Activities' },
  'home.news.empty': { th: 'ยังไม่มีข่าวสาร', en: 'No news yet' },
  'home.spectrum.title': { th: 'IEEE Spectrum', en: 'IEEE Spectrum' },

  // === News page ===
  'news.page_title': { th: 'ข่าวสารและกิจกรรม', en: 'News & Activities' },
  'news.travel.badge': { th: '✈️ ไปราชการ', en: '✈️ Official Travel' },
  'news.travel.title': { th: 'การเดินทางไปราชการ', en: 'Official Duty Travel' },
  'news.travel.subtitle': { th: 'Official Duty Travel Record', en: 'Official Duty Travel Record' },
  'news.travel.purpose': { th: 'วัตถุประสงค์', en: 'Purpose' },
  'news.travel.location': { th: 'สถานที่', en: 'Location' },
  'news.travel.duration': { th: 'ระยะเวลา', en: 'Duration' },
  'news.travel.days_total': { th: 'รวม', en: 'Total' },
  'news.travel.days_unit': { th: 'วัน', en: 'days' },
  'news.travel.participants': { th: 'ผู้ร่วมเดินทาง', en: 'Participants' },
  'news.travel.restricted_title': { th: 'ข้อมูลเพิ่มเติม (เฉพาะนักวิจัยในหน่วย)', en: 'Restricted Info (CESRU researchers only)' },
  'news.travel.restricted_msg': {
    th: 'งบประมาณ, เลขที่หนังสืออนุมัติ, และเอกสารแนบ — แสดงเฉพาะนักวิจัย CESRU ที่ login ด้วย email หน่วยงาน',
    en: 'Budget, approval number, and attached documents are visible only to CESRU researchers who sign in with their unit email.',
  },
  'news.travel.no_access_title': { th: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้', en: 'Access Denied' },
  'news.travel.no_access_msg': { th: 'ข้อมูลงบประมาณและเอกสารอนุมัติเปิดให้เฉพาะนักวิจัยในหน่วย CESRU เท่านั้น', en: 'Budget and approval documents are visible only to CESRU researchers' },
  'news.travel.no_access_account_note': { th: 'บัญชีของท่าน ({email}) ไม่ได้ลงทะเบียนเป็นนักวิจัย', en: 'Your account ({email}) is not registered as a researcher' },
  'news.travel.checking_permission': { th: 'กำลังตรวจสอบสิทธิ์...', en: 'Verifying permission...' },
  'news.travel.unlocked_badge': { th: '🔓 เฉพาะนักวิจัย CESRU', en: '🔓 CESRU Researchers Only' },
  'news.travel.viewing_admin': { th: '(viewing as admin)', en: '(viewing as admin)' },
  'news.travel.approval_number': { th: '📋 เลขที่หนังสืออนุมัติ', en: '📋 Approval Document No.' },
  'news.travel.budget': { th: '💰 งบประมาณ', en: '💰 Budget' },
  'news.travel.funding_source': { th: '🏦 แหล่งงบประมาณ', en: '🏦 Funding Source' },
  'news.travel.budget_unit': { th: 'บาท', en: 'THB' },
  'news.travel.view_pdf': { th: 'ดูเอกสารอนุมัติ (PDF)', en: 'View Approval Document (PDF)' },
  'news.travel.view_link': { th: 'ลิงก์เอกสาร', en: 'External Document Link' },

  // === Comments ===
  'comments.title': { th: 'ความคิดเห็น', en: 'Comments' },
  'comments.empty': { th: 'ยังไม่มีความคิดเห็น — เป็นคนแรกกันเลย!', en: 'No comments yet — be the first!' },
  'comments.placeholder': { th: 'เขียนความคิดเห็นในฐานะ', en: 'Write a comment as' },
  'comments.send': { th: 'ส่งความคิดเห็น', en: 'Send Comment' },
  'comments.sending': { th: 'กำลังส่ง...', en: 'Sending...' },
  'comments.delete': { th: 'ลบ', en: 'Delete' },
  'comments.signin_prompt': { th: 'Login ด้วย Google เพื่อแสดงความคิดเห็น — ปลอดภัย PDPA', en: 'Sign in with Google to comment — PDPA-safe' },

  // === Activity types (for travel) ===
  'activity.conference': { th: '🎤 ประชุมวิชาการ', en: '🎤 Conference' },
  'activity.seminar': { th: '💼 สัมมนา', en: '💼 Seminar' },
  'activity.training': { th: '📚 อบรม', en: '📚 Training' },
  'activity.field_work': { th: '🔬 ภาคสนาม', en: '🔬 Field Work' },
  'activity.meeting': { th: '🗣️ ประชุม', en: '🗣️ Meeting' },
  'activity.inspection': { th: '🔍 ตรวจสอบ', en: '🔍 Inspection' },
  'activity.exhibition': { th: '🎪 นิทรรศการ', en: '🎪 Exhibition' },
  'activity.consulting': { th: '💡 ที่ปรึกษา', en: '💡 Consulting' },
  'activity.other': { th: '📌 อื่นๆ', en: '📌 Other' },

  // === Errors ===
  'error.generic': { th: 'เกิดข้อผิดพลาด', en: 'An error occurred' },
  'error.unauthorized': { th: 'ไม่มีสิทธิ์เข้าถึง', en: 'Unauthorized' },
  'error.not_found': { th: 'ไม่พบข้อมูล', en: 'Not found' },

  // === Publications ===
  'publications.page_title': { th: 'ผลงานตีพิมพ์', en: 'Publications' },
  'publications.page_subtitle': { th: 'ผลงานวิจัยและบทความตีพิมพ์', en: 'Research papers and publications' },
  'publications.filter.year': { th: 'ปี', en: 'Year' },
  'publications.filter.all_years': { th: 'ทุกปี', en: 'All years' },
  'publications.filter.type': { th: 'ประเภท', en: 'Type' },
  'publications.filter.all_types': { th: 'ทุกประเภท', en: 'All types' },
  'publications.filter.author': { th: 'ผู้แต่ง', en: 'Author' },
  'publications.filter.all_authors': { th: 'ทุกคน', en: 'All authors' },
  'publications.filter.search': { th: 'ค้นหา title / journal / DOI', en: 'Search title / journal / DOI' },
  'publications.empty': { th: 'ไม่พบผลงานตีพิมพ์ตามเงื่อนไข', en: 'No publications found' },
  'publications.cited': { th: 'อ้างอิง', en: 'cited' },
  'publications.times': { th: 'ครั้ง', en: 'times' },
  'publications.open_access': { th: 'Open Access', en: 'Open Access' },
  'publications.type.journal': { th: 'วารสาร', en: 'Journal' },
  'publications.type.journal_international': { th: 'วารสารนานาชาติ', en: 'Intl. Journal' },
  'publications.type.journal_national': { th: 'วารสารในประเทศ', en: 'National Journal' },
  'publications.type.conference': { th: 'การประชุมวิชาการ', en: 'Conference' },
  'publications.type.conference_international': { th: 'การประชุมนานาชาติ', en: 'Intl. Conference' },
  'publications.type.conference_national': { th: 'การประชุมในประเทศ', en: 'National Conference' },
  'publications.type.book': { th: 'หนังสือ', en: 'Book' },
  'publications.type.book_chapter': { th: 'บทในหนังสือ', en: 'Book Chapter' },
  'publications.type.patent': { th: 'สิทธิบัตร', en: 'Patent' },
  'publications.type.petty_patent': { th: 'อนุสิทธิบัตร', en: 'Petty Patent' },
  'publications.type.thesis': { th: 'วิทยานิพนธ์', en: 'Thesis' },
  'publications.type.report': { th: 'รายงาน', en: 'Report' },

  // === Grants ===
  'grants.page_title': { th: 'ทุนวิจัย', en: 'Research Grants' },
  'grants.page_subtitle': { th: 'โครงการวิจัยและทุนสนับสนุน', en: 'Research projects and funding' },
  'grants.section.active': { th: 'กำลังดำเนินการ', en: 'Active' },
  'grants.section.completed': { th: 'เสร็จสิ้น', en: 'Completed' },
  'grants.section.other': { th: 'อื่นๆ', en: 'Others' },
  'grants.status.active': { th: 'กำลังดำเนินการ', en: 'In Progress' },
  'grants.status.completed': { th: 'เสร็จสิ้น', en: 'Completed' },
  'grants.status.pending': { th: 'รอดำเนินการ', en: 'Pending' },
  'grants.status.cancelled': { th: 'ยกเลิก', en: 'Cancelled' },
  'grants.budget': { th: 'งบประมาณ', en: 'Budget' },
  'grants.funding_agency': { th: 'แหล่งทุน', en: 'Funding Agency' },
  'grants.fiscal_year': { th: 'ปีงบประมาณ', en: 'Fiscal Year' },
  'grants.duration': { th: 'ระยะเวลา', en: 'Duration' },
  'grants.team': { th: 'ทีมวิจัย', en: 'Research Team' },
  'grants.role.pi': { th: 'หัวหน้าโครงการ', en: 'Principal Investigator' },
  'grants.role.co_pi': { th: 'ผู้ร่วมโครงการ', en: 'Co-Investigator' },
  'grants.role.researcher': { th: 'นักวิจัย', en: 'Researcher' },
  'grants.role.consultant': { th: 'ที่ปรึกษา', en: 'Consultant' },
  'grants.empty': { th: 'ยังไม่มีข้อมูลทุนวิจัย', en: 'No research grants yet' },

  // === Services ===
  'services.page_title': { th: 'บริการวิชาการ', en: 'Academic Services' },
  'services.page_subtitle': { th: 'งานบริการและที่ปรึกษาด้านพลังงานสะอาด', en: 'Clean energy consulting and services' },
  'services.training_title': { th: 'หลักสูตรอบรม', en: 'Training Courses' },
  'services.consulting_title': { th: 'ที่ปรึกษา & ออกแบบ', en: 'Consulting & Design' },
  'services.references_title': { th: 'ผลงานบริการวิชาการ', en: 'Site References' },
  'services.request.title': { th: 'ส่งคำขอบริการ', en: 'Service Request' },
  'services.request.subtitle': { th: 'กรอกฟอร์มเพื่อขอบริการ — เราจะติดต่อกลับ 1-2 วัน', en: 'Fill the form — we will contact you within 1-2 days' },
  'services.empty': { th: 'ยังไม่มีงานบริการในหมวดนี้', en: 'No services in this category' },

  // === Equipment ===
  'equipment.page_title': { th: 'ครุภัณฑ์', en: 'Equipment' },
  'equipment.page_subtitle': { th: 'ทะเบียนครุภัณฑ์และระบบยืม-คืน', en: 'Equipment inventory and borrowing system' },
  'equipment.status.available': { th: 'พร้อมใช้งาน', en: 'Available' },
  'equipment.status.borrowed': { th: 'ถูกยืม', en: 'Borrowed' },
  'equipment.status.maintenance': { th: 'ซ่อมบำรุง', en: 'Maintenance' },
  'equipment.status.disposed': { th: 'ตัดจำหน่าย', en: 'Disposed' },
  'equipment.borrow_button': { th: 'ขอยืม', en: 'Request Borrow' },
  'equipment.empty': { th: 'ยังไม่มีข้อมูลครุภัณฑ์', en: 'No equipment listed' },

  // === Students ===
  'students.page_title': { th: 'นักศึกษาในกลุ่มวิจัย', en: 'Research Group Students' },
  'students.page_subtitle': { th: 'รายชื่อนักศึกษาที่ทำโครงงาน/วิทยานิพนธ์กับนักวิจัย CESRU', en: 'Students working with CESRU researchers' },
  'students.section.phd_in_unit': { th: 'นักศึกษาปริญญาเอก ในกลุ่มวิจัย', en: 'PhD Students in the Unit' },
  'students.section.doctoral': { th: 'ระดับปริญญาเอก (Doctoral)', en: 'Doctoral Level' },
  'students.section.master': { th: 'ระดับปริญญาโท (Master)', en: 'Master Level' },
  'students.section.bachelor': { th: 'ระดับปริญญาตรี (Bachelor)', en: 'Bachelor Level' },
  'students.degree.bachelor': { th: 'ป.ตรี', en: 'BSc' },
  'students.degree.master': { th: 'ป.โท', en: 'MSc' },
  'students.degree.doctoral': { th: 'ป.เอก', en: 'PhD' },
  'students.status.active': { th: 'กำลังศึกษา', en: 'Active' },
  'students.status.graduated': { th: 'สำเร็จการศึกษา', en: 'Graduated' },
  'students.status.withdrawn': { th: 'พ้นสภาพ', en: 'Withdrawn' },
  'students.status.on_leave': { th: 'ลาพักการศึกษา', en: 'On Leave' },
  'students.advisor': { th: 'อาจารย์ที่ปรึกษา', en: 'Advisor' },
  'students.thesis': { th: 'วิทยานิพนธ์', en: 'Thesis' },
  'students.project': { th: 'โครงงาน', en: 'Project' },
  'students.enrollment_year': { th: 'เข้าศึกษา', en: 'Enrolled' },
  'students.graduation_year': { th: 'จบ', en: 'Graduated' },
  'students.total_active': { th: 'กำลังศึกษา', en: 'Active' },
  'students.total_graduated': { th: 'สำเร็จการศึกษา', en: 'Graduated' },
  'students.total_all': { th: 'ทั้งหมด', en: 'Total' },
  'students.empty': { th: 'ยังไม่มีข้อมูลนักศึกษา', en: 'No students yet' },

  // === Research Areas ===
  'research_areas.page_title': { th: 'สาขาวิจัย', en: 'Research Areas' },
  'research_areas.page_subtitle': { th: 'สาขาวิจัยของหน่วยวิจัยระบบพลังงานสะอาด CESRU', en: 'Research areas of CESRU' },
  'research_areas.publications_count': { th: 'ผลงาน', en: 'publications' },
  'research_areas.publications_label': { th: 'publication', en: 'publication' },
  'research_areas.areas_label': { th: 'สาขา', en: 'areas' },
  'research_areas.no_data_title': { th: 'ยังไม่มีข้อมูลสาขาวิจัย', en: 'No research area data' },
  'research_areas.detail.researchers': { th: 'นักวิจัยที่เกี่ยวข้อง', en: 'Related Researchers' },
  'research_areas.detail.publications': { th: 'ผลงานตีพิมพ์ที่เกี่ยวข้อง', en: 'Related Publications' },

  // === News ===
  'news.list_title': { th: 'ข่าวสารและกิจกรรม', en: 'News & Activities' },
  'news.list_subtitle': { th: 'ข่าวสารล่าสุดและกิจกรรมของหน่วยวิจัย', en: 'Latest news and activities from CESRU' },
  'news.category.team_activity': { th: 'กิจกรรมทีม', en: 'Team Activity' },
  'news.category.energy_news': { th: 'ข่าวพลังงาน', en: 'Energy News' },
  'news.category.academic': { th: 'วิชาการ', en: 'Academic' },
  'news.category.announcement': { th: 'ประกาศ', en: 'Announcement' },
  'news.published_at': { th: 'เผยแพร่เมื่อ', en: 'Published' },
  'news.author_label': { th: 'โดย', en: 'By' },
  'news.back_to_list': { th: '← กลับไปหน้าข่าวสาร', en: '← Back to news list' },
  'news.related_publications': { th: 'งานวิจัยที่เกี่ยวข้อง', en: 'Related Publications' },
  'news.image_gallery': { th: 'รูปภาพประกอบ', en: 'Image Gallery' },
  'news.empty': { th: 'ยังไม่มีข่าวสาร', en: 'No news yet' },

  // === Account / Auth ===
  'account.title': { th: 'บัญชีของฉัน', en: 'My Account' },
  'account.profile': { th: 'ข้อมูลส่วนตัว', en: 'Personal Information' },
  'account.email': { th: 'Email', en: 'Email' },
  'account.display_name': { th: 'ชื่อที่แสดง', en: 'Display Name' },
  'account.user_type': { th: 'ประเภทผู้ใช้', en: 'User Type' },
  'account.institution': { th: 'สถาบัน', en: 'Institution' },
  'account.comments_count': { th: 'จำนวนคอมเมนต์', en: 'Comments' },
  'account.joined': { th: 'เข้าร่วมเมื่อ', en: 'Joined' },
  'account.pdpa_rights': { th: 'สิทธิของฉันตาม PDPA', en: 'My PDPA Rights' },
  'account.export': { th: 'Export ข้อมูลของฉัน', en: 'Export My Data' },
  'account.export_subtitle': { th: 'ดาวน์โหลดข้อมูลทั้งหมด (JSON)', en: 'Download all my data (JSON)' },
  'account.signout_title': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'account.signout_subtitle': { th: 'Sign out — ข้อมูลไม่ถูกลบ', en: 'Sign out — data is preserved' },
  'account.delete': { th: 'ลบบัญชีและข้อมูลทั้งหมด', en: 'Delete Account & All Data' },
  'account.delete_subtitle': { th: 'ไม่สามารถกู้คืนได้', en: 'Cannot be undone' },
  'account.delete_confirm': { th: 'ยืนยันการลบบัญชี', en: 'Confirm Account Deletion' },

  // === Auth Callback (consent) ===
  'auth.callback.welcome': { th: 'ยินดีต้อนรับสู่ CESRU!', en: 'Welcome to CESRU!' },
  'auth.callback.subtitle': { th: 'เพิ่มข้อมูลเล็กน้อยเพื่อให้การใช้งานสมบูรณ์', en: 'A few details to complete your profile' },
  'auth.callback.email_label': { th: 'Email (จาก Google)', en: 'Email (from Google)' },
  'auth.callback.name_label': { th: 'ชื่อที่แสดง', en: 'Display Name' },
  'auth.callback.name_help': { th: 'ชื่อนี้จะแสดงกับ comment ของท่าน — แก้ไขภายหลังได้', en: 'This name will appear with your comments — editable later' },
  'auth.callback.user_type_label': { th: 'ท่านเป็น', en: 'You are' },
  'auth.callback.institution_label': { th: 'สถาบัน / มหาวิทยาลัย (ไม่บังคับ)', en: 'Institution / University (optional)' },
  'auth.callback.consent_privacy': { th: 'ฉันได้อ่านและยอมรับ', en: 'I have read and agree to the' },
  'auth.callback.consent_terms': { th: 'ฉันยอมรับ', en: 'I accept the' },
  'auth.callback.consent_marketing': { th: '(ไม่บังคับ) ฉันยินยอมรับข่าวสารและข้อมูลกิจกรรม CESRU ทาง email', en: '(Optional) I agree to receive CESRU news and event updates via email' },
  'auth.callback.submit': { th: 'ยืนยันและเริ่มต้นใช้งาน', en: 'Confirm and Start' },
  'auth.callback.submitting': { th: 'กำลังสมัคร...', en: 'Creating account...' },
  'auth.callback.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'auth.callback.signing_in': { th: 'กำลังเข้าสู่ระบบ...', en: 'Signing in...' },

  // === Cookie consent banner ===
  'consent.title': { th: 'คุกกี้และความเป็นส่วนตัว', en: 'Cookies and Privacy' },
  'consent.subtitle': {
    th: 'เว็บไซต์นี้ใช้ cookies ที่จำเป็นเพื่อให้บริการ และสถิติการใช้งานแบบไม่ระบุตัวตน เพื่อปรับปรุงเว็บ',
    en: 'This website uses essential cookies and anonymous usage analytics to improve our service.',
  },
  'consent.accept_all': { th: 'ยอมรับทั้งหมด', en: 'Accept All' },
  'consent.essential_only': { th: 'เฉพาะที่จำเป็น', en: 'Essential Only' },
  'consent.details': { th: 'รายละเอียด:', en: 'Details:' },

  // === Research Plan (Phase 1: Grant Calendar) ===
  'rplan.title': { th: 'แผนวิจัย', en: 'Research Plan' },
  'rplan.subtitle': { th: 'AI Co-Pilot สำหรับวางแผนทุนวิจัย ร่างข้อเสนอ และตั้งเป้าตำแหน่งวิชาการ', en: 'AI Co-Pilot for grant planning, proposal drafting, and academic career goals' },
  'rplan.tab.calendar': { th: 'ปฏิทินแหล่งทุน', en: 'Grant Calendar' },
  'rplan.tab.proposals': { th: 'ร่างข้อเสนอ', en: 'Proposals' },
  'rplan.tab.career': { th: 'แผนตำแหน่งวิชาการ', en: 'Career Plan' },
  'rplan.calendar.upcoming': { th: 'กำลังจะเปิด', en: 'Upcoming' },
  'rplan.calendar.open': { th: 'เปิดรับ', en: 'Open' },
  'rplan.calendar.closed': { th: 'ปิดรับแล้ว', en: 'Closed' },
  'rplan.calendar.results': { th: 'ประกาศผล', en: 'Results' },
  'rplan.field.announce': { th: 'ประกาศ', en: 'Announced' },
  'rplan.field.open': { th: 'เปิดรับ', en: 'Open' },
  'rplan.field.close': { th: 'ปิดรับ', en: 'Close' },
  'rplan.field.budget_range': { th: 'งบประมาณ', en: 'Budget' },
  'rplan.field.duration': { th: 'ระยะเวลา', en: 'Duration' },
  'rplan.field.scope': { th: 'ขอบเขต', en: 'Scope' },
  'rplan.field.eligibility': { th: 'คุณสมบัติผู้ขอ', en: 'Eligibility' },
  'rplan.field.outputs': { th: 'ผลผลิตที่ต้องส่ง', en: 'Required Outputs' },
  'rplan.action.ingest': { th: '✨ ใช้ AI สกัดข้อมูลทุน', en: '✨ AI Ingest Grant' },
  'rplan.action.draft_proposal': { th: 'ร่างข้อเสนอด้วย AI', en: 'Draft proposal with AI' },
  'rplan.action.view_announcement': { th: 'ดูประกาศต้นฉบับ', en: 'View announcement' },
  'rplan.ingest.title': { th: 'นำเข้าทุนใหม่ด้วย AI', en: 'Ingest New Grant with AI' },
  'rplan.ingest.url_label': { th: 'URL ประกาศ (หรือเว้นว่าง)', en: 'Announcement URL (or leave blank)' },
  'rplan.ingest.text_label': { th: 'หรือ paste ข้อความประกาศมาที่นี่', en: 'Or paste announcement text here' },
  'rplan.ingest.submit': { th: 'สกัดข้อมูล', en: 'Extract' },
  'rplan.ingest.processing': { th: 'AI กำลังสกัดข้อมูล...', en: 'AI is extracting...' },
  'rplan.ingest.review': { th: 'ตรวจทานก่อนบันทึก', en: 'Review before saving' },
  'rplan.empty.title': { th: 'ยังไม่มีแหล่งทุน', en: 'No grants yet' },
  'rplan.empty.subtitle': { th: 'นำเข้าทุนแรกด้วย AI เพื่อเริ่มต้น', en: 'Ingest your first grant with AI to get started' },

  // === Phase 2-3: Proposal drafting & team ===
  'rplan.detail.back': { th: '← กลับปฏิทินทุน', en: '← Back to grants' },
  'rplan.detail.proposals_section': { th: 'ร่างข้อเสนอสำหรับทุนนี้', en: 'Proposals for this grant' },
  'rplan.detail.no_proposals': { th: 'ยังไม่มีร่างข้อเสนอ', en: 'No drafts yet' },
  'rplan.detail.draft_with_ai': { th: '✨ ให้ AI ร่าง concept ใหม่', en: '✨ Draft concept with AI' },
  'rplan.draft.title': { th: 'AI Draft Concept Proposal', en: 'AI Draft Concept Proposal' },
  'rplan.draft.choose_pi': { th: 'เลือกหัวหน้าโครงการ (PI)', en: 'Select Principal Investigator (PI)' },
  'rplan.draft.choose_tier': { th: 'เลือกประเภททุน / Tier', en: 'Select grant tier' },
  'rplan.draft.user_brief': { th: 'อยากให้ AI ร่างเรื่องอะไร (เว้นว่างได้ AI จะใช้ความเชี่ยวชาญของ PI)', en: 'Topic hint (optional — AI uses PI expertise)' },
  'rplan.draft.processing': { th: 'AI กำลังร่าง concept ตามความเชี่ยวชาญและเงื่อนไขทุน...', en: 'AI is drafting concept based on PI expertise + grant requirements...' },
  'rplan.draft.submit': { th: '🤖 ให้ AI ร่างเลย', en: '🤖 Generate concept' },
  'rplan.draft.review': { th: 'ตรวจทาน concept ก่อนบันทึก', en: 'Review concept before saving' },
  'rplan.draft.match_score': { th: 'AI Match Score', en: 'AI Match Score' },
  'rplan.team.section': { th: 'ทีมวิจัย (PI + ผู้ร่วม)', en: 'Research Team (PI + Co-PIs)' },
  'rplan.team.suggest_with_ai': { th: '🤝 ให้ AI แนะนำผู้ร่วม', en: '🤝 AI-suggest co-PIs' },
  'rplan.team.role.pi': { th: 'หัวหน้าโครงการ', en: 'Principal Investigator' },
  'rplan.team.role.co_pi': { th: 'ผู้ร่วมวิจัย', en: 'Co-PI' },
  'rplan.team.role.researcher': { th: 'นักวิจัย', en: 'Researcher' },
  'rplan.team.role.advisor': { th: 'ที่ปรึกษา', en: 'Advisor' },
  'rplan.team.fte': { th: 'FTE %', en: 'FTE %' },
  'rplan.team.compensation': { th: 'ค่าตอบแทน %', en: 'Compensation %' },
  'rplan.team.total_fte': { th: 'รวม FTE', en: 'Total FTE' },
  'rplan.proposal.budget_requested': { th: 'งบประมาณที่ขอ', en: 'Budget requested' },
  'rplan.proposal.duration': { th: 'ระยะเวลาโครงการ', en: 'Project duration' },
  'rplan.proposal.problem': { th: 'ที่มาและความสำคัญ', en: 'Problem statement' },
  'rplan.proposal.objectives': { th: 'วัตถุประสงค์', en: 'Objectives' },
  'rplan.proposal.methodology': { th: 'ระเบียบวิธีวิจัย', en: 'Methodology' },
  'rplan.proposal.outputs': { th: 'ผลผลิตที่คาดว่าจะได้', en: 'Expected outputs' },
  'rplan.proposal.outcomes': { th: 'ผลลัพธ์/Impact', en: 'Expected outcomes / Impact' },
  'rplan.proposal.keywords': { th: 'คำสำคัญ', en: 'Keywords' },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

/**
 * Get translation for a key in given locale, with fallback to Thai.
 */
export function translate(key: string, locale: Locale): string {
  const entry = (TRANSLATIONS as Record<string, { th: string; en: string }>)[key];
  if (!entry) return key; // fallback: show the key itself for missing translations
  return entry[locale] || entry.th || key;
}

/**
 * Helper to get localized field from DB row.
 * E.g., getLocalizedField(researcher, 'first_name', 'en') → returns first_name_en or first_name_th fallback
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: Locale,
  fallbackToThai = true
): string {
  if (!obj) return '';
  const localizedKey = `${field}_${locale}`;
  if (obj[localizedKey]) return obj[localizedKey];
  if (fallbackToThai && obj[`${field}_th`]) return obj[`${field}_th`];
  return obj[field] || '';
}
