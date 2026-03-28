import { supabase } from '@/lib/supabase';
import NewsCard from '@/components/NewsCard';
import ScholarNews from '@/components/ScholarNews';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'ข่าวสารและกิจกรรม | CESRU',
  description: 'ข่าวสารกิจกรรมทีมวิจัย CESRU และข่าวด้านพลังงานสะอาด',
};

async function getNews() {
  const { data } = await supabase
    .from('news')
    .select(`
      *,
      news_images (id, image_url, caption, sort_order),
      researchers:author_id (title_th, first_name_th, last_name_th)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  return data || [];
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ข่าวสารและกิจกรรม</h1>
      <p className="text-gray-500 mb-8">ข่าวสารกิจกรรมทีม CESrc และข่าวด้านพลังงานจากแหล่งวิชาการ</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News from CESrc */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            ข่าวสารกิจกรรม CESrc
          </h2>

          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item: any) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border">
              <p className="text-gray-400">ยังไม่มีข่าวสาร</p>
              <p className="text-sm text-gray-400 mt-1">
                ข่าวจะถูกเพิ่มโดยทีม Admin
              </p>
            </div>
          )}
        </div>

        {/* Scholar News Sidebar */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            บทความวิชาการล่าสุด
          </h2>
          <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 border border-green-100">
            <p className="text-xs text-gray-500 mb-3">
              จาก Google Scholar - พลังงานสะอาด, Solar, EV, Battery
            </p>
            <ScholarNews />
          </div>
        </div>
      </div>
    </div>
  );
}
