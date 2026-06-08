'use client';

/**
 * AddPipelineItemModal — pick OR add a paper for the research pipeline
 *
 * Two tabs:
 *  • "เลือกจากระบบ" — search publications by title; pick one to link.
 *    On save we copy its existing publication_authors into the pipeline
 *    author table so the plan owner can see/override roles immediately.
 *  • "เพิ่มใหม่"     — manual entry of title/journal/year/doi for an
 *    in-progress paper that isn't in publications yet. Roles get added
 *    after save via the author editor.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Pub = {
  id: string;
  title: string;
  journal_name: string | null;
  year: number | null;
};

const STATUS_OPTIONS: { v: string; label: string }[] = [
  { v: 'drafting', label: 'กำลังเขียน' },
  { v: 'submitted', label: 'ส่งแล้ว' },
  { v: 'in_review', label: 'อยู่ในการประเมิน' },
  { v: 'accepted', label: 'รับตีพิมพ์' },
  { v: 'published', label: 'ตีพิมพ์แล้ว' },
];

const QUARTILE_OPTIONS = ['', 'Q1', 'Q2', 'Q3', 'Q4'];

export default function AddPipelineItemModal({
  planId,
  onClose,
  onAdded,
}: {
  planId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [tab, setTab] = useState<'pick' | 'new'>('pick');

  // Pick tab
  const [search, setSearch] = useState('');
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPubId, setSelectedPubId] = useState<string | null>(null);

  // New tab
  const [extTitle, setExtTitle] = useState('');
  const [extJournal, setExtJournal] = useState('');
  const [extYear, setExtYear] = useState<string>('');
  const [extDoi, setExtDoi] = useState('');

  // Common
  const [status, setStatus] = useState('drafting');
  const [targetJournal, setTargetJournal] = useState('');
  const [targetQuartile, setTargetQuartile] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Debounced publication search
  useEffect(() => {
    if (tab !== 'pick') return;
    const q = search.trim();
    if (q.length < 2) {
      setPubs([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('publications')
        .select('id, title, journal_name, year')
        .or(`title.ilike.%${q}%,journal_name.ilike.%${q}%`)
        .order('year', { ascending: false, nullsFirst: false })
        .limit(20);
      setPubs((data as Pub[]) || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, tab]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const baseRow = {
      plan_id: planId,
      pub_status: status,
      target_journal: targetJournal || null,
      target_quartile: targetQuartile || null,
      notes: notes || null,
    };

    let payload: any;
    if (tab === 'pick') {
      if (!selectedPubId) {
        setError('กรุณาเลือก publication ก่อน');
        setSaving(false);
        return;
      }
      payload = { ...baseRow, publication_id: selectedPubId };
    } else {
      if (!extTitle.trim()) {
        setError('กรุณาใส่ชื่อบทความ');
        setSaving(false);
        return;
      }
      payload = {
        ...baseRow,
        external_title: extTitle.trim(),
        external_journal: extJournal.trim() || null,
        external_year: extYear ? Number(extYear) : null,
        external_doi: extDoi.trim() || null,
      };
    }

    const { data: inserted, error: insErr } = await supabase
      .from('academic_position_research_pipeline')
      .insert(payload)
      .select()
      .single();

    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }

    // If we linked an existing publication, seed pipeline authors from
    // publication_authors so the plan owner has a starting point.
    if (tab === 'pick' && selectedPubId && inserted?.id) {
      const { data: existingAuthors } = await supabase
        .from('publication_authors')
        .select('researcher_id, author_role, is_corresponding, author_order')
        .eq('publication_id', selectedPubId);
      if ((existingAuthors || []).length > 0) {
        const seedRows = (existingAuthors as any[]).map((a) => ({
          pipeline_id: inserted.id,
          researcher_id: a.researcher_id,
          role: a.author_role,
          is_corresponding: a.is_corresponding,
          author_order: a.author_order,
        }));
        await supabase.from('academic_position_pipeline_authors').insert(seedRows);
      }
    }

    setSaving(false);
    onAdded();
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
          <h3 className="font-bold text-gray-800">📚 เพิ่มงานวิจัยในแผน</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab('pick')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                tab === 'pick' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔍 เลือกจากระบบ (publications)
            </button>
            <button
              onClick={() => setTab('new')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                tab === 'new' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ✍️ เพิ่มใหม่ (in-progress)
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 text-sm">
          {tab === 'pick' ? (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาด้วยชื่อบทความ หรือ journal..."
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                autoFocus
              />
              {searching && <p className="text-xs text-gray-400">กำลังค้นหา...</p>}
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded">
                {pubs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    {search.length < 2 ? 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา' : 'ไม่พบ'}
                  </p>
                ) : (
                  pubs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPubId(p.id)}
                      className={`w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition ${
                        selectedPubId === p.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-800 line-clamp-2">{p.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 italic">
                        {p.journal_name || '—'}
                        {p.journal_name && p.year ? ' · ' : ''}
                        {p.year}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase">ชื่อบทความ *</label>
                <input
                  value={extTitle}
                  onChange={(e) => setExtTitle(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium uppercase">Journal</label>
                  <input
                    value={extJournal}
                    onChange={(e) => setExtJournal(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium uppercase">ปี</label>
                  <input
                    value={extYear}
                    onChange={(e) => setExtYear(e.target.value)}
                    type="number"
                    placeholder="2026"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase">DOI (ถ้ามี)</label>
                <input
                  value={extDoi}
                  onChange={(e) => setExtDoi(e.target.value)}
                  placeholder="10.xxxx/..."
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                หลังเพิ่มเสร็จ คลิก "✎ แก้ผู้แต่ง" เพื่อระบุ FA / CA / Co-author
              </p>
            </div>
          )}

          {/* Common fields */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] text-gray-500 font-medium uppercase">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium uppercase">เป้า journal</label>
              <input
                value={targetJournal}
                onChange={(e) => setTargetJournal(e.target.value)}
                placeholder="e.g. Energy Reports"
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium uppercase">Quartile</label>
              <select
                value={targetQuartile}
                onChange={(e) => setTargetQuartile(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
              >
                {QUARTILE_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q || '—'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-500 font-medium uppercase">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs mt-1"
            />
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
            disabled={saving || (tab === 'pick' && !selectedPubId) || (tab === 'new' && !extTitle.trim())}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50"
          >
            {saving ? '...' : '+ เพิ่ม'}
          </button>
        </div>
      </div>
    </div>
  );
}
