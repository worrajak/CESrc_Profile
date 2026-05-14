'use client';

import { useState } from 'react';
import {
  computeTrustScore,
  classifyStrength,
  TRUST_BADGE,
  SOURCE_TYPE_LABEL,
  CREDIBILITY_LABEL,
  type EvidenceChain,
  type EvidenceLink,
} from '@/lib/evidence-chain';

/**
 * Display a list of evidence chains for a document.
 * Each chain represents one claim and its trust path.
 *
 * The component:
 *  - Recomputes trust_score locally from links (don't blindly trust AI's score)
 *  - Sorts chains by trust ascending so weakest claims surface first
 *  - Expand/collapse details per claim
 */
export default function EvidenceChainPanel({
  chains,
  title,
  intro,
}: {
  chains: EvidenceChain[];
  title?: string;
  intro?: string;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Recompute & sort
  const enriched = (chains || []).map((c) => {
    const score = computeTrustScore(c.chain || [], c.independent_corroborations || 0);
    const strength = classifyStrength(score);
    return { ...c, _score: score, _strength: strength };
  }).sort((a, b) => a._score - b._score);

  if (enriched.length === 0) {
    return null;
  }

  const total = enriched.length;
  const strong = enriched.filter((c) => c._strength === 'strong').length;
  const moderate = enriched.filter((c) => c._strength === 'moderate').length;
  const weak = enriched.filter((c) => c._strength === 'weak').length;
  const uncited = enriched.filter((c) => c._strength === 'uncited').length;
  const overall = Math.round(enriched.reduce((s, c) => s + c._score, 0) / total);

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="font-bold text-gray-800 text-base">
            🔗 {title || 'ห่วงโซ่ความน่าเชื่อถือของหลักฐาน'}
          </h2>
          <p className="text-[11px] text-gray-500 mt-1 max-w-xl leading-relaxed">
            {intro ||
              'ทุกข้อความที่อ้างเป็นข้อเท็จจริง ต้องตอบ 3 คำถาม: (1) ใครเป็นคนพูด? (2) เขารู้จากใคร? (3) แต่ละคนในสายน่าเชื่อถือไหม? — กรอบนี้นำมาจากวิธีตรวจสอบรายงานของนักวิชาการคลาสสิกหลายอารยธรรม'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-700">{overall}<span className="text-base text-gray-400">/100</span></div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">overall trust</div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-2 mb-4 text-[10px] flex-wrap">
        <Pill count={strong} label="แข็งแรง" cls="bg-emerald-100 text-emerald-700" />
        <Pill count={moderate} label="ปานกลาง" cls="bg-amber-100 text-amber-700" />
        <Pill count={weak} label="อ่อน" cls="bg-orange-100 text-orange-700" />
        <Pill count={uncited} label="ขาดอ้างอิง" cls="bg-red-100 text-red-700" />
        <span className="ml-auto text-gray-500 text-[10px]">{total} claim รวม · เรียงจากอ่อนสุด → แข็งสุด</span>
      </div>

      {/* Chain cards */}
      <div className="space-y-2">
        {enriched.map((c, i) => {
          const badge = TRUST_BADGE[c._strength];
          const expanded = expandedIdx === i;
          return (
            <div key={i} className={`bg-white rounded-xl border ${expanded ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => setExpandedIdx(expanded ? null : i)}
                className="w-full text-left p-3 flex items-start gap-3"
              >
                <div className="flex-shrink-0 flex flex-col items-center min-w-[3rem]">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                    {badge.icon} {c._score}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">{badge.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${expanded ? 'text-gray-900' : 'text-gray-700'} line-clamp-${expanded ? 'none' : '2'}`}>
                    {c.claim}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {c.chain.length} link · {c.independent_corroborations || 0} corroboration
                    {c.concerns?.length ? ` · ${c.concerns.length} concern` : ''}
                  </p>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">{expanded ? '−' : '+'}</span>
              </button>

              {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                  {/* Chain visualization */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">ห่วงโซ่หลักฐาน</p>
                    <div className="space-y-1.5">
                      {c.chain.map((link, j) => (
                        <ChainLinkCard key={j} link={link} step={j + 1} />
                      ))}
                    </div>
                  </div>

                  {c.concerns?.length ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-amber-800 mb-1">⚠ จุดที่น่ากังวล</p>
                      <ul className="text-[11px] text-amber-900 space-y-0.5">
                        {c.concerns.map((x, k) => <li key={k}>• {x}</li>)}
                      </ul>
                    </div>
                  ) : null}

                  {c.suggestions?.length ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-blue-800 mb-1">💡 วิธีเสริมหลักฐาน</p>
                      <ul className="text-[11px] text-blue-900 space-y-0.5">
                        {c.suggestions.map((x, k) => <li key={k}>• {x}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ count, label, cls }: { count: number; label: string; cls: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-semibold ${cls}`}>
      {count} {label}
    </span>
  );
}

function ChainLinkCard({ link, step }: { link: EvidenceLink; step: number }) {
  const credColor: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-orange-50 text-orange-700 border-orange-200',
    unverified: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${credColor[link.credibility] || ''} text-xs`}>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] font-mono text-gray-500">#{step}</span>
        <span className="font-medium text-gray-800 flex-1 min-w-0 break-words">{link.source}</span>
        {link.year && <span className="text-[10px] text-gray-500">({link.year})</span>}
      </div>
      <div className="flex items-center gap-2 text-[10px] flex-wrap">
        <span className="px-1.5 py-0.5 bg-white rounded border border-gray-200">
          {SOURCE_TYPE_LABEL[link.source_type] || link.source_type}
        </span>
        <span className="px-1.5 py-0.5 bg-white rounded border border-gray-200">
          credibility: <strong>{CREDIBILITY_LABEL[link.credibility] || link.credibility}</strong>
        </span>
        {link.source_url && (
          <a href={link.source_url} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            ↗ ลิงก์
          </a>
        )}
      </div>
      {link.credibility_reason && (
        <p className="text-[11px] text-gray-700 mt-1 leading-relaxed">
          <strong>เหตุผล:</strong> {link.credibility_reason}
        </p>
      )}
      {link.verification_path && (
        <p className="text-[10px] text-gray-500 mt-0.5 italic">
          🔍 ตรวจสอบได้ที่: {link.verification_path}
        </p>
      )}
    </div>
  );
}
