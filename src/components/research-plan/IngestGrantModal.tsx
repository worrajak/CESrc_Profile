'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

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
};

export default function IngestGrantModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState<ExtractedGrant | null>(null);
  const [aiMeta, setAiMeta] = useState<{ source: string; model: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleExtract = async () => {
    if (!url.trim() && !text.trim()) {
      setError(locale === 'en' ? 'Please provide URL or text' : 'กรุณาใส่ URL หรือข้อความ');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/research-plan/ingest-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() || undefined, text: text.trim() || undefined }),
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
        status: 'upcoming',
        ai_extracted_data: extracted as any,
        ai_provider: aiMeta?.source || null,
        ingested_at: new Date().toISOString(),
      };
      const { error: dbErr } = await supabase
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
            <h2 className="font-bold text-lg">{t('rplan.ingest.title')}</h2>
            <p className="text-xs text-blue-100 mt-0.5">
              {step === 'input'
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
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('rplan.ingest.url_label')}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.rmutl.ac.th/..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {locale === 'en'
                      ? '(Currently URL fetch may be blocked by some sites — paste text below for best results)'
                      : '(บางเว็บไม่ให้ดึงข้อมูล — แนะนำ paste ข้อความด้านล่างเพื่อความแม่นยำ)'}
                  </p>
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
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  ← {locale === 'en' ? 'Back' : 'ย้อนกลับ'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {saving ? '...' : locale === 'en' ? 'Save grant call' : 'บันทึกแหล่งทุน'}
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
