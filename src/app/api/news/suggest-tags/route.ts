import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// SDG definitions
const SDG_LIST = [
  { id: 'SDG 1', name: 'No Poverty', keywords: ['poverty', 'ความยากจน', 'ชุมชน'] },
  { id: 'SDG 2', name: 'Zero Hunger', keywords: ['hunger', 'food', 'อาหาร', 'เกษตร', 'agriculture'] },
  { id: 'SDG 3', name: 'Good Health', keywords: ['health', 'สุขภาพ', 'medical'] },
  { id: 'SDG 4', name: 'Quality Education', keywords: ['education', 'การศึกษา', 'อบรม', 'training', 'นักศึกษา', 'student'] },
  { id: 'SDG 5', name: 'Gender Equality', keywords: ['gender', 'เพศ', 'สตรี'] },
  { id: 'SDG 6', name: 'Clean Water', keywords: ['water', 'น้ำ', 'water treatment', 'บำบัดน้ำ', 'ประปา'] },
  { id: 'SDG 7', name: 'Affordable Energy', keywords: ['energy', 'พลังงาน', 'solar', 'โซลาร์', 'แสงอาทิตย์', 'battery', 'แบตเตอรี่', 'renewable', 'พลังงานทดแทน', 'EV', 'charging', 'microgrid', 'ไมโครกริด', 'grid', 'inverter', 'photovoltaic', 'PV', 'kW', 'MW'] },
  { id: 'SDG 8', name: 'Decent Work', keywords: ['economy', 'เศรษฐกิจ', 'employment', 'งาน'] },
  { id: 'SDG 9', name: 'Industry & Innovation', keywords: ['innovation', 'นวัตกรรม', 'technology', 'เทคโนโลยี', 'IoT', 'smart', 'สิทธิบัตร', 'patent', 'industry', 'อุตสาหกรรม', 'research', 'วิจัย'] },
  { id: 'SDG 10', name: 'Reduced Inequalities', keywords: ['inequality', 'ความเหลื่อมล้ำ'] },
  { id: 'SDG 11', name: 'Sustainable Cities', keywords: ['city', 'เมือง', 'smart city', 'smart building', 'อาคาร', 'building', 'transport', 'ขนส่ง'] },
  { id: 'SDG 12', name: 'Responsible Consumption', keywords: ['consumption', 'production', 'waste', 'recycle', 'ขยะ'] },
  { id: 'SDG 13', name: 'Climate Action', keywords: ['climate', 'carbon', 'CO2', 'ภูมิอากาศ', 'คาร์บอน', 'emission', 'greenhouse'] },
  { id: 'SDG 14', name: 'Life Below Water', keywords: ['ocean', 'marine', 'ทะเล'] },
  { id: 'SDG 15', name: 'Life on Land', keywords: ['forest', 'ป่า', 'biodiversity'] },
  { id: 'SDG 16', name: 'Peace & Justice', keywords: ['peace', 'justice', 'สันติภาพ'] },
  { id: 'SDG 17', name: 'Partnerships', keywords: ['partnership', 'ความร่วมมือ', 'MOU', 'collaboration', 'network'] },
];

// Research keyword mapping (matches common research terms)
const RESEARCH_TAG_KEYWORDS: Record<string, string[]> = {
  'Solar Energy': ['solar', 'โซลาร์', 'แสงอาทิตย์', 'PV', 'photovoltaic', 'solar cell', 'solar rooftop', 'แผงโซลาร์'],
  'Battery Storage': ['battery', 'แบตเตอรี่', 'energy storage', 'lithium', 'ESS', 'BESS'],
  'Electric Vehicle': ['EV', 'electric vehicle', 'รถยนต์ไฟฟ้า', 'charging', 'charger', 'สถานีชาร์จ'],
  'Microgrid': ['microgrid', 'ไมโครกริด', 'grid', 'off-grid', 'on-grid', 'mini grid'],
  'IoT & Smart Meter': ['IoT', 'smart meter', 'sensor', 'มิเตอร์', 'monitoring', 'ตรวจวัด', 'data logger'],
  'Smart Building': ['smart building', 'อาคาร', 'building', 'HVAC', 'energy efficiency', 'ประหยัดพลังงาน'],
  'Water Treatment': ['water', 'น้ำ', 'water treatment', 'บำบัดน้ำ', 'ประปา', 'filtration'],
  'Wireless Power': ['wireless', 'WPT', 'wireless power', 'inductive', 'ไร้สาย'],
  'Community Development': ['ชุมชน', 'community', 'พัฒนา', 'development', 'ท้องถิ่น', 'local'],
  'Power Electronics': ['inverter', 'converter', 'power electronics', 'MPPT', 'PWM'],
  'Renewable Energy': ['renewable', 'พลังงานทดแทน', 'clean energy', 'พลังงานสะอาด', 'green energy'],
  'DSM': ['DSM', 'demand side', 'demand response', 'load management', 'การจัดการพลังงาน'],
};

function matchKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
}

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  const fullText = `${title} ${content}`;

  // Match tags from research keywords
  const suggestedTags: string[] = [];
  for (const [tag, keywords] of Object.entries(RESEARCH_TAG_KEYWORDS)) {
    if (matchKeywords(fullText, keywords)) {
      suggestedTags.push(tag);
    }
  }

  // Also check research_areas from database for extra matching
  const { data: areas } = await supabase
    .from('research_areas')
    .select('name_en, name_th, search_terms');

  if (areas) {
    for (const area of areas) {
      const areaTerms = [area.name_en, area.name_th, ...(area.search_terms || [])];
      if (matchKeywords(fullText, areaTerms) && !suggestedTags.includes(area.name_en)) {
        suggestedTags.push(area.name_en);
      }
    }
  }

  // Match SDGs
  const suggestedSDGs: string[] = [];
  for (const sdg of SDG_LIST) {
    if (matchKeywords(fullText, sdg.keywords)) {
      suggestedSDGs.push(sdg.id);
    }
  }

  return NextResponse.json({
    tags: suggestedTags,
    sdg_goals: suggestedSDGs,
  });
}

// GET - return all available tags and SDGs for reference
export async function GET() {
  return NextResponse.json({
    available_tags: Object.keys(RESEARCH_TAG_KEYWORDS),
    sdg_list: SDG_LIST.map((s) => ({ id: s.id, name: s.name })),
  });
}
