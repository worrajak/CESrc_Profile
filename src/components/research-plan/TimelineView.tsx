'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/I18nContext';
import type { GrantCall } from '@/app/research-plan/page';

const AGENCY_COLORS: Record<string, { bar: string; ring: string; text: string }> = {
  FF: { bar: 'bg-emerald-500', ring: 'ring-emerald-300', text: 'text-emerald-700' },
  NRCT: { bar: 'bg-blue-500', ring: 'ring-blue-300', text: 'text-blue-700' },
  TSRI: { bar: 'bg-purple-500', ring: 'ring-purple-300', text: 'text-purple-700' },
  PMUC: { bar: 'bg-orange-500', ring: 'ring-orange-300', text: 'text-orange-700' },
  PMUA: { bar: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-700' },
  PMUB: { bar: 'bg-cyan-500', ring: 'ring-cyan-300', text: 'text-cyan-700' },
  EPPO: { bar: 'bg-lime-500', ring: 'ring-lime-300', text: 'text-lime-700' },
  EGAT: { bar: 'bg-rose-500', ring: 'ring-rose-300', text: 'text-rose-700' },
};

type Range = 3 | 6 | 12;

export default function TimelineView({ calls }: { calls: GrantCall[] }) {
  const { t, locale } = useI18n();
  const [range, setRange] = useState<Range>(6);

  // Generate the next N months starting from current month
  const months = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const list: { key: string; label: string; year: number; month: number; firstDay: Date; lastDay: Date }[] = [];
    for (let i = 0; i < range; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      list.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        firstDay: d,
        lastDay,
      });
    }
    return list;
  }, [range, locale]);

  // For each month, classify each grant as: closing, results, or open-window
  const monthData = useMemo(() => {
    return months.map((m) => {
      const closing: GrantCall[] = [];
      const results: GrantCall[] = [];
      const openWindow: GrantCall[] = [];
      for (const c of calls) {
        const cd = c.close_date ? new Date(c.close_date) : null;
        const rd = c.result_date ? new Date(c.result_date) : null;
        const od = c.open_date ? new Date(c.open_date) : null;
        const isInMonth = (d: Date | null) => d && d >= m.firstDay && d <= m.lastDay;

        if (isInMonth(cd)) {
          closing.push(c);
        } else if (isInMonth(rd)) {
          results.push(c);
        } else if (od && cd && od <= m.lastDay && cd >= m.firstDay) {
          openWindow.push(c);
        }
      }
      return { ...m, closing, results, openWindow };
    });
  }, [calls, months]);

  const fmtDay = (d: string | null) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short' });
  };

  const totalAcrossAllMonths = monthData.reduce(
    (s, m) => s + m.closing.length + m.results.length + m.openWindow.length,
    0,
  );

  return (
    <div>
      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 mr-1">{locale === 'en' ? 'View:' : 'แสดง:'}</span>
        {([3, 6, 12] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
              range === r
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {t(`rplan.timeline.range_${r}` as any)}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-gray-400">
          {locale === 'en' ? `${totalAcrossAllMonths} events` : `${totalAcrossAllMonths} เหตุการณ์`}
        </span>
      </div>

      {/* Month grid */}
      <div
        className={`grid gap-3 ${
          range === 3 ? 'grid-cols-1 md:grid-cols-3' : range === 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12'
        }`}
      >
        {monthData.map((m) => {
          const hasContent = m.closing.length + m.results.length + m.openWindow.length > 0;
          const isCurrent = m.year === new Date().getFullYear() && m.month === new Date().getMonth();
          return (
            <div
              key={m.key}
              className={`rounded-xl border bg-white overflow-hidden flex flex-col ${
                isCurrent ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div
                className={`px-3 py-2 text-xs font-semibold border-b ${
                  isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                }`}
              >
                {m.label}
                {isCurrent && <span className="ml-1 text-[9px] font-normal text-blue-500">(now)</span>}
              </div>

              <div className="p-2 space-y-1.5 flex-1 min-h-[120px]">
                {!hasContent && (
                  <p className="text-[10px] text-gray-300 text-center mt-4">—</p>
                )}

                {m.closing.map((c) => {
                  const col = AGENCY_COLORS[c.agency_code] || AGENCY_COLORS.FF;
                  return (
                    <Link
                      key={`c-${c.id}`}
                      href={`/research-plan/${c.id}`}
                      title={`${c.call_code} — ${locale === 'en' ? 'Closing' : 'ปิดรับ'} ${fmtDay(c.close_date)}`}
                      className={`block rounded-md px-2 py-1 text-[10px] ${col.bar} text-white hover:opacity-90 transition`}
                    >
                      <div className="font-semibold leading-tight">🔴 {c.call_code}</div>
                      <div className="text-[9px] opacity-90">close {fmtDay(c.close_date)}</div>
                    </Link>
                  );
                })}

                {m.results.map((c) => {
                  const col = AGENCY_COLORS[c.agency_code] || AGENCY_COLORS.FF;
                  return (
                    <Link
                      key={`r-${c.id}`}
                      href={`/research-plan/${c.id}`}
                      title={`${c.call_code} — ${locale === 'en' ? 'Results' : 'ผล'} ${fmtDay(c.result_date)}`}
                      className={`block rounded-md px-2 py-1 text-[10px] border ${col.ring} ${col.text} bg-white hover:bg-gray-50 transition`}
                    >
                      <div className="font-semibold leading-tight">🎯 {c.call_code}</div>
                      <div className="text-[9px] opacity-80">result {fmtDay(c.result_date)}</div>
                    </Link>
                  );
                })}

                {m.openWindow.map((c) => {
                  const col = AGENCY_COLORS[c.agency_code] || AGENCY_COLORS.FF;
                  return (
                    <Link
                      key={`o-${c.id}`}
                      href={`/research-plan/${c.id}`}
                      title={`${c.call_code} — ${locale === 'en' ? 'Open' : 'เปิดรับ'} ${fmtDay(c.open_date)} → ${fmtDay(c.close_date)}`}
                      className={`block rounded-md px-2 py-1 text-[10px] border-2 border-dashed ${col.ring} ${col.text} bg-white hover:bg-gray-50 transition`}
                    >
                      <div className="font-semibold leading-tight">{c.call_code}</div>
                      <div className="text-[9px] opacity-80">open window</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span className="font-semibold text-gray-700">{locale === 'en' ? 'Legend:' : 'สัญลักษณ์:'}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span>🔴 {t('rplan.timeline.closing')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-emerald-300"></span>🎯 {t('rplan.timeline.results')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-dashed border-emerald-300"></span>{t('rplan.timeline.open_window')}
        </span>
      </div>
    </div>
  );
}
