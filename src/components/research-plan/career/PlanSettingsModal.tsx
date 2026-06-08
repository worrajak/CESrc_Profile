'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CareerPlan } from './CareerPlanView';

type Reviewer = { id: string; title_th: string | null; first_name_th: string; last_name_th: string };

const POSITIONS: { v: string; label: string }[] = [
  { v: 'อาจารย์', label: 'อาจารย์' },
  { v: 'ผศ.', label: 'ผศ.' },
  { v: 'รศ.', label: 'รศ.' },
  { v: 'ศ.', label: 'ศ.' },
];

const TARGETS: { v: CareerPlan['target_position']; label: string }[] = [
  { v: 'asst_prof', label: 'ผศ.' },
  { v: 'assoc_prof', label: 'รศ.' },
  { v: 'prof', label: 'ศ.' },
];

export default function PlanSettingsModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: CareerPlan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [currentPos, setCurrentPos] = useState(plan.current_position_th || 'ผศ.');
  const [currentDate, setCurrentDate] = useState(plan.current_position_date || '');
  const [target, setTarget] = useState<CareerPlan['target_position']>(plan.target_position);
  const [eligStart, setEligStart] = useState(plan.eligibility_window_start || '');
  const [eligEnd, setEligEnd] = useState(plan.eligibility_window_end || '');
  const [targetSub, setTargetSub] = useState(plan.target_submission_date || '');
  const [reviewerId, setReviewerId] = useState(plan.reviewer_id || '');
  const [threshold, setThreshold] = useState(plan.approval_threshold || 80);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pull researcher list for the reviewer picker
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th')
        .eq('is_active', true)
        .order('last_name_th');
      setReviewers((data as Reviewer[]) || []);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { error: upErr } = await supabase
      .from('academic_position_plans')
      .update({
        current_position_th: currentPos || null,
        current_position_date: currentDate || null,
        target_position: target,
        eligibility_window_start: eligStart || null,
        eligibility_window_end: eligEnd || null,
        target_submission_date: targetSub || null,
        reviewer_id: reviewerId || null,
        approval_threshold: threshold,
      })
      .eq('id', plan.id);
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">⚙ แก้ไขเป้าหมาย & ที่ปรึกษา</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 text-sm">
          {/* Current position */}
          <Section title="ตำแหน่งปัจจุบัน">
            <div className="flex gap-2 flex-wrap">
              {POSITIONS.map((p) => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => setCurrentPos(p.v)}
                  className={`px-3 py-1 rounded-md border text-xs ${
                    currentPos === p.v
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="mt-2 w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">วันที่ได้รับตำแหน่งปัจจุบัน</p>
          </Section>

          {/* Target */}
          <Section title="ตำแหน่งเป้าหมาย">
            <div className="flex gap-2 flex-wrap">
              {TARGETS.map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => setTarget(t.v)}
                  className={`px-3 py-1 rounded-md border text-xs ${
                    target === t.v
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Eligibility window */}
          <Section title="ระยะเวลายื่นได้ (eligibility window)">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">เริ่มยื่นได้</label>
                <input
                  type="date"
                  value={eligStart}
                  onChange={(e) => setEligStart(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">สิ้นสุด</label>
                <input
                  type="date"
                  value={eligEnd}
                  onChange={(e) => setEligEnd(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </Section>

          {/* Self target */}
          <Section title="เป้าตัวเอง — ตั้งใจยื่นเมื่อไหร่">
            <input
              type="date"
              value={targetSub}
              onChange={(e) => setTargetSub(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
            />
          </Section>

          {/* Reviewer */}
          <Section title="ที่ปรึกษา / ผู้ดูแผน">
            <select
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
            >
              <option value="">— ไม่ระบุ —</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title_th || ''}
                  {r.first_name_th} {r.last_name_th}
                </option>
              ))}
            </select>
          </Section>

          {/* Threshold */}
          <Section title="Threshold ขั้นต่ำเพื่อกดยื่น (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 px-2 py-1.5 border border-slate-200 rounded text-xs"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              ต้องครบ ≥ {threshold}% ของเอกสารถึงจะกด “ยื่นแล้ว” ได้
            </p>
          </Section>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded p-2 text-xs text-rose-700">
              {error}
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
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50"
          >
            {saving ? '...' : '💾 บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}
