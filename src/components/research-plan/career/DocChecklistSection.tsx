'use client';

/**
 * DocChecklistSection — 12-doc grouped checklist for an academic position
 * plan. Each row supports:
 *   • toggle is_ready
 *   • upload PDF to Supabase Storage
 *   • paste an external link (Drive/OneDrive/etc.)
 *   • view / open / remove the existing file
 *   • notes
 *
 * Phase B will add "link from publications" for textbook/book/research rows.
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CareerPlan } from './CareerPlanView';
import type { DocRow } from './MyCareerPlan';

type DocSpec = {
  type: string;
  label: string;
  hint?: string;
};

const GROUPS: { title: string; icon: string; docs: DocSpec[] }[] = [
  {
    title: 'เอกสารหลัก ก.พ.อ.',
    icon: '📄',
    docs: [
      { type: 'kpo_03', label: 'ก.พ.อ. 03' },
      { type: 'kpo_04', label: 'ก.พ.อ. 04' },
      { type: 'lecture_notes', label: 'เอกสารคำสอน' },
      { type: 'teaching_supplement', label: 'เอกสารประกอบคำสอน' },
    ],
  },
  {
    title: 'หนังสือ / ตำรา',
    icon: '📚',
    docs: [
      { type: 'textbook', label: 'ตำรา' },
      { type: 'book', label: 'หนังสือ' },
      { type: 'research', label: 'งานวิจัยที่เตรียมตีพิมพ์ (เอกสารแนบเพิ่ม)', hint: 'รายการบทความจริงอยู่ในส่วน “งานวิจัยที่เตรียมตีพิมพ์” ด้านล่าง' },
    ],
  },
  {
    title: 'การสอน & ภาระงาน',
    icon: '🎓',
    docs: [
      { type: 'course_outline', label: 'แผนการเรียนการสอน' },
      { type: 'teaching_eval', label: 'ผลประเมินการสอน' },
      { type: 'workload_other', label: 'ภาระงานนอกการสอน' },
      { type: 'speaker_invitation', label: 'หนังสือคำเชิญเป็นวิทยากร' },
      { type: 'conference_cert', label: 'หนังสือรับรองประชุมวิชาการ' },
    ],
  },
];

const TOTAL_TYPES = GROUPS.reduce((n, g) => n + g.docs.length, 0); // = 12

export default function DocChecklistSection({
  plan,
  docs,
  onChanged,
}: {
  plan: CareerPlan;
  docs: DocRow[];
  onChanged: () => void;
}) {
  const byType = new Map<string, DocRow>();
  for (const d of docs) byType.set(d.doc_type, d);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">
          📄 เอกสารตามมาตรฐาน ก.พ.อ. ({TOTAL_TYPES} ประเภท)
        </h3>
      </div>

      {GROUPS.map((g) => {
        const groupDocs = g.docs.map((spec) => ({ spec, doc: byType.get(spec.type) }));
        const readyCount = groupDocs.filter((d) => d.doc?.is_ready).length;
        return (
          <details key={g.title} open className="border border-slate-200 rounded-lg overflow-hidden">
            <summary className="px-3 py-2 bg-slate-50 cursor-pointer text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>
                {g.icon} {g.title}
              </span>
              <span className="text-[11px] font-normal text-gray-500">
                {readyCount} / {g.docs.length} ✓
              </span>
            </summary>
            <ul className="divide-y divide-slate-100">
              {groupDocs.map(({ spec, doc }) => (
                <DocRowItem
                  key={spec.type}
                  spec={spec}
                  doc={doc}
                  planId={plan.id}
                  researcherId={plan.researcher_id}
                  onChanged={onChanged}
                />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function DocRowItem({
  spec,
  doc,
  planId,
  researcherId,
  onChanged,
}: {
  spec: DocSpec;
  doc?: DocRow;
  planId: string;
  researcherId: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const toggleReady = async () => {
    if (!doc) return;
    setBusy(true);
    await supabase
      .from('academic_position_documents')
      .update({
        is_ready: !doc.is_ready,
        ready_at: !doc.is_ready ? new Date().toISOString() : null,
      })
      .eq('id', doc.id);
    setBusy(false);
    onChanged();
  };

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${researcherId}/${planId}/${spec.type}/${Date.now()}-${safeName}`;
      const up = await supabase.storage
        .from('academic-position-docs')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) throw up.error;

      // Upsert doc row
      if (doc) {
        await supabase
          .from('academic_position_documents')
          .update({
            source_kind: 'uploaded',
            storage_path: path,
            external_url: null,
            file_size_bytes: file.size,
            mime_type: file.type,
            title: file.name,
            is_ready: true,
            ready_at: new Date().toISOString(),
          })
          .eq('id', doc.id);
      } else {
        await supabase.from('academic_position_documents').insert({
          plan_id: planId,
          doc_type: spec.type,
          title: file.name,
          source_kind: 'uploaded',
          storage_path: path,
          file_size_bytes: file.size,
          mime_type: file.type,
          is_ready: true,
          ready_at: new Date().toISOString(),
        });
      }
      onChanged();
    } catch (e: any) {
      window.alert('อัปโหลดไม่สำเร็จ: ' + (e?.message || 'unknown'));
    } finally {
      setBusy(false);
    }
  };

  const saveLink = async () => {
    if (!linkUrl.trim()) return;
    setBusy(true);
    if (doc) {
      await supabase
        .from('academic_position_documents')
        .update({
          source_kind: 'external_link',
          external_url: linkUrl.trim(),
          storage_path: null,
          title: linkUrl.trim(),
          is_ready: true,
          ready_at: new Date().toISOString(),
        })
        .eq('id', doc.id);
    } else {
      await supabase.from('academic_position_documents').insert({
        plan_id: planId,
        doc_type: spec.type,
        title: linkUrl.trim(),
        source_kind: 'external_link',
        external_url: linkUrl.trim(),
        is_ready: true,
        ready_at: new Date().toISOString(),
      });
    }
    setLinkUrl('');
    setShowLinkInput(false);
    setBusy(false);
    onChanged();
  };

  const remove = async () => {
    if (!doc) return;
    if (!window.confirm(`ลบเอกสาร "${spec.label}" ?`)) return;
    setBusy(true);
    // Best-effort remove storage object
    if (doc.storage_path) {
      try {
        await supabase.storage.from('academic-position-docs').remove([doc.storage_path]);
      } catch {}
    }
    await supabase.from('academic_position_documents').delete().eq('id', doc.id);
    setBusy(false);
    onChanged();
  };

  const openFile = async () => {
    if (doc?.external_url) {
      window.open(doc.external_url, '_blank');
      return;
    }
    if (doc?.storage_path) {
      const { data } = await supabase.storage
        .from('academic-position-docs')
        .createSignedUrl(doc.storage_path, 60 * 5);
      if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
        window.open(data.signedUrl, '_blank');
      }
    }
  };

  return (
    <li className="px-3 py-2 flex items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={!!doc?.is_ready}
        disabled={!doc || busy}
        onChange={toggleReady}
        className="w-4 h-4 accent-emerald-600"
        title="มาร์คว่าพร้อมแล้ว"
      />
      <div className="flex-1 min-w-0">
        <div className="text-gray-800 font-medium truncate">
          {spec.label}
          {doc?.is_ready && <span className="ml-1 text-emerald-600">✓</span>}
        </div>
        {spec.hint && <div className="text-[10px] text-gray-400">{spec.hint}</div>}
        {doc && (
          <div className="text-[10px] text-gray-500 truncate">
            {doc.source_kind === 'uploaded'
              ? `📎 ${doc.title || 'ไฟล์'}${doc.file_size_bytes ? ` · ${Math.round(doc.file_size_bytes / 1024)}KB` : ''}`
              : doc.source_kind === 'external_link'
              ? `🔗 ${doc.external_url}`
              : '🔗 linked publication (Phase B)'}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {doc ? (
          <>
            <button
              onClick={openFile}
              className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded"
            >
              เปิด
            </button>
            <button
              onClick={remove}
              disabled={busy}
              className="text-[10px] px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded"
            >
              ลบ
            </button>
          </>
        ) : (
          <>
            <label
              className={`text-[10px] px-2 py-1 rounded cursor-pointer ${
                busy ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              + Upload
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
            <button
              onClick={() => setShowLinkInput((v) => !v)}
              className="text-[10px] px-2 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded"
            >
              + Link
            </button>
          </>
        )}
      </div>

      {showLinkInput && !doc && (
        <div className="absolute right-3 mt-12 bg-white border border-slate-200 rounded p-2 shadow-lg z-10 flex gap-1">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="text-xs px-2 py-1 border border-slate-200 rounded w-72"
            autoFocus
          />
          <button
            onClick={saveLink}
            disabled={busy || !linkUrl.trim()}
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            บันทึก
          </button>
        </div>
      )}
    </li>
  );
}
