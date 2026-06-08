'use client';

/**
 * ResearchPipelineSection — Phase B
 * ─────────────────────────────────
 * Lists every paper in the plan owner's research pipeline + supporting
 * data: link to an existing publication (CESRU DB) or an external
 * in-progress paper (manual entry). For each paper, the plan owner
 * picks which CESRU researchers are FA/CA/Co/Last authors — this is
 * what counts toward the ก.พ.อ. promotion criteria.
 *
 * Phase C will add ORCID lookup for external researchers.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CareerPlan } from './CareerPlanView';
import AddPipelineItemModal from './AddPipelineItemModal';
import PipelineAuthorEditor from './PipelineAuthorEditor';

export type PipelineItem = {
  id: string;
  plan_id: string;
  publication_id: string | null;
  external_title: string | null;
  external_journal: string | null;
  external_year: number | null;
  external_doi: string | null;
  pub_status: 'drafting' | 'submitted' | 'in_review' | 'accepted' | 'published';
  target_journal: string | null;
  target_quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
  notes: string | null;
};

export type PipelineAuthor = {
  id: string;
  pipeline_id: string;
  researcher_id: string | null;
  external_name: string | null;
  external_orcid: string | null;
  external_affiliation: string | null;
  role: 'first_author' | 'corresponding_author' | 'co_author' | 'last_author';
  is_corresponding: boolean;
  author_order: number | null;
};

const STATUS_LABEL: Record<PipelineItem['pub_status'], { th: string; color: string }> = {
  drafting:   { th: 'กำลังเขียน',   color: 'bg-slate-100 text-slate-700' },
  submitted:  { th: 'ส่งแล้ว',       color: 'bg-blue-100 text-blue-800' },
  in_review:  { th: 'อยู่ในการประเมิน', color: 'bg-amber-100 text-amber-800' },
  accepted:   { th: 'รับตีพิมพ์',    color: 'bg-emerald-100 text-emerald-700' },
  published:  { th: 'ตีพิมพ์แล้ว',   color: 'bg-emerald-200 text-emerald-900' },
};

const ROLE_BADGE: Record<PipelineAuthor['role'], { label: string; color: string }> = {
  first_author:         { label: 'FA',   color: 'bg-rose-100 text-rose-700 border-rose-200' },
  corresponding_author: { label: 'CA',   color: 'bg-violet-100 text-violet-700 border-violet-200' },
  co_author:            { label: 'Co',   color: 'bg-slate-100 text-slate-700 border-slate-200' },
  last_author:          { label: 'Last', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export default function ResearchPipelineSection({ plan }: { plan: CareerPlan }) {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [authorsByItem, setAuthorsByItem] = useState<Record<string, PipelineAuthor[]>>({});
  const [pubTitlesById, setPubTitlesById] = useState<Record<string, { title: string; journal: string | null; year: number | null }>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editAuthorsFor, setEditAuthorsFor] = useState<PipelineItem | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data: pipelineRows } = await supabase
      .from('academic_position_research_pipeline')
      .select('*')
      .eq('plan_id', plan.id)
      .order('created_at', { ascending: false });
    const list = (pipelineRows as PipelineItem[]) || [];
    setItems(list);

    // Load authors per pipeline item
    if (list.length > 0) {
      const { data: authors } = await supabase
        .from('academic_position_pipeline_authors')
        .select('*')
        .in('pipeline_id', list.map((i) => i.id))
        .order('author_order', { ascending: true });
      const map: Record<string, PipelineAuthor[]> = {};
      for (const a of (authors as PipelineAuthor[]) || []) {
        if (!map[a.pipeline_id]) map[a.pipeline_id] = [];
        map[a.pipeline_id].push(a);
      }
      setAuthorsByItem(map);

      // Resolve linked publication titles
      const pubIds = Array.from(new Set(list.map((i) => i.publication_id).filter(Boolean))) as string[];
      if (pubIds.length > 0) {
        const { data: pubs } = await supabase
          .from('publications')
          .select('id, title, journal_name, year')
          .in('id', pubIds);
        const titleMap: typeof pubTitlesById = {};
        for (const p of (pubs as any[]) || []) {
          titleMap[p.id] = { title: p.title, journal: p.journal_name, year: p.year };
        }
        setPubTitlesById(titleMap);
      }
    } else {
      setAuthorsByItem({});
      setPubTitlesById({});
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  const removeItem = async (item: PipelineItem) => {
    if (!window.confirm('ลบรายการนี้ออกจาก pipeline?')) return;
    await supabase
      .from('academic_position_research_pipeline')
      .delete()
      .eq('id', item.id);
    refresh();
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700">
          📚 งานวิจัยที่เตรียมตีพิมพ์
          <span className="ml-2 text-[11px] font-normal text-gray-500">
            ({items.length} รายการ)
          </span>
        </h3>
        <button
          onClick={() => setAddOpen(true)}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
        >
          + เพิ่มงานวิจัย
        </button>
      </div>

      {loading ? (
        <div className="px-3 py-6 text-center text-xs text-gray-400">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-gray-400">
          ยังไม่มีรายการ — กด “+ เพิ่มงานวิจัย” เพื่อเลือกบทความที่มีอยู่ในระบบ หรือเพิ่มบทความที่กำลังเขียน
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((it) => {
            const linked = it.publication_id ? pubTitlesById[it.publication_id] : null;
            const title = linked?.title || it.external_title || '—';
            const journal = linked?.journal || it.external_journal;
            const year = linked?.year || it.external_year;
            const status = STATUS_LABEL[it.pub_status];
            const authors = authorsByItem[it.id] || [];

            return (
              <li key={it.id} className="px-3 py-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${status.color}`}>
                        {status.th}
                      </span>
                      {linked ? (
                        <span className="text-[10px] text-emerald-700">🔗 จาก publications</span>
                      ) : (
                        <span className="text-[10px] text-blue-700">✍️ external</span>
                      )}
                      {it.target_journal && (
                        <span className="text-[10px] text-gray-500">→ {it.target_journal}</span>
                      )}
                      {it.target_quartile && (
                        <span className="text-[10px] font-semibold text-violet-700">{it.target_quartile}</span>
                      )}
                    </div>
                    <div className="font-medium text-gray-800 leading-snug">{title}</div>
                    {(journal || year) && (
                      <div className="text-[11px] text-gray-500 mt-0.5 italic">
                        {journal}
                        {journal && year ? ' · ' : ''}
                        {year}
                      </div>
                    )}
                    {it.external_doi && (
                      <a
                        href={`https://doi.org/${it.external_doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline mt-0.5 inline-block"
                      >
                        DOI: {it.external_doi}
                      </a>
                    )}
                    {/* Authors row */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {authors.length === 0 ? (
                        <span className="text-[10px] text-gray-400 italic">ยังไม่ได้ระบุผู้แต่ง</span>
                      ) : (
                        authors.map((a) => (
                          <AuthorChip key={a.id} author={a} />
                        ))
                      )}
                      <button
                        onClick={() => setEditAuthorsFor(it)}
                        className="text-[10px] px-1.5 py-0.5 border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 rounded"
                      >
                        ✎ แก้ผู้แต่ง
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it)}
                    className="text-[10px] px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded flex-shrink-0"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {addOpen && (
        <AddPipelineItemModal
          planId={plan.id}
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            refresh();
          }}
        />
      )}

      {editAuthorsFor && (
        <PipelineAuthorEditor
          item={editAuthorsFor}
          authors={authorsByItem[editAuthorsFor.id] || []}
          onClose={() => setEditAuthorsFor(null)}
          onSaved={() => {
            setEditAuthorsFor(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function AuthorChip({ author }: { author: PipelineAuthor }) {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    if (author.researcher_id) {
      supabase
        .from('researchers')
        .select('title_th, first_name_th, last_name_th')
        .eq('id', author.researcher_id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setName(`${data.title_th || ''}${data.first_name_th} ${data.last_name_th}`);
        });
    } else {
      setName(author.external_name || '?');
    }
  }, [author.researcher_id, author.external_name]);

  const badge = ROLE_BADGE[author.role];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 border rounded ${badge.color}`}
      title={author.is_corresponding ? `${name} · Corresponding` : name}
    >
      <span className="font-bold">{badge.label}</span>
      <span className="truncate max-w-[120px]">{name}</span>
      {author.is_corresponding && <span className="text-violet-700">*</span>}
    </span>
  );
}
