/**
 * POST /api/publications/auto-classify
 * - Backfill keywords + sdg_goals for publications that don't have them
 * - Uses OpenAlex concepts API for OpenAlex-imported publications
 * - Uses keyword matching for others
 *
 * Body: { password: ADMIN_PASSWORD, source?: 'openalex' | 'all' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callAIText } from '@/lib/ai-provider';
import { authorizeAdminRequest } from '@/lib/admin-auth';

const SDG_KEYWORDS: Record<string, string[]> = {
  'SDG 7': ['energy', 'solar', 'pv', 'photovoltaic', 'battery', 'storage', 'renewable', 'wind', 'biomass', 'electricity', 'power', 'grid', 'hydrogen', 'fuel cell', 'microgrid', 'inverter', 'mppt', 'charger', 'ev', 'electric vehicle', 'wireless power', 'พลังงาน', 'แบตเตอรี่', 'พลังงานสะอาด', 'พลังงานทดแทน'],
  'SDG 9': ['innovation', 'industrial', 'manufacturing', 'industry 4', 'iot', 'automation', 'sensor', 'smart factory', 'อุตสาหกรรม', 'นวัตกรรม', 'เซนเซอร์'],
  'SDG 11': ['smart city', 'urban', 'sustainable city', 'transportation', 'มหานคร', 'เมืองอัจฉริยะ', 'ขนส่ง'],
  'SDG 12': ['recycling', 'sustainable consumption', 'waste', 'circular economy', 'รีไซเคิล', 'เศรษฐกิจหมุนเวียน'],
  'SDG 13': ['climate', 'carbon', 'emission', 'greenhouse', 'ghg', 'co2', 'global warming', 'climate change', 'ภาวะโลกร้อน', 'คาร์บอน', 'การปล่อยก๊าซ'],
  'SDG 4': ['education', 'training', 'learning', 'curriculum', 'การศึกษา', 'อบรม'],
};

// Common research area keywords -> tag mapping (mirrors news suggest-tags)
const RESEARCH_KEYWORD_MAP: Record<string, string[]> = {
  'Solar Energy': ['solar', 'photovoltaic', 'pv', 'ผลิตไฟฟ้าจากแสงอาทิตย์', 'โซลาร์', 'แสงอาทิตย์'],
  'Battery Storage': ['battery', 'lithium', 'energy storage', 'แบตเตอรี่', 'การกักเก็บพลังงาน'],
  'Electric Vehicle': ['ev', 'electric vehicle', 'electric car', 'รถยนต์ไฟฟ้า'],
  'Wireless Power Transfer': ['wireless power', 'wireless charging', 'inductive', 'ไร้สาย', 'wpt'],
  'Smart Grid': ['smart grid', 'grid', 'microgrid', 'ระบบโครงข่ายไฟฟ้าอัจฉริยะ'],
  'Power Electronics': ['converter', 'inverter', 'power electronics', 'mppt', 'pwm', 'อิเล็กทรอนิกส์กำลัง'],
  'Renewable Energy': ['renewable', 'wind', 'biomass', 'hydrogen', 'พลังงานทดแทน'],
  'IoT Systems': ['iot', 'internet of things', 'sensor', 'monitoring', 'ระบบติดตาม'],
  'Energy Audit': ['energy audit', 'energy efficiency', 'การตรวจวัดพลังงาน'],
  'Microgrid': ['microgrid', 'distributed generation', 'ไมโครกริด'],
};

function classifyText(text: string) {
  const lower = text.toLowerCase();
  const tags: Set<string> = new Set();
  const sdgs: Set<string> = new Set();

  for (const [tag, keywords] of Object.entries(RESEARCH_KEYWORD_MAP)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      tags.add(tag);
    }
  }

  for (const [sdg, keywords] of Object.entries(SDG_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      sdgs.add(sdg);
    }
  }

  return { tags: Array.from(tags), sdgs: Array.from(sdgs) };
}

// AI-powered classification fallback for ambiguous publications
async function aiClassify(title: string, journal: string, abstract: string): Promise<{ tags: string[]; sdgs: string[] }> {
  const prompt = `วิเคราะห์ผลงานวิจัยต่อไปนี้และระบุ:
1. สาขาวิจัย (research areas) - เลือกได้ 1-3 จากรายการ:
   Solar Energy, Battery Storage, Electric Vehicle, Wireless Power Transfer,
   Smart Grid, Power Electronics, Renewable Energy, IoT Systems, Energy Audit, Microgrid

2. SDG goals - เลือกได้ 1-3 จากรายการ:
   SDG 4 (Quality Education), SDG 7 (Affordable Clean Energy), SDG 9 (Industry Innovation),
   SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), SDG 13 (Climate Action)

ผลงาน:
Title: ${title}
Journal: ${journal || 'N/A'}
Abstract: ${(abstract || '').substring(0, 500)}

ตอบในรูปแบบ JSON เท่านั้น:
{"tags": ["..."], "sdgs": ["SDG 7"]}`;

  try {
    const result = await callAIText(prompt);
    if (result.data) {
      return {
        tags: Array.isArray(result.data.tags) ? result.data.tags : [],
        sdgs: Array.isArray(result.data.sdgs) ? result.data.sdgs : [],
      };
    }
  } catch {
    // AI failed — return empty
  }
  return { tags: [], sdgs: [] };
}

async function fetchOpenAlexConcepts(openalexId: string): Promise<string[]> {
  if (!openalexId) return [];
  try {
    const res = await fetch(`https://api.openalex.org/works/${openalexId}?mailto=cesru@rmutl.ac.th`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const d = await res.json();
    // Extract concepts (top 5 by score)
    const concepts = (d.concepts || [])
      .slice(0, 8)
      .map((c: any) => c.display_name)
      .filter(Boolean);
    // Also add topics
    const topics = (d.topics || [])
      .slice(0, 3)
      .map((t: any) => t.display_name)
      .filter(Boolean);
    return Array.from(new Set([...concepts, ...topics]));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await authorizeAdminRequest(request);
    if (!admin.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const source = body.source || 'all';
    const useAI = body.use_ai === true;

    // Fetch publications that need classification
    let query = supabase
      .from('publications')
      .select('id, title, journal_name, abstract, keywords, openalex_id, source')
      .order('year', { ascending: false });

    if (source === 'openalex') {
      query = query.eq('source', 'openalex');
    }

    const { data: pubs, error } = await query;
    if (error) throw error;

    let processed = 0;
    let updated = 0;
    const errors: any[] = [];

    for (const pub of pubs || []) {
      processed++;

      try {
        // Build keyword set
        const keywords = new Set<string>(pub.keywords || []);

        // For OpenAlex publications, fetch concepts/topics
        if (pub.openalex_id && (!pub.keywords || pub.keywords.length === 0)) {
          const concepts = await fetchOpenAlexConcepts(pub.openalex_id);
          concepts.forEach((c) => keywords.add(c));
        }

        // Classify based on title + journal + abstract + existing keywords
        const fullText = [
          pub.title,
          pub.journal_name || '',
          pub.abstract || '',
          Array.from(keywords).join(' '),
        ].join(' ');

        let { tags, sdgs } = classifyText(fullText);

        // If AI mode AND no tags found via keyword matching → fallback to AI
        if (useAI && tags.length === 0) {
          const aiResult = await aiClassify(pub.title, pub.journal_name || '', pub.abstract || '');
          tags = Array.from(new Set([...tags, ...aiResult.tags]));
          sdgs = Array.from(new Set([...sdgs, ...aiResult.sdgs]));
          // Throttle AI calls
          await new Promise((r) => setTimeout(r, 500));
        }

        // Add discovered tags as keywords
        tags.forEach((t) => keywords.add(t));

        const newKeywords = Array.from(keywords);
        const hasChanges = newKeywords.length !== (pub.keywords || []).length || sdgs.length > 0;

        if (hasChanges) {
          await supabase
            .from('publications')
            .update({ keywords: newKeywords })
            .eq('id', pub.id);
          updated++;
        }

        // Throttle OpenAlex API calls
        if (pub.openalex_id) await new Promise((r) => setTimeout(r, 100));
      } catch (err: any) {
        errors.push({ id: pub.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      updated,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Auto-classify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
