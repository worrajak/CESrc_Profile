import { NextResponse } from 'next/server';

interface ScholarArticle {
  title: string;
  link: string;
  snippet: string;
  authors: string;
  source: string;
  year: string;
  thumbnail: string | null;
}

// Cache to avoid hitting Google too often
let cachedArticles: ScholarArticle[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function fetchGoogleScholarNews(): Promise<ScholarArticle[]> {
  const queries = [
    'solar energy renewable Thailand',
    'clean energy microgrid battery storage',
    'electric vehicle charging power system',
  ];

  const allArticles: ScholarArticle[] = [];

  for (const query of queries) {
    try {
      const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=en&as_sdt=0,5&as_ylo=2024&num=5`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!res.ok) continue;

      const html = await res.text();
      const articles = parseScholarHTML(html);
      allArticles.push(...articles);
    } catch {
      // Skip this query on error
    }
  }

  // Deduplicate by title and limit to 5
  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    const key = a.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 5);
}

function parseScholarHTML(html: string): ScholarArticle[] {
  const articles: ScholarArticle[] = [];
  // Match each result block
  const resultBlocks = html.split(/class="gs_r gs_or gs_scl"/);

  for (let i = 1; i < resultBlocks.length && articles.length < 5; i++) {
    const block = resultBlocks[i];

    // Title and link
    const titleMatch = block.match(/<h3[^>]*class="gs_rt"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;

    const link = titleMatch[1];
    const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();

    // Snippet
    const snippetMatch = block.match(/class="gs_rs"[^>]*>([\s\S]*?)<\/div>/);
    const snippet = snippetMatch
      ? snippetMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200)
      : '';

    // Authors and source
    const authorMatch = block.match(/class="gs_a"[^>]*>([\s\S]*?)<\/div>/);
    const authorLine = authorMatch
      ? authorMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';
    const authorParts = authorLine.split(' - ');
    const authors = authorParts[0]?.trim() || '';
    const source = authorParts[1]?.trim() || '';
    const year = authorParts[2]?.trim() || '';

    // Thumbnail
    const thumbMatch = block.match(/class="gs_or_ggsm"[\s\S]*?href="([^"]*)"/);
    const thumbnail = thumbMatch ? thumbMatch[1] : null;

    articles.push({ title, link, snippet, authors, source, year, thumbnail });
  }

  return articles;
}

export async function GET() {
  const now = Date.now();

  // Return cached if still fresh
  if (cachedArticles.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json({ articles: cachedArticles, cached: true });
  }

  try {
    const articles = await fetchGoogleScholarNews();

    if (articles.length > 0) {
      cachedArticles = articles;
      lastFetchTime = now;
    }

    return NextResponse.json({ articles, cached: false });
  } catch {
    // Return cached even if expired, or empty
    return NextResponse.json({ articles: cachedArticles, cached: true, error: 'fetch failed' });
  }
}
