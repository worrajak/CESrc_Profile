'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/I18nContext';

type ActionItem = {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail?: string;
  linked_grant_call_code?: string | null;
  linked_proposal_id?: string | null;
  deadline?: string | null;
  assignee_hint?: string | null;
};

type MonthBlock = {
  month_label: string;
  year: number;
  month: number;
  actions: ActionItem[];
};

type RiskItem = {
  risk: string;
  mitigation: string;
};

type ThemeItem = {
  theme: string;
  rationale: string;
};

type Plan = {
  horizon_months?: number;
  summary?: string;
  months?: MonthBlock[];
  risks?: RiskItem[];
  long_term_themes?: ThemeItem[];
};

const CATEGORY_ICONS: Record<string, string> = {
  grant_submit: '📝',
  grant_full_proposal: '📄',
  grant_revision: '✏️',
  journal_submit: '📚',
  journal_revision: '🔄',
  thesis_defense: '🎓',
  career_evidence: '📈',
  team_meeting: '👥',
};

const PRIORITY_COLOR: Record<string, string> = {
  high: 'border-red-300 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-gray-200 bg-gray-50',
};

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function ActionPlanGenerator() {
  const { t, locale } = useI18n();
  const [horizon, setHorizon] = useState<3 | 6 | 12>(6);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [aiMeta, setAiMeta] = useState<{ source: string; model: string; context?: any } | null>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setGenerating(true);
    setError('');
    setPlan(null);
    try {
      const res = await fetch('/api/research-plan/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon_months: horizon }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'AI failed');
      setPlan(json.data || {});
      setAiMeta({ source: json.source, model: json.model, context: json.context });
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-6">
        <h2 className="text-lg font-bold">{t('rplan.action_plan.title')}</h2>
        <p className="text-xs text-indigo-100 mt-1">{t('rplan.action_plan.subtitle')}</p>

        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-xs text-indigo-100">{locale === 'en' ? 'Horizon:' : 'ระยะเวลา:'}</span>
          {([3, 6, 12] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                horizon === h ? 'bg-white text-purple-700' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {t(`rplan.timeline.range_${h}` as any)}
            </button>
          ))}
          <button
            onClick={generate}
            disabled={generating}
            className="ml-auto px-4 py-1.5 bg-white text-purple-700 hover:bg-purple-50 rounded-lg font-medium text-xs disabled:opacity-50 transition"
          >
            {generating ? (locale === 'en' ? 'Thinking…' : 'AI กำลังคิด…') : t('rplan.action_plan.generate')}
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4 text-sm text-red-700">{error}</div>
        )}

        {!plan && !error && !generating && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🪄</div>
            <p className="text-sm">
              {locale === 'en'
                ? 'Choose a horizon and click "Generate plan with AI" to get a month-by-month action list.'
                : 'เลือกระยะเวลาแล้วกด "สร้างแผนด้วย AI" เพื่อรับแผนรายเดือน'}
            </p>
          </div>
        )}

        {generating && (
          <div className="text-center py-12 text-purple-500">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">
              {locale === 'en' ? 'AI is analyzing grants, proposals, and goals…' : 'AI กำลังวิเคราะห์ทุน ข้อเสนอ และเป้าหมาย…'}
            </p>
          </div>
        )}

        {plan && (
          <div className="space-y-5">
            {aiMeta && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700 flex items-center justify-between flex-wrap gap-2">
                <span>
                  ✓ {locale === 'en' ? 'Generated by' : 'สร้างโดย'} <strong>{aiMeta.source}</strong> ({aiMeta.model})
                </span>
                {aiMeta.context && (
                  <span className="font-mono text-[10px]">
                    {aiMeta.context.grants_count}g · {aiMeta.context.proposals_count}p · {aiMeta.context.journals_count}j · {aiMeta.context.goals_count}c
                  </span>
                )}
              </div>
            )}

            {plan.summary && (
              <div className="bg-indigo-50 border-l-4 border-indigo-400 px-4 py-3 rounded-r">
                <p className="text-xs font-semibold text-indigo-700 mb-1">
                  {locale === 'en' ? 'Overview' : 'ภาพรวม'}
                </p>
                <p className="text-sm text-indigo-900 leading-relaxed">{plan.summary}</p>
              </div>
            )}

            {/* Monthly cards */}
            {plan.months && plan.months.length > 0 && (
              <div className="space-y-3">
                {plan.months.map((mb, mi) => (
                  <div key={mi} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-4 py-2 border-b">
                      <h3 className="font-semibold text-gray-800 text-sm">📅 {mb.month_label}</h3>
                      <p className="text-[10px] text-gray-500">
                        {mb.actions.length} {locale === 'en' ? 'actions' : 'งาน'}
                      </p>
                    </div>
                    <div className="p-3 space-y-2">
                      {mb.actions.map((a, ai) => (
                        <div
                          key={ai}
                          className={`border rounded-lg p-3 ${PRIORITY_COLOR[a.priority] || 'border-gray-200'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg leading-none mt-0.5">{CATEGORY_ICONS[a.category] || '•'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    PRIORITY_BADGE[a.priority] || 'bg-gray-100'
                                  }`}
                                >
                                  {a.priority.toUpperCase()}
                                </span>
                                {a.linked_grant_call_code && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                                    {a.linked_grant_call_code}
                                  </span>
                                )}
                                {a.deadline && (
                                  <span className="text-[10px] text-red-600 font-mono ml-auto">⏰ {a.deadline}</span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                              {a.detail && (
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{a.detail}</p>
                              )}
                              {a.assignee_hint && (
                                <p className="text-[10px] text-gray-500 italic mt-1">👤 {a.assignee_hint}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Risks */}
            {plan.risks && plan.risks.length > 0 && (
              <div className="border border-red-200 rounded-xl overflow-hidden">
                <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                  <h3 className="font-semibold text-red-700 text-sm">⚠️ {locale === 'en' ? 'Risks' : 'ความเสี่ยง'}</h3>
                </div>
                <div className="p-3 space-y-2">
                  {plan.risks.map((r, i) => (
                    <div key={i} className="text-xs">
                      <p className="text-red-900 font-medium">{r.risk}</p>
                      <p className="text-red-700 mt-0.5 italic">→ {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long-term themes */}
            {plan.long_term_themes && plan.long_term_themes.length > 0 && (
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                  <h3 className="font-semibold text-blue-700 text-sm">
                    🌱 {locale === 'en' ? 'Long-term themes / opportunities' : 'ธีมระยะยาว / โอกาส'}
                  </h3>
                </div>
                <div className="p-3 space-y-2">
                  {plan.long_term_themes.map((th, i) => (
                    <div key={i} className="text-xs">
                      <p className="text-blue-900 font-medium">{th.theme}</p>
                      <p className="text-blue-700 mt-0.5">{th.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
