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
  const { data } = await supabase
    .from('research_areas')
    .select('*')
    .order('sort_order');
  return data || [];
}

export default async function ResearchAreasPage() {
  const areas = await getAreas();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">สาขาวิจัย</h1>
          <p className="text-gray-500 mt-1">สาขาวิจัยของหน่วยวิจัยระบบพลังงานสะอาด CESRU</p>
        </div>
        <SyncClassificationButton />
      </div>
      <div className="mb-6"></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {areas.map((area: { id: string; name_th: string; name_en: string; icon: string | null; description_th: string | null; sdg_goals: string[] | null }) => (
          <Link
            key={area.id}
            href={`/research-areas/${area.id}`}
            className="bg-white rounded-xl p-5 shadow-sm border text-center hover:shadow-lg hover:border-blue-300 transition block group"
          >
            {area.icon && <div className="text-4xl mb-2">{area.icon}</div>}
            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {area.name_th}
            </p>
            <p className="text-xs text-gray-500 mt-1">{area.name_en}</p>
            {area.description_th && (
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{area.description_th}</p>
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
        ))}
      </div>
    </div>
  );
}
