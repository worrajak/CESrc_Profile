'use client';

/**
 * ExecutiveHero — homepage Hero section
 * ─────────────────────────────────────
 * Renders:
 *   • Logo + unit name + locale-aware tagline
 *   • AI-generated executive summary (3-5 sentences) inside a glass card
 *   • 4 KPI cards (lifetime + active)
 *   • Optional "▾ ที่มา" disclosure (Step 5 will wire EvidenceChainPanel here)
 *
 * The summary is read SERVER-SIDE via the `initial` prop if a fresh cache row
 * exists. If `initial` is null (cache empty or stale), this component fetches
 * /api/homepage/executive-summary on mount and shows a skeleton meanwhile.
 *
 * Audience target: academic peers and potential collaborators.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import EvidenceChainPanel from '@/components/EvidenceChainPanel';
import type { EvidenceChain } from '@/lib/evidence-chain';

export type ExecutiveSummary = {
  summary_th: string;
  summary_en: string;
  evidence_chain: any[];
  source?: string;
  model?: string;
  generated_at?: string;
  cached?: boolean;
  stale?: boolean;
};

export type HomeKpi = {
  publications_total: number | null;
  citations_total: number | null;
  h_index_avg: number | string | null;
  projects_active: number | null;
  researchers_active?: number | null;
};

type Props = {
  /** Pre-fetched cache row from the server. Null means "fetch on mount". */
  initial: ExecutiveSummary | null;
  /** KPI numbers from cesru_kpi_summary view, fetched server-side. */
  kpi: HomeKpi;
  /** Translated tagline (e.g., "Clean Energy System Research Unit") */
  tagline: string;
  locale: 'th' | 'en';
};

