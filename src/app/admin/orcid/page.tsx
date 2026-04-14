'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WORK_TYPE_MAP: Record<string, string> = {
  'journal-article': 'วารสาร',
  'conference-paper': 'การประชุม',
  'book-chapter': 'บทในหนังสือ',
  'book': 'หนังสือ',
  'dissertation': 'วิทยานิพนธ์',
  'report': 'รายงาน',
  'other': 'อื่นๆ',
};

export default function AdminOrcidPage() {
  const [researchers, setResearchers] = useState<any[]>([]);
  const [selectedResearcher, setSelectedResearcher] = useState('');
  const [orcidInput, setOrcidInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orcidData, setOrcidData] = useState<any>(null);
  const [error, setError] = useState('');

  // Import selections
  const [selectedWorks, setSelectedWorks] = useState<Set<number>>(new Set());
  const [selectedFundings, setSelectedFundings] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Tab
  const [tab, setTab] = useState<'profile' | 'works' | 'fundings'>('profile');

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      const { data } = await supabase
        .from('researchers')
        .select('id, title_th, first_name_th, last_name_th, first_name_en, last_name_en, orcid_id')
        .order('last_name_th');
      setResearchers(data || []);
    } catch {}
  };

  const handleFetch = async () => {
    const orcid = orcidInput.trim();
    if (!orcid) { setError('กรุณากรอก ORCID ID'); return; }

    setLoading(true);
    setError('');
    setOrcidData(null);
    setImportResult(null);
    setSelectedWorks(new Set());
    setSelectedFundings(new Set());

    try {
      const res = await fetch(`/api/orcid/${orcid}`);
      const data = await res.json();

      if (res.ok) {
        setOrcidData(data);
        setTab('profile');
        // Auto-select all works and fundings
        setSelectedWorks(new Set(data.works?.map((_: any, i: number) => i) || []));
        setSelectedFundings(new Set(data.fundings?.map((_: any, i: number) => i) || []));
        // Auto-match researcher if linked
        if (data.existing_researcher) {
          setSelectedResearcher(data.existing_researcher.id);
        }
      } else {
        setError(data.error || 'ไม่สามารถดึงข้อมูลได้');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedResearcher) { setError('กรุณาเลือกนักวิจัยก่อน'); return; }
    if (!orcidData) return;

    setImporting(true);
    setImportResult(null);

    try {
      const worksToImport = orcidData.works.filter((_: any, i: number) => selectedWorks.has(i));
      const fundingsToImport = orcidData.fundings.filter((_: any, i: number) => selectedFundings.has(i));

      const res = await fetch(`/api/orcid/${orcidData.orcid_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researcher_id: selectedResearcher,
          import_works: selectedWorks.size > 0,
          import_fundings: selectedFundings.size > 0,
          works: worksToImport,
          fundings: fundingsToImport,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        fetchResearchers(); // refresh orcid_id
      } else {
        setError(data.error || 'นำเข้าไม่สำเร็จ');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setImporting(false);
    }
  };

  const toggleWork = (i: number) => {
    const next = new Set(selectedWorks);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedWorks(next);
  };

  const toggleFunding = (i: number) => {
    const next = new Set(selectedFundings);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelectedFundings(next);
  };

  const toggleAllWorks = () => {
    if (selectedWorks.size === orcidData?.works?.length) {
      setSelectedWorks(new Set());
    } else {
      setSelectedWorks(new Set(orcidData?.works?.map((_: any, i: number) => i) || []));
    }
  };

  const toggleAllFundings = () => {
    if (selectedFundings.size === orcidData?.fundings?.length) {
      setSelectedFundings(new Set());
    } else {
      setSelectedFundings(new Set(orcidData?.fundings?.map((_: any, i: number) => i) || []));
    }
  };

  // Quick lookup: researchers with orcid
  const researchersWithOrcid = researchers.filter(r => r.orcid_id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ORCID Integration</h1>
          <p className="text-gray-500 text-sm">ดึงข้อมูลนักวิจัยจาก ORCID — ผลงานตีพิมพ์, ทุนวิจัย, สังกัด</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          กลับ Admin
        </Link>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-green-800 mb-3">ค้นหาข้อมูลจาก ORCID</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">ORCID ID</label>
            <div className="flex gap-2">
              <input
                value={orcidInput}
                onChange={e => setOrcidInput(e.target.value)}
                className="flex-1 border border-green-200 rounded-lg px-4 py-2.5 text-sm font-mono bg-white"
                placeholder="0000-0002-1234-5678"
              />
              <button
                onClick={handleFetch}
                disabled={loading}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'กำลังดึง...' : 'ดึงข้อมูล ORCID'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">เชื่อมกับนักวิจัย</label>
            <select
              value={selectedResearcher}
              onChange={e => setSelectedResearcher(e.target.value)}
              className="w-full border border-green-200 rounded-lg px-4 py-2.5 text-sm bg-white"
            >
              <option value="">-- เลือกนักวิจัยในระบบ --</option>
              {researchers.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title_th || ''}{r.first_name_th} {r.last_name_th}
                  {r.first_name_en ? ` (${r.first_name_en} ${r.last_name_en})` : ''}
                  {r.orcid_id ? ` [ORCID: ${r.orcid_id}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Researchers with ORCID */}
        {researchersWithOrcid.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-green-600 py-1">เชื่อมแล้ว:</span>
            {researchersWithOrcid.map(r => (
              <button
                key={r.id}
                onClick={() => { setOrcidInput(r.orcid_id); setSelectedResearcher(r.id); }}
                className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full hover:bg-green-200 font-medium"
              >
                {r.first_name_th} {r.last_name_th?.charAt(0)}. — {r.orcid_id}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 mb-6">
          นำเข้าสำเร็จ! ผลงาน: {importResult.imported.works} รายการ (ข้าม {importResult.skipped.works})
          {' | '}ทุนวิจัย: {importResult.imported.fundings} รายการ (ข้าม {importResult.skipped.fundings})
        </div>
      )}

      {/* ORCID Data Preview */}
      {orcidData && (
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 rounded-t-xl text-white">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xl">
                  {orcidData.name.credit_name || `${orcidData.name.first_name} ${orcidData.name.last_name}`}
                </h4>
                <p className="text-green-200 text-sm mt-1 font-mono">ORCID: {orcidData.orcid_id}</p>
              </div>
              <div className="text-right text-xs text-green-200">
                <p>{orcidData.stats.works} ผลงาน</p>
                <p>{orcidData.stats.fundings} ทุนวิจัย</p>
                <p>{orcidData.stats.affiliations} สังกัด</p>
              </div>
            </div>
            {orcidData.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {orcidData.keywords.map((kw: string, i: number) => (
                  <span key={i} className="bg-white/20 px-2 py-0.5 rounded text-xs">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {[
              { key: 'profile', label: `ข้อมูลส่วนตัว` },
              { key: 'works', label: `ผลงาน (${orcidData.works?.length || 0})` },
              { key: 'fundings', label: `ทุนวิจัย (${orcidData.fundings?.length || 0})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                  tab === t.key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 text-sm mb-1">Name</h5>
                    <p className="text-sm text-gray-800">{orcidData.name.first_name} {orcidData.name.last_name}</p>
                    {orcidData.name.credit_name && (
                      <p className="text-xs text-gray-400">Credit: {orcidData.name.credit_name}</p>
                    )}
                  </div>
                </div>

                {orcidData.affiliations?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 text-sm mb-2">สังกัด / การศึกษา</h5>
                    <div className="space-y-2">
                      {orcidData.affiliations.map((aff: any, i: number) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              aff.type === 'employment' ? 'bg-blue-100 text-blue-700' :
                              aff.type === 'education' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {aff.type === 'employment' ? 'สังกัด' : aff.type === 'education' ? 'การศึกษา' : aff.type}
                            </span>
                            <span className="font-medium text-gray-800 text-sm">{aff.organization}</span>
                          </div>
                          {(aff.role || aff.department) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {aff.role}{aff.role && aff.department ? ' — ' : ''}{aff.department}
                            </p>
                          )}
                          {(aff.start_year || aff.end_year) && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {aff.start_year || '?'} — {aff.end_year || 'ปัจจุบัน'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Works Tab */}
            {tab === 'works' && (
              <div>
                {orcidData.works?.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWorks.size === orcidData.works.length}
                          onChange={toggleAllWorks}
                          className="rounded"
                        />
                        เลือกทั้งหมด ({selectedWorks.size}/{orcidData.works.length})
                      </label>
                    </div>
                    <div className="space-y-2">
                      {orcidData.works.map((w: any, i: number) => (
                        <label
                          key={i}
                          className={`block rounded-lg border p-3 cursor-pointer transition ${
                            selectedWorks.has(i) ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedWorks.has(i)}
                              onChange={() => toggleWork(i)}
                              className="mt-1 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm">{w.title}</div>
                              <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-gray-500">
                                {w.journal_name && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{w.journal_name}</span>}
                                {w.year && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{w.year}</span>}
                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                  {WORK_TYPE_MAP[w.type] || w.type}
                                </span>
                                {w.doi && (
                                  <a href={`https://doi.org/${w.doi}`} target="_blank" rel="noopener noreferrer"
                                    className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded hover:underline"
                                    onClick={e => e.stopPropagation()}>
                                    DOI: {w.doi}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">ไม่พบผลงานใน ORCID</p>
                )}
              </div>
            )}

            {/* Fundings Tab */}
            {tab === 'fundings' && (
              <div>
                {orcidData.fundings?.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFundings.size === orcidData.fundings.length}
                          onChange={toggleAllFundings}
                          className="rounded"
                        />
                        เลือกทั้งหมด ({selectedFundings.size}/{orcidData.fundings.length})
                      </label>
                    </div>
                    <div className="space-y-2">
                      {orcidData.fundings.map((f: any, i: number) => (
                        <label
                          key={i}
                          className={`block rounded-lg border p-3 cursor-pointer transition ${
                            selectedFundings.has(i) ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFundings.has(i)}
                              onChange={() => toggleFunding(i)}
                              className="mt-1 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm">{f.title}</div>
                              <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-gray-500">
                                {f.funder && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">{f.funder}</span>}
                                {f.start_year && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {f.start_year}{f.end_year ? ` — ${f.end_year}` : ''}
                                  </span>
                                )}
                                {f.amount && (
                                  <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                                    {Number(f.amount).toLocaleString()} {f.currency || ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">ไม่พบทุนวิจัยใน ORCID</p>
                )}
              </div>
            )}
          </div>

          {/* Import Actions */}
          <div className="border-t px-5 py-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              เลือก: {selectedWorks.size} ผลงาน, {selectedFundings.size} ทุนวิจัย
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing || !selectedResearcher || (selectedWorks.size === 0 && selectedFundings.size === 0)}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {importing ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูลที่เลือก'}
              </button>
              <button
                onClick={() => { setOrcidData(null); setImportResult(null); }}
                className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                ล้าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
