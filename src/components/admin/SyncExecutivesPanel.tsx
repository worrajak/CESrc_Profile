'use client';

/**
 * SyncExecutivesPanel — admin tool for syncing RMUTL executive roles
 * ─────────────────────────────────────────────────────────────────
 * 1. Click "🏛️ ซิงค์ผู้บริหาร RMUTL" → GET /api/admin/researchers/
 *    sync-executives?preview=1 — scrapes rmutl.ac.th/structure/executive
 *    and returns proposed matches (no DB writes yet).
 * 2. Admin reviews the proposed matches table — toggle confirm checkboxes
 *    on the rows they want to apply.
 * 3. Click "Apply selected" → POST → UPDATE rows in researchers.
 *
 * Embed by importing and rendering on /admin/researchers.
 */

import { useState } from 'react';
import { adminJSON, adminFetch } from '@/lib/admin-auth-client';

type Proposal = {
  rmutl_name: string;
  rmutl_role: string;
  rmutl_photo_url: string;
  researcher_id: string | null;
  researcher_name: string | null;
  has_existing_role: boolean;
  has_existing_avatar: boolean;
  confidence: 'exact' | 'first+last' | 'last_only' | 'none';
};

type PreviewResp = {
  source_url: string;
  total_execs: number;
  matched: number;
  proposals: Proposal[];
};

const CONFIDENCE_COLOR: Record<Proposal['confidence'], string> = {
  exact: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'first+last': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  last_only: 'bg-amber-50 text-amber-700 border-amber-200',
  none: 'bg-slate-100 text-slate-500 border-slate-200',
};

const CONFIDENCE_LABEL: Record<Proposal['confidence'], string> = {
  exact: 'ตรงทุกตัวอักษร',
  'first+last': 'ตรงชื่อ+นามสกุล',
  last_only: 'ตรงแค่นามสกุล',
  none: 'ไม่พบ',
};

const PRESET_URLS: { label: string; url: string }[] = [
  { label: 'มหา\'ลัย (อธิการ/รองอธิการ/คณบดี)', url: 'https://www.rmutl.ac.th/structure/executive' },
  { label: 'สถาบันวิจัยและพัฒนา (RDI)', url: 'https://rdi.rmutl.ac.th/structure/Executives_personnel' },
];

