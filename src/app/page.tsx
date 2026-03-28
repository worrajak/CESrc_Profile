import { supabase } from '@/lib/supabase';
import ScholarNews from '@/components/ScholarNews';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getHomeData() {
  const [researchersRes, pubCountRes, grantCountRes, newsRes] = await Promise.all([
    supabase
      .from('researchers')
      .select('*')
      .eq('is_active', true)
      .order('unit_role', { ascending: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
    supabase.from('grants').select('id', { count: 'exact', head: true }),
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
    news: newsRes.data || [],
  };
}

export default async function HomePage() {
  const { researchers, pubCount, grantCount, news } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Image src="/logo-cesru.jpeg" alt="CESRU Logo" width={80} height={80} className="mx-auto mb-3 rounded-xl bg-white p-1.5 shadow-lg" />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Clean Energy System Research Unit
          </h1>
          <p className="text-blue-200 text-sm">หน่วยวิจัยระบบพลังงานสะอาด</p>
          <p className="text-blue-300 text-xs">
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
          </p>

          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{researchers.length}</div>
              <div className="text-xs text-blue-200">นักวิจัย</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{pubCount}</div>
              <div className="text-xs text-blue-200">ผลงานตีพิมพ์</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{grantCount}</div>
              <div className="text-xs text-blue-200">ทุนวิจัย</div>
            </div>
          </div>
        </div>
      </section>

      {/* News & IEEE Spectrum */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: CESrc News */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                ข่าวสารและกิจกรรม
              </h2>
              <Link href="/news" className="text-blue-600 hover:text-blue-800 text-sm">
                ดูทั้งหมด →
              </Link>
            </div>

            {news.length > 0 ? (
              <div className="space-y-3">
                {news.map((item: any) => (
                  <Link key={item.id} href={`/news/${item.id}`} className="block group">
                    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md hover:border-blue-300 transition p-3 flex gap-4">
                      {item.cover_image_url && (
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.content.replace(/[#*_`]/g, '').substring(0, 100)}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(item.published_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center border">
                <p className="text-gray-400 text-sm">ยังไม่มีข่าวสาร</p>
              </div>
            )}
          </div>

          {/* Right: IEEE Spectrum News */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-600 rounded-full"></span>
              IEEE Spectrum News
            </h2>
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 border border-green-100">
              <ScholarNews />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
