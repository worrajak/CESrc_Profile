'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/I18nContext';

export default function CriteriaUploadModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const [mode, setMode] = useState<'text' | 'url' | 'image'>('text');
  const [sourceText, setSourceText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMime, setImageMime] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ count: number; source: string } | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(locale === 'en' ? 'Please upload an image (PNG/JPG)' : 'กรุณาอัปโหลดไฟล์รูป (PNG/JPG)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(locale === 'en' ? 'Image too large (max 8MB)' : 'ไฟล์ใหญ่เกิน 8MB');
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

  const handleSubmit = async () => {
    setProcessing(true);
    setError('');
    setSuccess(null);
    try {
      const body: any = {};
      if (mode === 'image' && imageBase64) {
        body.image_base64 = imageBase64;
        body.image_mime = imageMime;
      } else if (mode === 'url' && sourceUrl.trim()) {
        body.source_url = sourceUrl.trim();
      } else if (mode === 'text' && sourceText.trim()) {
        body.source_text = sourceText.trim();
      } else {
        setError(locale === 'en' ? 'Please provide input' : 'กรุณาใส่ข้อมูล');
        setProcessing(false);
        return;
      }
      const res = await fetch('/api/research-plan/fetch-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed');
      const saved = json.data?.saved || [];
      setSuccess({ count: saved.length, source: json.source });
      // Wait a moment before closing so user sees the success
      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-r from-rose-700 to-pink-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">
              📥 {locale === 'en' ? 'Upload promotion criteria' : 'นำเข้าเกณฑ์ตำแหน่งวิชาการ'}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              {locale === 'en'
                ? 'AI will extract ผศ./รศ./ศ. criteria from your source'
                : 'AI จะสกัดเกณฑ์ ผศ./รศ./ศ. จากแหล่งที่ท่านให้มา'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Mode toggle */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-xl w-fit">
            {(['text', 'url', 'image'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                  mode === m ? 'bg-white shadow text-rose-700' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {m === 'text' ? '📝 ' : m === 'url' ? '🔗 ' : '📷 '}
                {m === 'text'
                  ? locale === 'en' ? 'Paste text' : 'วางข้อความ'
                  : m === 'url'
                  ? 'URL'
                  : locale === 'en' ? 'Image' : 'รูป'}
              </button>
            ))}
          </div>

          {mode === 'text' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'en' ? 'Paste criteria text (Thai)' : 'วางข้อความเกณฑ์ (ไทย)'}
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={10}
                placeholder={
                  locale === 'en'
                    ? 'Paste the full text from ก.พ.อ. announcement or university regulation'
                    : 'วางข้อความประกาศ ก.พ.อ. ฉบับล่าสุด หรือระเบียบของมหาวิทยาลัย เช่น...\n\nผู้ช่วยศาสตราจารย์ — วิธีปกติ:\n• เคยสอนระดับอุดมศึกษาไม่น้อยกว่า 1 ภาคการศึกษา\n• มีผลงานวิจัยอย่างน้อย 1 เรื่อง ตีพิมพ์ในวารสาร...\n• มีผลงานวิชาการอื่น 1 ชิ้น...\n\nวิธีพิเศษ:\n...'
                }
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          )}

          {mode === 'url' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://www.mua.go.th/..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                {locale === 'en'
                  ? 'AI uses URL as a context hint (cannot always fetch). For best results, paste the text.'
                  : 'AI จะใช้ URL เป็น hint (อาจ fetch ไม่ได้บางเว็บ) แนะนำใช้ "วางข้อความ" หรือ "รูป" ถ้าได้'}
              </p>
            </div>
          )}

          {mode === 'image' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {locale === 'en' ? 'Upload criteria document image' : 'อัปโหลดรูปเอกสารเกณฑ์'}
              </label>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center py-6">
                    <div className="text-4xl mb-2">📤</div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{locale === 'en' ? 'Click to upload' : 'คลิกเพื่ออัปโหลด'}</span>{' '}
                      {locale === 'en' ? 'or drag & drop' : 'หรือลากมาวาง'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 8MB)</p>
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

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3 text-sm text-emerald-700">
              ✓ {locale === 'en' ? `Saved ${success.count} position criteria via ${success.source}` : `บันทึกเกณฑ์ ${success.count} ตำแหน่งจาก ${success.source} แล้ว`}
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {processing
                ? locale === 'en' ? 'AI extracting…' : 'AI กำลังสกัด…'
                : locale === 'en' ? '✨ Extract & save' : '✨ สกัดและบันทึก'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
              {locale === 'en' ? 'Cancel' : 'ยกเลิก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
