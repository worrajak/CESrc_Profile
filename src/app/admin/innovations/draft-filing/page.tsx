'use client';

import { useState } from 'react';
import Link from 'next/link';
import EvidenceChainPanel from '@/components/EvidenceChainPanel';
import type { EvidenceChain } from '@/lib/evidence-chain';

type DraftResult = {
  recommended_type?: string;
  recommendation_rationale_th?: string;
  key_features_th?: string[];
  estimated_cost_thb?: any;
  timeline_months?: any;
  documents_needed?: any[];
  draft_specification?: any;
  draft_claims_th?: string[];
  draft_abstract_th?: string;
  prior_art?: any[];
  filing_strategy?: any;
  risks_th?: string[];
  next_steps_th?: string[];
  evidence_chain?: EvidenceChain[];
};

const TYPE_LABELS: Record<string, string> = {
  petty_patent: 'อนุสิทธิบัตร (Petty Patent)',
  patent: 'สิทธิบัตรการประดิษฐ์ (Patent)',
  design_patent: 'สิทธิบัตรการออกแบบ (Design Patent)',
  copyright: 'ลิขสิทธิ์ (Copyright)',
  trade_secret: 'ความลับทางการค้า (Trade Secret)',
};

export default function DraftFilingPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tech, setTech] = useState('');
  const [markets, setMarkets] = useState<string[]>(['TH']);
  const [preferredType, setPreferredType] = useState('auto');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DraftResult | null>(null);
  const [meta, setMeta] = useState<{ source: string; model: string } | null>(null);

  const generate = async () => {
    if (desc.trim().length < 30) {
      setError('กรุณากรอกคำอธิบายไอเดียอย่างน้อย 30 ตัวอักษร');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/innovations/draft-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_title: title,
          idea_description: desc,
          technical_details: tech,
          target_markets: markets,
          preferred_type: preferredType,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'AI failed');
      setResult(json.data || {});
      setMeta({ source: json.source, model: json.model });
      setTimeout(() => document.getElementById('ai-output')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const toggleMarket = (m: string) => {
    setMarkets((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  // ---- Export helpers ----
  const renderAsMarkdown = (r: DraftResult) => {
    const spec = r.draft_specification || {};
    const lines: string[] = [];
    lines.push(`# ${spec.title_th || title || 'Patent Filing Draft'}\n`);
    if (spec.title_en) lines.push(`*${spec.title_en}*\n`);
    lines.push(`\n**ประเภทที่แนะนำ:** ${TYPE_LABELS[r.recommended_type || ''] || r.recommended_type}\n`);
    if (r.recommendation_rationale_th) lines.push(`\n${r.recommendation_rationale_th}\n`);

    lines.push(`\n---\n\n## รายละเอียดการประดิษฐ์\n`);
    if (spec.field_th) lines.push(`\n### สาขาเทคนิค\n\n${spec.field_th}\n`);
    if (spec.background_th) lines.push(`\n### ภูมิหลัง\n\n${spec.background_th}\n`);
    if (spec.summary_th) lines.push(`\n### บทสรุปการประดิษฐ์\n\n${spec.summary_th}\n`);
    if (spec.disclosure_th) lines.push(`\n### การเปิดเผยรายละเอียด\n\n${spec.disclosure_th}\n`);
    if (spec.best_mode_th) lines.push(`\n### วิธีการที่ดีที่สุดในการนำไปใช้\n\n${spec.best_mode_th}\n`);
    if (spec.drawings_description_th) lines.push(`\n### คำอธิบายภาพประกอบ\n\n${spec.drawings_description_th}\n`);

    if (r.draft_claims_th?.length) {
      lines.push(`\n## ข้อถือสิทธิ (Claims)\n`);
      r.draft_claims_th.forEach((c) => lines.push(`\n${c}\n`));
    }
    if (r.draft_abstract_th) {
      lines.push(`\n## บทสรุปการประดิษฐ์ (Abstract)\n\n${r.draft_abstract_th}\n`);
    }
    if (r.prior_art?.length) {
      lines.push(`\n## Prior Art ที่เปรียบเทียบ\n\n| # | ชื่อ | เลข | ปี | ความใกล้เคียง | จุดต่าง |\n|---|------|-----|----|----------------|---------|`);
      r.prior_art.forEach((p, i) => lines.push(`| ${i + 1} | ${p.title} | ${p.patent_or_doi || ''} | ${p.year || ''} | ${p.similarity || ''} | ${p.key_difference_th || ''} |`));
    }
    return lines.join('\n');
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/innovations" className="text-sm text-blue-600 hover:underline">← Innovations</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">📝 AI ผู้ช่วยร่างเอกสารยื่นขอ IP</h1>
        <p className="text-sm text-gray-500 mt-1">
          กรอกแนวคิด → AI ร่างเอกสารตามรูปแบบ IPThailand (
          <a href="https://www.ipthailand.go.th" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            ipthailand.go.th
          </a>
          ) พร้อมเปรียบเทียบ prior art และแนะนำกลยุทธ์การยื่น
        </p>
      </div>

      {/* Input form */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-800">ใส่ไอเดียของคุณ</h2>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อแนวคิด (ชั่วคราว)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ระบบ EV Wireless Charging แบบ Solar Hybrid"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            คำอธิบายไอเดีย <span className="text-red-500">*</span>
            <span className="text-gray-400 ml-2">(ปัญหาที่เจอ → วิธีแก้ → ประโยชน์)</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={6}
            placeholder={
              'อธิบายแนวคิด เช่น:\n' +
              'ปัญหา: รถยนต์ไฟฟ้าในชนบทขาดสถานีชาร์จ\n' +
              'ไอเดีย: ระบบชาร์จไร้สายที่ติดตั้งคู่กับแผงโซลาร์เซลล์ บูรณาการการจ่ายไฟแบบ MPPT-aware\n' +
              'ประโยชน์: ลดการพึ่งพา grid, ติดตั้งง่ายในพื้นที่ห่างไกล'
            }
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            รายละเอียดทางเทคนิค (option)
            <span className="text-gray-400 ml-2">โครงสร้าง / องค์ประกอบ / อัลกอริทึม / สเปค</span>
          </label>
          <textarea
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            rows={5}
            placeholder={
              'เช่น:\n' +
              '- ขดลวดส่ง: 200x200mm Litz wire, 85 kHz\n' +
              '- ขดลวดรับ: 150x150mm\n' +
              '- MPPT controller: STM32F4 + buck-boost converter\n' +
              '- ระยะส่งกำลัง: 5-15 cm, ประสิทธิภาพ ≥85%'
            }
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ตลาดเป้าหมาย</label>
            <div className="flex flex-wrap gap-2">
              {['TH', 'ASEAN', 'US', 'EU', 'CN', 'JP'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMarket(m)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition ${
                    markets.includes(m)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ประเภทที่อยากจด</label>
            <select
              value={preferredType}
              onChange={(e) => setPreferredType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="auto">🤖 ให้ AI แนะนำ</option>
              <option value="petty_patent">อนุสิทธิบัตร</option>
              <option value="patent">สิทธิบัตรการประดิษฐ์</option>
              <option value="design_patent">สิทธิบัตรการออกแบบ</option>
              <option value="copyright">ลิขสิทธิ์</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button
          onClick={generate}
          disabled={busy}
          className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 text-base"
        >
          {busy ? '🪄 AI กำลังร่างเอกสาร… (อาจใช้เวลา 15-45 วินาที)' : '🪄 ร่างเอกสารด้วย AI'}
        </button>
      </div>

      {/* Output */}
      {result && (
        <div id="ai-output" className="space-y-5">
          {meta && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs text-emerald-700 flex items-center justify-between flex-wrap gap-2">
              <span>✓ สร้างโดย <strong>{meta.source}</strong> ({meta.model})</span>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile('patent-draft.md', renderAsMarkdown(result), 'text/markdown')}
                  className="px-3 py-1 bg-white text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50"
                >
                  📥 Markdown
                </button>
                <button
                  onClick={() => downloadFile('patent-draft.json', JSON.stringify(result, null, 2), 'application/json')}
                  className="px-3 py-1 bg-white text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50"
                >
                  📥 JSON
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(renderAsMarkdown(result)); }}
                  className="px-3 py-1 bg-white text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50"
                >
                  📋 Copy MD
                </button>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <Section title="🎯 คำแนะนำประเภท IP" color="amber">
            {result.recommended_type && (
              <div className="mb-3">
                <div className="inline-block px-4 py-1.5 bg-amber-600 text-white rounded-full font-bold">
                  {TYPE_LABELS[result.recommended_type] || result.recommended_type}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result.recommendation_rationale_th}</p>

            {result.key_features_th?.length ? (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">จุดเด่น</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {result.key_features_th.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {result.estimated_cost_thb && (
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">💰 ค่าใช้จ่ายโดยประมาณ (บาท)</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {Object.entries(result.estimated_cost_thb).map(([k, v]) => (
                      <li key={k} className="flex justify-between"><span>{k}</span><span>{typeof v === 'number' ? v.toLocaleString() : String(v)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {result.timeline_months && (
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">⏱️ ระยะเวลา (เดือน)</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {Object.entries(result.timeline_months).map(([k, v]) => (
                      <li key={k} className="flex justify-between"><span>{k.replace(/_/g, ' ')}</span><span>{String(v)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* Documents */}
          {result.documents_needed?.length ? (
            <Section title="📋 เอกสารที่ต้องเตรียม" color="blue">
              <ul className="space-y-2">
                {result.documents_needed.map((d: any, i: number) => (
                  <li key={i} className="bg-white rounded-lg p-3 border border-blue-100 flex items-start gap-2">
                    <span>{d.required ? '✅' : '☐'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {d.name_th}
                        {d.code && <span className="ml-1 text-[10px] font-mono text-gray-400">({d.code})</span>}
                        {d.auto_drafted && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">AI draft แล้ว</span>}
                      </p>
                      {d.notes_th && <p className="text-xs text-gray-500 mt-0.5">{d.notes_th}</p>}
                      {d.download_url && (
                        <a href={d.download_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          🔗 ดาวน์โหลดแบบฟอร์ม
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* Specification */}
          {result.draft_specification && (
            <Section title="📝 ร่างรายละเอียดการประดิษฐ์" color="violet">
              <SpecField label="ชื่อ (ไทย)" value={result.draft_specification.title_th} mono />
              <SpecField label="ชื่อ (อังกฤษ)" value={result.draft_specification.title_en} mono />
              <SpecField label="สาขาเทคนิค" value={result.draft_specification.field_th} />
              <SpecField label="ภูมิหลัง" value={result.draft_specification.background_th} long />
              <SpecField label="บทสรุปการประดิษฐ์" value={result.draft_specification.summary_th} long />
              <SpecField label="การเปิดเผยรายละเอียด" value={result.draft_specification.disclosure_th} long />
              <SpecField label="วิธีที่ดีที่สุดในการนำไปใช้" value={result.draft_specification.best_mode_th} long />
              <SpecField label="คำอธิบายภาพประกอบ" value={result.draft_specification.drawings_description_th} />
            </Section>
          )}

          {/* Claims */}
          {result.draft_claims_th?.length ? (
            <Section title="💎 ข้อถือสิทธิ (Claims)" color="indigo">
              <div className="space-y-2">
                {result.draft_claims_th.map((c, i) => (
                  <div key={i} className="bg-white rounded p-3 border border-indigo-100 text-sm text-gray-800 leading-relaxed whitespace-pre-line font-serif">
                    {c}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Abstract */}
          {result.draft_abstract_th && (
            <Section title="📖 บทสรุปการประดิษฐ์ (Abstract)" color="cyan">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{result.draft_abstract_th}</p>
              <p className="text-[10px] text-gray-400 mt-2">{result.draft_abstract_th.length} ตัวอักษร</p>
            </Section>
          )}

          {/* Prior art */}
          {result.prior_art?.length ? (
            <Section title="🔍 Prior Art ที่เปรียบเทียบ" color="rose">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-rose-50 border-b border-rose-200">
                    <tr>
                      <th className="text-left p-2">ชื่อ</th>
                      <th className="text-left p-2">เลขสิทธิบัตร/DOI</th>
                      <th className="text-left p-2">ประเทศ</th>
                      <th className="text-center p-2">ปี</th>
                      <th className="text-center p-2">ใกล้เคียง</th>
                      <th className="text-left p-2">จุดต่างของเรา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {result.prior_art.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2">
                          {p.title}
                          {p.source_note === 'hypothetical' && <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">hypothetical</span>}
                        </td>
                        <td className="p-2 font-mono text-[10px]">{p.patent_or_doi || '—'}</td>
                        <td className="p-2">{p.country || '—'}</td>
                        <td className="p-2 text-center">{p.year || '—'}</td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.similarity === 'high' ? 'bg-red-100 text-red-700'
                            : p.similarity === 'medium' ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                          }`}>{p.similarity || '—'}</span>
                        </td>
                        <td className="p-2 text-gray-700">{p.key_difference_th || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          {/* Filing strategy */}
          {result.filing_strategy && (
            <Section title="🌍 กลยุทธ์การยื่น" color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">🇹🇭 ประเทศหลัก: {result.filing_strategy.primary_country}</p>
                  <p className="text-sm text-gray-700">{result.filing_strategy.primary_rationale_th}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">🌐 เส้นทางต่างประเทศ: {result.filing_strategy.international_path?.toUpperCase()}</p>
                  <p className="text-sm text-gray-700">{result.filing_strategy.international_rationale_th}</p>
                </div>
              </div>
              {result.filing_strategy.country_rationale_th && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">เปรียบเทียบประเทศแนะนำ</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(result.filing_strategy.country_rationale_th).map(([c, r]) => (
                      <div key={c} className="bg-white border border-emerald-200 rounded p-2 text-xs">
                        <p className="font-bold text-emerald-700">{c}</p>
                        <p className="text-gray-700 mt-1">{String(r)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.filing_strategy.global_comparison_th && (
                <div className="mt-4 bg-white rounded p-3 border border-emerald-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">📊 เปรียบเทียบทั่วโลก</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{result.filing_strategy.global_comparison_th}</p>
                </div>
              )}
            </Section>
          )}

          {/* Evidence Trust Chain */}
          {result.evidence_chain?.length ? (
            <EvidenceChainPanel
              chains={result.evidence_chain}
              title="ห่วงโซ่ความน่าเชื่อถือของหลักฐาน (ตามหลักการตรวจสอบรายงานของนักวิชาการคลาสสิก)"
            />
          ) : null}

          {/* Risks + next steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.risks_th?.length ? (
              <Section title="⚠️ ความเสี่ยง" color="red">
                <ul className="space-y-1.5">
                  {result.risks_th.map((r, i) => <li key={i} className="text-sm text-gray-700">• {r}</li>)}
                </ul>
              </Section>
            ) : null}
            {result.next_steps_th?.length ? (
              <Section title="✅ ขั้นตอนต่อไป" color="blue">
                <ol className="space-y-1.5 list-decimal list-inside">
                  {result.next_steps_th.map((s, i) => <li key={i} className="text-sm text-gray-700">{s.replace(/^\d+[\.\)]\s*/, '')}</li>)}
                </ol>
              </Section>
            ) : null}
          </div>

          {/* Final actions */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 border border-amber-300 text-center">
            <p className="text-sm font-semibold text-amber-900 mb-3">📦 พร้อมส่งต่อไปขั้นตอนถัดไป</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => downloadFile('patent-draft.md', renderAsMarkdown(result), 'text/markdown')}
                className="px-4 py-2 bg-white text-amber-700 border border-amber-400 rounded-lg hover:bg-amber-50 text-sm"
              >
                📥 ดาวน์โหลดเป็น Markdown
              </button>
              <button
                onClick={() => downloadFile('patent-draft.json', JSON.stringify(result, null, 2), 'application/json')}
                className="px-4 py-2 bg-white text-amber-700 border border-amber-400 rounded-lg hover:bg-amber-50 text-sm"
              >
                📥 ดาวน์โหลด JSON
              </button>
              <a
                href="https://www.ipthailand.go.th/th/แบบฟอร์ม.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                🌐 ไปกรอกที่ IPThailand →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50/50',
    blue: 'border-blue-200 bg-blue-50/50',
    violet: 'border-violet-200 bg-violet-50/50',
    indigo: 'border-indigo-200 bg-indigo-50/50',
    cyan: 'border-cyan-200 bg-cyan-50/50',
    rose: 'border-rose-200 bg-rose-50/50',
    emerald: 'border-emerald-200 bg-emerald-50/50',
    red: 'border-red-200 bg-red-50/50',
  };
  return (
    <div className={`rounded-2xl border-2 ${colorMap[color] || ''} p-5`}>
      <h2 className="font-bold text-gray-800 text-base mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SpecField({ label, value, mono, long }: { label: string; value?: string; mono?: boolean; long?: boolean }) {
  if (!value) return null;
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider mb-1">{label}</p>
      <p className={`${mono ? 'font-mono' : ''} text-sm text-gray-800 leading-relaxed ${long ? 'whitespace-pre-line' : ''}`}>
        {value}
      </p>
    </div>
  );
}
