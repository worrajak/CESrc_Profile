'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Researcher {
  id: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string | null;
  unit_role: string;
}

interface Summary {
  publications_total: number;
  publications_this_year: number;
  citations_total: number;
  h_index: number;
  grants_total: number;
  grants_active: number;
  travels_this_year: number;
  travel_days_this_year: number;
  travels_all: number;
  courses_as_instructor: number;
  academic_services: number;
  students_supervised: number;
}

interface Travel {
  id: string;
  title: string;
  travel_purpose: string;
  travel_location: string;
  travel_start_date: string;
  travel_end_date: string;
  travel_approval_number: string;
  travel_approval_doc_url: string;
  travel_approval_link: string;
  travel_budget: number | null;
  travel_funding_source: string;
  travel_activity_type: string;
}

interface WorkloadData {
  researcher: any;
  year: number;
  available_years: number[];
  summary: Summary;
  publications: any[];
  grants: any[];
  travels: Travel[];
  courses: any[];
  services: any[];
  students: any[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  conference: '🎤 ประชุมวิชาการ',
  seminar: '💼 สัมมนา',
  training: '📚 อบรม',
  field_work: '🔬 ภาคสนาม',
  meeting: '🗣️ ประชุม',
  inspection: '🔍 ตรวจสอบ',
  exhibition: '🎪 นิทรรศการ',
  consulting: '💡 ที่ปรึกษา',
  other: '📌 อื่นๆ',
};

export default function AdminWorkloadPage() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const pwd = sessionStorage.getItem('admin_pwd') || '';
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) {
        window.location.href = '/admin';
        return;
      }
      setAuthChecked(true);
      const r = await fetch('/api/researchers');
      if (r.ok) setResearchers(await r.json());
    })();
  }, []);

  const fetchWorkload = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workload/${selectedId}?year=${year}`);
      if (res.ok) setData(await res.json());
      else setData(null);
    } catch { setData(null); }
    setLoading(false);
  }, [selectedId, year]);

  useEffect(() => { fetchWorkload(); }, [fetchWorkload]);

  const printReport = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">&larr; Admin Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">📊 ประเมินภาระงาน (Workload Report)</h1>
          <p className="text-sm text-gray-500">รวบรวมผลงาน ทุน การเดินทางไปราชการ และกิจกรรมอื่นๆ สำหรับการประเมิน</p>
        </div>
        {data && (
          <button onClick={printReport}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            🖨️ พิมพ์รายงาน / PDF
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">เลือกนักวิจัย</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">-- เลือก --</option>
            {researchers.map((r) => (
              <option key={r.id} value={r.id}>{r.first_name_th} {r.last_name_th}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ปี</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg text-sm">
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const y = new Date().getFullYear() - n;
              return <option key={y} value={y}>{y} ({y + 543})</option>;
            })}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Researcher Header (print-friendly) */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{data.researcher.name_th}</h2>
                {data.researcher.name_en && <p className="text-sm text-gray-500">{data.researcher.name_en}</p>}
                <p className="text-sm text-gray-600 mt-1">{data.researcher.department}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ปีการประเมิน: <strong>{data.year} ({data.year + 543})</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">ORCID</p>
                <p className="text-xs font-mono text-gray-700">{data.researcher.orcid_id || '-'}</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard color="from-blue-500 to-cyan-500" label="ผลงานปีนี้" value={data.summary.publications_this_year} sub={`รวม ${data.summary.publications_total}`} />
            <StatCard color="from-orange-500 to-red-500" label="Citations" value={data.summary.citations_total.toLocaleString()} sub={`H-index ${data.summary.h_index}`} />
            <StatCard color="from-emerald-500 to-teal-500" label="ทุนที่กำลังดำเนินการ" value={data.summary.grants_active} sub={`รวม ${data.summary.grants_total}`} />
            <StatCard color="from-violet-500 to-fuchsia-500" label="เดินทางไปราชการ" value={`${data.summary.travels_this_year}`} sub={`${data.summary.travel_days_this_year} วัน`} />
            <StatCard color="from-amber-500 to-orange-500" label="หลักสูตรที่เป็นวิทยากร" value={data.summary.courses_as_instructor} sub="คน" />
            <StatCard color="from-lime-500 to-emerald-500" label="งานบริการวิชาการ" value={data.summary.academic_services} sub="งาน" />
            <StatCard color="from-pink-500 to-rose-500" label="นักศึกษาที่ดูแล" value={data.summary.students_supervised} sub="คน" />
            <StatCard color="from-sky-500 to-blue-500" label="เดินทางสะสม" value={data.summary.travels_all} sub="ทั้งหมด" />
          </div>

          {/* Travel Log */}
          <Section title={`✈️ การเดินทางไปราชการปี ${data.year} (${data.travels.length} ครั้ง · ${data.summary.travel_days_this_year} วัน)`}>
            {data.travels.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีการเดินทางในปีนี้</p>
            ) : (
              <div className="space-y-2">
                {data.travels.map((t) => {
                  const start = new Date(t.travel_start_date);
                  const end = t.travel_end_date ? new Date(t.travel_end_date) : start;
                  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <div key={t.id} className="border rounded-lg p-3 hover:bg-emerald-50/30 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              {ACTIVITY_LABELS[t.travel_activity_type] || t.travel_activity_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {start.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {days > 1 && <> — {end.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ({days} วัน)</>}
                            </span>
                          </div>
                          <p className="font-medium text-sm text-gray-800">{t.title}</p>
                          {t.travel_purpose && <p className="text-xs text-gray-600 mt-0.5">{t.travel_purpose}</p>}
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {t.travel_location && <span className="text-xs text-gray-500">📍 {t.travel_location}</span>}
                            {t.travel_approval_number && <span className="text-xs text-gray-500">📋 {t.travel_approval_number}</span>}
                            {t.travel_budget && <span className="text-xs text-amber-700">💰 {Number(t.travel_budget).toLocaleString()} ฿</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0 print:hidden">
                          {t.travel_approval_doc_url && (
                            <a href={t.travel_approval_doc_url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 text-center">
                              📄 PDF
                            </a>
                          )}
                          {t.travel_approval_link && (
                            <a href={t.travel_approval_link} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] bg-white border border-emerald-600 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 text-center">
                              🔗 Link
                            </a>
                          )}
                          <Link href={`/news/${t.id}`} target="_blank"
                            className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 text-center">
                            ดูข่าว
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Publications */}
          <Section title={`📄 ผลงานตีพิมพ์ปี ${data.year}`}>
            {data.publications.filter((p: any) => p.year === data.year).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีผลงานในปีนี้</p>
            ) : (
              <div className="space-y-1.5">
                {data.publications.filter((p: any) => p.year === data.year).map((p: any) => (
                  <div key={p.id} className="text-sm border-l-2 border-blue-300 pl-3 py-1">
                    <p className="text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500">
                      {p.journal_name} ({p.year}) · {p.cited_by_count || 0} citations
                      {p.doi && <> · DOI: <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.doi}</a></>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Active Grants */}
          <Section title={`💰 ทุนวิจัย (${data.grants.length} โครงการ)`}>
            {data.grants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีทุน</p>
            ) : (
              <div className="space-y-1.5">
                {data.grants.map((g: any) => (
                  <div key={g.id} className={`text-sm border-l-2 pl-3 py-1 ${g.status === 'active' ? 'border-emerald-400' : 'border-gray-300'}`}>
                    <p className="text-gray-800 font-medium">{g.title_th}</p>
                    <p className="text-xs text-gray-500">
                      {g.funding_agency} · ปีงบ {g.fiscal_year} · {g.status === 'active' ? '🟢 Active' : g.status}
                      {g.budget && <> · {Number(g.budget).toLocaleString()} ฿</>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Students */}
          {data.students.length > 0 && (
            <Section title={`👨‍🎓 นักศึกษาในความดูแล (${data.students.length} คน)`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.students.map((s: any) => (
                  <div key={s.id} className="text-sm border rounded-lg p-2">
                    <p className="text-gray-800">{s.title_th}{s.first_name_th} {s.last_name_th}</p>
                    <p className="text-xs text-gray-500">{s.degree_level} · เข้าศึกษาปี {s.enrollment_year}
                      {s.graduation_year && <> · จบปี {s.graduation_year}</>}
                      {' · '}{s.status}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {!selectedId && !loading && (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border-2 border-dashed">
          เลือกนักวิจัยเพื่อดูข้อมูลภาระงาน
        </div>
      )}
    </div>
  );
}

function StatCard({ color, label, value, sub }: { color: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} rounded-t-xl`}></div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
