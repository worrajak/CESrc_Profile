import { NextResponse } from 'next/server';

interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  authors: string;
  source: string;
  year: string;
  thumbnail: string | null;
}

// Cache
let cachedArticles: NewsArticle[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function fetchIEEESpectrumNews(): Promise<NewsArticle[]> {
  const url = 'https://spectrum.ieee.org/type/news/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) return [];

  const html = await res.text();
  return parseIEEESpectrumHTML(html);
}

function parseIEEESpectrumHTML(html: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // IEEE Spectrum uses article cards with <h2> titles inside links
  // Pattern: find article blocks with titles and links
  const articleBlocks = html.split(/<article/);

  for (let i = 1; i < articleBlocks.length && articles.length < 5; i++) {
    const block = articleBlocks[i];

    // Find title link - typically <a href="..."><h2>Title</h2></a> or <h2><a>...
    const titleMatch = block.match(/href="(\/[^"]*)"[^>]*>[\s\S]*?<(?:h2|h3)[^>]*>([\s\S]*?)<\/(?:h2|h3)>/);
    if (!titleMatch) {
      // Try alternative: <h2><a href="...">Title</a></h2>
      const altMatch = block.match(/<(?:h2|h3)[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      if (!altMatch) continue;

      const link = altMatch[1].startsWith('http') ? altMatch[1] : `https://spectrum.ieee.org${altMatch[1]}`;
      const title = altMatch[2].replace(/<[^>]+>/g, '').trim();
      if (!title || title.length < 10) continue;

      const snippet = extractSnippet(block);
      const thumbnail = extractThumbnail(block);

      articles.push({
        title,
        link,
        snippet,
        authors: '',
        source: 'IEEE Spectrum',
        year: '',
        thumbnail,
      });
      continue;
    }

    const link = titleMatch[1].startsWith('http') ? titleMatch[1] : `https://spectrum.ieee.org${titleMatch[1]}`;
    const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();
    if (!title || title.length < 10) continue;

    const snippet = extractSnippet(block);
    const thumbnail = extractThumbnail(block);

    articles.push({
      title,
      link,
      snippet,
      authors: '',
      source: 'IEEE Spectrum',
      year: '',
      thumbnail,
    });
  }

  return articles;
}

function extractSnippet(block: string): string {
  // Look for paragraph or description text
  const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 20) return text.substring(0, 150);
  }
  return '';
}

function extractThumbnail(block: string): string | null {
  // Look for img src
  const imgMatch = block.match(/<img[^>]*src="([^"]*(?:\.jpg|\.jpeg|\.png|\.webp)[^"]*)"/);
  if (imgMatch) return imgMatch[1];

  // Try srcset
  const srcsetMatch = block.match(/srcset="([^"]*(?:\.jpg|\.jpeg|\.png|\.webp)[^\s,]*)/) ;
  if (srcsetMatch) return srcsetMatch[1];

  return null;
}

export async function GET() {
  const now = Date.now();

  if (cachedArticles.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json({ articles: cachedArticles, cached: true });
  }

  try {
    const articles = await fetchIEEESpectrumNews();

    if (articles.length > 0) {
      cachedArticles = articles;
      lastFetchTime = now;
    }

    return NextResponse.json({ articles, cached: false });
  } catch {
    return NextResponse.json({ articles: cachedArticles, cached: true, error: 'fetch failed' });
  }
}