export default function SyncExecutivesPanel() {
  const [sourceUrl, setSourceUrl] = useState<string>(PRESET_URLS[0].url);
  const [preview, setPreview] = useState<PreviewResp | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const loadPreview = async () => {
    if (!sourceUrl.trim()) {
      setMessage({ kind: 'err', text: 'กรุณาใส่ URL ก่อน' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setSelected(new Set());
    try {
      const res = await adminFetch(
        '/api/admin/researchers/sync-executives?preview=1&url=' +
          encodeURIComponent(sourceUrl.trim()),
      );
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      const data = json as PreviewResp;
      setPreview(data);
      // Auto-select all confident matches by default
      const auto = new Set<number>();
      data.proposals.forEach((p, i) => {
        if (p.researcher_id && (p.confidence === 'exact' || p.confidence === 'first+last')) {
          auto.add(i);
        }
      });
      setSelected(auto);
    } catch (e: any) {
      setMessage({ kind: 'err', text: e.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const applySelected = async () => {
    if (!preview || selected.size === 0) return;
    setApplying(true);
    setMessage(null);
    try {
      const matches = Array.from(selected)
        .map((i) => preview.proposals[i])
        .filter((p) => p.researcher_id)
        .map((p) => ({
          researcher_id: p.researcher_id,
          role: p.rmutl_role,
          photo_url: p.rmutl_photo_url,
          source_url: preview.source_url,
        }));
      const res = await adminJSON('/api/admin/researchers/sync-executives', 'POST', { matches });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);

      const applied = Number(json.applied || 0);
      const failed = Number(json.failed || 0);

      // Pull the first per-row error message (if any) — usually surfaces
      // missing-column errors ("column ... does not exist") when the
      // migration hasn't been run yet.
      const firstError =
        (json.results || [])
          .filter((r: any) => !r.ok)
          .map((r: any) => r.error)
          .find(Boolean) || '';

      if (applied === 0 && failed > 0) {
        // Total failure — surface as error, not a green success.
        setMessage({
          kind: 'err',
          text:
            `ล้มเหลวทั้งหมด ${failed} คน` +
            (firstError ? ` · ${firstError}` : '') +
            (/column.*does not exist/i.test(firstError)
              ? ' · กรุณารัน supabase/055_researcher_executive_role.sql ใน Supabase SQL Editor ก่อน'
              : ''),
        });
      } else {
        setMessage({
          kind: 'ok',
          text:
            `อัปเดต ${applied}/${matches.length} คนสำเร็จ` +
            (failed
              ? ` · ล้มเหลว ${failed}${firstError ? ` (${firstError})` : ''}`
              : ''),
        });
        setPreview(null);
        setSelected(new Set());
      }
    } catch (e: any) {
      setMessage({ kind: 'err', text: e.message || 'Apply failed' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          🏛️ ซิงค์ตำแหน่งบริหารจากเว็บ RMUTL
        </h2>
        <p className="text-xs text-gray-500 mt-0.5 max-w-2xl leading-relaxed">
          ดึงข้อมูลจากหน้าโครงสร้างผู้บริหารบนเว็บ rmutl.ac.th → จับคู่กับ researchers ในระบบ →
          preview ก่อนบันทึก · ตรวจสอบ checkbox ของแต่ละแถวก่อน Apply · รองรับเฉพาะโดเมน *.rmutl.ac.th
        </p>
      </div>

      <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <label className="block text-[11px] font-medium text-gray-600 uppercase tracking-wide mb-1">
          URL ของหน้าผู้บริหาร
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://...rmutl.ac.th/.../structure/..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[10px] text-gray-400 mr-1">ตัวอย่างเร็ว:</span>
          {PRESET_URLS.map((p) => (
            <button
              key={p.url}
              type="button"
              onClick={() => setSourceUrl(p.url)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                sourceUrl === p.url
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={loadPreview}
            disabled={loading || !sourceUrl.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap"
          >
            {loading ? '⏳ กำลังดึงข้อมูล...' : '🔍 ดึงข้อมูล + จับคู่'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-3 rounded-lg px-3 py-2 text-xs ${
            message.kind === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.kind === 'ok' ? '✓ ' : '✗ '}
          {message.text}
        </div>
      )}

      {preview && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>
              พบ <strong className="text-gray-700">{preview.total_execs}</strong> ผู้บริหารใน RMUTL ·
              จับคู่ได้ <strong className="text-emerald-700">{preview.matched}</strong> คน
            </span>
            <span>
              เลือกแล้ว <strong className="text-blue-700">{selected.size}</strong> คน
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="w-8 px-2 py-2"></th>
                  <th className="px-2 py-2 text-left">ภาพ</th>
                  <th className="px-2 py-2 text-left">ชื่อ (RMUTL)</th>
                  <th className="px-2 py-2 text-left">ตำแหน่ง</th>
                  <th className="px-2 py-2 text-left">ตรงกับ researcher</th>
                  <th className="px-2 py-2 text-left">ความมั่นใจ</th>
                </tr>
              </thead>
              <tbody>
                {preview.proposals.map((p, i) => {
                  const disabled = !p.researcher_id;
                  return (
                    <tr
                      key={i}
                      className={`border-t border-slate-100 ${disabled ? 'opacity-50' : ''}`}
                    >
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          disabled={disabled}
                          onChange={() => toggleRow(i)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-2 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.rmutl_photo_url}
                          alt={p.rmutl_name}
                          className="w-10 h-12 object-cover rounded border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="font-medium text-gray-800 max-w-[200px] truncate">
                          {p.rmutl_name}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-gray-700 max-w-[180px]">{p.rmutl_role}</td>
                      <td className="px-2 py-2">
                        {p.researcher_name ? (
                          <div className="text-gray-800">
                            {p.researcher_name}
                            {p.has_existing_role && (
                              <span className="ml-1 text-[10px] text-amber-600">
                                (มีตำแหน่งเดิม)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">ไม่พบใน CESRU</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-medium ${CONFIDENCE_COLOR[p.confidence]}`}
                        >
                          {CONFIDENCE_LABEL[p.confidence]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={applySelected}
              disabled={applying || selected.size === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {applying ? '⏳ กำลังบันทึก...' : `✓ Apply ${selected.size} คน`}
            </button>
            <button
              onClick={() => {
                setPreview(null);
                setSelected(new Set());
              }}
              className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <p className="text-[10px] text-gray-400 ml-2">
              💡 แถวที่ <strong>ตรงทุกตัวอักษร / ตรงชื่อ+นามสกุล</strong> ถูกเลือกอัตโนมัติ ·
              ตรวจสอบ <strong>ตรงแค่นามสกุล</strong> เองก่อน apply
            </p>
          </div>
        </>
      )}
    </div>
  );
}
