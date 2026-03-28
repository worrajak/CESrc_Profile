'use client';

import { useState, useEffect } from 'react';

interface ScholarArticle {
  title: string;
  link: string;
  snippet: string;
  authors: string;
  source: string;
  year: string;
  thumbnail: string | null;
}

export default function ScholarNews() {
  const [articles, setArticles] = useState<ScholarArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scholar-news')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        ไม่สามารถโหลดข่าววิชาการได้ในขณะนี้
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, idx) => (
        <a
          key={idx}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-lg p-4 border hover:shadow-md hover:border-blue-300 transition group"
        >
          <div className="flex gap-3">
            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt=""
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h4>
              {article.snippet && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {article.snippet}
                </p>
              )}
              <span className="text-[10px] text-gray-400 mt-1 block">{article.source}</span>
            </div>
          </div>
        </a>
      ))}
      <p className="text-[10px] text-gray-400 text-right">
        Powered by IEEE Spectrum
      </p>
    </div>
  );
}
