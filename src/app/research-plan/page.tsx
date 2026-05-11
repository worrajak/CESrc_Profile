'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';
import { useAuth } from '@/lib/AuthContext';
import IngestGrantModal from '@/components/research-plan/IngestGrantModal';
import TimelineView from '@/components/research-plan/TimelineView';
import ProposalsList from '@/components/research-plan/ProposalsList';
import ActionPlanGenerator from '@/components/research-plan/ActionPlanGenerator';

export type GrantCall = {
  id: string;
  agency_code: string;
  agency_name_th: string;
  agency_name_en: string | null;
  call_code: string;
  call_name_th: string;
  call_name_en: string | null;
  fiscal_year_be: number | null;
  announce_date: string | null;
  open_date: string | null;
  close_date: string | null;
  result_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  duration_months: number | null;
  eligibility_th: string | null;
  conditions_th: string | null;
  scope_th: string | null;
  research_areas: string[] | null;
  required_outputs: string[] | null;
  announcement_url: string | null;
  regulations_url: string | null;
  template_url: string | null;
  status: 'upcoming' | 'open' | 'closed' | 'results_announced' | 'archived';
  notes: string | null;
};

const AGENCY_COLORS: Record<string, string> = {
  FF: 'from-emerald-500 to-teal-600',
  NRCT: 'from-blue-500 to-indigo-600',
  TSRI: 'from-purple-500 to-fuchsia-600',
  PMUC: 'from-orange-500 to-red-600',
  PMUA: 'from-amber-500 to-yellow-600',
  PMUB: 'from-cyan-500 to-blue-600',
  EPPO: 'from-lime-500 to-green-600',
  EGAT: 'from-rose-500 to-pink-600',
};

const STATUS_BADGE: Record<string, { th: string; en: string; cls: string }> = {
  upcoming: { th: 'กำลังจะเปิด', en: 'Upcoming', cls: 'bg-amber-100 text-amber-700' },
  open: { th: 'เปิดรับ', en: 'Open', cls: 'bg-emerald-100 text-emerald-700' },
  closed: { th: 'ปิดรับแล้ว', en: 'Closed', cls: 'bg-gray-100 text-gray-600' },
  results_announced: { th: 'ประกาศผลแล้ว', en: 'Results', cls: 'bg-blue-100 text-blue-700' },
  archived: { th: 'เก็บถาวร', en: 'Archived', cls: 'bg-gray-100 text-gray-500' },
};

