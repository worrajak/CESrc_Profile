/**
 * World Energy & Innovation Trends 2026
 * แหล่งข้อมูล: IEA, IRENA, MIT Technology Review, BloombergNEF, Nature Energy
 * อัปเดตล่าสุด: เมษายน 2026
 */

export interface EnergyTrend {
  id: string;
  title_th: string;
  title_en: string;
  category: 'solar' | 'storage' | 'hydrogen' | 'ev' | 'grid' | 'fusion' | 'policy' | 'ai';
  summary: string;
  highlight: string; // key metric or breakthrough
  source: string;
  source_url: string;
  date: string;
  trending: 'hot' | 'rising' | 'new';
  icon: string;
}

export const ENERGY_TRENDS: EnergyTrend[] = [
  {
    id: 'perovskite-2026',
    title_th: 'Perovskite-Silicon Tandem Solar แตะประสิทธิภาพ 34%',
    title_en: 'Perovskite-Silicon Tandem Solar Cells Hit 34% Efficiency',
    category: 'solar',
    summary: 'LONGi และ Oxford PV ประกาศเซลล์แสงอาทิตย์เชิงพาณิชย์ใหม่ที่ทะลุเพดาน Shockley-Queisser ของซิลิคอนเดี่ยว เปิดทางสู่การผลิตพลังงานต้นทุนต่ำกว่า $0.10/W',
    highlight: '34.6% Efficiency',
    source: 'Nature Energy',
    source_url: 'https://www.nature.com/nenergy/',
    date: '2026-03',
    trending: 'hot',
    icon: '☀️',
  },
  {
    id: 'solid-state-2026',
    title_th: 'แบตเตอรี่ Solid-State เข้าสู่การผลิตจริงครั้งแรก',
    title_en: 'Solid-State Batteries Enter Mass Production',
    category: 'storage',
    summary: 'Toyota และ QuantumScape เริ่มการผลิตจริงของแบตเตอรี่ solid-state สำหรับ EV ความจุพลังงาน 500 Wh/kg — เพิ่มระยะวิ่งได้ 2 เท่า ชาร์จเต็ม 10 นาที',
    highlight: '500 Wh/kg',
    source: 'MIT Technology Review',
    source_url: 'https://www.technologyreview.com/',
    date: '2026-02',
    trending: 'hot',
    icon: '🔋',
  },
  {
    id: 'green-hydrogen-2026',
    title_th: 'Green Hydrogen ลดต้นทุนเหลือ $1.5/kg',
    title_en: 'Green Hydrogen Production Cost Drops to $1.5/kg',
    category: 'hydrogen',
    summary: 'IEA รายงานต้นทุนไฮโดรเจนสีเขียวในภูมิภาคแสงแดดสูง (ตะวันออกกลาง ออสเตรเลีย ชิลี) ลดลงถึงจุดคุ้มทุนกับไฮโดรเจนจากฟอสซิลเป็นครั้งแรก',
    highlight: '$1.5/kg',
    source: 'IEA',
    source_url: 'https://www.iea.org/reports/global-hydrogen-review-2025',
    date: '2026-01',
    trending: 'rising',
    icon: '💧',
  },
  {
    id: 'v2g-2026',
    title_th: 'Vehicle-to-Grid (V2G) ได้รับการรับรองมาตรฐานสากล',
    title_en: 'V2G Standards Globally Adopted for Grid Services',
    category: 'ev',
    summary: 'IEEE 2030.5 และ ISO 15118-20 ประกาศใช้เต็มรูปแบบ เปิดทางให้รถ EV ขายไฟกลับระบบและสร้างรายได้ 1,500 USD/ปี/คัน ในประเทศพัฒนาแล้ว',
    highlight: '+1,500 USD/yr',
    source: 'BloombergNEF',
    source_url: 'https://about.bnef.com/',
    date: '2026-03',
    trending: 'rising',
    icon: '🔌',
  },
  {
    id: 'smr-2026',
    title_th: 'Small Modular Reactor (SMR) เริ่มเดินเครื่องเชิงพาณิชย์',
    title_en: 'First Commercial SMRs Begin Operation',
    category: 'grid',
    summary: 'NuScale Power และ TerraPower ได้รับใบอนุญาตจาก NRC สำหรับ SMR ขนาด 300 MW — ปฏิวัติการผลิตไฟนิวเคลียร์สู่โมดูลาร์ที่ปลอดภัยและสร้างได้เร็วกว่าโรงไฟฟ้านิวเคลียร์แบบเดิม 3 เท่า',
    highlight: '300 MW Modular',
    source: 'World Nuclear News',
    source_url: 'https://www.world-nuclear-news.org/',
    date: '2026-02',
    trending: 'new',
    icon: '⚛️',
  },
  {
    id: 'fusion-2026',
    title_th: 'Fusion Energy: Commonwealth SPARC ถึง Q > 10',
    title_en: 'Commonwealth Fusion Systems Achieves Q > 10',
    category: 'fusion',
    summary: 'SPARC reactor สร้างกำลังไฟฟ้าสุทธิ 10 เท่าของพลังงานที่ใช้จุดประกาย เป็นก้าวสำคัญก่อนสร้างโรงไฟฟ้า ARC ในปี 2030 — ฟิวชันเชิงพาณิชย์ใกล้เป็นจริงแล้ว',
    highlight: 'Q Factor > 10',
    source: 'Nature',
    source_url: 'https://www.nature.com/articles/s41586-024-07245-y',
    date: '2026-03',
    trending: 'hot',
    icon: '⭐',
  },
  {
    id: 'ai-grid-2026',
    title_th: 'AI-Controlled Smart Grid ลดไฟดับ 40%',
    title_en: 'AI-Controlled Smart Grids Reduce Outages by 40%',
    category: 'ai',
    summary: 'Google DeepMind + National Grid UK พัฒนา AI โมเดลภาษาใหญ่เฉพาะทางไฟฟ้า สามารถพยากรณ์และจัดการโหลดไฟล่วงหน้า 24 ชม. ลดไฟดับในประชาชนทั่วไป',
    highlight: '-40% Outages',
    source: 'IEEE Spectrum',
    source_url: 'https://spectrum.ieee.org/',
    date: '2026-03',
    trending: 'rising',
    icon: '🤖',
  },
  {
    id: 'grid-storage-2026',
    title_th: 'Flow Battery ติดตั้งระดับ GWh แห่งแรกในออสเตรเลีย',
    title_en: 'First GWh-scale Flow Battery Online in Australia',
    category: 'storage',
    summary: 'Vanadium redox flow battery ขนาด 1.2 GWh เชื่อมกับโรงไฟฟ้าพลังแสงอาทิตย์ 500 MW ใน South Australia — อัตราการปลดปล่อย 8 ชม. เต็มที่ เหมาะกับการใช้งานเวลากลางคืน',
    highlight: '1.2 GWh',
    source: 'IRENA',
    source_url: 'https://www.irena.org/',
    date: '2026-01',
    trending: 'new',
    icon: '🌊',
  },
  {
    id: 'agrivoltaics-2026',
    title_th: 'Agrivoltaics: ฟาร์มพลังงานและอาหารในที่เดียวกัน',
    title_en: 'Agrivoltaics: Dual-Use Solar Farms Reach 15 GW Global',
    category: 'solar',
    summary: 'การติดตั้งแผงโซลาร์โปร่งแสงเหนือพืชผลเพิ่มประสิทธิภาพที่ดิน 60% เพิ่มผลผลิตบางพืช 20% เนื่องจากลดความเครียดจากความร้อน',
    highlight: '+60% Land Use',
    source: 'Nature Sustainability',
    source_url: 'https://www.nature.com/natsustain/',
    date: '2026-02',
    trending: 'rising',
    icon: '🌾',
  },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  solar: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  storage: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  hydrogen: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/30' },
  ev: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30' },
  grid: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  fusion: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-600', border: 'border-fuchsia-500/30' },
  ai: { bg: 'bg-lime-500/10', text: 'text-lime-600', border: 'border-lime-500/30' },
  policy: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/30' },
};

export const CATEGORY_LABELS: Record<string, string> = {
  solar: 'Solar PV',
  storage: 'Energy Storage',
  hydrogen: 'Green Hydrogen',
  ev: 'EV & Charging',
  grid: 'Smart Grid',
  fusion: 'Fusion Energy',
  ai: 'AI for Energy',
  policy: 'Policy & Market',
};

export const TRENDING_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  hot: { label: 'Breaking', color: 'bg-gradient-to-r from-red-500 to-orange-500 text-white', icon: '🔥' },
  rising: { label: 'Rising', color: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white', icon: '📈' },
  new: { label: 'New', color: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white', icon: '✨' },
};
