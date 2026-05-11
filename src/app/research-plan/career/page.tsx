'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';
import { useAuth } from '@/lib/AuthContext';

type Criteria = {
  id: string;
  position_code: 'asst_prof' | 'assoc_prof' | 'full_prof';
  position_name_th: string;
  position_name_en: string | null;
  source: string | null;
  source_url: string | null;
  criteria: Record<string, any>;
  notes: string | null;
  ingested_at: string | null;
};

type Researcher = {
  id: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  position_th: string | null;
  h_index: number | null;
  i10_index: number | null;
  cited_by_count: number | null;
};

type CareerGoal = {
  id: string;
  researcher_id: string;
  target_position: 'asst_prof' | 'assoc_prof' | 'full_prof';
  target_date: string | null;
  status: string;
  current_progress: any;
  notes: string | null;
};

const POSITION_GRADIENTS: Record<string, string> = {
  asst_prof: 'from-blue-500 to-indigo-600',
  assoc_prof: 'from-purple-500 to-fuchsia-600',
  full_prof: 'from-rose-500 to-pink-600',
};

export default function CareerPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: cr }, { data: rs }, { data: gs }] = await Promise.all([
      supabase
        .from('promotion_criteria')
        .select('*')
        .eq('is_current', true)
        .order('position_code'),
      supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th, position_th, h_index, i10_index, cited_by_count')
        .order('h_index', { ascending: false, nullsFirst: false }),
      supabase.from('career_goals').select('*'),
    ]);
    setCriteria((cr as Criteria[]) || []);
    setResearchers((rs as Researcher[]) || []);
    setGoals((gs as CareerGoal[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refreshCriteria = async () => {
    setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/research-plan/fetch-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_prompt: locale === 'en' ? 'For Thai universities, 2026 latest version' : 'มหาวิทยาลัยไทย ฉบับล่าสุด 2569',
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setRefreshing(false);
    }
  };

  const setGoal = async (researcherId: string, targetPosition: CareerGoal['target_position']) => {
    const existing = goals.find((g) => g.researcher_id === researcherId);
    if (existing && existing.target_position === targetPosition) {
      // Unset
      await supabase.from('career_goals').delete().eq('id', existing.id);
    } else if (existing) {
      await supabase
        .from('career_goals')
        .update({ target_position: targetPosition })
        .eq('id', existing.id);
    } else {
      await supabase.from('career_goals').insert({
        researcher_id: researcherId,
        target_position: targetPosition,
        status: 'planned',
      });
    }
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-700 to-pink-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/research-plan" className="text-rose-100 hover:text-white text-sm">
            ← {t('rplan.detail.back')}
          </Link>
          <div className="flex items-start justify-between gap-4 mt-3 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                🎓 {locale === 'en' ? 'Academic Career Plan' : 'แผนตำแหน่งวิชาการ'}
              </h1>
              <p className="text-sm text-rose-100 mt-1">
                {locale === 'en'
                  ? 'Track progress toward ผศ. / รศ. / ศ. with current ก.พ.อ. criteria (AI-fetched)'
                  : 'ติดตามความก้าวหน้าสู่ ผศ. / รศ. / ศ. ตามเกณฑ์ ก.พ.อ. ปัจจุบัน (AI ดึงมา)'}
              </p>
            </div>
            {user && (
              <button
                onClick={refreshCriteria}
                disabled={refreshing}
                className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-medium shadow-lg text-sm whitespace-nowrap disabled:opacity-50"
              >
                {refreshing
                  ? locale === 'en'
                    ? '🔄 Fetching…'
                    : '🔄 กำลังดึง…'
                  : locale === 'en'
                  ? '🔄 Refresh criteria via AI'
                  : '🔄 ดึงเกณฑ์ปัจจุบันด้วย AI'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4 text-sm text-red-700">{error}</div>
        )}

        {/* Criteria cards */}
        <h2 className="font-semibold text-gray-800 mb-3">
          {locale === 'en' ? 'Promotion criteria (current)' : 'เกณฑ์ตำแหน่งวิชาการ (ปัจจุบัน)'}
        </h2>

        {criteria.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
            <div className="text-5xl mb-3">🎓</div>
            <h3 className="font-semibold text-gray-700 mb-1">
              {locale === 'en' ? 'No criteria fetched yet' : 'ยังไม่มีเกณฑ์'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {locale === 'en'
                ? 'Click the button above to let AI fetch the current ก.พ.อ. criteria'
                : 'กดปุ่มด้านบนเพื่อให้ AI ดึงเกณฑ์ ก.พ.อ. ปัจจุบันมาเก็บ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {criteria.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${POSITION_GRADIENTS[c.position_code]} text-white p-4`}>
                  <h3 className="font-bold text-sm">{c.position_name_th}</h3>
                  <p className="text-[11px] opacity-80">{c.position_name_en}</p>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  {Object.entries(c.criteria || {}).map(([method, items]: [string, any]) => (
                    <div key={method}>
                      <p className="font-semibold text-gray-800 mb-1">{method}</p>
                      <ul className="space-y-1 text-gray-700">
                        {typeof items === 'object' && items !== null
                          ? Object.entries(items).map(([k, v]) => (
                              <li key={k} className="leading-relaxed">
                                <strong className="text-gray-600">{k}:</strong> {String(v)}
                              </li>
                            ))
                          : <li>{String(items)}</li>}
                      </ul>
                    </div>
                  ))}
                  {c.notes && (
                    <p className="text-[10px] text-gray-500 italic border-t pt-2 mt-2">
                      📝 {c.notes}
                    </p>
                  )}
                  {c.source && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {locale === 'en' ? 'Source: ' : 'แหล่งอ้างอิง: '}
                      {c.source_url ? (
                        <a href={c.source_url} target="_blank" rel="noreferrer" className="underline text-blue-500">
                          {c.source}
                        </a>
                      ) : (
                        c.source
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Researcher career goals */}
        <h2 className="font-semibold text-gray-800 mb-3">
          {locale === 'en' ? 'CESRU researcher targets' : 'เป้าหมายนักวิจัย CESRU'}
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-700">
                  {locale === 'en' ? 'Researcher' : 'นักวิจัย'}
                </th>
                <th className="text-center px-2 py-2 text-xs font-semibold text-gray-700">
                  {locale === 'en' ? 'h-index' : 'h-index'}
                </th>
                <th className="text-center px-2 py-2 text-xs font-semibold text-gray-700">i10</th>
                <th className="text-center px-2 py-2 text-xs font-semibold text-gray-700">
                  {locale === 'en' ? 'Citations' : 'อ้างอิง'}
                </th>
                <th className="text-center px-2 py-2 text-xs font-semibold text-gray-700">
                  {locale === 'en' ? 'Target' : 'เป้าหมาย'}
                </th>
              </tr>
            </thead>
            <tbody>
              {researchers.map((r) => {
                const goal = goals.find((g) => g.researcher_id === r.id);
                const name = `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50/40">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800 text-sm">{name}</p>
                      <p className="text-[10px] text-gray-500">{r.position_th || '—'}</p>
                    </td>
                    <td className="text-center px-2 py-2.5 text-xs text-gray-700">{r.h_index ?? '—'}</td>
                    <td className="text-center px-2 py-2.5 text-xs text-gray-700">{r.i10_index ?? '—'}</td>
                    <td className="text-center px-2 py-2.5 text-xs text-gray-700">
                      {r.cited_by_count?.toLocaleString() ?? '—'}
                    </td>
                    <td className="text-center px-2 py-2.5">
                      {user ? (
                        <div className="flex gap-1 justify-center">
                          {(['asst_prof', 'assoc_prof', 'full_prof'] as const).map((pos) => {
                            const active = goal?.target_position === pos;
                            return (
                              <button
                                key={pos}
                                onClick={() => setGoal(r.id, pos)}
                                className={`text-[10px] px-2 py-1 rounded font-medium transition ${
                                  active
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                              >
                                {pos === 'asst_prof' ? 'ผศ.' : pos === 'assoc_prof' ? 'รศ.' : 'ศ.'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          {goal
                            ? goal.target_position === 'asst_prof'
                              ? 'ผศ.'
                              : goal.target_position === 'assoc_prof'
                              ? 'รศ.'
                              : 'ศ.'
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
