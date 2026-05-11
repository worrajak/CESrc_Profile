'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

type Researcher = {
  id: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  position_th: string | null;
  expertise: string[] | null;
};

export type TeamMember = {
  id?: string;
  researcher_id: string | null;
  external_name?: string | null;
  external_affiliation?: string | null;
  role: 'pi' | 'co_pi' | 'researcher' | 'advisor' | 'consultant' | 'external_collaborator';
  fte_pct: number;
  compensation_pct: number;
  responsibilities?: string | null;
  ai_suggested?: boolean;
  ai_rationale?: string | null;
};

export default function TeamAllocator({
  proposalId,
  piId,
  proposal,
  onChanged,
}: {
  proposalId: string;
  piId: string;
  proposal: any;
  onChanged?: () => void;
}) {
  const { t, locale } = useI18n();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    const [{ data: team }, { data: people }] = await Promise.all([
      supabase
        .from('proposal_team')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('role', { ascending: true })
        .order('sort_order'),
      supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th, position_th, expertise')
        .order('h_index', { ascending: false, nullsFirst: false }),
    ]);
    setMembers((team as TeamMember[]) || []);
    setResearchers((people as Researcher[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const fullName = (id: string | null) => {
    if (!id) return '—';
    const r = researchers.find((x) => x.id === id);
    return r ? `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim() : '?';
  };

  const updateMember = async (idx: number, patch: Partial<TeamMember>) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], ...patch };
    setMembers(updated);
  };

  const saveMember = async (m: TeamMember) => {
    if (!m.id) return;
    const { error: e } = await supabase
      .from('proposal_team')
      .update({
        role: m.role,
        fte_pct: m.fte_pct,
        compensation_pct: m.compensation_pct,
        responsibilities: m.responsibilities || null,
      })
      .eq('id', m.id);
    if (e) setError(e.message);
    else onChanged?.();
  };

  const addMember = async (researcher_id: string) => {
    const { error: e } = await supabase.from('proposal_team').insert({
      proposal_id: proposalId,
      researcher_id,
      role: 'co_pi',
      fte_pct: 20,
      compensation_pct: 15,
    });
    if (e) setError(e.message);
    else {
      await refresh();
      onChanged?.();
    }
  };

  const removeMember = async (id: string) => {
    const { error: e } = await supabase.from('proposal_team').delete().eq('id', id);
    if (e) setError(e.message);
    else {
      await refresh();
      onChanged?.();
    }
  };

  const suggestWithAI = async () => {
    setSuggesting(true);
    setError('');
    try {
      const excludeIds = members.map((m) => m.researcher_id).filter(Boolean) as string[];
      const res = await fetch('/api/research-plan/match-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal, pi_id: piId, exclude_ids: excludeIds }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'AI failed');

      const team = (json.data?.team || []) as any[];
      if (team.length === 0) {
        setError(locale === 'en' ? 'AI returned no suggestions' : 'AI ไม่มีคำแนะนำ');
        return;
      }

      // Insert each suggested member
      const rows = team
        .filter((s) => s.researcher_id && s.researcher_id !== piId)
        .map((s) => ({
          proposal_id: proposalId,
          researcher_id: s.researcher_id,
          role: s.role || 'co_pi',
          fte_pct: s.fte_pct || 20,
          compensation_pct: s.compensation_pct || 15,
          responsibilities: s.responsibilities || null,
          ai_suggested: true,
          ai_rationale: s.ai_rationale || null,
        }));
      if (rows.length > 0) {
        await supabase.from('proposal_team').insert(rows);
        await refresh();
        onChanged?.();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setSuggesting(false);
    }
  };

  const totalFte = members.reduce((s, m) => s + (Number(m.fte_pct) || 0), 0);
  const totalComp = members.reduce((s, m) => s + (Number(m.compensation_pct) || 0), 0);

  const candidateOptions = researchers.filter((r) => !members.some((m) => m.researcher_id === r.id));

  if (loading) {
    return <div className="text-center py-6 text-gray-400 text-sm">Loading team…</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{t('rplan.team.section')}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {locale === 'en'
              ? `Total FTE: ${totalFte.toFixed(0)}% · Total compensation: ${totalComp.toFixed(0)}%`
              : `รวม FTE: ${totalFte.toFixed(0)}% · รวมค่าตอบแทน: ${totalComp.toFixed(0)}%`}
          </p>
        </div>
        <button
          onClick={suggestWithAI}
          disabled={suggesting}
          className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg font-medium transition disabled:opacity-50"
        >
          {suggesting ? '…' : t('rplan.team.suggest_with_ai')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {members.map((m, idx) => (
          <div
            key={m.id || idx}
            className={`border rounded-xl p-3 ${
              m.role === 'pi' ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-gray-50/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.role === 'pi'
                        ? 'bg-emerald-600 text-white'
                        : m.role === 'co_pi'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t(`rplan.team.role.${m.role}` as any) || m.role}
                  </span>
                  <span className="font-medium text-sm text-gray-800 truncate">{fullName(m.researcher_id)}</span>
                  {m.ai_suggested && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">AI</span>
                  )}
                </div>
                {m.ai_rationale && (
                  <p className="text-[10px] text-violet-700 italic mt-0.5 line-clamp-2">💡 {m.ai_rationale}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <select
                    value={m.role}
                    onChange={(e) => updateMember(idx, { role: e.target.value as any })}
                    onBlur={() => saveMember(members[idx])}
                    disabled={m.role === 'pi'}
                    className="px-2 py-1 border rounded text-xs"
                  >
                    <option value="pi">{t('rplan.team.role.pi')}</option>
                    <option value="co_pi">{t('rplan.team.role.co_pi')}</option>
                    <option value="researcher">{t('rplan.team.role.researcher')}</option>
                    <option value="advisor">{t('rplan.team.role.advisor')}</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={m.fte_pct ?? 0}
                    onChange={(e) => updateMember(idx, { fte_pct: +e.target.value })}
                    onBlur={() => saveMember(members[idx])}
                    placeholder={t('rplan.team.fte')}
                    className="px-2 py-1 border rounded text-xs"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={m.compensation_pct ?? 0}
                    onChange={(e) => updateMember(idx, { compensation_pct: +e.target.value })}
                    onBlur={() => saveMember(members[idx])}
                    placeholder={t('rplan.team.compensation')}
                    className="px-2 py-1 border rounded text-xs"
                  />
                </div>
                <textarea
                  value={m.responsibilities || ''}
                  onChange={(e) => updateMember(idx, { responsibilities: e.target.value })}
                  onBlur={() => saveMember(members[idx])}
                  rows={1}
                  placeholder={locale === 'en' ? 'Responsibilities…' : 'หน้าที่ในโครงการ…'}
                  className="w-full mt-1.5 px-2 py-1 border rounded text-xs"
                />
              </div>
              {m.role !== 'pi' && m.id && (
                <button
                  onClick={() => removeMember(m.id!)}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add member */}
      {candidateOptions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dashed">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addMember(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-1.5 border rounded-lg text-xs text-gray-600"
            value=""
          >
            <option value="">+ {locale === 'en' ? 'Add researcher to team' : 'เพิ่มสมาชิกทีม'}…</option>
            {candidateOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {`${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim()}
                {r.position_th ? ` — ${r.position_th}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
