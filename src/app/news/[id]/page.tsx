import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Comments from '@/components/Comments';
import TravelSensitiveInfo from '@/components/TravelSensitiveInfo';
import { getServerLocale, st } from '@/lib/i18n-server';

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
  // Travel fields
  is_official_travel?: boolean;
  travel_purpose?: string | null;
  travel_location?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  travel_approval_number?: string | null;
  travel_approval_doc_url?: string | null;
  travel_approval_link?: string | null;
  travel_budget?: number | null;
  travel_funding_source?: string | null;
  travel_participants?: string[] | null;
  travel_activity_type?: string | null;
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

const categoryColors: Record<string, string> = {
  team_activity: 'bg-blue-100 text-blue-700',
  energy_news: 'bg-green-100 text-green-700',
  academic: 'bg-purple-100 text-purple-700',
  announcement: 'bg-yellow-100 text-yellow-700',
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

  const locale = getServerLocale();
  const catColor = categoryColors[news.category] || categoryColors.announcement;
  const catLabel = st(`news.category.${news.category}`, locale);
  const date = new Date(news.published_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sortedImages = (news.news_images || []).sort((a, b) => a.sort_order - b.sort_order);
  const relatedPubs = await getRelatedPublications(news.tags || []);

  // Fetch participant details if this is a travel news
  let travelParticipants: any[] = [];
  if (news.is_official_travel && news.travel_participants && news.travel_participants.length > 0) {
    const { data } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th')
      .in('id', news.travel_participants);
    travelParticipants = data || [];
  }

  // Calculate travel duration
  let travelDays = 0;
  if (news.is_official_travel && news.travel_start_date && news.travel_end_date) {
    const start = new Date(news.travel_start_date);
    const end = new Date(news.travel_end_date);
    travelDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/news" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        {st('news.back_to_list', locale)}
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
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{catLabel}</span>
          <span className="text-sm text-gray-400">{date}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{news.title}</h1>
        {news.researchers && (
          <p className="text-sm text-gray-500">
            {st('news.author_label', locale)} {news.researchers.title_th}{news.researchers.first_name_th} {news.researchers.last_name_th}
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

      {/* Official Travel Card */}
      {news.is_official_travel && (
        <div className="mb-6 rounded-2xl overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <div>
                <h3 className="font-bold text-sm md:text-base">{st('news.travel.title', locale)}</h3>
                <p className="text-[11px] text-white/80">{st('news.travel.subtitle', locale)}</p>
              </div>
            </div>
            {news.travel_activity_type && (
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                {st(`activity.${news.travel_activity_type}`, locale)}
              </span>
            )}
          </div>

          <div className="p-5 space-y-3">
            {news.travel_purpose && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">{st('news.travel.purpose', locale)}</p>
                <p className="text-sm text-gray-800">{news.travel_purpose}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {news.travel_location && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">📍 {st('news.travel.location', locale)}</p>
                  <p className="text-gray-800 font-medium">{news.travel_location}</p>
                </div>
              )}

              {(news.travel_start_date || news.travel_end_date) && (
                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">📅 {st('news.travel.duration', locale)}</p>
                  <p className="text-gray-800 font-medium text-xs">
                    {news.travel_start_date && new Date(news.travel_start_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {news.travel_end_date && news.travel_end_date !== news.travel_start_date && (
                      <> — {new Date(news.travel_end_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                    )}
                  </p>
                  {travelDays > 0 && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">{st('news.travel.days_total', locale)} {travelDays} {st('news.travel.days_unit', locale)}</p>
                  )}
                </div>
              )}

              {/* เลขที่อนุมัติ ย้ายไปใน restricted section (sensitive) */}
            </div>

            {/* Participants — public ดูได้ */}
            {travelParticipants.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                  👥 {st('news.travel.participants', locale)} ({travelParticipants.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {travelParticipants.map((p: any) => (
                    <Link key={p.id} href={`/researchers/${p.id}`}
                      className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full hover:bg-emerald-50 transition">
                      {p.title_th}{p.first_name_th} {p.last_name_th}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sensitive: เลขที่อนุมัติ + งบประมาณ + แหล่งงบ + เอกสารแนบ — เฉพาะนักวิจัยในหน่วย */}
            <TravelSensitiveInfo newsId={news.id} />
          </div>
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
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{st('news.image_gallery', locale)}</h2>
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
          <h2 className="text-lg font-semibold text-indigo-800 mb-3">{st('news.related_publications', locale)}</h2>
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

      {/* Comments */}
      <Comments targetType="news" targetId={news.id} />
    </div>
  );
}
