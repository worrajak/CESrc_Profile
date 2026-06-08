'use client';

/**
 * TeamCareerOverview — compact list of every active CESRU researcher and
 * their progress toward the next academic title.
 *
 * Rows come from cesru_career_team_overview (see migration 056). Sort key:
 *   sort_bucket asc (1=critical / 2=active plan / 3=no plan)
 *   then completion_pct desc
 * — so "most ready" people surface at the top, gold/silver/bronze.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { TeamOverviewRow } from './CareerPlanView';

const TARGET_LABEL: Record<string, string> = {
  asst_prof: 'ผศ.',
  assoc_prof: 'รศ.',
  prof: 'ศ.',
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft: { label: '⚪ ร่าง', cls: 'bg-slate-100 text-slate-700' },
  preparing: { label: '🟡 กำลังเตรียม', cls: 'bg-amber-100 text-amber-800' },
  submitted: { label: '🔵 ยื่นแล้ว', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: '🟢 ได้รับ', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: '🔴 ตก', cls: 'bg-rose-100 text-rose-700' },
};

const RANK_ICON = ['🥇', '🥈', '🥉'];

function fmtCountdown(days: number | null): string {
  if (days == null) return '—';
  if (days < 0) return `เลย ${Math.abs(days)} วัน`;
  if (days === 0) return 'วันนี้';
  if (days < 30) return `อีก ${days} วัน`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `อีก ${months} เดือน`;
  }
  const years = (days / 365).toFixed(1);
  return `อีก ${years} ปี`;
}

export default function TeamCareerOverview({
  team,
  loading,
  stats,
  currentResearcherId,
}: {
  team: TeamOverviewRow[];
  loading: boolean;
  stats: { total: number; withPlan: number; critical: number };
  currentResearcherId: string | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const [targetFilter, setTargetFilter] = useState<string>('all');

  const filtered = team.filter((t) => {
    if (targetFilter === 'all') return true;
    if (targetFilter === 'no_plan') return !t.plan_id;
    return t.target_position === targetFilter;
  });

  const preview = showAll ? filtered : filtered.slice(0, 7);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            📊 ภาพรวมทีม CESRU
            <span className="text-xs font-normal text-gray-500">
              · เรียงตามความพร้อม
            </span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {stats.total} นักวิจัย · มีแผน {stats.withPlan} · ใกล้ครบกำหนด{' '}
            <span className="text-rose-600 font-medium">{stats.critical}</span>
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 mr-1">เป้า:</span>
          {[
            { v: 'all', l: 'ทั้งหมด' },
            { v: 'asst_prof', l: 'ผศ.' },
            { v: 'assoc_prof', l: 'รศ.' },
            { v: 'prof', l: 'ศ.' },
            { v: 'no_plan', l: 'ยังไม่กรอก' },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setTargetFilter(f.v)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                targetFilter === f.v
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 text-[11px] uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 w-10"></th>
              <th className="px-3 py-2 text-left">ชื่อ</th>
              <th className="px-3 py-2 text-left">เป้า</th>
              <th className="px-3 py-2 text-left w-48">Progress</th>
              <th className="px-3 py-2 text-left">ครบกำหนด</th>
              <th className="px-3 py-2 text-left">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-xs">
                  กำลังโหลด...
                </td>
              </tr>
            ) : preview.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-xs">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              preview.map((t, i) => {
                const name = `${t.title_th || ''}${t.first_name_th} ${t.last_name_th}`;
                const targetText = t.target_position ? TARGET_LABEL[t.target_position] : '—';
                const fromText = t.current_position_th || '—';
                const pct = t.completion_pct || 0;
                const status = t.status ? STATUS_BADGE[t.status] : { label: '⚪ ยังไม่กรอก', cls: 'bg-slate-50 text-slate-500' };
                const rankIcon = i < 3 && t.plan_id && pct > 0 ? RANK_ICON[i] : '';
                const isMe = t.researcher_id === currentResearcherId;

                return (
                  <tr
                    key={t.researcher_id}
                    className={`border-t border-slate-100 hover:bg-slate-50 transition ${
                      isMe ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-center text-base leading-none">
                      {rankIcon || <span className="text-gray-400 text-xs">{i + 1}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/researchers/${t.researcher_id}`}
                        className="text-gray-800 hover:text-blue-700 hover:underline font-medium"
                      >
                        {name}
                      </Link>
                      {isMe && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                          คุณ
                        </span>
                      )}
                      {t.executive_role_th && (
                        <div className="text-[10px] text-amber-700 mt-0.5">
                          🏛️ {t.executive_role_th}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {t.plan_id ? (
                        <>
                          <span className="text-gray-500">{fromText}</span>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="font-medium text-gray-800">{targetText}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 w-9 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {fmtCountdown(t.days_until_deadline)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 7 && (
        <div className="px-5 py-2 border-t border-slate-100 text-center bg-slate-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] text-blue-700 hover:underline font-medium"
          >
            {showAll
              ? '▴ ย่อ'
              : `+ แสดงทั้งหมด ${filtered.length} คน`}
          </button>
        </div>
      )}
    </div>
  );
}
