'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';
import { useAuth } from '@/lib/AuthContext';
import DraftProposalModal from '@/components/research-plan/DraftProposalModal';
import TeamAllocator from '@/components/research-plan/TeamAllocator';
import JournalTargetPicker from '@/components/research-plan/JournalTargetPicker';
import type { GrantCall } from '../page';

// FF71 tier defaults — derived from announcement
const FF71_TIERS = [
  { code: 'FF71-T1', label: 'T1 นักวิจัยใหม่ (50K-150K)' },
  { code: 'FF71-T2', label: 'T2 นักวิจัยรุ่นกลาง (200K-400K)' },
  { code: 'FF71-T3', label: 'T3 นักวิจัยรุ่นอาวุโส (400K-600K)' },
  { code: 'FF71-T4', label: 'T4 หน่วยวิจัย/COE (600K-1M, Multi-year)' },
  { code: 'FF71-T5', label: 'T5 R2R (50K-120K)' },
];

type Proposal = {
  id: string;
  title_th: string;
  title_en: string | null;
  tier_code: string | null;
  abstract_th: string | null;
  budget_requested: number | null;
  duration_months: number | null;
  pi_id: string | null;
  ai_match_score: number | null;
  ai_match_rationale: string | null;
  status: string;
  created_at: string;
  expected_outputs: string[] | null;
  objectives: string[] | null;
  methodology: string | null;
  keywords: string[] | null;
};

