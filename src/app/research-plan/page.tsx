'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';
import { useAuth } from '@/lib/AuthContext';
import { useAdminAuth } from '@/lib/admin-auth-client';
import IngestGrantModal from '@/components/research-plan/IngestGrantModal';
import TimelineView from '@/components/research-plan/TimelineView';
import ProposalsList from '@/components/research-plan/ProposalsList';
import ActionPlanGenerator from '@/components/research-plan/ActionPlanGenerator';
// Career plans moved to /career-plans (under "เกี่ยวกับเรา" navbar dropdown).
// Career tab removed below — link is in the page's empty state for discoverability.

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
  const { role: adminRole } = useAdminAuth();
  const isAdmin = adminRole === 'superadmin' || adminRole === 'admin' || adminRole === 'legacy';
  const [calls, setCalls] = useState<GrantCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'calendar' | 'timeline' | 'proposals' | 'action_plan'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [showIngest, setShowIngest] = useState(false);
  const [editingCall, setEditingCall] = useState<GrantCall | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDelete = async (c: GrantCall) => {
    const label = c.call_name_th || c.call_code || 'this grant';
    if (!window.confirm(
      locale === 'en'
        ? `Delete grant call "${label}"? This cannot be undone.`
        : `ลบแหล่งทุน “${label}” ใช่ไหม? (ลบแล้วกู้คืนไม่ได้)`,
    )) return;
    const { error: delErr } = await supabase.from('grant_calls').delete().eq('id', c.id);
    if (delErr) {
      window.alert(
        (locale === 'en' ? 'Delete failed: ' : 'ลบไม่สำเร็จ: ') + delErr.message,
      );
      return;
    }
    setOpenMenuId(null);
    await fetchCalls();
  };

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

  // A grant call counts as "having content" once any concrete field is
  // populated. Bare placeholder rows (seeded with just agency_code +
  // call_code but no dates/budget/scope/areas) are hidden from the public
  // view until someone fills them in — admins can still see them via the
  // ⋯ menu by toggling the "show empty" filter below (or by editing
  // directly in Supabase).
  const hasContent = (c: GrantCall) =>
    !!(
      c.open_date ||
      c.close_date ||
      c.announce_date ||
      c.budget_max ||
      c.budget_min ||
      c.scope_th ||
      c.conditions_th ||
      c.eligibility_th ||
      (c.research_areas && c.research_areas.length > 0)
    );

  const agencies = Array.from(new Set(calls.filter(hasContent).map((c) => c.agency_code))).sort();
  const filtered = calls.filter((c) => {
    if (!hasContent(c)) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (agencyFilter !== 'all' && c.agency_code !== agencyFilter) return false;
    return true;
  });

  // Counts use the same hasContent filter so the badge numbers match the
  // number of cards actually displayed.
  const contentful = calls.filter(hasContent);
  const statusCounts = {
    all: contentful.length,
    upcoming: contentful.filter((c) => c.status === 'upcoming').length,
    open: contentful.filter((c) => c.status === 'open').length,
    closed: contentful.filter((c) => c.status === 'closed').length,
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
            {(['calendar', 'timeline', 'proposals', 'action_plan'] as const).map((tk) => (
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
                  const callTitle = locale === 'en' && c.call_name_en ? c.call_name_en : c.call_name_th;
                  const agencyTitle = locale === 'en' && c.agency_name_en ? c.agency_name_en : c.agency_name_th;
                  // Strategy line (migration 053) — optional
                  const strategy = (c as any).strategy as
                    | { strategy_no?: string; program?: string; sub_programs?: any[] }
                    | undefined;
                  const strategyLine = strategy
                    ? [strategy.strategy_no, strategy.program].filter(Boolean).join(' · ')
                    : '';

                  // ───── Urgency model ─────
                  // Used both for the countdown chip and the left accent stripe.
                  let urgencyKey: 'critical' | 'soon' | 'open' | 'upcoming' | 'closed';
                  if (c.status === 'closed' || (days !== null && days < 0)) urgencyKey = 'closed';
                  else if (c.status === 'upcoming' && (days === null || days > 60)) urgencyKey = 'upcoming';
                  else if (days !== null && days <= 7) urgencyKey = 'critical';
                  else if (days !== null && days <= 30) urgencyKey = 'soon';
                  else urgencyKey = 'open';

                  const URGENCY = {
                    critical: {
                      stripe: 'before:bg-rose-500',
                      chipBg: 'bg-rose-100 text-rose-700 border-rose-200',
                      icon: '🔥',
                      label_th: days === 0 ? 'ปิดวันนี้' : `เหลือ ${days} วัน`,
                      label_en: days === 0 ? 'closes today' : `${days}d left`,
                    },
                    soon: {
                      stripe: 'before:bg-amber-500',
                      chipBg: 'bg-amber-100 text-amber-800 border-amber-200',
                      icon: '⏳',
                      label_th: `เหลือ ${days} วัน`,
                      label_en: `${days}d left`,
                    },
                    open: {
                      stripe: 'before:bg-emerald-500',
                      chipBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      icon: '✓',
                      label_th: days !== null ? `เหลือ ${days} วัน` : 'เปิดรับอยู่',
                      label_en: days !== null ? `${days}d left` : 'open',
                    },
                    upcoming: {
                      stripe: 'before:bg-slate-300',
                      chipBg: 'bg-slate-100 text-slate-600 border-slate-200',
                      icon: '🗓️',
                      label_th: 'จะเปิดเร็วๆ นี้',
                      label_en: 'upcoming',
                    },
                    closed: {
                      stripe: 'before:bg-slate-300',
                      chipBg: 'bg-slate-100 text-slate-500 border-slate-200',
                      icon: '🚫',
                      label_th: 'ปิดรับแล้ว',
                      label_en: 'closed',
                    },
                  }[urgencyKey];

                  return (
                    <div
                      key={c.id}
                      className={`relative bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 hover:border-slate-300 transition-all overflow-hidden flex flex-col before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${URGENCY.stripe}`}
                    >
                      {/* Top row — urgency chip + agency code + admin menu */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${URGENCY.chipBg}`}
                        >
                          <span>{URGENCY.icon}</span>
                          <span>{locale === 'en' ? URGENCY.label_en : URGENCY.label_th}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold tracking-wider text-slate-500">
                            {c.agency_code} · {c.call_code}
                          </span>
                          {isAdmin && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === c.id ? null : c.id);
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-base leading-none"
                                title={locale === 'en' ? 'Admin actions' : 'การจัดการ (admin)'}
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === c.id}
                              >
                                ⋯
                              </button>
                              {openMenuId === c.id && (
                                <>
                                  {/* click-outside backdrop */}
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-7 z-40 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
                                    <button
                                      onClick={() => {
                                        setEditingCall(c);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                                    >
                                      ✏️ {locale === 'en' ? 'Edit' : 'แก้ไข'}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(c)}
                                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600"
                                    >
                                      🗑️ {locale === 'en' ? 'Delete' : 'ลบ'}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="px-4 pb-4 flex-1 flex flex-col">
                        <h4 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 mb-1">
                          {callTitle}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{agencyTitle}</p>

                        {/* Strategy line (migration 053) — optional */}
                        {strategyLine && (
                          <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                            <span className="text-slate-400">🧭</span> {strategyLine}
                          </p>
                        )}

                        {/* Key facts — budget + duration + open/close in 1-2 lines */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                          {(c.budget_min || c.budget_max) && (
                            <span className="font-semibold text-emerald-700">
                              💰 {fmtBudget(c.budget_min, c.budget_max)}
                            </span>
                          )}
                          {c.duration_months && (
                            <span className="text-gray-600">
                              ⏱ {c.duration_months} {locale === 'en' ? 'mo' : 'เดือน'}
                            </span>
                          )}
                          {c.close_date && (
                            <span className="text-gray-500">
                              📅 {locale === 'en' ? 'closes' : 'ปิด'} {fmtDate(c.close_date)}
                            </span>
                          )}
                        </div>

                        {/* Required outputs (Q1 paper, patent, …) */}
                        {(c as any).required_outputs?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(c as any).required_outputs.slice(0, 3).map((o: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium"
                              >
                                📤 {o}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Research areas */}
                        {c.research_areas && c.research_areas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.research_areas.slice(0, 4).map((a, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded"
                              >
                                {a}
                              </span>
                            ))}
                            {c.research_areas.length > 4 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{c.research_areas.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer actions */}
                        <div className="mt-auto pt-3 flex items-center gap-2 border-t border-slate-100 mt-3">
                          {c.announcement_url && (
                            <a
                              href={c.announcement_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-600 hover:text-blue-700 hover:underline"
                            >
                              ↗ {t('rplan.action.view_announcement')}
                            </a>
                          )}
                          {user ? (
                            <Link
                              href={`/research-plan/${c.id}`}
                              className="ml-auto inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 rounded-md font-medium transition shadow-sm"
                            >
                              ✨ {t('rplan.action.draft_proposal')} →
                            </Link>
                          ) : (
                            <Link
                              href={`/research-plan/${c.id}`}
                              className="ml-auto text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium transition"
                            >
                              {locale === 'en' ? 'View details' : 'ดูรายละเอียด'} →
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

      {editingCall && (
        <IngestGrantModal
          editTarget={editingCall as any}
          onClose={() => setEditingCall(null)}
          onSaved={() => {
            setEditingCall(null);
            fetchCalls();
          }}
        />
      )}
    </div>
  );
}
