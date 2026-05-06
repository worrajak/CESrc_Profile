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
  'news.travel.unlocked_badge': { th: '🔓 เฉพาะนักวิจัย CESRU', en: '🔓 CESRU Researchers Only' },

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
