'use client';

import { useState } from 'react';

export type ExtractedInnovation = {
  title_th?: string;
  title_en?: string;
  short_desc_th?: string;
  long_desc_th?: string;
  innovation_type?: string;
  ip_number?: string;
  filing_date?: string;
  grant_date?: string;
  status?: string;
  license_type?: string;
  license_holder_name?: string;
  license_contract_no?: string;
  license_start_date?: string;
  license_end_date?: string;
  license_territory?: string;
  license_fee_breakdown?: any;
  license_fee_thb?: number;
  notes?: string;
};

export default function IngestInnovationModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (data: ExtractedInnovation, meta: { source: string; model: string }) => void;
}) {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMime, setImageMime] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState<ExtractedInnovation | null>(null);
  const [meta, setMeta] = useState<{ source: string; model: string } | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาอัปโหลดไฟล์รูป (PNG/JPG)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกิน 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageBase64(dataUrl.split(',')[1]);
      setImageMime(file.type);
      setImagePreview(dataUrl);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const extract = async () => {
    if (mode === 'image' && !imageBase64) {
      setError('กรุณาอัปโหลดรูปก่อน');
      return;
    }
    if (mode === 'text' && !url.trim() && !text.trim()) {
      setError('กรุณาใส่ URL หรือข้อความ');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body =
        mode === 'image'
          ? { image_base64: imageBase64, image_mime: imageMime }
          : { url: url.trim() || undefined, text: text.trim() || undefined };
      const res = await fetch('/api/admin/innovations/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Extraction failed');
      setExtracted(json.data || {});
      setMeta({ source: json.source, model: json.model });
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const applyAndClose = () => {
    if (extracted && meta) onApply(extracted, meta);
    onClose();
  };

  const fieldsFound = extracted ? Object.keys(extracted).filter((k) => (extracted as any)[k] != null && (extracted as any)[k] !== '').length : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">✨ AI สกัดข้อมูลนวัตกรรม</h2>
            <p className="text-xs text-amber-100 mt-0.5">
              วาง URL/ข้อความ หรืออัปโหลดรูปเอกสารสิทธิบัตร · AI กรอกฟอร์มให้อัตโนมัติ
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          {!extracted ? (
            <>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`px-4 py-1.5 text-xs rounded-lg font-medium transition ${
                    mode === 'text' ? 'bg-white shadow text-amber-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📝 URL / ข้อความ
                </button>
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={`px-4 py-1.5 text-xs rounded-lg font-medium transition ${
                    mode === 'image' ? 'bg-white shadow text-amber-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📷 รูปเอกสาร
                </button>
              </div>

              {mode === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">URL (ถ้ามี)</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">หรือวางข้อความเอกสาร</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={10}
                      placeholder={
                        'วางเนื้อหาสัญญา/อนุสิทธิบัตร เช่น...\n\n' +
                        'สัญญาเลขที่ TLO-LCA-2567-002\n' +
                        'เรื่อง "เครื่องอ่านและบันทึกค่าหลายชนิดโดยใช้เทคโนโลยีอินเตอร์เน็ตของทุกสรรพสิ่ง"\n' +
                        'อนุสิทธิบัตรเลขที่ 2001008879\n' +
                        '...'
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">อัปโหลดรูปเอกสาร</label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center py-6">
                        <div className="text-4xl mb-2">📤</div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากมาวาง
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 8MB)</p>
                        <p className="text-[10px] text-gray-400 mt-2 text-center max-w-sm">
                          AI จะอ่านเลขสิทธิบัตร วันที่ ค่าสิทธิ จากรูปสัญญาให้
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="preview" className="w-full max-h-80 object-contain border rounded-lg bg-gray-50" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageBase64('');
                          setImageMime('');
                        }}
                        className="absolute top-2 right-2 bg-white shadow rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-100"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3 text-sm text-red-700">{error}</div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={extract}
                  disabled={busy}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? '🔮 AI กำลังสกัด…' : '✨ สกัดข้อมูล'}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                  ยกเลิก
                </button>
              </div>
            </>
          ) : (
            <>
              {meta && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-xs text-emerald-700">
                  ✓ สกัดโดย <strong>{meta.source}</strong> ({meta.model}) — เจอ {fieldsFound} ช่อง
                </div>
              )}

              {/* Preview of extracted fields */}
              <div className="space-y-1.5 max-h-[55vh] overflow-y-auto text-xs">
                {Object.entries(extracted).map(([k, v]) => {
                  if (v == null || v === '') return null;
                  const display = typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);
                  return (
                    <div key={k} className="flex gap-2 py-1 border-b">
                      <span className="font-mono text-amber-700 flex-shrink-0 w-40">{k}</span>
                      <span className="text-gray-800 break-words whitespace-pre-wrap min-w-0 flex-1">{display}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setExtracted(null)}
                  className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  ← สกัดใหม่
                </button>
                <button
                  onClick={applyAndClose}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  ✅ กรอกลงในฟอร์ม
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
