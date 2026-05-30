/**
 * ActivityStream — recent activity feed on homepage
 * ──────────────────────────────────────────────────
 * Server component. Reads `cesru_activity_stream` view (migration 050) and
 * renders the top N items as a vertical timeline. Each row links to the
 * detail page for that kind.
 *
 * Backed by a Supabase VIEW that UNIONs publications/patents/grants/innovations
 * — see supabase/050_homepage_summary.sql.
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

const KIND_META: Record<StreamItem['kind'], { icon: string; label_th: string; label_en: string; color: string }> = {
  publication: { icon: '📄', label_th: 'ผลงาน', label_en: 'Publication', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  patent:      { icon: '⚖️', label_th: 'สิทธิบัตร', label_en: 'Patent', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  grant:       { icon: '💰', label_th: 'ทุน', label_en: 'Grant', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  innovation:  { icon: '💡', label_th: 'นวัตกรรม', label_en: 'Innovation', color: 'bg-violet-50 text-violet-700 border-violet-200' },
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
  limit = 7,
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
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              📅 {locale === 'en' ? 'Recent activity' : 'กิจกรรมล่าสุด'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
            {locale === 'en' ? 'What we have been up to' : 'หน่วยเราเพิ่งทำอะไรบ้าง'}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((item) => {
            const meta = KIND_META[item.kind] || KIND_META.publication;
            const title =
              (locale === 'en' && item.title_en) || item.title_th || item.title_en || '—';
            return (
              <li key={`${item.kind}-${item.ref_id}`}>
                <Link
                  href={item.link_path}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="text-2xl flex-shrink-0 leading-none mt-0.5">{meta.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.color}`}>
                        {locale === 'en' ? meta.label_en : meta.label_th}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {timeAgo(item.occurred_at, locale)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    {item.snippet && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.snippet}</p>
                    )}
                  </div>
                  <span className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
