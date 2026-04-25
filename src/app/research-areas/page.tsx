import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';
import SyncClassificationButton from '@/components/SyncClassificationButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'สาขาวิจัย | CESRU',
  description: 'สาขาวิจัยของหน่วยวิจัยระบบพลังงานสะอาด CESRU',
};

async function getAreas() {
  const { data: areas } = await supabase
    .from('research_areas')
    .select('*')
    .order('sort_order');

  // Also fetch all publications to count matches per area
  const { data: publications } = await supabase
    .from('publications')
    .select('id, title, journal_name, abstract, keywords');

  // Count publications per area by keyword/title matching
  const areaMatches: Record<string, number> = {};
  for (const area of areas || []) {
    const searchTerms: string[] = (area.search_terms && area.search_terms.length > 0)
      ? area.search_terms.map((s: string) => s.toLowerCase())
      : (area.name_en || '').toLowerCase().split(/[&,]/).map((s: string) => s.trim()).filter(Boolean);

    let count = 0;
    for (const pub of publications || []) {
      const text = [
        (pub.keywords || []).join(' '),
        pub.title || '',
        pub.journal_name || '',
        pub.abstract || '',
      ].join(' ').toLowerCase();
      if (searchTerms.some((t) => text.includes(t))) count++;
    }
    areaMatches[area.id] = count;
  }

  return { areas: areas || [], areaMatches, totalPublications: (publications || []).length };
}

export default async function ResearchAreasPage() {
  const { areas, areaMatches, totalPublications } = await getAreas();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">สาขาวิจัย</h1>
          <p className="text-gray-500 mt-1">
            สาขาวิจัยของหน่วยวิจัยระบบพลังงานสะอาด CESRU
            <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              📚 {totalPublications} ผลงาน · {areas.length} สาขา
            </span>
          </p>
        </div>
        <SyncClassificationButton />
      </div>

      {areas.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-6">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="text-amber-800 font-semibold">ยังไม่มีข้อมูลสาขาวิจัย</p>
          <p className="text-sm text-amber-700 mt-2">
            กรุณารัน <code className="bg-amber-100 px-2 py-0.5 rounded">002_seed_data.sql</code> และ{' '}
            <code className="bg-amber-100 px-2 py-0.5 rounded">005_sdg_research_areas.sql</code> ใน Supabase Dashboard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {areas.map((area: { id: string; name_th: string; name_en: string; icon: string | null; description_th: string | null; sdg_goals: string[] | null }) => {
            const count = areaMatches[area.id] || 0;
            return (
              <Link
                key={area.id}
                href={`/research-areas/${area.id}`}
                className="bg-white rounded-xl p-5 shadow-sm border text-center hover:shadow-lg hover:border-blue-300 transition block group relative"
              >
                {/* Publication count badge */}
                {count > 0 && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-[28px] h-6 px-2 text-xs font-bold rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                    {count}
                  </span>
                )}
                {area.icon && <div className="text-4xl mb-2">{area.icon}</div>}
                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {area.name_th}
                </p>
                <p className="text-xs text-gray-500 mt-1">{area.name_en}</p>
                {area.description_th && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{area.description_th}</p>
                )}
                {count > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-2 font-medium">
                    📄 {count} publication{count > 1 ? 's' : ''}
                  </p>
                )}
                {area.sdg_goals && area.sdg_goals.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-3">
                    {area.sdg_goals.map((sdg: string) => (
                      <span key={sdg} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                        {sdg}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
