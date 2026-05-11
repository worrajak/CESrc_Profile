'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/I18nContext';

type CriterionItem = {
  item: string;
  required: string;
  current: string;
  status: 'met' | 'missing' | 'partial' | 'unknown';
  action_th?: string;
};

type GapAnalysis = {
  researcher_name?: string;
  target_position?: 'asst_prof' | 'assoc_prof' | 'full_prof';
  verdict?: 'ready_normal' | 'ready_special' | 'not_ready';
  verdict_summary_th?: string;
  normal_method?: {
    applicable?: boolean;
    criteria_met?: CriterionItem[];
    criteria_missing?: CriterionItem[];
  };
  special_method?: {
    applicable?: boolean;
    rationale_th?: string;
    criteria_met?: CriterionItem[];
    criteria_missing?: CriterionItem[];
  };
  recommended_path?: 'normal' | 'special' | 'wait';
  recommended_actions_th?: string[];
  estimated_months_to_ready?: number;
};

const POSITION_LABELS: Record<string, { th: string; en: string }> = {
  asst_prof: { th: 'ผู้ช่วยศาสตราจารย์', en: 'Asst. Prof.' },
  assoc_prof: { th: 'รองศาสตราจารย์', en: 'Assoc. Prof.' },
  full_prof: { th: 'ศาสตราจารย์', en: 'Professor' },
};

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  met: { cls: 'bg-emerald-100 text-emerald-700', label: '✓' },
  missing: { cls: 'bg-red-100 text-red-700', label: '✗' },
  partial: { cls: 'bg-amber-100 text-amber-700', label: '◐' },
  unknown: { cls: 'bg-gray-100 text-gray-500', label: '?' },
};

export default function CareerGapModal({
  researcherId,
  researcherName,
  targetPosition,
  onClose,
}: {
  researcherId: string;
  researcherName: string;
  targetPosition: 'asst_prof' | 'assoc_prof' | 'full_prof';
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [aiMeta, setAiMeta] = useState<{ source: string; model: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/research-plan/career-gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ researcher_id: researcherId, target_position: targetPosition }),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || 'AI failed');
        setAnalysis(json.data || {});
        setAiMeta({ source: json.source, model: json.model });
      } catch (e: any) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [researcherId, targetPosition]);

  const verdictColor =
    analysis?.verdict === 'ready_normal'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
      : analysis?.verdict === 'ready_special'
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-amber-100 text-amber-700 border-amber-300';

  const verdictLabel = analysis?.verdict
    ? {
        ready_normal: locale === 'en' ? 'Ready (Normal method)' : 'พร้อมยื่นแบบปกติ',
        ready_special: locale === 'en' ? 'Ready (Special method)' : 'พร้อมยื่นแบบพิเศษ',
        not_ready: locale === 'en' ? 'Not ready yet' : 'ยังไม่พร้อมยื่น',
      }[analysis.verdict]
    : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-pink-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="font-bold text-lg">📊 {locale === 'en' ? 'Career Gap Analysis' : 'วิเคราะห์ Gap ตำแหน่งวิชาการ'}</h2>
            <p className="text-xs text-rose-100 mt-0.5 truncate">
              {researcherName} → {POSITION_LABELS[targetPosition][locale as 'th' | 'en']}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {locale === 'en' ? 'AI is comparing record vs criteria…' : 'AI กำลังเทียบประวัติกับเกณฑ์…'}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          ) : analysis ? (
            <div className="space-y-5">
              {/* Verdict */}
              <div className={`border-2 rounded-xl px-4 py-3 ${verdictColor}`}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  {locale === 'en' ? 'Verdict' : 'ผลการวิเคราะห์'}
                </p>
                <p className="font-bold text-lg mt-1">{verdictLabel}</p>
                {analysis.verdict_summary_th && (
                  <p className="text-sm mt-1 leading-relaxed">{analysis.verdict_summary_th}</p>
                )}
                {analysis.estimated_months_to_ready != null && analysis.verdict === 'not_ready' && (
                  <p className="text-xs mt-2 opacity-80">
                    ⏱ {locale === 'en' ? 'Estimated time to ready: ' : 'คาดว่าจะพร้อมในอีก: '}
                    {analysis.estimated_months_to_ready} {locale === 'en' ? 'months' : 'เดือน'}
                  </p>
                )}
              </div>

              {/* Two methods side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Normal method */}
                <MethodCard
                  title={locale === 'en' ? 'Normal Method (วิธีปกติ)' : 'วิธีปกติ'}
                  applicable={!!analysis.normal_method?.applicable}
                  recommended={analysis.recommended_path === 'normal'}
                  criteriaMet={analysis.normal_method?.criteria_met || []}
                  criteriaMissing={analysis.normal_method?.criteria_missing || []}
                  rationale={undefined}
                />

                {/* Special method */}
                <MethodCard
                  title={locale === 'en' ? 'Special Method (วิธีพิเศษ)' : 'วิธีพิเศษ'}
                  applicable={!!analysis.special_method?.applicable}
                  recommended={analysis.recommended_path === 'special'}
                  criteriaMet={analysis.special_method?.criteria_met || []}
                  criteriaMissing={analysis.special_method?.criteria_missing || []}
                  rationale={analysis.special_method?.rationale_th}
                />
              </div>

              {/* Recommended actions */}
              {analysis.recommended_actions_th && analysis.recommended_actions_th.length > 0 && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    📌 {locale === 'en' ? 'Recommended actions' : 'สิ่งที่ควรทำต่อไป'}
                  </p>
                  <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                    {analysis.recommended_actions_th.map((a, i) => (
                      <li key={i} className="leading-relaxed">{a}</li>
                    ))}
                  </ol>
                </div>
              )}

              {aiMeta && (
                <p className="text-[10px] text-gray-400 text-center">
                  Analyzed by {aiMeta.source} · {aiMeta.model}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  title,
  applicable,
  recommended,
  criteriaMet,
  criteriaMissing,
  rationale,
}: {
  title: string;
  applicable: boolean;
  recommended: boolean;
  criteriaMet: CriterionItem[];
  criteriaMissing: CriterionItem[];
  rationale?: string;
}) {
  return (
    <div
      className={`border rounded-xl p-4 ${
        recommended ? 'border-emerald-300 bg-emerald-50/30' : applicable ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-80'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
        {recommended && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">
            ⭐ แนะนำ
          </span>
        )}
      </div>

      {rationale && <p className="text-[11px] text-gray-600 italic mb-2">{rationale}</p>}

      <div className="space-y-1.5">
        {criteriaMet.map((c, i) => (
          <CritRow key={`m-${i}`} item={c} />
        ))}
        {criteriaMissing.map((c, i) => (
          <CritRow key={`x-${i}`} item={c} />
        ))}
        {criteriaMet.length + criteriaMissing.length === 0 && (
          <p className="text-[11px] text-gray-400 italic">ไม่มีข้อมูล</p>
        )}
      </div>
    </div>
  );
}

function CritRow({ item }: { item: CriterionItem }) {
  const badge = STATUS_BADGE[item.status] || STATUS_BADGE.unknown;
  return (
    <div className="text-[11px] flex items-start gap-2">
      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${badge.cls}`}>
        {badge.label}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-800">{item.item}</p>
        <p className="text-gray-500">
          <span className="text-gray-400">need:</span> {item.required}
          {item.current && (
            <>
              {' · '}
              <span className="text-gray-400">have:</span> {item.current}
            </>
          )}
        </p>
        {item.action_th && (
          <p className="text-blue-700 mt-0.5">→ {item.action_th}</p>
        )}
      </div>
    </div>
  );
}
