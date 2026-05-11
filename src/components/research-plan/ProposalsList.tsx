'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

type ProposalRow = {
  id: string;
  grant_call_id: string;
  title_th: string;
  tier_code: string | null;
  budget_requested: number | null;
  duration_months: number | null;
  pi_id: string | null;
  ai_match_score: number | null;
  status: string;
  created_at: string;
};

type Grant = {
  id: string;
  agency_code: string;
  call_code: string;
  call_name_th: string;
  close_date: string | null;
};

const STATUS_BADGE: Record<string, { label_th: string; label_en: string; cls: string }> = {
  draft: { label_th: 'ฉบับร่าง', label_en: 'Draft', cls: 'bg-amber-100 text-amber-700' },
  submitted: { label_th: 'ส่งแล้ว', label_en: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  under_review: { label_th: 'พิจารณา', label_en: 'Under review', cls: 'bg-purple-100 text-purple-700' },
  awarded: { label_th: 'ได้รับทุน', label_en: 'Awarded', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label_th: 'ไม่ผ่าน', label_en: 'Rejected', cls: 'bg-gray-100 text-gray-600' },
  withdrawn: { label_th: 'ถอน', label_en: 'Withdrawn', cls: 'bg-gray-100 text-gray-500' },
};

export default function ProposalsList() {
  const { t, locale } = useI18n();
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [grants, setGrants] = useState<Record<string, Grant>>({});
  const [piNames, setPiNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: props } = await supabase
        .from('proposals')
        .select('id, grant_call_id, title_th, tier_code, budget_requested, duration_months, pi_id, ai_match_score, status, created_at')
        .order('created_at', { ascending: false });
      const rows = (props as ProposalRow[]) || [];
      setProposals(rows);

      // Look up grants + PIs
      const grantIds = Array.from(new Set(rows.map((r) => r.grant_call_id))).filter(Boolean);
      const piIds = Array.from(new Set(rows.map((r) => r.pi_id).filter(Boolean))) as string[];

      const [grantRes, piRes] = await Promise.all([
        grantIds.length
          ? supabase.from('grant_calls').select('id, agency_code, call_code, call_name_th, close_date').in('id', grantIds)
          : Promise.resolve({ data: [] as any[] }),
        piIds.length
          ? supabase.from('researchers').select('id, title_th, first_name_th, last_name_th').in('id', piIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const gmap: Record<string, Grant> = {};
      (grantRes.data || []).forEach((g: Grant) => (gmap[g.id] = g));
      setGrants(gmap);

      const pmap: Record<string, string> = {};
      (piRes.data || []).forEach((p: any) => {
        pmap[p.id] = `${p.title_th || ''}${p.first_name_th || ''} ${p.last_name_th || ''}`.trim();
      });
      setPiNames(pmap);

      setLoading(false);
    })();
  }, []);

  const filtered = proposals.filter((p) => statusFilter === 'all' || p.status === statusFilter);

  const statusCounts: Record<string, number> = { all: proposals.length };
  Object.keys(STATUS_BADGE).forEach((s) => {
    statusCounts[s] = proposals.filter((p) => p.status === s).length;
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>;
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="text-5xl mb-3">📝</div>
        <h3 className="text-lg font-semibold text-gray-700">{t('rplan.proposals.empty')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('rplan.proposals.empty_subtitle')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
          {locale === 'en' ? 'All' : 'ทั้งหมด'} ({statusCounts.all})
        </FilterPill>
        {Object.entries(STATUS_BADGE).map(([key, info]) => {
          const n = statusCounts[key] || 0;
          if (n === 0) return null;
          return (
            <FilterPill key={key} active={statusFilter === key} onClick={() => setStatusFilter(key)}>
              {locale === 'en' ? info.label_en : info.label_th} ({n})
            </FilterPill>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
        {filtered.map((p) => {
          const grant = grants[p.grant_call_id];
          const badge = STATUS_BADGE[p.status];
          return (
            <Link
              key={p.id}
              href={`/research-plan/${p.grant_call_id}`}
              className="block px-5 py-4 hover:bg-gray-50/60 transition"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>
                        {locale === 'en' ? badge.label_en : badge.label_th}
                      </span>
                    )}
                    {p.tier_code && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                        {p.tier_code}
                      </span>
                    )}
                    {p.ai_match_score !== null && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          p.ai_match_score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        match {p.ai_match_score}/100
                      </span>
                    )}
                    {grant && (
                      <span className="text-[10px] text-gray-500">
                        → {grant.agency_code} · {grant.call_code}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-800 line-clamp-1">{p.title_th}</p>
                  <div className="flex gap-3 mt-1 text-[11px] text-gray-500">
                    {p.pi_id && piNames[p.pi_id] && (
                      <span>👤 {piNames[p.pi_id]}</span>
                    )}
                    <span>💰 {p.budget_requested?.toLocaleString() ?? '—'} THB</span>
                    <span>⏱ {p.duration_months ?? '?'}{locale === 'en' ? ' mo' : ' เดือน'}</span>
                    <span className="ml-auto text-gray-400">
                      {new Date(p.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
        active ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
