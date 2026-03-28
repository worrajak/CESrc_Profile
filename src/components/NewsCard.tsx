import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
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
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
        {news.cover_image_url && (
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={news.cover_image_url}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {news.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {news.content.replace(/[#*_`]/g, '').substring(0, 120)}...
          </p>
          {news.researchers && (
            <p className="text-xs text-gray-400 mt-2">
              โดย {news.researchers.title_th}{news.researchers.first_name_th} {news.researchers.last_name_th}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
