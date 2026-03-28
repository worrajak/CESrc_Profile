import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  tags?: string[] | null;
  sdg_goals?: string[] | null;
  researchers?: {
    title_th: string;
    first_name_th: string;
    last_name_th: string;
  } | null;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  team_activity: { label: 'กิจกรรมทีม', color: 'bg-blue-100 text-blue-700' },
  energy_news: { label: 'ข่าวพลังงาน', color: 'bg-green-100 text-green-700' },
  academic: { label: 'วิชาการ', color: 'bg-purple-100 text-purple-700' },
  announcement: { label: 'ประกาศ', color: 'bg-yellow-100 text-yellow-700' },
};

export default function NewsCard({ news }: { news: NewsItem }) {
  const cat = categoryLabels[news.category] || categoryLabels.announcement;
  const date = new Date(news.published_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/news/${news.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden flex">
        {/* Thumbnail */}
        {news.cover_image_url ? (
          <div className="w-32 md:w-40 flex-shrink-0 bg-gray-100 overflow-hidden">
            <img
              src={news.cover_image_url}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-32 md:w-40 flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-3xl opacity-50">
              {news.category === 'energy_news' ? '⚡' : news.category === 'academic' ? '📄' : '📰'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm md:text-base">
            {news.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
            {news.content.replace(/[#*_`]/g, '').substring(0, 120)}...
          </p>
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {news.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
              {news.sdg_goals && news.sdg_goals.slice(0, 2).map((sdg) => (
                <span key={sdg} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{sdg}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
