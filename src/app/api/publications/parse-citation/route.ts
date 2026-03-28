import { NextRequest, NextResponse } from 'next/server';

function extractDoi(text: string): string | null {
  const match = text.match(/\b(10\.\d{4,}\/[^\s,;"\]>]+)/);
  return match ? match[1].replace(/[.)]+$/, '') : null;
}

function extractYear(text: string): number | null {
  // Match year in parentheses first, then standalone
  const m = text.match(/\((\d{4})\)/) || text.match(/,\s*(\d{4})\b/) || text.match(/\b(19\d{2}|20\d{2})\b/);
  if (m) {
    const y = parseInt(m[1]);
    if (y >= 1950 && y <= 2030) return y;
  }
  return null;
}

function parseAuthors(authorBlock: string): { given: string; family: string; order: number }[] {
  // Clean up
  let clean = authorBlock.replace(/\band\b/gi, ',').replace(/&/g, ',').replace(/\s+/g, ' ').trim();
  // Remove trailing period
  clean = clean.replace(/\.$/, '');

  const parts = clean.split(/,\s*/).map(s => s.trim()).filter(s => s.length > 1);
  const authors: { given: string; family: string; order: number }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Try "Family, G." pattern (common in IEEE)
    if (i + 1 < parts.length && /^[A-Z]\.?(\s*[A-Z]\.?)*$/.test(parts[i + 1].trim())) {
      authors.push({ family: part, given: parts[i + 1].trim(), order: authors.length + 1 });
      i++; // skip next
      continue;
    }
    // Try "G. Family" or "Given Family" pattern
    const nameMatch = part.match(/^([A-Z]\.?\s*(?:[A-Z]\.?\s*)*)\s+(\S+.*)$/) ||
                      part.match(/^(\S+)\s+(\S+.*)$/);
    if (nameMatch) {
      authors.push({ given: nameMatch[1].trim(), family: nameMatch[2].trim(), order: authors.length + 1 });
    } else if (part.length > 2) {
      authors.push({ given: '', family: part, order: authors.length + 1 });
    }
  }

  return authors;
}

function buildAuthorsRaw(authors: { given: string; family: string }[]): string {
  const names = authors.map(a => {
    const initial = a.given ? a.given.charAt(0) + '.' : '';
    return `${initial} ${a.family}`.trim();
  });
  if (names.length <= 1) return names[0] || '';
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
}

function inferPubType(journalName: string): string {
  const lower = journalName.toLowerCase();
  if (/conference|proceedings|symposium|congress|workshop|icee|ecti-con|gtsd|iecon|pvsec/i.test(lower)) {
    return 'conference_international';
  }
  if (/วารสาร|สาร/.test(journalName)) return 'journal_national';
  if (/ประชุม/.test(journalName)) return 'conference_national';
  return 'journal_international';
}

function parseCitation(citation: string) {
  const text = citation.trim();
  const year = extractYear(text);
  const doi = extractDoi(text);

  // Try splitting by common patterns

  // Pattern 1: APA-like — "Authors (Year). Title. Journal, vol(issue), pages."
  const apaMatch = text.match(/^(.+?)\s*\((\d{4})\)\.\s*(.+?)\.\s*(.+?)(?:,\s*(\d+)\s*(?:\((\d+)\))?\s*(?:,\s*(.+?))?)?\.?\s*$/);
  if (apaMatch) {
    const authors = parseAuthors(apaMatch[1]);
    return {
      title: apaMatch[3].trim(),
      authors_raw: buildAuthorsRaw(authors),
      authors,
      journal_name: apaMatch[4]?.split(',')[0]?.trim() || '',
      volume: apaMatch[5] || null,
      issue: apaMatch[6] || null,
      pages: apaMatch[7]?.replace(/\.$/, '').trim() || null,
      year: parseInt(apaMatch[2]),
      doi,
      pub_type: inferPubType(apaMatch[4] || ''),
      keywords: [],
    };
  }

  // Pattern 2: IEEE-like — "Authors, "Title," Journal, vol. X, no. Y, pp. Z, Year."
  const ieeeMatch = text.match(/^(.+?)[,.]?\s*[""](.+?)[""][,.]?\s*(.+?)$/s);
  if (ieeeMatch) {
    const authors = parseAuthors(ieeeMatch[1]);
    const rest = ieeeMatch[3];

    // Parse journal info from rest
    const volMatch = rest.match(/vol\.?\s*(\d+)/i);
    const noMatch = rest.match(/no\.?\s*(\d+)/i);
    const ppMatch = rest.match(/pp?\.?\s*([\d\-–]+)/i);
    const journalPart = rest.split(/,\s*vol\./i)[0]?.trim() || rest.split(',')[0]?.trim() || '';

    return {
      title: ieeeMatch[2].trim(),
      authors_raw: buildAuthorsRaw(authors),
      authors,
      journal_name: journalPart.replace(/[,.]$/, '').trim(),
      volume: volMatch?.[1] || null,
      issue: noMatch?.[1] || null,
      pages: ppMatch?.[1] || null,
      year: year,
      doi,
      pub_type: inferPubType(journalPart),
      keywords: [],
    };
  }

  // Pattern 3: Simple fallback — try to split by periods
  const sentences = text.split(/\.\s+/).filter(s => s.length > 5);
  if (sentences.length >= 2) {
    const authors = parseAuthors(sentences[0]);
    const title = sentences[1]?.replace(/\.$/, '').trim() || '';
    const journalPart = sentences[2] || '';

    const volMatch = journalPart.match(/vol\.?\s*(\d+)/i) || journalPart.match(/(\d+)\s*\(/);
    const issueMatch = journalPart.match(/no\.?\s*(\d+)/i) || journalPart.match(/\((\d+)\)/);
    const ppMatch = journalPart.match(/pp?\.?\s*([\d\-–]+)/i);

    return {
      title,
      authors_raw: buildAuthorsRaw(authors),
      authors,
      journal_name: journalPart.split(/,\s*(?:vol|no|\d)/i)[0]?.replace(/[,.]$/, '').trim() || '',
      volume: volMatch?.[1] || null,
      issue: issueMatch?.[1] || null,
      pages: ppMatch?.[1] || null,
      year,
      doi,
      pub_type: inferPubType(journalPart),
      keywords: [],
    };
  }

  // Last resort
  return {
    title: text.substring(0, 200),
    authors_raw: '',
    authors: [],
    journal_name: '',
    volume: null, issue: null, pages: null,
    year,
    doi,
    pub_type: 'journal_international',
    keywords: [],
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, citation } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!citation?.trim()) {
    return NextResponse.json({ error: 'Citation is required' }, { status: 400 });
  }

  // First try to extract DOI and use CrossRef
  const doi = extractDoi(citation);
  if (doi) {
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': 'CESRUAdmin/1.0 (mailto:worrajak@rmutl.ac.th)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        const msg = data.message;

        const authors = (msg.author || []).map((a: any, i: number) => ({
          given: a.given || '', family: a.family || '', order: i + 1,
        }));

        const dateParts = msg['published-print']?.['date-parts']?.[0]
          || msg['published-online']?.['date-parts']?.[0]
          || msg['published']?.['date-parts']?.[0] || [];

        const TYPE_MAP: Record<string, string> = {
          'journal-article': 'journal_international',
          'proceedings-article': 'conference_international',
          'book-chapter': 'book_chapter',
        };

        return NextResponse.json({
          title: msg.title?.[0] || '',
          authors_raw: buildAuthorsRaw(authors),
          authors,
          journal_name: msg['container-title']?.[0] || '',
          volume: msg.volume || null,
          issue: msg.issue || null,
          pages: msg.page || null,
          year: dateParts[0] || null,
          doi: msg.DOI || doi,
          pub_type: TYPE_MAP[msg.type] || 'journal_international',
          keywords: msg.subject || [],
          source: 'crossref',
        });
      }
    } catch { /* CrossRef failed, fall through to parsing */ }
  }

  // Parse citation locally
  const result = parseCitation(citation);
  return NextResponse.json({ ...result, source: 'parsed' });
}
