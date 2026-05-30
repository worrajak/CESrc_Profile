/**
 * ActivityStream — recent activity feed on homepage
 * ──────────────────────────────────────────────────
 * Server component. Reads `cesru_activity_stream` view (migration 050) and
 * renders the top N items as a stack of compact cards. Each card links to
 * the detail page for that kind. Designed to live inside a 1/3-width
 * column of the News grid — fits next to the main news list.
 *
 * Backed by a Supabase VIEW that UNIONs publications/patents/grants/innovations
 * — see supabase/050_homepage_summary.sql and 051 perf indexes.
 */

import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type StreamItem = {
  kind: 'publication' | 'patent' | 'grant' | 'innovation';
  ref_id: string;
  title_th: string | null;
  title_en: string | null;
  snippet: string | null;
  occurred_at: string;
  link_path: string;
};

const KIND_META: Record<
  StreamItem['kind'],
  { icon: string; label_th: string; label_en: string; chip: string; ring: string }
> = {
  publication: {
    icon: '📄',
    label_th: 'ผลงาน',
    label_en: 'Publication',
    chip: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    ring: 'hover:border-cyan-300',
  },
  patent: {
    icon: '⚖️',
    label_th: 'สิทธิบัตร',
    label_en: 'Patent',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    ring: 'hover:border-rose-300',
  },
  grant: {
    icon: '💰',
    label_th: 'ทุน',
    label_en: 'Grant',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    ring: 'hover:border-amber-300',
  },
  innovation: {
    icon: '💡',
    label_th: 'นวัตกรรม',
    label_en: 'Innovation',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    ring: 'hover:border-violet-300',
  },
};

function timeAgo(iso: string, locale: 'th' | 'en'): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  const days = Math.floor(diff / day);
  if (days <= 0) return locale === 'en' ? 'today' : 'วันนี้';
  if (days === 1) return locale === 'en' ? 'yesterday' : 'เมื่อวาน';
  if (days < 7) return locale === 'en' ? `${days}d ago` : `${days} วันก่อน`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return locale === 'en' ? `${w}w ago` : `${w} สัปดาห์ก่อน`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return locale === 'en' ? `${m}mo ago` : `${m} เดือนก่อน`;
  }
  const y = Math.floor(days / 365);
  return locale === 'en' ? `${y}y ago` : `${y} ปีก่อน`;
}

export default async function ActivityStream({
  locale,
  limit = 6,
}: {
  locale: 'th' | 'en';
  limit?: number;
}) {
  const { data: items, error } = await supabase
    .from('cesru_activity_stream')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) {
    return (
      <div className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚠ {locale === 'en' ? 'Activity feed unavailable' : 'โหลดกิจกรรมล่าสุดไม่ได้'}
      </div>
    );
  }

  const list = (items || []) as StreamItem[];
  if (list.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          📅 {locale === 'en' ? 'Recent activity' : 'กิจกรรมล่าสุด'}
        </span>
      </div>
      <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4">
        {locale === 'en' ? 'What we have been up to' : 'หน่วยเราเพิ่งทำอะไรบ้าง'}
      </h2>

      <div className="space-y-2.5">
        {list.map((item) => {
          const meta = KIND_META[item.kind] || KIND_META.publication;
          const title =
            (locale === 'en' && item.title_en) || item.title_th || item.title_en || '—';
          return (
            <Link
              key={`${item.kind}-${item.ref_id}`}
              href={item.link_path}
              className={`group block bg-white rounded-xl border border-slate-200 ${meta.ring} hover:shadow-md transition-all overflow-hidden`}
            >
              <div className="p-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-lg leading-none mt-0.5 flex-shrink-0">
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.chip}`}
                      >
                        {locale === 'en' ? meta.label_en : meta.label_th}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {timeAgo(item.occurred_at, locale)}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                  {title}
                </h3>
                {item.snippet && (
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 italic">
                    {item.snippet}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
