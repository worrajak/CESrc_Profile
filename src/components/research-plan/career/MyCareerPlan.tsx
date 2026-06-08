'use client';

/**
 * MyCareerPlan — self-service detail view for the logged-in researcher.
 *
 * If no plan row exists, offers to create a draft. Otherwise renders:
 *   • Hero strip with countdown to eligibility window close
 *   • Settings card (current/target position, dates, reviewer, threshold)
 *   • 12-doc checklist grouped by section
 *   • Reminders banner
 *   • Notes textarea (own notes + reviewer notes shown read-only)
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CareerPlan } from './CareerPlanView';
import PlanSettingsModal from './PlanSettingsModal';
import DocChecklistSection from './DocChecklistSection';

export type DocRow = {
  id: string;
  plan_id: string;
  doc_type: string;
  title: string | null;
  source_kind: 'uploaded' | 'external_link' | 'linked_publication';
  storage_path: string | null;
  external_url: string | null;
  linked_publication_id: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_ready: boolean;
  ready_at: string | null;
  notes: string | null;
};

const TARGET_LABEL: Record<string, string> = {
  asst_prof: 'ผศ.',
  assoc_prof: 'รศ.',
  prof: 'ศ.',
};

function fmtCountdown(deadline: string | null): { days: number | null; text: string } {
  if (!deadline) return { days: null, text: 'ยังไม่ระบุ' };
  const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (d < 0) return { days: d, text: `เลย ${Math.abs(d)} วัน` };
  if (d === 0) return { days: 0, text: 'วันนี้' };
  if (d < 30) return { days: d, text: `อีก ${d} วัน` };
  if (d < 365) return { days: d, text: `อีก ${Math.round(d / 30)} เดือน ${d % 30} วัน` };
  return { days: d, text: `อีก ${(d / 365).toFixed(1)} ปี` };
}

export default function MyCareerPlan({
  researcherId,
  plan,
  onChanged,
}: {
  researcherId: string;
  plan: CareerPlan | null;
  onChanged: () => void;
}) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const refreshDocs = async () => {
    if (!plan) {
      setDocs([]);
      return;
    }
    const { data } = await supabase
      .from('academic_position_documents')
      .select('*')
      .eq('plan_id', plan.id)
      .order('doc_type', { ascending: true });
    setDocs((data as DocRow[]) || []);
  };

  useEffect(() => {
    refreshDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  const createPlan = async () => {
    setCreating(true);
    setError('');
    const { error: insErr } = await supabase
      .from('academic_position_plans')
      .insert({
        researcher_id: researcherId,
        target_position: 'asst_prof',
        status: 'draft',
      });
    setCreating(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    onChanged();
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="text-5xl mb-3">🎓</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          เริ่มวางแผนตำแหน่งวิชาการ
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          ติดตามความก้าวหน้าสู่ ผศ./รศ./ศ. — ตามมาตรฐาน ก.พ.อ. · จัดเก็บเอกสาร · แจ้งเตือนเมื่อใกล้ครบกำหนด
        </p>
        <button
          onClick={createPlan}
          disabled={creating}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {creating ? 'กำลังสร้าง...' : '+ สร้างแผนของฉัน'}
        </button>
        {error && <p className="text-rose-700 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  const target = TARGET_LABEL[plan.target_position] || plan.target_position;
  const eligibility = fmtCountdown(plan.eligibility_window_end);
  const canSubmit = plan.completion_pct >= plan.approval_threshold;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] text-blue-200 uppercase tracking-wider">
              🎓 แผนของฉัน
            </div>
            <h2 className="text-xl font-bold mt-0.5">
              {plan.current_position_th || 'ตำแหน่งปัจจุบัน'}{' '}
              <span className="text-blue-200">→</span> {target}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-blue-200">⏰ ยื่นได้</div>
            <div className="text-lg font-bold">{eligibility.text}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">
              ความพร้อมรวม:{' '}
              <span className="font-bold text-gray-900">
                {docs.filter((d) => d.is_ready).length} / {docs.length || 12}
              </span>{' '}
              ({plan.completion_pct}%)
            </span>
            <span className="text-gray-500">
              ต้อง ≥ <strong>{plan.approval_threshold}%</strong> จึงจะยื่นได้
            </span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                plan.completion_pct >= plan.approval_threshold
                  ? 'bg-emerald-500'
                  : plan.completion_pct >= 50
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${plan.completion_pct}%` }}
            />
          </div>
        </div>

        {/* Quick settings row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Field label="ตำแหน่งปัจจุบัน">{plan.current_position_th || '—'}</Field>
          <Field label="ตั้งแต่">{plan.current_position_date || '—'}</Field>
          <Field label="เป้าหมาย">{target}</Field>
          <Field label="ตั้งใจยื่น">{plan.target_submission_date || '—'}</Field>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
          >
            ⚙ แก้ไขเป้าหมาย & ที่ปรึกษา
          </button>
        </div>

        {/* Checklist */}
        <DocChecklistSection plan={plan} docs={docs} onChanged={refreshDocs} />

        {/* Notes */}
        <div className="pt-3 border-t border-slate-100">
          <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            📝 บันทึกของฉัน
          </label>
          <textarea
            defaultValue={plan.notes || ''}
            rows={3}
            onBlur={async (e) => {
              const v = e.target.value;
              if (v === (plan.notes || '')) return;
              await supabase
                .from('academic_position_plans')
                .update({ notes: v })
                .eq('id', plan.id);
              onChanged();
            }}
            placeholder="โน้ตส่วนตัว..."
            className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-gray-500 mr-2">
            สถานะปัจจุบัน:{' '}
            <strong className="text-gray-800">{plan.status}</strong>
          </span>
          <button
            disabled={!canSubmit || plan.status === 'submitted'}
            onClick={async () => {
              await supabase
                .from('academic_position_plans')
                .update({ status: 'submitted' })
                .eq('id', plan.id);
              onChanged();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              !canSubmit
                ? `ต้องครบ ≥ ${plan.approval_threshold}% ก่อนยื่น`
                : ''
            }
          >
            📤 มาร์คว่ายื่นแล้ว
          </button>
        </div>
      </div>

      {settingsOpen && (
        <PlanSettingsModal
          plan={plan}
          onClose={() => setSettingsOpen(false)}
          onSaved={() => {
            setSettingsOpen(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded p-2">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-xs text-gray-800 font-medium mt-0.5">{children}</div>
    </div>
  );
}
