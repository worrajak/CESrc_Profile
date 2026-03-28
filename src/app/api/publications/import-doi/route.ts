import { NextRequest, NextResponse } from 'next/server';

const TYPE_MAP: Record<string, string> = {
  'journal-article': 'journal_international',
  'proceedings-article': 'conference_international',
  'book-chapter': 'book_chapter',
  'book': 'book',
  'monograph': 'book',
};

function buildAuthorsRaw(authors: { given?: string; family?: string }[]): string {
  const names = authors.map((a) => {
    const initial = a.given ? a.given.charAt(0) + '.' : '';
    return `${initial} ${a.family || ''}`.trim();
  });
  if (names.length <= 1) return names[0] || '';
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, doi } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!doi) {
    return NextResponse.json({ error: 'DOI is required' }, { status: 400 });
  }

  // Clean DOI
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();

  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
      headers: {
        'User-Agent': 'CESRUAdmin/1.0 (mailto:worrajak@rmutl.ac.th)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'DOI not found in CrossRef' }, { status: 404 });
      }
      return NextResponse.json({ error: `CrossRef error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const msg = data.message;

    const title = msg.title?.[0] || '';
    const authors = (msg.author || []).map((a: any, i: number) => ({
      given: a.given || '',
      family: a.family || '',
      sequence: a.sequence,
      orcid: a.ORCID || null,
      order: i + 1,
    }));

    const dateParts = msg['published-print']?.['date-parts']?.[0]
      || msg['published-online']?.['date-parts']?.[0]
      || msg['published']?.['date-parts']?.[0]
      || [];

    const pubType = TYPE_MAP[msg.type] || 'journal_international';

    // Strip JATS XML from abstract
    const abstract = msg.abstract
      ? msg.abstract.replace(/<[^>]+>/g, '').trim()
      : null;

    const publication = {
      title,
      authors_raw: buildAuthorsRaw(authors),
      journal_name: msg['container-title']?.[0] || '',
      volume: msg.volume || null,
      issue: msg.issue || null,
      pages: msg.page || null,
      year: dateParts[0] || null,
      month: dateParts[1] || null,
      doi: msg.DOI || cleanDoi,
      pub_type: pubType,
      scopus_indexed: false,
      wos_indexed: false,
      abstract,
      keywords: msg.subject || [],
      authors,
    };

    return NextResponse.json(publication);
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'CrossRef request timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
