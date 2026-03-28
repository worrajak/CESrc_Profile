import { supabase } from '@/lib/supabase';
import ResearcherCard from '@/components/ResearcherCard';
import NewsCard from '@/components/NewsCard';
import ScholarNews from '@/components/ScholarNews';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getHomeData() {
  const [researchersRes, pubCountRes, grantCountRes, areasRes, newsRes] = await Promise.all([
    supabase
      .from('researchers')
      .select('*')
      .eq('is_active', true)
      .order('unit_role', { ascending: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
    supabase.from('grants').select('id', { count: 'exact', head: true }),
    supabase.from('research_areas').select('*').order('sort_order'),
    supabase
      .from('news')
      .select(`
        *,
        news_images (id, image_url, caption, sort_order),
        researchers:author_id (title_th, first_name_th, last_name_th)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(5),
  ]);

  return {
    researchers: researchersRes.data || [],
    pubCount: pubCountRes.count || 0,
    grantCount: grantCountRes.count || 0,
    areas: areasRes.data || [],
    news: newsRes.data || [],
  };
}

export default async function HomePage() {
  const { researchers, pubCount, grantCount, areas, news } = await getHomeData();

  const advisor = researchers.filter((r: { unit_role: string }) => r.unit_role === 'advisor');
  const head = researchers.filter((r: { unit_role: string }) => r.unit_role === 'head');
  const members = researchers.filter((r: { unit_role: string }) => r.unit_role === 'member');

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Image src="/logo-cesru.jpeg" alt="CESRU Logo" width={120} height={120} className="mx-auto mb-6 rounded-2xl bg-white p-2 shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Clean Energy System Research Unit
          </h1>
          <p className="text-xl text-blue-200 mb-2">หน่วยวิจัยระบบพลังงานสะอาด</p>
          <p className="text-blue-300">
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
          </p>

          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{researchers.length}</div>
              <div className="text-sm text-blue-200">นักวิจัย</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{pubCount}</div>
              <div className="text-sm text-blue-200">ผลงานตีพิมพ์</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{grantCount}</div>
              <div className="text-sm text-blue-200">ทุนวิจัย</div>
            </div>
          </div>
        </div>
      </section>

      {/* News & Scholar Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ข่าวสารและกิจกรรม</h2>
          <Link href="/news" className="text-blue-600 hover:text-blue-800 text-sm">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CESrc News */}
          <div className="lg:col-span-2">
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((item: any) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border">
                <p className="text-gray-400">ยังไม่มีข่าวสาร</p>
              </div>
            )}
          </div>
          {/* Scholar News */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              บทความวิชาการล่าสุด
            </h3>
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 border border-green-100">
              <ScholarNews />
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">สาขาวิจัย</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area: { id: string; name_th: string; name_en: string; icon: string | null; sdg_goals: string[] | null }) => (
            <Link key={area.id} href={`/research-areas/${area.id}`} className="bg-white rounded-lg p-4 shadow-sm border text-center hover:shadow-md hover:border-blue-300 transition block">
              {area.icon && <div className="text-2xl mb-1">{area.icon}</div>}
              <p className="font-medium text-gray-800 text-sm">{area.name_th}</p>
              <p className="text-xs text-gray-500 mt-1">{area.name_en}</p>
              {area.sdg_goals && area.sdg_goals.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {area.sdg_goals.map((sdg: string) => (
                    <span key={sdg} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{sdg}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Researchers */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ทีมนักวิจัย</h2>
          <Link href="/researchers" className="text-blue-600 hover:text-blue-800 text-sm">
            ดูทั้งหมด →
          </Link>
        </div>

        {advisor.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">ที่ปรึกษา</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisor.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
            </div>
          </div>
        )}

        {head.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-3">หัวหน้าหน่วยวิจัย</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {head.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
            </div>
          </div>
        )}

        {members.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-3">สมาชิก</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
