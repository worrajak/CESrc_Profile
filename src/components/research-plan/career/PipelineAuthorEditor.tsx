'use client';

/**
 * PipelineAuthorEditor — Phase B
 *
 * Edit the author roster for one pipeline item:
 *   • add a CESRU researcher with a role (FA / CA / Co / Last)
 *   • toggle is_corresponding (the "*" star) — independent of role,
 *     so e.g. a Co-author who is also corresponding still counts
 *   • re-order via author_order
 *   • remove an author
 *
 * Phase C will add an "+ external" path with ORCID lookup. The DB
 * schema already supports it (external_name/orcid/affiliation
 * columns); this Phase B UI just doesn't expose the controls yet.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PipelineAuthor, PipelineItem } from './ResearchPipelineSection';

type Researcher = {
  id: string;
  title_th: string | null;
  first_name_th: string;
  last_name_th: string;
};

const ROLES: { v: PipelineAuthor['role']; label: string; short: string }[] = [
  { v: 'first_author',         label: 'ผู้แต่งคนแรก (First author)',           short: 'FA' },
  { v: 'corresponding_author', label: 'ผู้รับผิดชอบบทความ (Corresponding)',     short: 'CA' },
  { v: 'co_author',            label: 'ผู้แต่งร่วม (Co-author)',                short: 'Co' },
  { v: 'last_author',          label: 'ผู้แต่งลำดับสุดท้าย (Last / Senior)',    short: 'Last' },
];

export default function PipelineAuthorEditor({
  item,
  authors,
  onClose,
  onSaved,
}: {
  item: PipelineItem;
  authors: PipelineAuthor[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<PipelineAuthor[]>(
    [...authors].sort((a, b) => (a.author_order || 0) - (b.author_order || 0)),
  );
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [pickResearcherId, setPickResearcherId] = useState('');
  const [pickRole, setPickRole] = useState<PipelineAuthor['role']>('co_author');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th')
        .eq('is_active', true)
        .order('last_name_th');
      setResearchers((data as Researcher[]) || []);
    })();
  }, []);

  const namesById = new Map(researchers.map((r) => [r.id, r]));

  const addInternal = () => {
    if (!pickResearcherId) return;
    if (rows.some((r) => r.researcher_id === pickResearcherId)) {
      setError('นักวิจัยคนนี้อยู่ในรายชื่อแล้ว');
      return;
    }
    setError('');
    const nextOrder = Math.max(0, ...rows.map((r) => r.author_order || 0)) + 1;
    // Temp row marked with id starting with "new:" — real id assigned on save
    setRows([
      ...rows,
      {
        id: `new:${Date.now()}`,
        pipeline_id: item.id,
        researcher_id: pickResearcherId,
        external_name: null,
        external_orcid: null,
        external_affiliation: null,
        role: pickRole,
        is_corresponding: pickRole === 'corresponding_author',
        author_order: nextOrder,
      },
    ]);
    setPickResearcherId('');
  };

  const updateRow = (id: string, patch: Partial<PipelineAuthor>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    const a = next[idx], b = next[j];
    const ao = a.author_order, bo = b.author_order;
    next[idx] = { ...a, author_order: bo };
    next[j] = { ...b, author_order: ao };
    next.sort((x, y) => (x.author_order || 0) - (y.author_order || 0));
    setRows(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    // Strategy: delete all existing for pipeline + insert current rows (simpler than diff)
    const { error: delErr } = await supabase
      .from('academic_position_pipeline_authors')
      .delete()
      .eq('pipeline_id', item.id);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return;
    }
    if (rows.length > 0) {
      const insertRows = rows.map((r, i) => ({
        pipeline_id: item.id,
        researcher_id: r.researcher_id,
        external_name: r.external_name,
        external_orcid: r.external_orcid,
        external_affiliation: r.external_affiliation,
        role: r.role,
        is_corresponding: r.is_corresponding,
        author_order: r.author_order ?? i + 1,
      }));
      const { error: insErr } = await supabase
        .from('academic_position_pipeline_authors')
        .insert(insertRows);
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            ✎ แก้ผู้แต่ง
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({item.external_title?.slice(0, 40) || 'linked paper'}…)
            </span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Add internal */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <label className="text-[11px] font-medium text-gray-500 uppercase">
              เพิ่มนักวิจัย CESRU
            </label>
            <div className="flex items-end gap-2 mt-1">
              <select
                value={pickResearcherId}
                onChange={(e) => setPickResearcherId(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs"
              >
                <option value="">— เลือกนักวิจัย —</option>
                {researchers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title_th || ''}
                    {r.first_name_th} {r.last_name_th}
                  </option>
                ))}
              </select>
              <select
                value={pickRole}
                onChange={(e) => setPickRole(e.target.value as PipelineAuthor['role'])}
                className="w-44 px-2 py-1.5 border border-slate-200 rounded text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r.v} value={r.v}>
                    {r.short} — {r.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addInternal}
                disabled={!pickResearcherId}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs disabled:opacity-50"
              >
                + เพิ่ม
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              💡 Phase C จะมีปุ่ม "+ external (ORCID)" สำหรับเพิ่มผู้ร่วมวิจัยภายนอก
            </p>
          </div>

          {/* List */}
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase">
              ผู้แต่งในบทความ ({rows.length})
            </label>
            {rows.length === 0 ? (
              <p className="text-xs text-gray-400 italic mt-1">ยังไม่มีผู้แต่ง</p>
            ) : (
              <ul className="mt-1 border border-slate-200 rounded divide-y divide-slate-100">
                {rows.map((r, i) => {
                  const internal = r.researcher_id ? namesById.get(r.researcher_id) : null;
                  const name = internal
                    ? `${internal.title_th || ''}${internal.first_name_th} ${internal.last_name_th}`
                    : r.external_name || '?';
                  return (
                    <li key={r.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => move(r.id, -1)}
                          disabled={i === 0}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1"
                          title="ขึ้น"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => move(r.id, 1)}
                          disabled={i === rows.length - 1}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1"
                          title="ลง"
                        >
                          ▼
                        </button>
                      </div>
                      <span className="w-5 text-center text-gray-400">#{i + 1}</span>
                      <span className="flex-1 min-w-0 truncate">{name}</span>
                      <select
                        value={r.role}
                        onChange={(e) =>
                          updateRow(r.id, {
                            role: e.target.value as PipelineAuthor['role'],
                            is_corresponding: e.target.value === 'corresponding_author' || r.is_corresponding,
                          })
                        }
                        className="px-1 py-0.5 border border-slate-200 rounded text-[11px]"
                      >
                        {ROLES.map((rr) => (
                          <option key={rr.v} value={rr.v}>
                            {rr.short}
                          </option>
                        ))}
                      </select>
                      <label className="text-[10px] flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          checked={r.is_corresponding}
                          onChange={(e) => updateRow(r.id, { is_corresponding: e.target.checked })}
                          className="w-3 h-3"
                        />
                        CA
                      </label>
                      <button
                        onClick={() => removeRow(r.id)}
                        className="text-rose-600 hover:bg-rose-50 px-1 rounded text-xs"
                      >
                        ลบ
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[11px] text-blue-900 leading-relaxed">
            <strong>หมายเหตุ ก.พ.อ.:</strong> ผลงานที่ใช้ยื่นต้องมีลำดับเป็น{' '}
            <strong>First Author</strong> หรือ <strong>Corresponding Author</strong>{' '}
            บนบทความ Q1/Q2 ตามเกณฑ์ของตำแหน่งที่ขอ
          </div>

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
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium disabled:opacity-50"
          >
            {saving ? '...' : '💾 บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
