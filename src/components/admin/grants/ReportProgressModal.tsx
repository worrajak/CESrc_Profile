'use client';

/**
 * ReportProgressModal — submits a status update for one workplan entity.
 *
 * Anyone in grant_team_members (or admin) can insert into
 * grant_progress_reports — RLS does the check. The DB trigger
 * grant_pr_sync_entity then syncs the entity's current state (status +
 * note + reported_at) and bumps completed/disbursed timestamps where
 * applicable.
 *
 * Reason is REQUIRED iff status ∈ {slight_delay, off_plan, blocked}.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  STATUS_META,
  requiresReason,
  type EntityType,
  type ProgressStatus,
} from '@/lib/progressStatus';

const ORDER: ProgressStatus[] = [
  'on_plan',
  'slight_delay',
  'off_plan',
  'blocked',
  'done',
  'cancelled',
  'not_started',
];

export default function ReportProgressModal({
  grantId,
  entityType,
  entityId,
  currentStatus,
  onClose,
  onReported,
}: {
  grantId: string;
  entityType: EntityType;
  entityId: string;
  currentStatus: ProgressStatus;
  onClose: () => void;
  onReported: () => void;
}) {
  const [statusTo, setStatusTo] = useState<ProgressStatus>(
    currentStatus === 'not_started' ? 'on_plan' : currentStatus,
  );
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reporterLabel, setReporterLabel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // Resolve reporter label for snapshot (does not block submit)
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const email = u?.user?.email;
      if (!email) return;
      const { data: r } = await supabase
        .from('researchers')
        .select('title_th, first_name_th, last_name_th')
        .ilike('email', email.toLowerCase())
        .maybeSingle();
      if (r) setReporterLabel(`${r.title_th || ''}${r.first_name_th} ${r.last_name_th}`);
      else setReporterLabel(email);
    })();
  }, []);

  // Load history for this entity
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('grant_progress_reports')
        .select('id, status_from, status_to, reason_th, evidence_url, reporter_label, reported_at')
        .eq('entity_id', entityId)
        .order('reported_at', { ascending: false })
        .limit(10);
      setHistory((data as any[]) || []);
    })();
  }, [entityId]);

  const reasonNeeded = requiresReason(statusTo);

  const submit = async () => {
    if (reasonNeeded && !reason.trim()) {
      setError('สถานะนี้ต้องระบุเหตุผล');
      return;
    }
    setSubmitting(true);
    setError('');

    const { data: u } = await supabase.auth.getUser();
    const { error: insErr } = await supabase.from('grant_progress_reports').insert({
      grant_id: grantId,
      entity_type: entityType,
      entity_id: entityId,
      status_from: currentStatus,
      status_to: statusTo,
      reason_th: reason.trim() || null,
      evidence_url: evidence.trim() || null,
      reported_by: u?.user?.id || null,
      reporter_label: reporterLabel,
    });
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    onReported();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">
            📝 รายงานความคืบหน้า
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 text-sm">
          {/* Reporter snapshot */}
          {reporterLabel && (
            <p className="text-[11px] text-gray-500">
              ผู้รายงาน: <strong>{reporterLabel}</strong>
            </p>
          )}

          {/* Status picker */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase">
              สถานะปัจจุบัน
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {ORDER.map((s) => {
                const meta = STATUS_META[s];
                const active = s === statusTo;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusTo(s)}
                    className={`px-2 py-1 rounded-md border text-xs font-medium transition ${
                      active ? meta.chip + ' ring-2 ring-blue-400' : 'bg-white text-gray-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase">
              เหตุผล / รายละเอียด
              {reasonNeeded && <span className="text-rose-600 ml-1">*</span>}
              {!reasonNeeded && <span className="text-gray-400 ml-1">(ใส่ก็ได้)</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={
                reasonNeeded
                  ? 'จำเป็นต้องระบุเหตุผล เช่น "DC-DC ส่งช้า 2 สัปดาห์ · สั่ง alt วันนี้"'
                  : 'อธิบายเพิ่ม (ทางเลือก)'
              }
              className={`mt-1 w-full px-2 py-1.5 border rounded text-xs ${
                reasonNeeded && !reason.trim() ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Evidence URL */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase">
              หลักฐาน URL (ทางเลือก)
            </label>
            <input
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded p-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <label className="text-[11px] font-medium text-gray-500 uppercase">
                ประวัติการรายงาน ({history.length})
              </label>
              <ul className="mt-1 border border-slate-200 rounded divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {history.map((h) => (
                  <li key={h.id} className="px-2 py-1.5 text-[11px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span>{STATUS_META[h.status_to as ProgressStatus].icon}</span>
                      <span className="font-medium">{STATUS_META[h.status_to as ProgressStatus].label}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{h.reporter_label || '—'}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">
                        {new Date(h.reported_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    {h.reason_th && (
                      <p className="text-gray-600 mt-0.5">{h.reason_th}</p>
                    )}
                    {h.evidence_url && (
                      <a
                        href={h.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-[10px]"
                      >
                        🔗 หลักฐาน
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            disabled={submitting || (reasonNeeded && !reason.trim())}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50"
          >
            {submitting ? '...' : '📤 ส่งรายงาน'}
          </button>
        </div>
      </div>
    </div>
  );
}