export default function ExecutiveHero({ initial, kpi, tagline, locale }: Props) {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  // Fetch on mount only if we didn't get a cache from the server
  useEffect(() => {
    if (initial || summary) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/homepage/executive-summary');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json.error) {
          setError(json.error || 'Could not generate summary');
        } else {
          setSummary(json);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial, summary]);

  const summaryText = summary
    ? locale === 'en'
      ? summary.summary_en || summary.summary_th
      : summary.summary_th || summary.summary_en
    : '';

  // Has the AI provided structured evidence we can show?
  const chains = (summary?.evidence_chain || []) as EvidenceChain[];
  const hasChains = chains.length > 0;

  return (
    <>
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div
          className="absolute top-10 right-0 w-72 h-72 bg-lime-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* Logo + Title row */}
        <div className="flex items-center gap-4 md:gap-5 mb-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-2xl blur-xl opacity-60"></div>
            <Image
              src="/logo-cesru.jpeg"
              alt="CESRU Logo"
              width={64}
              height={64}
              className="relative rounded-2xl bg-white p-1.5 shadow-2xl"
            />
          </div>
          <div className="text-white min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"></span>
                {locale === 'en' ? 'Live snapshot' : 'ภาพปัจจุบัน'}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-lime-100 to-emerald-200 bg-clip-text text-transparent leading-tight">
              CESRU · Clean Energy System Research Unit
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-0.5 truncate">{tagline}</p>
          </div>
        </div>

        {/* AI Summary card */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-emerald-400/5 rounded-2xl blur"></div>
          <div className="relative backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-200 border border-lime-400/20">
                <span>🤖</span>
                <span>
                  {locale === 'en' ? 'AI executive summary' : 'AI สรุปภาพรวม'}
                </span>
              </span>
              {summary?.generated_at && (
                <span className="text-[10px] text-slate-400">
                  {locale === 'en' ? 'as of' : 'ณ '}{' '}
                  {new Date(summary.generated_at).toLocaleString(locale === 'en' ? 'en-US' : 'th-TH', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {summary.stale && (
                    <span className="ml-2 text-amber-300">
                      ({locale === 'en' ? 'cached' : 'จาก cache'})
                    </span>
                  )}
                </span>
              )}
            </div>

            {loading ? (
              <SummarySkeleton />
            ) : error ? (
              <div className="text-amber-200 text-sm">
                <p className="mb-1">
                  ⚠ {locale === 'en' ? 'Could not load summary right now.' : 'โหลดสรุปไม่สำเร็จขณะนี้'}
                </p>
                <p className="text-amber-300/70 text-xs">{error}</p>
              </div>
            ) : summaryText ? (
              <p className="text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {summaryText}
              </p>
            ) : (
              <p className="text-slate-300 text-sm italic">
                {locale === 'en'
                  ? 'AI summary will appear after the first visit triggers generation.'
                  : 'AI summary จะปรากฏหลังเข้าเยี่ยมครั้งแรก'}
              </p>
            )}

            {/* Source meta strip + Evidence disclosure */}
            {summary && (summary.source || summary.model || hasChains) && (
              <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                {summary.source && (
                  <span>
                    {locale === 'en' ? 'Generated by' : 'สร้างโดย'}{' '}
                    <strong className="text-slate-300">{summary.source}</strong>
                  </span>
                )}
                {summary.model && <span className="text-slate-500">· {summary.model}</span>}
                {hasChains && (
                  <button
                    type="button"
                    onClick={() => setEvidenceOpen((v) => !v)}
                    className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20 transition text-[10px] font-medium"
                    aria-expanded={evidenceOpen}
                  >
                    <span>{evidenceOpen ? '▴' : '▾'}</span>
                    <span>
                      {locale === 'en'
                        ? `${evidenceOpen ? 'Hide' : 'Show'} sources (${chains.length})`
                        : `${evidenceOpen ? 'ซ่อน' : 'ดู'}ที่มา (${chains.length})`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KPI strip — 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <KpiCard
            value={fmt(kpi.publications_total)}
            label={locale === 'en' ? 'Publications' : 'ผลงานตีพิมพ์'}
            color="from-cyan-400 to-blue-400"
          />
          <KpiCard
            value={fmt(kpi.citations_total)}
            label={locale === 'en' ? 'Citations' : 'การอ้างอิง'}
            color="from-amber-400 to-orange-400"
          />
          <KpiCard
            value={String(kpi.h_index_avg ?? 0)}
            label={locale === 'en' ? 'avg h-index' : 'h-index เฉลี่ย'}
            color="from-violet-400 to-fuchsia-400"
          />
          <KpiCard
            value={fmt(kpi.projects_active)}
            label={locale === 'en' ? 'Active projects' : 'โครงการที่ active'}
            color="from-lime-400 to-emerald-400"
          />
        </div>
      </div>
    </section>

    {/* Evidence Trust Chain — light background, collapsed by default */}
    {hasChains && evidenceOpen && (
      <section className="max-w-7xl mx-auto px-4 -mt-4 mb-6 md:-mt-6 md:mb-8 relative z-10">
        <EvidenceChainPanel
          chains={chains}
          title={
            locale === 'en'
              ? 'How this summary is sourced'
              : 'ที่มาของสรุป — ห่วงโซ่ความน่าเชื่อถือ'
          }
          intro={
            locale === 'en'
              ? 'Each numeric claim above traces back to a row in the CESRU internal database (publications, patents, grants, innovations). Click any claim to see the chain.'
              : 'แต่ละข้อความใน AI summary ด้านบน อ้างอิงไปยังข้อมูลจริงในฐานข้อมูล CESRU (publications, patents, grants, innovations) — คลิกแต่ละข้อเพื่อดูที่มา'
          }
        />
      </section>
    )}
    </>
  );
}

function KpiCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
      <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all">
        <div className={`text-xl md:text-2xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-[10px] md:text-xs text-slate-300 mt-0.5 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 bg-white/15 rounded w-11/12"></div>
      <div className="h-3 bg-white/15 rounded w-10/12"></div>
      <div className="h-3 bg-white/15 rounded w-9/12"></div>
      <div className="h-3 bg-white/15 rounded w-8/12"></div>
    </div>
  );
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '0';
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}
