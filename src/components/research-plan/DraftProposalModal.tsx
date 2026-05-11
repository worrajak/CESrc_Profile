'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

type Researcher = {
  id: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  position_th: string | null;
  expertise: string[] | null;
};

type DraftedProposal = {
  title_th?: string;
  title_en?: string;
  abstract_th?: string;
  abstract_en?: string;
  problem_statement?: string;
  research_questions?: string[];
  objectives?: string[];
  methodology?: string;
  expected_outputs?: string[];
  expected_outcomes?: string[];
  keywords?: string[];
  budget_requested?: number;
  duration_months?: number;
  tier_code?: string;
  ai_match_score?: number;
  ai_match_rationale?: string;
  budget_breakdown?: Record<string, number>;
};

export default function DraftProposalModal({
  grantCallId,
  grantCallCode,
  tierOptions,
  onClose,
  onSaved,
}: {
  grantCallId: string;
  grantCallCode: string;
  tierOptions?: { code: string; label: string }[];
  onClose: () => void;
  onSaved: (proposalId: string) => void;
}) {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [piId, setPiId] = useState('');
  const [tierCode, setTierCode] = useState(tierOptions?.[0]?.code || '');
  const [userHint, setUserHint] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [drafted, setDrafted] = useState<DraftedProposal | null>(null);
  const [aiMeta, setAiMeta] = useState<{ source: string; model: string; pi_name?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Load researchers
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th, position_th, expertise')
        .order('h_index', { ascending: false, nullsFirst: false });
      setResearchers((data as Researcher[]) || []);
    })();
  }, []);

  const fullName = (r: Researcher) =>
    `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();

  const handleDraft = async () => {
    if (!piId) {
      setError(locale === 'en' ? 'Please pick a PI' : 'กรุณาเลือกหัวหน้าโครงการ');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/research-plan/draft-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_call_id: grantCallId,
          pi_id: piId,
          tier_code: tierCode || undefined,
          user_hint: userHint.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Draft failed');
      setDrafted(json.data || {});
      setAiMeta({ source: json.source, model: json.model, pi_name: json.pi?.name });
      setStep('review');
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!drafted) return;
    setSaving(true);
    setError('');
    try {
      const { data: proposal, error: insErr } = await supabase
        .from('proposals')
        .insert({
          grant_call_id: grantCallId,
          title_th: drafted.title_th || 'Untitled',
          title_en: drafted.title_en || null,
          tier_code: drafted.tier_code || tierCode || null,
          abstract_th: drafted.abstract_th || null,
          abstract_en: drafted.abstract_en || null,
          problem_statement: drafted.problem_statement || null,
          research_questions: drafted.research_questions || null,
          objectives: drafted.objectives || null,
          methodology: drafted.methodology || null,
          expected_outputs: drafted.expected_outputs || null,
          expected_outcomes: drafted.expected_outcomes || null,
          keywords: drafted.keywords || null,
          budget_requested: drafted.budget_requested || null,
          budget_breakdown: drafted.budget_breakdown || null,
          duration_months: drafted.duration_months || null,
          pi_id: piId,
          ai_match_score: drafted.ai_match_score || null,
          ai_match_rationale: drafted.ai_match_rationale || null,
          ai_drafted: true,
          ai_provider: aiMeta?.source || null,
          ai_model: aiMeta?.model || null,
          ai_generated_data: drafted as any,
          status: 'draft',
        })
        .select('id')
        .single();
      if (insErr) throw insErr;

      // Also insert PI as proposal_team row
      if (proposal?.id) {
        await supabase.from('proposal_team').insert({
          proposal_id: proposal.id,
          researcher_id: piId,
          role: 'pi',
          fte_pct: 35,
          compensation_pct: 40,
          responsibilities: locale === 'en' ? 'Overall project leadership' : 'บริหารโครงการ ดูแลภาพรวม กำหนดทิศทาง',
        });
        onSaved(proposal.id);
      }
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedPI = researchers.find((r) => r.id === piId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="bg-gradient-to-r from-violet-700 to-fuchsia-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{t('rplan.draft.title')}</h2>
            <p className="text-xs text-violet-100 mt-0.5">
              {locale === 'en'
                ? `For grant: ${grantCallCode}`
                : `สำหรับทุน: ${grantCallCode}`}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          {step === 'input' ? (
            <>
              <div className="space-y-4">
                {/* PI picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('rplan.draft.choose_pi')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={piId}
                    onChange={(e) => setPiId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">— {locale === 'en' ? 'pick a researcher' : 'เลือกนักวิจัย'} —</option>
                    {researchers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {fullName(r)}
                        {r.position_th ? ` (${r.position_th})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedPI && selectedPI.expertise && selectedPI.expertise.length > 0 && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {locale === 'en' ? 'Expertise: ' : 'ความเชี่ยวชาญ: '}
                      <span className="text-violet-700">{selectedPI.expertise.join(' · ')}</span>
                    </p>
                  )}
                </div>

                {tierOptions && tierOptions.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('rplan.draft.choose_tier')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {tierOptions.map((tier) => (
                        <button
                          key={tier.code}
                          type="button"
                          onClick={() => setTierCode(tier.code)}
                          className={`px-2.5 py-1.5 text-xs rounded-lg border transition ${
                            tierCode === tier.code
                              ? 'bg-violet-600 text-white border-violet-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('rplan.draft.user_brief')}
                  </label>
                  <textarea
                    value={userHint}
                    onChange={(e) => setUserHint(e.target.value)}
                    rows={3}
                    placeholder={
                      locale === 'en'
                        ? 'e.g. focus on wireless EV charging optimization for rural areas'
                        : 'เช่น เน้นการชาร์จ EV แบบไร้สาย สำหรับชนบท'
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleDraft}
                  disabled={processing || !piId}
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  {processing ? t('rplan.draft.processing') : t('rplan.draft.submit')}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                  {locale === 'en' ? 'Cancel' : 'ยกเลิก'}
                </button>
              </div>
            </>
          ) : (
            <>
              {aiMeta && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-xs text-emerald-700 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    ✓ {locale === 'en' ? 'Drafted by' : 'ร่างโดย'} <strong>{aiMeta.source}</strong> ({aiMeta.model})
                  </span>
                  {drafted?.ai_match_score !== undefined && (
                    <span className="font-mono">
                      {t('rplan.draft.match_score')}:{' '}
                      <strong className={drafted.ai_match_score >= 70 ? 'text-emerald-700' : 'text-amber-700'}>
                        {drafted.ai_match_score}/100
                      </strong>
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <FieldGroup label={locale === 'en' ? 'Title (TH)' : 'ชื่อโครงการ (ไทย)'}>
                  <input
                    type="text"
                    value={drafted?.title_th || ''}
                    onChange={(e) => setDrafted({ ...(drafted || {}), title_th: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm font-medium"
                  />
                </FieldGroup>

                <FieldGroup label={locale === 'en' ? 'Title (EN)' : 'ชื่อโครงการ (English)'}>
                  <input
                    type="text"
                    value={drafted?.title_en || ''}
                    onChange={(e) => setDrafted({ ...(drafted || {}), title_en: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <FieldGroup label={locale === 'en' ? 'Abstract (TH)' : 'บทคัดย่อ (ไทย)'}>
                  <textarea
                    value={drafted?.abstract_th || ''}
                    onChange={(e) => setDrafted({ ...(drafted || {}), abstract_th: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <FieldGroup label={t('rplan.proposal.problem')}>
                  <textarea
                    value={drafted?.problem_statement || ''}
                    onChange={(e) => setDrafted({ ...(drafted || {}), problem_statement: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <FieldGroup label={t('rplan.proposal.objectives')}>
                  <textarea
                    value={(drafted?.objectives || []).join('\n')}
                    onChange={(e) =>
                      setDrafted({
                        ...(drafted || {}),
                        objectives: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    rows={3}
                    placeholder={locale === 'en' ? 'One objective per line' : 'หนึ่งวัตถุประสงค์ต่อบรรทัด'}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <FieldGroup label={t('rplan.proposal.methodology')}>
                  <textarea
                    value={drafted?.methodology || ''}
                    onChange={(e) => setDrafted({ ...(drafted || {}), methodology: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <FieldGroup label={t('rplan.proposal.outputs')}>
                  <textarea
                    value={(drafted?.expected_outputs || []).join('\n')}
                    onChange={(e) =>
                      setDrafted({
                        ...(drafted || {}),
                        expected_outputs: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-1.5 border rounded text-sm"
                  />
                </FieldGroup>

                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label={`${t('rplan.proposal.budget_requested')} (THB)`}>
                    <input
                      type="number"
                      value={drafted?.budget_requested ?? ''}
                      onChange={(e) =>
                        setDrafted({
                          ...(drafted || {}),
                          budget_requested: e.target.value ? +e.target.value : undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded text-sm font-medium text-emerald-700"
                    />
                  </FieldGroup>
                  <FieldGroup label={`${t('rplan.proposal.duration')} (${locale === 'en' ? 'months' : 'เดือน'})`}>
                    <input
                      type="number"
                      value={drafted?.duration_months ?? ''}
                      onChange={(e) =>
                        setDrafted({
                          ...(drafted || {}),
                          duration_months: e.target.value ? +e.target.value : undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded text-sm"
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label={t('rplan.proposal.keywords')}>
                  <input
                    type="text"
                    value={(drafted?.keywords || []).join(', ')}
                    onChange={(e) =>
                      setDrafted({
                        ...(drafted || {}),
                        keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded text-sm"
                    placeholder={locale === 'en' ? 'comma-separated' : 'คั่นด้วย ,'}
                  />
                </FieldGroup>

                {drafted?.ai_match_rationale && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-violet-700 mb-1">
                      {locale === 'en' ? 'Why this matches' : 'ทำไม AI ถึงคิดว่าตรง'}
                    </p>
                    <p className="text-xs text-violet-900">{drafted.ai_match_rationale}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3 text-sm text-red-700">{error}</div>
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
                  {saving ? '...' : locale === 'en' ? '💾 Save concept' : '💾 บันทึก concept'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
