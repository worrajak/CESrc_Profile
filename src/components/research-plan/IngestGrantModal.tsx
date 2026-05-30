'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';
import { extractFromPDF } from '@/lib/extractPDF';

/**
 * Domains we know render content with JS (SPA / Next.js / React).
 * Server-side URL fetch returns mostly "กำลังโหลด..." — not usable for AI extraction.
 * When URL matches one of these, we show a hint asking the user to paste text instead.
 * Add new entries here as you confirm each site's behaviour.
 */
const JS_RENDERED_DOMAINS: { match: string; name_th: string; name_en: string }[] = [
  { match: 'nriis.go.th', name_th: 'NRIIS (ระบบ ววน. แห่งชาติ)', name_en: 'NRIIS' },
];

function detectJsRendered(input: string) {
  if (!input) return null;
  const lower = input.toLowerCase();
  // Try parsing as URL first, fall back to substring match for partial typing
  try {
    const host = new URL(input).hostname.toLowerCase();
    return JS_RENDERED_DOMAINS.find((d) => host.includes(d.match)) || null;
  } catch {
    return JS_RENDERED_DOMAINS.find((d) => lower.includes(d.match)) || null;
  }
}

type StrategySubProgram = {
  code?: string;
  name?: string;
  topic?: string;       // แผนงานย่อยรายประเด็น
  groups?: string[];    // กลุ่มเรื่อง
};

type StrategyHierarchy = {
  strategy_no?: string;
  program?: string;
  sub_programs?: StrategySubProgram[];
};

type ExtractedGrant = {
  agency_code?: string;
  agency_name_th?: string;
  agency_name_en?: string;
  call_code?: string;
  call_name_th?: string;
  call_name_en?: string;
  fiscal_year_be?: number;
  announce_date?: string;
  open_date?: string;
  close_date?: string;
  result_date?: string;
  budget_min?: number;
  budget_max?: number;
  duration_months?: number;
  eligibility_th?: string;
  conditions_th?: string;
  scope_th?: string;
  research_areas?: string[];
  required_outputs?: string[];
  announcement_url?: string;
  regulations_url?: string;
  // NRIIS-style strategy hierarchy + submission/result details
  strategy?: StrategyHierarchy;
  submission_details_th?: string;
  result_channels?: string[];
};