export default function GrantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [grant, setGrant] = useState<GrantCall | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [piNames, setPiNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showDraft, setShowDraft] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tierOptions = grant?.agency_code === 'FF' && grant?.call_code === 'FF71' ? FF71_TIERS : undefined;

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: g }, { data: p }] = await Promise.all([
      supabase.from('grant_calls').select('*').eq('id', id).single(),
      supabase
        .from('proposals')
        .select('*')
        .eq('grant_call_id', id)
        .order('created_at', { ascending: false }),
    ]);
    setGrant(g as GrantCall);
    const props = (p as Proposal[]) || [];
    setProposals(props);

    // Look up PI names
    const piIds = Array.from(new Set(props.map((x) => x.pi_id).filter(Boolean))) as string[];
    if (piIds.length > 0) {
      const { data: rs } = await supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th')
        .in('id', piIds);
      const map: Record<string, string> = {};
      (rs || []).forEach((r: any) => {
        map[r.id] = `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();
      });
      setPiNames(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fmtDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysUntil = (d: string | null) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-700 mb-3">{locale === 'en' ? 'Grant not found' : 'ไม่พบทุนนี้'}</h1>
        <Link href="/research-plan" className="text-blue-600 underline text-sm">
          ← {t('rplan.detail.back')}
        </Link>
      </div>
    );
  }

  const days = daysUntil(grant.close_date);
  const urgent = days !== null && days >= 0 && days <= 14;
  const callTitle = locale === 'en' && grant.call_name_en ? grant.call_name_en : grant.call_name_th;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-pink-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/research-plan" className="text-violet-100 hover:text-white text-sm">
            {t('rplan.detail.back')}
          </Link>
          <div className="flex items-start justify-between gap-4 mt-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded">{grant.agency_code}</span>
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded">{grant.call_code}</span>
                {urgent && (
                  <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded font-semibold animate-pulse">
                    🔴 {days}d left
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold leading-snug">{callTitle}</h1>
              <p className="text-xs text-violet-100 mt-1">
                {locale === 'en' && grant.agency_name_en ? grant.agency_name_en : grant.agency_name_th}
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowDraft(true)}
                className="px-4 py-2 bg-white text-violet-700 hover:bg-violet-50 rounded-xl font-medium shadow-lg text-sm whitespace-nowrap"
              >
                {t('rplan.detail.draft_with_ai')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: grant detail */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              {locale === 'en' ? 'Calendar' : 'ปฏิทิน'}
            </h3>
            <div className="space-y-2 text-xs">
              <CalRow label={t('rplan.field.announce')} value={fmtDate(grant.announce_date)} />
              <CalRow label={t('rplan.field.open')} value={fmtDate(grant.open_date)} />
              <CalRow
                label={t('rplan.field.close')}
                value={fmtDate(grant.close_date)}
                accent={urgent ? 'text-red-600 font-semibold' : ''}
              />
              <CalRow label={t('rplan.calendar.results')} value={fmtDate(grant.result_date)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              {locale === 'en' ? 'Budget envelope' : 'งบประมาณ'}
            </h3>
            <p className="text-2xl font-bold text-emerald-700">
              {grant.budget_min?.toLocaleString() ?? '?'} – {grant.budget_max?.toLocaleString() ?? '?'}
              <span className="text-sm text-gray-500 font-normal ml-1">THB</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {grant.duration_months} {locale === 'en' ? 'months' : 'เดือน'}
            </p>
          </div>

          {grant.research_areas && grant.research_areas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                {locale === 'en' ? 'Research areas accepted' : 'หัวข้อวิจัยที่รับ'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {grant.research_areas.map((a, i) => (
                  <span key={i} className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: scope + eligibility + outputs + proposals */}
        <div className="lg:col-span-2 space-y-4">
          {grant.scope_th && (
            <CollapsibleSection title={t('rplan.field.scope')}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{grant.scope_th}</p>
            </CollapsibleSection>
          )}

          {grant.eligibility_th && (
            <CollapsibleSection title={t('rplan.field.eligibility')}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{grant.eligibility_th}</p>
            </CollapsibleSection>
          )}

          {grant.conditions_th && (
            <CollapsibleSection title={locale === 'en' ? 'Conditions / Tiers' : 'เงื่อนไข / ประเภททุน'} defaultOpen>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{grant.conditions_th}</p>
            </CollapsibleSection>
          )}

          {grant.required_outputs && grant.required_outputs.length > 0 && (
            <CollapsibleSection title={t('rplan.field.outputs')}>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {grant.required_outputs.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Proposals */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">{t('rplan.detail.proposals_section')}</h3>
            {proposals.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <div className="text-3xl mb-2">📝</div>
                {t('rplan.detail.no_proposals')}
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => {
                  const expanded = expandedId === p.id;
                  return (
                    <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                p.status === 'draft'
                                  ? 'bg-amber-100 text-amber-700'
                                  : p.status === 'submitted'
                                  ? 'bg-blue-100 text-blue-700'
                                  : p.status === 'awarded'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.status.toUpperCase()}
                            </span>
                            {p.tier_code && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                                {p.tier_code}
                              </span>
                            )}
                            {p.ai_match_score !== null && (
                              <span
                                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                  p.ai_match_score >= 70
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                Match {p.ai_match_score}/100
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {p.pi_id && piNames[p.pi_id] ? `PI: ${piNames[p.pi_id]}` : ''}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title_th}</p>
                          <div className="flex gap-3 mt-1 text-[11px] text-gray-500">
                            <span>💰 {p.budget_requested?.toLocaleString() ?? '—'} THB</span>
                            <span>⏱ {p.duration_months ?? '?'}{locale === 'en' ? ' mo' : ' เดือน'}</span>
                          </div>
                        </div>
                        <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      {expanded && (
                        <div className="px-4 pb-4 pt-2 border-t bg-gray-50/40 space-y-3 text-sm">
                          {p.abstract_th && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                                {locale === 'en' ? 'Abstract' : 'บทคัดย่อ'}
                              </p>
                              <p className="text-xs text-gray-700 leading-relaxed">{p.abstract_th}</p>
                            </div>
                          )}
                          {p.objectives && p.objectives.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                                {t('rplan.proposal.objectives')}
                              </p>
                              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                                {p.objectives.map((o, i) => (
                                  <li key={i}>{o}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.expected_outputs && p.expected_outputs.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                                {t('rplan.proposal.outputs')}
                              </p>
                              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                                {p.expected_outputs.map((o, i) => (
                                  <li key={i}>{o}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.ai_match_rationale && (
                            <div className="bg-violet-50 border border-violet-200 rounded-lg p-2">
                              <p className="text-[10px] font-semibold text-violet-700 mb-0.5">
                                {locale === 'en' ? 'AI rationale' : 'เหตุผลของ AI'}
                              </p>
                              <p className="text-[11px] text-violet-900">{p.ai_match_rationale}</p>
                            </div>
                          )}

                          {/* Team allocator */}
                          {p.pi_id && (
                            <TeamAllocator
                              proposalId={p.id}
                              piId={p.pi_id}
                              proposal={p}
                              onChanged={fetchAll}
                            />
                          )}

                          {/* Journal targets + APC budget feedback */}
                          <JournalTargetPicker
                            proposalId={p.id}
                            currentBudget={p.budget_requested}
                            onBudgetSuggested={() => fetchAll()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDraft && (
        <DraftProposalModal
          grantCallId={grant.id}
          grantCallCode={grant.call_code}
          tierOptions={tierOptions}
          onClose={() => setShowDraft(false)}
          onSaved={async () => {
            setShowDraft(false);
            await fetchAll();
          }}
        />
      )}
    </div>
  );
}

function CalRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${accent || 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition"
      >
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="px-5 pb-4 pt-1">{children}</div>}
    </div>
  );
}
