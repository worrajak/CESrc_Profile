'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

type JournalTarget = {
  id?: string;
  journal_name: string;
  publisher?: string | null;
  issn?: string | null;
  homepage_url?: string | null;
  scopus_indexed?: boolean;
  wos_indexed?: boolean;
  tci_tier?: number | null;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | '-' | null;
  impact_factor?: number | null;
  is_open_access?: boolean;
  oa_model?: string | null;
  apc_amount_usd?: number | null;
  apc_amount_thb?: number | null;
  fee_waiver?: boolean;
  ai_suggested?: boolean;
  ai_rationale?: string | null;
  research_gap?: string | null;
  scope_match_score?: number | null;
  priority?: number;
  status?: string;
};

const QUARTILE_COLORS: Record<string, string> = {
  Q1: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Q2: 'bg-blue-100 text-blue-700 border-blue-300',
  Q3: 'bg-amber-100 text-amber-700 border-amber-300',
  Q4: 'bg-orange-100 text-orange-700 border-orange-300',
  '-': 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function JournalTargetPicker({
  proposalId,
  currentBudget,
  onBudgetSuggested,
}: {
  proposalId: string;
  currentBudget: number | null;
  onBudgetSuggested?: (newApcReserve: number, totalSuggested: number) => void;
}) {
  const { t, locale } = useI18n();
  const [targets, setTargets] = useState<JournalTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [aiBudgetSuggestion, setAiBudgetSuggestion] = useState<{ thb: number; rationale: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('proposal_journal_targets')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('priority', { ascending: true });
    setTargets((data as JournalTarget[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/research-plan/suggest-journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposalId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'AI failed');

      const newTargets = (json.data?.targets || []) as JournalTarget[];
      if (newTargets.length === 0) {
        setError(locale === 'en' ? 'AI returned no journals' : 'AI ไม่มีวารสารแนะนำ');
        return;
      }

      // Save each new target to DB (skip ones already present by name)
      const existing = new Set(targets.map((t) => t.journal_name.toLowerCase()));
      const rows = newTargets
        .filter((nt) => !existing.has(nt.journal_name.toLowerCase()))
        .map((nt) => ({
          proposal_id: proposalId,
          journal_name: nt.journal_name,
          publisher: nt.publisher || null,
          issn: nt.issn || null,
          homepage_url: nt.homepage_url || null,
          scopus_indexed: nt.scopus_indexed || false,
          wos_indexed: nt.wos_indexed || false,
          tci_tier: nt.tci_tier || null,
          quartile: nt.quartile || null,
          impact_factor: nt.impact_factor || null,
          is_open_access: nt.is_open_access || false,
          oa_model: nt.oa_model || null,
          apc_amount_usd: nt.apc_amount_usd || null,
          apc_amount_thb: nt.apc_amount_thb || null,
          fee_waiver: nt.fee_waiver || false,
          ai_suggested: true,
          ai_rationale: nt.ai_rationale || null,
          research_gap: nt.research_gap || null,
          scope_match_score: nt.scope_match_score || null,
          priority: nt.priority || 99,
          status: 'planned',
        }));

      if (rows.length > 0) {
        await supabase.from('proposal_journal_targets').insert(rows);
        await refresh();
      }

      // Show budget impact
      if (json.data?.budget_impact?.recommended_apc_reserve_thb) {
        setAiBudgetSuggestion({
          thb: json.data.budget_impact.recommended_apc_reserve_thb,
          rationale: json.data.budget_impact.rationale || '',
        });
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setGenerating(false);
    }
  };

  const removeTarget = async (id: string) => {
    await supabase.from('proposal_journal_targets').delete().eq('id', id);
    await refresh();
  };

  const applyBudgetSuggestion = async () => {
    if (!aiBudgetSuggestion || !currentBudget) return;
    // Add APC reserve on top of personnel/materials, or update budget_breakdown.apc_publication
    const { data: prop } = await supabase
      .from('proposals')
      .select('budget_breakdown, budget_requested')
      .eq('id', proposalId)
      .single();

    const breakdown = (prop?.budget_breakdown as any) || {};
    breakdown.apc_publication = aiBudgetSuggestion.thb;

    const oldApc = ((prop?.budget_breakdown as any)?.apc_publication as number) || 0;
    const delta = aiBudgetSuggestion.thb - oldApc;
    const newTotal = (prop?.budget_requested || 0) + delta;

    await supabase
      .from('proposals')
      .update({ budget_breakdown: breakdown, budget_requested: newTotal })
      .eq('id', proposalId);

    onBudgetSuggested?.(aiBudgetSuggestion.thb, newTotal);
    setAiBudgetSuggestion(null);
  };

  const totalApc = targets.filter((t) => t.priority && t.priority <= 2).reduce((s, t) => s + (t.apc_amount_thb || 0), 0);

  if (loading) {
    return <div className="text-center py-4 text-gray-400 text-sm">Loading journals…</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            📚 {locale === 'en' ? 'Target Journals (Q1–Q4 + TCI + OA)' : 'วารสารเป้าหมาย (Q1-Q4 + TCI + OA)'}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {locale === 'en'
              ? `Top-2 APC estimate: ${totalApc.toLocaleString()} THB`
              : `APC ของ top-2 ประมาณ: ${totalApc.toLocaleString()} บาท`}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition disabled:opacity-50 whitespace-nowrap"
        >
          {generating ? '...' : `✨ ${locale === 'en' ? 'AI suggest' : 'ให้ AI แนะนำ'}`}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-700">{error}</div>
      )}

      {aiBudgetSuggestion && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            💡 {locale === 'en' ? 'Budget feedback from journal strategy' : 'AI แนะนำให้กันงบ APC'}
          </p>
          <p className="text-xs text-amber-900 mb-2">{aiBudgetSuggestion.rationale}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-900">
              +{aiBudgetSuggestion.thb.toLocaleString()} THB
            </span>
            <button
              onClick={applyBudgetSuggestion}
              className="ml-auto text-xs px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
            >
              {locale === 'en' ? 'Apply to proposal budget' : 'ปรับงบใน proposal'}
            </button>
            <button onClick={() => setAiBudgetSuggestion(null)} className="text-xs px-2 py-1 text-amber-700 hover:underline">
              {locale === 'en' ? 'Dismiss' : 'ปิด'}
            </button>
          </div>
        </div>
      )}

      {targets.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed rounded-lg">
          <div className="text-2xl mb-1">📖</div>
          {locale === 'en' ? 'No target journals yet — let AI suggest' : 'ยังไม่มีวารสารเป้าหมาย กด AI แนะนำได้'}
        </div>
      ) : (
        <div className="space-y-2">
          {targets.map((tg) => (
            <div key={tg.id} className="border border-gray-200 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {tg.quartile && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          QUARTILE_COLORS[tg.quartile] || QUARTILE_COLORS['-']
                        }`}
                      >
                        {tg.quartile}
                      </span>
                    )}
                    {tg.tci_tier && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                        TCI-{tg.tci_tier}
                      </span>
                    )}
                    {tg.is_open_access && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        OA
                      </span>
                    )}
                    {tg.impact_factor !== null && tg.impact_factor !== undefined && (
                      <span className="text-[10px] text-gray-500">IF {tg.impact_factor}</span>
                    )}
                    {tg.scope_match_score !== null && tg.scope_match_score !== undefined && (
                      <span
                        className={`text-[10px] font-mono ml-auto ${
                          tg.scope_match_score >= 80 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        match {tg.scope_match_score}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {tg.journal_name}
                    {tg.publisher && <span className="text-gray-400 font-normal ml-1">· {tg.publisher}</span>}
                  </p>
                  {tg.apc_amount_thb && tg.apc_amount_thb > 0 && (
                    <p className="text-[11px] text-orange-700 mt-0.5">
                      APC ≈ {tg.apc_amount_thb.toLocaleString()} THB
                      {tg.apc_amount_usd ? ` ($${tg.apc_amount_usd})` : ''}
                      {tg.oa_model ? ` · ${tg.oa_model}` : ''}
                    </p>
                  )}
                  {tg.ai_rationale && (
                    <p className="text-[11px] text-indigo-700 italic mt-1 line-clamp-2">💡 {tg.ai_rationale}</p>
                  )}
                  {tg.research_gap && (
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                      <strong>{locale === 'en' ? 'Gap: ' : 'Gap: '}</strong>
                      {tg.research_gap}
                    </p>
                  )}
                </div>
                {tg.id && (
                  <button
                    onClick={() => removeTarget(tg.id!)}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