export default function ResearchPlanPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [calls, setCalls] = useState<GrantCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'calendar' | 'timeline' | 'proposals' | 'action_plan' | 'career'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [showIngest, setShowIngest] = useState(false);

  const fetchCalls = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('grant_calls')
      .select('*')
      .eq('is_active', true)
      .order('close_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    setCalls((data as GrantCall[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const agencies = Array.from(new Set(calls.map((c) => c.agency_code))).sort();
  const filtered = calls.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (agencyFilter !== 'all' && c.agency_code !== agencyFilter) return false;
    return true;
  });

  const statusCounts = {
    all: calls.length,
    upcoming: calls.filter((c) => c.status === 'upcoming').length,
    open: calls.filter((c) => c.status === 'open').length,
    closed: calls.filter((c) => c.status === 'closed').length,
  };

  const fmtDate = (d: string | null) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fmtBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return '—';
    const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`);
    if (min && max) return `${fmt(min)} – ${fmt(max)} THB`;
    return `${fmt((min || max) as number)} THB`;
  };

  const daysUntil = (d: string | null) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {user ? (
                <button
                  onClick={() => setShowIngest(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 hover:bg-white/25 backdrop-blur rounded-full text-xs mb-3 transition cursor-pointer"
                  title={locale === 'en' ? 'Click to ingest a grant with AI' : 'คลิกเพื่อสกัดทุนด้วย AI'}
                >
                  <span>🎯</span>
                  <span>AI Co-Pilot</span>
                  <span className="text-[10px] opacity-70">·</span>
                  <span className="text-[10px] opacity-90">
                    {locale === 'en' ? 'click to ingest a grant' : 'คลิกเพื่อสกัดทุน'}
                  </span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs mb-3">
                  <span>🎯</span>
                  <span>AI Co-Pilot</span>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('rplan.title')}</h1>
              <p className="text-blue-100 max-w-2xl text-sm">{t('rplan.subtitle')}</p>
            </div>

            {user && (
              <button
                onClick={() => setShowIngest(true)}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-medium shadow-lg transition flex items-center gap-2 text-sm"
              >
                {t('rplan.action.ingest')}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mt-6 bg-white/10 backdrop-blur p-1 rounded-xl w-fit max-w-full">
            {(['calendar', 'timeline', 'proposals', 'action_plan', 'career'] as const).map((tk) => (
              <button
                key={tk}
                onClick={() => setTab(tk)}
                className={`px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg transition whitespace-nowrap ${
                  tab === tk ? 'bg-white text-blue-700 font-medium' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                {t(`rplan.tab.${tk}` as any)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {tab === 'calendar' && (
          <>
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { k: 'all', label: locale === 'en' ? 'All' : 'ทั้งหมด', n: statusCounts.all },
                { k: 'upcoming', label: t('rplan.calendar.upcoming'), n: statusCounts.upcoming },
                { k: 'open', label: t('rplan.calendar.open'), n: statusCounts.open },
                { k: 'closed', label: t('rplan.calendar.closed'), n: statusCounts.closed },
              ].map((s) => (
                <button
                  key={s.k}
                  onClick={() => setStatusFilter(s.k)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    statusFilter === s.k
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {s.label} <span className="ml-1 text-xs opacity-70">({s.n})</span>
                </button>
              ))}
            </div>

            {/* Agency filter */}
            {agencies.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                <button
                  onClick={() => setAgencyFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    agencyFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {locale === 'en' ? 'All agencies' : 'ทุกแหล่ง'}
                </button>
                {agencies.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAgencyFilter(a)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      agencyFilter === a ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}

            {/* Grant cards */}
            {loading ? (
              <div className="text-center py-16 text-gray-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-gray-700">{t('rplan.empty.title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('rplan.empty.subtitle')}</p>
                {user && (
                  <button
                    onClick={() => setShowIngest(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    {t('rplan.action.ingest')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c) => {
                  const days = daysUntil(c.close_date);
                  const urgent = days !== null && days >= 0 && days <= 14 && c.status !== 'closed';
                  const badge = STATUS_BADGE[c.status];
                  const gradient = AGENCY_COLORS[c.agency_code] || 'from-gray-500 to-gray-700';
                  const callTitle = locale === 'en' && c.call_name_en ? c.call_name_en : c.call_name_th;
                  const agencyTitle = locale === 'en' && c.agency_name_en ? c.agency_name_en : c.agency_name_th;

                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all overflow-hidden flex flex-col"
                    >
                      {/* Banner */}
                      <div className={`px-4 py-3 bg-gradient-to-r ${gradient} text-white`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold tracking-wider opacity-90">{c.agency_code}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/20`}>
                            {locale === 'en' ? badge.en : badge.th}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold mt-1 leading-snug line-clamp-2">{c.call_code}</h3>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1">{agencyTitle}</p>
                        <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                          {callTitle}
                        </h4>

                        {/* Dates */}
                        <div className="mt-3 space-y-1.5 text-xs">
                          {c.open_date && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">{t('rplan.field.open')}</span>
                              <span className="font-medium text-gray-700">{fmtDate(c.open_date)}</span>
                            </div>
                          )}
                          {c.close_date && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">{t('rplan.field.close')}</span>
                              <span className={`font-medium ${urgent ? 'text-red-600' : 'text-gray-700'}`}>
                                {fmtDate(c.close_date)}
                                {urgent && <span className="ml-1 text-red-500">({days}d)</span>}
                              </span>
                            </div>
                          )}
                          {(c.budget_min || c.budget_max) && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">{t('rplan.field.budget_range')}</span>
                              <span className="font-medium text-emerald-700">{fmtBudget(c.budget_min, c.budget_max)}</span>
                            </div>
                          )}
                          {c.duration_months && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">{t('rplan.field.duration')}</span>
                              <span className="font-medium text-gray-700">
                                {c.duration_months} {locale === 'en' ? 'months' : 'เดือน'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Research areas */}
                        {c.research_areas && c.research_areas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {c.research_areas.slice(0, 3).map((a, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                            {c.research_areas.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{c.research_areas.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Footer actions */}
                        <div className="mt-auto pt-3 flex items-center gap-2">
                          {c.announcement_url && (
                            <a
                              href={c.announcement_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:underline"
                            >
                              ↗ {t('rplan.action.view_announcement')}
                            </a>
                          )}
                          {user && (
                            <Link
                              href={`/research-plan/${c.id}`}
                              className="ml-auto text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium transition"
                            >
                              {t('rplan.action.draft_proposal')} →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'timeline' && <TimelineView calls={calls} />}

        {tab === 'proposals' && <ProposalsList />}

        {tab === 'action_plan' && <ActionPlanGenerator />}

        {tab === 'career' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-3">🎓</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {locale === 'en' ? 'Academic Career Plan' : 'แผนตำแหน่งวิชาการ'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {locale === 'en'
                ? 'Track progress towards Asst. Prof, Assoc. Prof, Full Prof with AI-fetched current ก.พ.อ. criteria.'
                : 'ติดตามความก้าวหน้าสู่ ผศ./รศ./ศ. — AI ดึงเกณฑ์ ก.พ.อ. ปัจจุบันมาเก็บให้'}
            </p>
            <Link
              href="/research-plan/career"
              className="inline-block px-5 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 font-medium transition"
            >
              {locale === 'en' ? 'Open career planner →' : 'เปิดหน้าวางแผนตำแหน่ง →'}
            </Link>
          </div>
        )}
      </div>

      {showIngest && (
        <IngestGrantModal
          onClose={() => setShowIngest(false)}
          onSaved={() => {
            setShowIngest(false);
            fetchCalls();
          }}
        />
      )}
    </div>
  );
}
