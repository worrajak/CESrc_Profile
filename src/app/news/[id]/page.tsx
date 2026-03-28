import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  tags: string[] | null;
  sdg_goals: string[] | null;
  news_images: { id: string; image_url: string; caption: string | null; sort_order: number }[];
  researchers: { title_th: string; first_name_th: string; last_name_th: string } | null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from('news')
    .select('title, content')
    .eq('id', params.id)
    .single();

  return {
    title: data ? `${data.title} | CESRU` : 'ข่าวสาร | CESRU',
    description: data?.content?.substring(0, 160) || '',
  };
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  team_activity: { label: 'กิจกรรมทีม', color: 'bg-blue-100 text-blue-700' },
  energy_news: { label: 'ข่าวพลังงาน', color: 'bg-green-100 text-green-700' },
  academic: { label: 'วิชาการ', color: 'bg-purple-100 text-purple-700' },
  announcement: { label: 'ประกาศ', color: 'bg-yellow-100 text-yellow-700' },
};

const SDG_COLORS: Record<string, string> = {
  'SDG 1': 'bg-red-600', 'SDG 2': 'bg-yellow-600', 'SDG 3': 'bg-green-600',
  'SDG 4': 'bg-red-700', 'SDG 5': 'bg-orange-500', 'SDG 6': 'bg-cyan-500',
  'SDG 7': 'bg-yellow-500', 'SDG 8': 'bg-rose-700', 'SDG 9': 'bg-orange-600',
  'SDG 10': 'bg-pink-600', 'SDG 11': 'bg-amber-600', 'SDG 12': 'bg-amber-700',
  'SDG 13': 'bg-green-700', 'SDG 14': 'bg-blue-600', 'SDG 15': 'bg-lime-600',
  'SDG 16': 'bg-blue-800', 'SDG 17': 'bg-blue-900',
};

async function getRelatedPublications(tags: string[]) {
  if (!tags || tags.length === 0) return [];

  // Search publications by keywords matching tags
  const keywordPattern = tags.map((t) => t.toLowerCase()).join('|');

  const { data } = await supabase
    .from('publications')
    .select('id, title, year, journal_name, doi, authors_raw, keywords')
    .order('year', { ascending: false })
    .limit(50);

  if (!data) return [];

  // Filter by matching keywords in title, keywords array, or journal
  const matched = data.filter((pub: any) => {
    const searchText = [pub.title, pub.journal_name, ...(pub.keywords || [])].join(' ').toLowerCase();
    return tags.some((tag) => searchText.includes(tag.toLowerCase()));
  });

  return matched.slice(0, 5);
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const { data: news } = await supabase
    .from('news')
    .select(`
      *,
      news_images (id, image_url, caption, sort_order),
      researchers:author_id (title_th, first_name_th, last_name_th)
    `)
    .eq('id', params.id)
    .single() as { data: NewsDetail | null };

  if (!news) return notFound();

  const cat = categoryLabels[news.category] || categoryLabels.announcement;
  const date = new Date(news.published_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sortedImages = (news.news_images || []).sort((a, b) => a.sort_order - b.sort_order);
  const relatedPubs = await getRelatedPublications(news.tags || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/news" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        ← กลับไปหน้าข่าวสาร
      </Link>

      {/* Cover Image */}
      {news.cover_image_url && (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
          <img src={news.cover_image_url} alt={news.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
          <span className="text-sm text-gray-400">{date}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{news.title}</h1>
        {news.researchers && (
          <p className="text-sm text-gray-500">
            โดย {news.researchers.title_th}{news.researchers.first_name_th} {news.researchers.last_name_th}
          </p>
        )}
      </div>

      {/* Tags & SDGs */}
      {((news.tags && news.tags.length > 0) || (news.sdg_goals && news.sdg_goals.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {news.tags?.map((tag) => (
            <Link key={tag} href={`/news?tag=${encodeURIComponent(tag)}`}
              className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full hover:bg-blue-100 transition">
              {tag}
            </Link>
          ))}
          {news.sdg_goals?.map((sdg) => (
            <span key={sdg} className={`text-xs text-white px-2.5 py-1 rounded-full ${SDG_COLORS[sdg] || 'bg-blue-600'}`}>
              {sdg}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-gray max-w-none mb-8">
        {news.content.split('\n').map((paragraph, idx) => (
          <p key={idx} className="text-gray-700 leading-relaxed mb-3">{paragraph}</p>
        ))}
      </div>

      {/* Image Gallery */}
      {sortedImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">รูปภาพประกอบ</h2>
          <div className={`grid gap-4 ${sortedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {sortedImages.map((img) => (
              <div key={img.id} className="rounded-lg overflow-hidden bg-gray-100">
                <img src={img.image_url} alt={img.caption || news.title} className="w-full h-auto object-cover" />
                {img.caption && <p className="text-xs text-gray-500 p-2 text-center">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Publications */}
      {relatedPubs.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-800 mb-3">งานวิจัยที่เกี่ยวข้อง</h2>
          <div className="space-y-3">
            {relatedPubs.map((pub: any) => (
              <div key={pub.id} className="bg-white rounded-lg p-3 border">
                <Link href="/publications" className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors block">
                  {pub.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {pub.authors_raw} ({pub.year})
                  {pub.journal_name && <> — <em>{pub.journal_name}</em></>}
                </p>
                {pub.doi && (
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline mt-1 inline-block">
                    DOI: {pub.doi}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
