import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authorizeAdminRequest } from '@/lib/admin-auth';

function normalize(s: string): string {
  return s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

function matchScore(given: string, family: string, researcher: any): number {
  const normFamily = normalize(family);
  const rLastEn = normalize(researcher.last_name_en || '');
  const rLastTh = normalize(researcher.last_name_th || '');

  // Last name must match
  let lastScore = 0;
  if (normFamily === rLastEn) lastScore = 1.0;
  else if (rLastEn && normFamily.includes(rLastEn)) lastScore = 0.8;
  else if (rLastTh && normFamily.includes(rLastTh)) lastScore = 0.7;
  else return 0; // No last name match = no match

  // First name scoring
  const normGiven = normalize(given);
  const rFirstEn = normalize(researcher.first_name_en || '');

  let firstScore = 0;
  if (!normGiven) {
    firstScore = 0.3;
  } else if (normGiven === rFirstEn) {
    firstScore = 1.0;
  } else if (normGiven.length <= 2 && rFirstEn.startsWith(normGiven.charAt(0))) {
    // Initial match (e.g., "T" matches "Teerasak")
    firstScore = 0.8;
  } else if (rFirstEn.startsWith(normGiven) || normGiven.startsWith(rFirstEn)) {
    firstScore = 0.9;
  }

  return lastScore * 0.6 + firstScore * 0.4;
}

export async function POST(request: NextRequest) {
  const admin = await authorizeAdminRequest(request);
  if (!admin.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { authors } = body;

  const { data: researchers } = await supabase
    .from('researchers')
    .select('id, first_name_en, last_name_en, first_name_th, last_name_th, title_th')
    .eq('is_active', true);

  const allResearchers = researchers || [];
  const totalAuthors = authors.length;

  const matches = authors.map((author: { given: string; family: string; order: number }, idx: number) => {
    let bestMatch: any = null;
    let bestScore = 0;

    for (const r of allResearchers) {
      const score = matchScore(author.given, author.family, r);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = r;
      }
    }

    // Determine suggested role
    let suggestedRole = 'co_author';
    if (idx === 0) suggestedRole = 'first_author';
    else if (idx === totalAuthors - 1) suggestedRole = 'last_author';

    return {
      input_author: { given: author.given, family: author.family },
      author_order: author.order || idx + 1,
      matched_researcher: bestScore >= 0.5 ? {
        id: bestMatch.id,
        first_name_en: bestMatch.first_name_en,
        last_name_en: bestMatch.last_name_en,
        title_th: bestMatch.title_th,
        first_name_th: bestMatch.first_name_th,
        last_name_th: bestMatch.last_name_th,
      } : null,
      confidence: Math.round(bestScore * 100) / 100,
      suggested_role: suggestedRole,
    };
  });

  return NextResponse.json({ matches });
}