export default function IngestGrantModal({
  onClose,
  onSaved,
  editTarget,
}: {
  onClose: () => void;
  onSaved: () => void;
  /**
   * If provided, the modal opens directly in the review step with the row's
   * fields pre-populated and saves via UPDATE instead of UPSERT. Used by the
   * admin Edit menu on /research-plan cards.
   */
  editTarget?: (ExtractedGrant & { id: string }) | null;
}) {
  const { t, locale } = useI18n();
  const isEditing = Boolean(editTarget);
  const [step, setStep] = useState<'input' | 'review'>(isEditing ? 'review' : 'input');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMime, setImageMime] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState<ExtractedGrant | null>(editTarget || null);
  const [aiMeta, setAiMeta] = useState<{ source: string; model: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setError(
        locale === 'en'
          ? 'Please upload an image (PNG/JPG) or a PDF file'
          : 'กรุณาอัปโหลดไฟล์รูป (PNG/JPG) หรือ PDF',
      );
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setError(locale === 'en' ? 'File too large (max 16MB)' : 'ไฟล์ใหญ่เกิน 16MB');
      return;
    }

    setError('');

    // ── PDF path: extract text in browser; fall back to vision on scanned PDFs ──
    if (isPdf) {
      setProcessing(true);
      try {
        const result = await extractFromPDF(file);
        if (result.kind === 'text') {
          // Got embedded text — switch to TEXT mode + populate textarea so the
          // user can review/edit before sending to AI.
          setMode('text');
          setUrl('');
          setText(result.text);
          setImageBase64('');
          setImageMime('');
          setImagePreview('');
        } else {
          // Scanned PDF — first page rendered to PNG → vision path
          setMode('image');
          setImageBase64(result.imageBase64);
          setImageMime(result.imageMime);
          setImagePreview(result.preview);
        }
      } catch (e: any) {
        setError(
          (locale === 'en' ? 'PDF extraction failed: ' : 'อ่าน PDF ไม่สำเร็จ: ') +
            (e?.message || 'unknown error'),
        );
      } finally {
        setProcessing(false);
      }
      return;
    }

    // ── Image path (unchanged) ──
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
      setImageMime(file.type);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Derived: is the user's URL pointing at a JS-rendered SPA?
  const jsHint = mode === 'text' ? detectJsRendered(url) : null;

  const handleExtract = async () => {
    if (mode === 'image' && !imageBase64) {
      setError(locale === 'en' ? 'Upload an image first' : 'กรุณาอัปโหลดรูปก่อน');
      return;
    }
    if (mode === 'text' && !url.trim() && !text.trim()) {
      setError(locale === 'en' ? 'Provide URL or paste text' : 'กรุณาใส่ URL หรือข้อความ');
      return;
    }
    // Guard: JS-rendered URL + no pasted text → server fetch would just get "Loading..."
    if (mode === 'text' && jsHint && !text.trim()) {
      setError(
        locale === 'en'
          ? `${jsHint.name_en} loads content with JavaScript — URL fetch will not work. Please open the page in your browser, copy the announcement text, and paste it in the Text box below.`
          : `${jsHint.name_th} โหลดเนื้อหาด้วย JavaScript — ดึง URL ตรงไม่ได้ กรุณาเปิดหน้าในเบราว์เซอร์ คัดลอกเนื้อหา แล้ววางในช่อง "ข้อความ" ด้านล่าง`,
      );
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const body =
        mode === 'image'
          ? { image_base64: imageBase64, image_mime: imageMime }
          : { url: url.trim() || undefined, text: text.trim() || undefined };
      const res = await fetch('/api/research-plan/ingest-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Extraction failed');
      setExtracted(json.data || {});
      setAiMeta({ source: json.source, model: json.model });
      setStep('review');
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!extracted) return;
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        agency_code: extracted.agency_code || 'UNKNOWN',
        agency_name_th: extracted.agency_name_th || extracted.agency_name_en || 'Unknown',
        agency_name_en: extracted.agency_name_en || null,
        call_code: extracted.call_code || `CALL-${Date.now()}`,
        call_name_th: extracted.call_name_th || extracted.call_name_en || 'Untitled',
        call_name_en: extracted.call_name_en || null,
        fiscal_year_be: extracted.fiscal_year_be || null,
        announce_date: extracted.announce_date || null,
        open_date: extracted.open_date || null,
        close_date: extracted.close_date || null,
        result_date: extracted.result_date || null,
        budget_min: extracted.budget_min ?? null,
        budget_max: extracted.budget_max ?? null,
        duration_months: extracted.duration_months ?? null,
        eligibility_th: extracted.eligibility_th || null,
        conditions_th: extracted.conditions_th || null,
        scope_th: extracted.scope_th || null,
        research_areas: extracted.research_areas?.length ? extracted.research_areas : null,
        required_outputs: extracted.required_outputs?.length ? extracted.required_outputs : null,
        announcement_url: extracted.announcement_url || url || null,
        regulations_url: extracted.regulations_url || null,
        // NRIIS-style strategy hierarchy + submission/result details (migration 053)
        strategy: extracted.strategy && Object.keys(extracted.strategy).length ? extracted.strategy : null,
        submission_details_th: extracted.submission_details_th || null,
        result_channels: extracted.result_channels?.length ? extracted.result_channels : null,
        status: 'upcoming',
        ai_extracted_data: extracted as any,
        ai_provider: aiMeta?.source || null,
        ingested_at: new Date().toISOString(),
      };
      const { error: dbErr } = isEditing && editTarget?.id
        ? await supabase.from('grant_calls').update(payload).eq('id', editTarget.id)
        : await supabase
            .from('grant_calls')
            .upsert(payload, { onConflict: 'agency_code,call_code' });
      if (dbErr) throw dbErr;
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">
              {isEditing
                ? locale === 'en' ? 'Edit grant call' : 'แก้ไขแหล่งทุน'
                : t('rplan.ingest.title')}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              {isEditing
                ? locale === 'en' ? 'Update fields and save' : 'แก้ไขข้อมูลและบันทึก'
                : step === 'input'
                ? locale === 'en'
                  ? 'AI will extract dates, budget, conditions automatically'
                  : 'AI จะสกัดวันสำคัญ งบประมาณ เงื่อนไข อัตโนมัติ'
                : t('rplan.ingest.review')}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6">
          {step === 'input' ? (
            <>
              {/* Mode toggle */}
              <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`px-4 py-1.5 text-xs rounded-lg font-medium transition ${
                    mode === 'text' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📝 {locale === 'en' ? 'URL / Text' : 'URL / ข้อความ'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={`px-4 py-1.5 text-xs rounded-lg font-medium transition ${
                    mode === 'image' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📷 {locale === 'en' ? 'Image / PDF' : 'รูป / PDF'}
                </button>
              </div>

              <div className="space-y-4">
                {mode === 'text' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t('rplan.ingest.url_label')}
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.rmutl.ac.th/..."
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                          jsHint ? 'border-amber-300 bg-amber-50/30' : ''
                        }`}
                      />
                      {jsHint ? (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-800 leading-relaxed">
                          <div className="font-semibold mb-1">
                            ⚠{' '}
                            {locale === 'en'
                              ? `${jsHint.name_en} loads content with JavaScript — direct URL fetch returns only "Loading…"`
                              : `${jsHint.name_th} โหลดเนื้อหาด้วย JavaScript — ดึง URL ตรงได้แค่ "กำลังโหลด…"`}
                          </div>
                          <div className="text-amber-700">
                            {locale === 'en' ? 'Please do this instead:' : 'กรุณาทำตามนี้แทน:'}
                          </div>
                          <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-amber-700">
                            <li>{locale === 'en' ? 'Open the URL in your browser' : 'เปิด URL ในเบราว์เซอร์'}</li>
                            <li>
                              {locale === 'en'
                                ? 'Select the announcement content and copy (Cmd/Ctrl+C)'
                                : 'เลือกเนื้อหาประกาศ แล้ว copy (Cmd/Ctrl+C)'}
                            </li>
                            <li>
                              {locale === 'en'
                                ? 'Paste into the Text box below ↓'
                                : 'วางในช่อง "ข้อความ" ด้านล่าง ↓'}
                            </li>
                          </ol>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 mt-1">
                          {locale === 'en'
                            ? '(Currently URL fetch may be blocked by some sites — paste text below for best results)'
                            : '(บางเว็บไม่ให้ดึงข้อมูล — แนะนำ paste ข้อความด้านล่างเพื่อความแม่นยำ)'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t('rplan.ingest.text_label')}
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        placeholder={
                          locale === 'en'
                            ? 'Paste the announcement text here (Thai or English)'
                            : 'วางข้อความประกาศ (ไทยหรืออังกฤษ) ตรงนี้\n\nตัวอย่าง:\nประกาศ มทร.ล้านนา เรื่อง การเปิดรับข้อเสนอโครงการวิจัย FF71...\nกำหนดการ:\n- เปิดรับ: 1 ก.พ. 2569\n- ปิดรับ: 31 มี.ค. 2569\n...'
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        {locale === 'en'
                          ? 'Upload announcement — image (PNG/JPG) or PDF'
                          : 'อัปโหลดประกาศ — รูป (PNG/JPG) หรือ PDF'}
                      </label>

                      {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                          <div className="flex flex-col items-center justify-center py-6">
                            <div className="text-4xl mb-2">📤</div>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">
                                {locale === 'en' ? 'Click to upload' : 'คลิกเพื่ออัปโหลด'}
                              </span>{' '}
                              {locale === 'en' ? 'or drag & drop' : 'หรือลากมาวาง'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG (max 16MB)</p>
                            <p className="text-[10px] text-gray-400 mt-2 text-center max-w-sm leading-relaxed">
                              {locale === 'en'
                                ? 'PDF: extracts text automatically, falls back to vision for scanned PDFs. Image: vision AI reads dates, budget, conditions.'
                                : 'PDF: ดึงตัวอักษรอัตโนมัติ ถ้าเป็น PDF สแกนใช้ vision · รูป: vision อ่านวันสำคัญ งบประมาณ เงื่อนไข'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*,application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFile(f);
                            }}
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-full max-h-80 object-contain border rounded-lg bg-gray-50"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageBase64('');
                              setImageMime('');
                            }}
                            className="absolute top-2 right-2 bg-white shadow rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                          >
                            ×
                          </button>
                          <p className="text-[11px] text-gray-500 mt-2">
                            {locale === 'en'
                              ? 'AI will use vision to extract all fields from this image'
                              : 'AI จะใช้ vision สกัดทุก field จากรูปนี้'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleExtract}
                  disabled={processing}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  {processing ? `✨ ${t('rplan.ingest.processing')}` : t('rplan.ingest.submit')}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {locale === 'en' ? 'Cancel' : 'ยกเลิก'}
                </button>
              </div>
            </>
          ) : (
            <>
              {aiMeta && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-xs text-emerald-700">
                  ✓ {locale === 'en' ? 'Extracted by' : 'สกัดโดย'} <strong>{aiMeta.source}</strong> ({aiMeta.model})
                </div>
              )}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <Field label={locale === 'en' ? 'Agency code' : 'รหัสแหล่งทุน'}>
                  <input
                    type="text"
                    value={extracted?.agency_code || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), agency_code: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
                <Field label={locale === 'en' ? 'Agency name (TH)' : 'ชื่อแหล่งทุน (ไทย)'}>
                  <input
                    type="text"
                    value={extracted?.agency_name_th || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), agency_name_th: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
                <Field label={locale === 'en' ? 'Call code' : 'รหัสรอบทุน'}>
                  <input
                    type="text"
                    value={extracted?.call_code || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), call_code: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                    placeholder="FF71"
                  />
                </Field>
                <Field label={locale === 'en' ? 'Call name (TH)' : 'ชื่อรอบทุน (ไทย)'}>
                  <input
                    type="text"
                    value={extracted?.call_name_th || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), call_name_th: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('rplan.field.open')}>
                    <input
                      type="date"
                      value={extracted?.open_date || ''}
                      onChange={(e) => setExtracted({ ...(extracted || {}), open_date: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded text-sm"
                    />
                  </Field>
                  <Field label={t('rplan.field.close')}>
                    <input
                      type="date"
                      value={extracted?.close_date || ''}
                      onChange={(e) => setExtracted({ ...(extracted || {}), close_date: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded text-sm"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={`${locale === 'en' ? 'Budget min' : 'งบขั้นต่ำ'} (THB)`}>
                    <input
                      type="number"
                      value={extracted?.budget_min ?? ''}
                      onChange={(e) =>
                        setExtracted({ ...(extracted || {}), budget_min: e.target.value ? +e.target.value : undefined })
                      }
                      className="w-full px-3 py-1.5 border rounded text-sm"
                    />
                  </Field>
                  <Field label={`${locale === 'en' ? 'Budget max' : 'งบสูงสุด'} (THB)`}>
                    <input
                      type="number"
                      value={extracted?.budget_max ?? ''}
                      onChange={(e) =>
                        setExtracted({ ...(extracted || {}), budget_max: e.target.value ? +e.target.value : undefined })
                      }
                      className="w-full px-3 py-1.5 border rounded text-sm"
                    />
                  </Field>
                </div>

                <Field label={t('rplan.field.scope')}>
                  <textarea
                    value={extracted?.scope_th || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), scope_th: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
                <Field label={t('rplan.field.eligibility')}>
                  <textarea
                    value={extracted?.eligibility_th || ''}
                    onChange={(e) => setExtracted({ ...(extracted || {}), eligibility_th: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
                <Field label={locale === 'en' ? 'Research areas (comma-separated)' : 'หัวข้อวิจัย (คั่นด้วย ,)'}>
                  <input
                    type="text"
                    value={(extracted?.research_areas || []).join(', ')}
                    onChange={(e) =>
                      setExtracted({
                        ...(extracted || {}),
                        research_areas: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>

                {/* ── NRIIS-style strategy hierarchy ── */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    🧭 {locale === 'en' ? 'Strategy hierarchy (NRIIS)' : 'โครงสร้างยุทธศาสตร์ (NRIIS)'}
                  </h4>
                  <div className="space-y-2">
                    <Field label={locale === 'en' ? 'Strategy (ยุทธศาสตร์ที่)' : 'ยุทธศาสตร์ที่'}>
                      <input
                        type="text"
                        value={extracted?.strategy?.strategy_no || ''}
                        onChange={(e) =>
                          setExtracted({
                            ...(extracted || {}),
                            strategy: { ...(extracted?.strategy || {}), strategy_no: e.target.value },
                          })
                        }
                        placeholder="ยุทธศาสตร์ที่ 2 การยกระดับสังคม..."
                        className="w-full px-3 py-1.5 border rounded text-sm"
                      />
                    </Field>
                    <Field label={locale === 'en' ? 'Program (แผนงาน)' : 'แผนงาน'}>
                      <input
                        type="text"
                        value={extracted?.strategy?.program || ''}
                        onChange={(e) =>
                          setExtracted({
                            ...(extracted || {}),
                            strategy: { ...(extracted?.strategy || {}), program: e.target.value },
                          })
                        }
                        placeholder="P9 พัฒนาสังคมสูงวัย..."
                        className="w-full px-3 py-1.5 border rounded text-sm"
                      />
                    </Field>

                    {/* Sub-programs (repeating) — read-only listing for now, admins can edit later via JSON */}
                    {(extracted?.strategy?.sub_programs || []).length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-gray-600 mb-1">
                          {locale === 'en' ? 'Sub-programs (แผนงานย่อย)' : 'แผนงานย่อย'}
                        </div>
                        <div className="space-y-2">
                          {(extracted?.strategy?.sub_programs || []).map((sp, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                            >
                              <div className="font-semibold text-slate-700">
                                {sp.code ? `[${sp.code}] ` : ''}
                                {sp.name || '—'}
                              </div>
                              {sp.topic && (
                                <div className="mt-1 text-slate-600">
                                  <span className="text-slate-400">แผนงานย่อยรายประเด็น:</span> {sp.topic}
                                </div>
                              )}
                              {sp.groups && sp.groups.length > 0 && (
                                <ul className="mt-1 text-slate-600 list-disc pl-5">
                                  {sp.groups.map((g, gi) => (
                                    <li key={gi}>{g}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Submission details + result channels ── */}
                <Field label={locale === 'en' ? 'Submission details' : 'การส่งข้อเสนอ (วิธีลงทะเบียน · ขั้นตอนยืนยัน)'}>
                  <textarea
                    value={extracted?.submission_details_th || ''}
                    onChange={(e) =>
                      setExtracted({ ...(extracted || {}), submission_details_th: e.target.value })
                    }
                    rows={3}
                    placeholder="ลงทะเบียนที่ https://nriis.go.th ... ทำการ ‘ยืนยัน’ การส่ง..."
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
                <Field label={locale === 'en' ? 'Result channels (URLs, comma-separated)' : 'ช่องทางประกาศผล (URL คั่นด้วย ,)'}>
                  <input
                    type="text"
                    value={(extracted?.result_channels || []).join(', ')}
                    onChange={(e) =>
                      setExtracted({
                        ...(extracted || {}),
                        result_channels: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="https://www.nrct.go.th, https://nriis.go.th"
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </Field>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                {!isEditing && (
                  <button
                    onClick={() => setStep('input')}
                    className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    ← {locale === 'en' ? 'Back' : 'ย้อนกลับ'}
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    {locale === 'en' ? 'Cancel' : 'ยกเลิก'}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {saving
                    ? '...'
                    : isEditing
                    ? locale === 'en' ? 'Update' : 'บันทึกการแก้ไข'
                    : locale === 'en' ? 'Save grant call' : 'บันทึกแหล่งทุน'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
