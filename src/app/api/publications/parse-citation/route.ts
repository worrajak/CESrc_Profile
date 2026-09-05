import { NextRequest, NextResponse } from 'next/server';
import { callAIText, getAvailableProviders, AIProvider } from '@/lib/ai-provider';
import { authorizeAdminRequest } from '@/lib/admin-auth';

function extractDoi(text: string): string | null {
  const match = text.match(/\b(10\.\d{4,}\/[^\s,;"\]>]+)/);
  return match ? match[1].replace(/[.)]+$/, '') : null;
}

function extractYear(text: string): number | null {
  const m = text.match(/\((\d{4})\)/) || text.match(/,\s*(\d{4})\b/) || text.match(/\b(19\d{2}|20\d{2})\b/);
  if (m) {
    const y = parseInt(m[1]);
    if (y >= 1950 && y <= 2030) return y;
  }
  return null;
}

function parseAuthors(authorBlock: string): { given: string; family: string; order: number }[] {
  let clean = authorBlock.replace(/\band\b/gi, ',').replace(/&/g, ',').replace(/\s+/g, ' ').trim();
  clean = clean.replace(/\.$/, '');

  const parts = clean.split(/,\s*/).map(s => s.trim()).filter(s => s.length > 1);
  const authors: { given: string; family: string; order: number }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i + 1 < parts.length && /^[A-Z]\.?(\s*[A-Z]\.?)*$/.test(parts[i + 1].trim())) {
      authors.push({ family: part, given: parts[i + 1].trim(), order: authors.length + 1 });
      i++;
      continue;
    }
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

function parseCitationRegex(citation: string) {
  const text = citation.trim();
  const year = extractYear(text);
  const doi = extractDoi(text);

  // Pattern 1: APA-like
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

  // Pattern 2: IEEE-like
  const ieeeMatch = text.match(/^(.+?)[,.]?\s*[""\u201C](.+?)[""\u201D][,.]?\s*([\s\S]+?)$/);
  if (ieeeMatch) {
    const authors = parseAuthors(ieeeMatch[1]);
    const rest = ieeeMatch[3];

    const volMatch = rest.match(/vol\.?\s*(\d+)/i);
    const noMatch = rest.match(/no\.?\s*(\d+)/i);
    const ppMatch = rest.match(/pp?\.?\s*([\d\-\u2013]+)/i);
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

  // Pattern 3: Simple fallback
  const sentences = text.split(/\.\s+/).filter(s => s.length > 5);
  if (sentences.length >= 2) {
    const authors = parseAuthors(sentences[0]);
    const title = sentences[1]?.replace(/\.$/, '').trim() || '';
    const journalPart = sentences[2] || '';

    const volMatch = journalPart.match(/vol\.?\s*(\d+)/i) || journalPart.match(/(\d+)\s*\(/);
    const issueMatch = journalPart.match(/no\.?\s*(\d+)/i) || journalPart.match(/\((\d+)\)/);
    const ppMatch = journalPart.match(/pp?\.?\s*([\d\-\u2013]+)/i);

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

// AI-powered citation parsing using unified ai-provider
async function parseCitationWithAI(citation: string, provider?: AIProvider, model?: string): Promise<any | null> {
  const prompt = `Parse this academic citation and extract structured data. Return ONLY valid JSON, no explanation.

Citation:
${citation}

Return JSON with this exact structure:
{
  "title": "paper title",
  "authors": [{"given": "First", "family": "Last", "order": 1}],
  "journal_name": "journal or conference name",
  "volume": "vol number or null",
  "issue": "issue number or null",
  "pages": "page range or null",
  "year": 2024,
  "doi": "DOI if found or null",
  "pub_type": "journal_international|journal_national|conference_international|conference_national|book_chapter|book|technical_report",
  "keywords": [],
  "scopus_indexed": false,
  "wos_indexed": false
}

Notes:
- For pub_type: if it mentions conference/proceedings/symposium use conference_*, if Thai journal use journal_national
- authors should have separate given name and family name
- year should be integer
- If DOI is present in the citation, extract it (format: 10.xxxx/yyyy)`;

  try {
    const result = await callAIText(prompt, {
      provider: provider || undefined,
      model: model || undefined,
    });

    if (result.error || !result.data) return null;

    const parsed = result.data;
    if (!parsed.title) return null;

    const authors = (parsed.authors || []).map((a: any, i: number) => ({
      given: a.given || '',
      family: a.family || '',
      order: a.order || i + 1,
    }));

    return {
      title: parsed.title,
      authors_raw: buildAuthorsRaw(authors),
      authors,
      journal_name: parsed.journal_name || '',
      volume: parsed.volume || null,
      issue: parsed.issue || null,
      pages: parsed.pages || null,
      year: parsed.year || null,
      doi: parsed.doi || extractDoi(citation),
      pub_type: parsed.pub_type || 'journal_international',
      keywords: parsed.keywords || [],
      scopus_indexed: parsed.scopus_indexed || false,
      wos_indexed: parsed.wos_indexed || false,
      ai_source: result.source,
      ai_model: result.model,
    };
  } catch (e) {
    console.error('AI citation parsing failed:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const admin = await authorizeAdminRequest(request);
  if (!admin.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { citation, ai_provider, ai_model } = body;

  if (!citation?.trim()) {
    return NextResponse.json({ error: 'Citation is required' }, { status: 400 });
  }

  // Step 1: Try to extract DOI and use CrossRef
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
    } catch { /* CrossRef failed, fall through */ }
  }

  // Step 2: Try AI-powered parsing (uses unified ai-provider system)
  if (ai_provider !== 'none') {
    const aiResult = await parseCitationWithAI(
      citation,
      ai_provider as AIProvider || undefined,
      ai_model || undefined,
    );
    if (aiResult) {
      return NextResponse.json({ ...aiResult, source: 'ai', ai_provider: aiResult.ai_source });
    }
  }

  // Step 3: Fallback to regex parsing
  const result = parseCitationRegex(citation);
  return NextResponse.json({ ...result, source: 'parsed' });
}

// GET: return available AI providers
export async function GET() {
  const providers = await getAvailableProviders();
  return NextResponse.json({ providers });
}
