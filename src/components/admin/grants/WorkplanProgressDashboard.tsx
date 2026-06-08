'use client';

/**
 * WorkplanProgressDashboard — composite dashboard rendered on
 * /admin/grants/tracking once a grant has imported plan data
 * (migration 058) + progress reports (migration 059).
 *
 * Three panels:
 *   1. KPI rollup — counts of each progress status across daily +
 *      milestones + wp_month + disbursement, plus headline numbers.
 *   2. WP Gantt — WP × month grid coloured by progress_status; click
 *      a cell to report progress.
 *   3. Recent reports feed — latest 8 grant_progress_reports rows.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { STATUS_META, ENTITY_LABEL, type ProgressStatus, type EntityType } from '@/lib/progressStatus';
import ProgressStatusPill from './ProgressStatusPill';

type WPRow = { id: string; wp_code: string; title: string; primary_owner_code: string | null };
type WPCellRow = {
  id: string;
  wp_id: string;
  month_no: number;
  load: 'low' | 'medium' | 'high' | null;
  progress_status: ProgressStatus | null;
  progress_note: string | null;
};
type MilestoneRow = { id: string; month_no: number; title: string; progress_status: ProgressStatus | null; due_date: string | null };
type ReportRow = {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  status_to: ProgressStatus;
  reason_th: string | null;
  reporter_label: string | null;
  reported_at: string;
};

const LOAD_INTENSITY: Record<string, string> = {
  low: 'opacity-50',
  medium: 'opacity-75',
  high: 'opacity-100',
};

export default function WorkplanProgressDashboard({ grantId }: { grantId: string }) {
  const [wp, setWp] = useState<WPRow[]>([]);
  const [cells, setCells] = useState<WPCellRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [kpiCounts, setKpiCounts] = useState<Record<ProgressStatus, number>>({} as any);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [wpRes, cellRes, msRes, reportRes] = await Promise.all([
      supabase.from('grant_workplan_wp').select('id, wp_code, title, primary_owner_code').eq('grant_id', grantId).order('sort_order'),
      supabase.from('grant_workplan_wp_calendar').select('id, wp_id, month_no, load, progress_status, progress_note').eq('grant_id', grantId),
      supabase.from('grant_workplan_milestones').select('id, month_no, title, progress_status, due_date').eq('grant_id', grantId).order('month_no'),
      supabase.from('grant_progress_reports').select('id, entity_type, entity_id, status_to, reason_th, reporter_label, reported_at').eq('grant_id', grantId).order('reported_at', { ascending: false }).limit(8),
    ]);

    setWp((wpRes.data as WPRow[]) || []);
    setCells((cellRes.data as WPCellRow[]) || []);
    setMilestones((msRes.data as MilestoneRow[]) || []);
    setReports((reportRes.data as ReportRow[]) || []);

    // KPI counts — combine daily + milestones + wp_month + disbursement
    const counts: Record<string, number> = {};
    const tally = (rows: any[]) => {
      for (const r of rows) {
        const s = (r.progress_status || 'not_started') as string;
        counts[s] = (counts[s] || 0) + 1;
      }
    };

    const [daily, disb] = await Promise.all([
      supabase.from('grant_workplan_daily').select('progress_status').eq('grant_id', grantId),
      supabase.from('grant_disbursement').select('progress_status').eq('grant_id', grantId),
    ]);
    tally(daily.data || []);
    tally(disb.data || []);
    tally(cellRes.data || []);
    tally(msRes.data || []);
    setKpiCounts(counts as any);

    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grantId]);

  // Months: figure out span from cells/milestones
  const months = useMemo(() => {
    const maxM = Math.max(12, ...cells.map((c) => c.month_no), ...milestones.map((m) => m.month_no));
    return Array.from({ length: maxM }, (_, i) => i + 1);
  }, [cells, milestones]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-gray-400">
        กำลังโหลด workplan...
      </div>
    );
  }

  if (wp.length === 0 && milestones.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        ⚠ ยังไม่มีข้อมูลแผน — กรุณา Import .xlsx ก่อน
      </div>
    );
  }

  const totalEntries = Object.values(kpiCounts).reduce((s, n) => s + n, 0);
  const onTrack = (kpiCounts.on_plan || 0) + (kpiCounts.done || 0);
  const offTrack = (kpiCounts.off_plan || 0) + (kpiCounts.blocked || 0);
  const delayed = kpiCounts.slight_delay || 0;
  const pct = totalEntries > 0 ? Math.round((onTrack / totalEntries) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* KPI rollup */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">📊 ภาพรวมความคืบหน้า</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-xs">
          {(['on_plan','slight_delay','off_plan','blocked','done','cancelled','not_started'] as ProgressStatus[]).map((s) => {
            const meta = STATUS_META[s];
            const n = kpiCounts[s] || 0;
            return (
              <div
                key={s}
                className={`rounded-lg border px-2 py-1.5 ${meta.chip}`}
              >
                <div className="text-lg font-bold">{n}</div>
                <div className="text-[10px] flex items-center gap-1">
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500" style={{ width: `${totalEntries ? (onTrack / totalEntries) * 100 : 0}%` }} />
            <div className="bg-amber-500" style={{ width: `${totalEntries ? (delayed / totalEntries) * 100 : 0}%` }} />
            <div className="bg-rose-500" style={{ width: `${totalEntries ? (offTrack / totalEntries) * 100 : 0}%` }} />
          </div>
          <span className="text-[11px] font-medium text-gray-700 w-20 text-right">
            {pct}% on-track
          </span>
        </div>
      </div>

      {/* WP Gantt */}
      {wp.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">📦 Work Package × เดือน</h3>
            <span className="text-[10px] text-gray-500">คลิกเซลล์เพื่อรายงาน</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left sticky left-0 bg-slate-50 z-10">WP</th>
                  <th className="px-2 py-2 text-left sticky left-12 bg-slate-50 z-10 min-w-[140px]">รายละเอียด</th>
                  {months.map((m) => (
                    <th key={m} className="px-1 py-2 w-10 text-center text-[10px]">M{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wp.map((w) => (
                  <tr key={w.id} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-medium text-gray-800 sticky left-0 bg-white z-10">
                      {w.wp_code}
                    </td>
                    <td className="px-2 py-2 text-gray-700 sticky left-12 bg-white z-10">
                      <div className="leading-tight">{w.title}</div>
                      {w.primary_owner_code && (
                        <div className="text-[10px] text-gray-500 mt-0.5">{w.primary_owner_code}</div>
                      )}
                    </td>
                    {months.map((m) => {
                      const cell = cells.find((c) => c.wp_id === w.id && c.month_no === m);
                      if (!cell) {
                        return <td key={m} className="px-1 py-1 w-10" />;
                      }
                      const meta = STATUS_META[(cell.progress_status || 'not_started') as ProgressStatus];
                      const loadClass = cell.load ? LOAD_INTENSITY[cell.load] : 'opacity-30';
                      return (
                        <td key={m} className="px-1 py-1 w-10 text-center">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`reportbtn-${cell.id}`)?.click()}
                              className={`block w-7 h-7 rounded ${meta.cell} ${loadClass} hover:ring-2 hover:ring-blue-400 transition`}
                              title={`${w.wp_code} M${m}: ${meta.label}${cell.progress_note ? ' · ' + cell.progress_note : ''}`}
                            />
                            <span id={`reportbtn-${cell.id}`} className="hidden">
                              <ProgressStatusPill
                                grantId={grantId}
                                entityType="wp_month"
                                entityId={cell.id}
                                status={cell.progress_status}
                                note={cell.progress_note}
                                compact
                                onReported={refresh}
                              />
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Milestones list */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">★ Milestones</h3>
          <ul className="divide-y divide-slate-100">
            {milestones.map((ms) => (
              <li key={ms.id} className="py-1.5 flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-700 w-8">M{ms.month_no}</span>
                <span className="flex-1 text-gray-800">{ms.title}</span>
                {ms.due_date && (
                  <span className="text-[10px] text-gray-500">{ms.due_date}</span>
                )}
                <ProgressStatusPill
                  grantId={grantId}
                  entityType="milestone"
                  entityId={ms.id}
                  status={ms.progress_status}
                  onReported={refresh}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent reports */}
      {reports.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">📰 รายงานล่าสุด</h3>
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => {
              const meta = STATUS_META[r.status_to];
              return (
                <li key={r.id} className="py-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${meta.chip}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[10px] text-gray-500">{ENTITY_LABEL[r.entity_type]}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-500">{r.reporter_label || '—'}</span>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {new Date(r.reported_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  {r.reason_th && (
                    <p className="text-gray-700 mt-1 ml-1">{r.reason_th}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
