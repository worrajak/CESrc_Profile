'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Researcher {
  id: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string;
  last_name_en: string;
  openalex_id: string | null;
  orcid_id: string | null;
  cited_by_count: number;
  h_index: number;
  i10_index: number;
}

interface OAWork {
  openalex_id: string;
  title: string;
  doi: string;
  year: number;
  type: string;
  pub_type: string;
  cited_by_count: number;
  journal: string;
  is_oa: boolean;
  oa_url: string;
  authors: { name: string; oa_id: string; position: string }[];
  selected?: boolean;
}

interface OAProfile {
  openalex_id: string;
  display_name: string;
  orcid: string | null;
  works_count: number;
  cited_by_count: number;
  h_index: number;
  i10_index: number;
  mean_citedness: number;
  affiliations: { institution: string; years: number[] }[];
  topics: { name: string; count: number; subfield: string }[];
  works: OAWork[];
  existing_researcher: any;
  stats: any;
}

export default function AdminOpenAlexPage() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Search / Import state
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [profile, setProfile] = useState<OAProfile | null>(null);
  const [selectedResearcher, setSelectedResearcher] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'works'>('overview');

  const fetchResearchers = useCallback(async () => {
    try {
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
    } catch {
      window.location.href = '/admin';
      return;
    }

    const res = await fetch('/api/researchers');
    if (res.ok) {
      const data = await res.json();
      setResearchers(data.sort((a: Researcher, b: Researcher) => (b.cited_by_count || 0) - (a.cited_by_count || 0)));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchResearchers(); }, [fetchResearchers]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/openalex/sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      fetchResearchers();
    } catch (err: any) {
      setSyncResult({ error: err.message });
    }
    setSyncing(false);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchLoading(true);
    setProfile(null);
    setImportResult(null);
    try {
      const res = await fetch(`/api/openalex/${searchId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        data.works = data.works.map((w: OAWork) => ({ ...w, selected: true }));
        setProfile(data);
        if (data.existing_researcher) {
          setSelectedResearcher(data.existing_researcher.id);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'ไม่พบข้อมูล');
      }
    } catch {
      alert('ไม่สามารถเชื่อมต่อได้');
    }
    setSearchLoading(false);
  };

  const handleImport = async () => {
    if (!selectedResearcher || !profile) return;
    setImporting(true);
    try {
      const selectedWorks = profile.works.filter((w) => w.selected);
      const oaId = profile.openalex_id.replace('https://openalex.org/', '');
      const res = await fetch(`/api/openalex/${oaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researcher_id: selectedResearcher,
          works: selectedWorks,
        }),
      });
      const data = await res.json();
      setImportResult(data);
      fetchResearchers();
    } catch (err: any) {
      setImportResult({ error: err.message });
    }
    setImporting(false);
  };

  const toggleAll = (selected: boolean) => {
    if (!profile) return;
    setProfile({
      ...profile,
      works: profile.works.map((w) => ({ ...w, selected })),
    });
  };

  const totalCitations = researchers.reduce((sum, r) => sum + (r.cited_by_count || 0), 0);
  const avgHIndex = researchers.length
    ? (researchers.reduce((sum, r) => sum + (r.h_index || 0), 0) / researchers.length).toFixed(1)
    : '0';

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">&larr; Admin Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">OpenAlex Integration</h1>
          <p className="text-sm text-gray-500">ดึงข้อมูลผลงาน Citations H-index จาก OpenAlex (ฟรี 100%)</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {syncing ? 'กำลัง Sync...' : 'Sync All Citations'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{researchers.filter((r) => r.openalex_id).length}</p>
          <p className="text-sm text-gray-500">Linked Researchers</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{totalCitations.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Citations</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{avgHIndex}</p>
          <p className="text-sm text-gray-500">Avg H-index</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{researchers.reduce((s, r) => s + (r.i10_index || 0), 0)}</p>
          <p className="text-sm text-gray-500">Total i10-index</p>
        </div>
      </div>

      {syncResult && (
        <div className={`mb-6 p-4 rounded-lg ${syncResult.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {syncResult.error ? (
            <p>Error: {syncResult.error}</p>
          ) : (
            <p>Synced {syncResult.researchers_synced} researchers, updated {syncResult.publications_updated} publications</p>
          )}
        </div>
      )}

      {/* Researcher Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">นักวิจัย</th>
              <th className="px-4 py-3 text-center text-gray-600">OpenAlex ID</th>
              <th className="px-4 py-3 text-center text-gray-600">ORCID</th>
              <th className="px-4 py-3 text-center text-gray-600">Citations</th>
              <th className="px-4 py-3 text-center text-gray-600">H-index</th>
              <th className="px-4 py-3 text-center text-gray-600">i10-index</th>
              <th className="px-4 py-3 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {researchers.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{r.first_name_th} {r.last_name_th}</p>
                  <p className="text-xs text-gray-500">{r.first_name_en} {r.last_name_en}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  {r.openalex_id ? (
                    <a href={`https://openalex.org/${r.openalex_id}`} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs font-mono">{r.openalex_id}</a>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.orcid_id ? (
                    <a href={`https://orcid.org/${r.orcid_id}`} target="_blank" rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-xs font-mono">{r.orcid_id}</a>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-orange-600">{r.cited_by_count || 0}</td>
                <td className="px-4 py-3 text-center font-semibold text-purple-600">{r.h_index || 0}</td>
                <td className="px-4 py-3 text-center font-semibold text-green-600">{r.i10_index || 0}</td>
                <td className="px-4 py-3 text-center">
                  {r.openalex_id ? (
                    <button
                      onClick={() => { setSearchId(r.openalex_id!); setTimeout(handleSearch, 100); }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      ดูผลงาน
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">ไม่มี OA ID</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Search / Import Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">ค้นหา / นำเข้าจาก OpenAlex</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="OpenAlex ID (เช่น A5077950520) หรือ orcid:0000-0003-4568-3178"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {searchLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>
      </div>

      {/* Profile Result */}
      {profile && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.display_name}</h2>
              <p className="text-sm text-gray-500">
                OpenAlex: <span className="font-mono">{profile.openalex_id?.split('/').pop()}</span>
                {profile.orcid && <> | ORCID: <span className="font-mono">{profile.orcid.split('/').pop()}</span></>}
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600">{profile.cited_by_count}</p>
                <p className="text-xs text-gray-500">Citations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{profile.h_index}</p>
                <p className="text-xs text-gray-500">H-index</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{profile.i10_index}</p>
                <p className="text-xs text-gray-500">i10-index</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{profile.works_count}</p>
                <p className="text-xs text-gray-500">Works</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => setTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              Overview ({profile.topics?.length || 0} Topics)
            </button>
            <button
              onClick={() => setTab('works')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'works' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              Works ({profile.works?.length || 0})
            </button>
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Topics */}
              {profile.topics?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Top Research Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.topics.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {t.name} ({t.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Affiliations */}
              {profile.affiliations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Affiliations</h3>
                  {profile.affiliations.slice(0, 5).map((a, i) => (
                    <div key={i} className="text-sm text-gray-600 mb-1">
                      {a.institution} <span className="text-gray-400">({a.years?.slice(0, 5).join(', ')})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'works' && (
            <div>
              <div className="flex items-center gap-4 mb-3">
                <button onClick={() => toggleAll(true)} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">เลือกทั้งหมด</button>
                <button onClick={() => toggleAll(false)} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">ไม่เลือก</button>
                <span className="text-sm text-gray-500">
                  เลือก {profile.works.filter((w) => w.selected).length} / {profile.works.length} ผลงาน
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {profile.works.map((w, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 border-b hover:bg-gray-50 ${w.selected ? '' : 'opacity-50'}`}>
                    <input
                      type="checkbox"
                      checked={w.selected || false}
                      onChange={() => {
                        const newWorks = [...profile.works];
                        newWorks[i] = { ...newWorks[i], selected: !newWorks[i].selected };
                        setProfile({ ...profile, works: newWorks });
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{w.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        <span>{w.year}</span>
                        {w.journal && <span>| {w.journal}</span>}
                        {w.doi && <span>| DOI: {w.doi}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-orange-600">{w.cited_by_count}</p>
                      <p className="text-xs text-gray-400">cited</p>
                      {w.is_oa && <span className="text-xs text-green-600 font-medium">OA</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Controls */}
              <div className="mt-4 flex items-center gap-4">
                <select
                  value={selectedResearcher}
                  onChange={(e) => setSelectedResearcher(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">-- เลือกนักวิจัย --</option>
                  {researchers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.first_name_th} {r.last_name_th} ({r.first_name_en} {r.last_name_en})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleImport}
                  disabled={importing || !selectedResearcher}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? 'กำลังนำเข้า...' : `นำเข้า ${profile.works.filter((w) => w.selected).length} ผลงาน`}
                </button>
              </div>

              {importResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${importResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {importResult.error ? (
                    <p>Error: {importResult.error}</p>
                  ) : (
                    <p>นำเข้าใหม่ {importResult.imported} | เชื่อมโยง {importResult.linked} | ข้าม {importResult.skipped} รายการ</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">เกี่ยวกับ OpenAlex</p>
        <ul className="list-disc list-inside space-y-1">
          <li>ฐานข้อมูลวิชาการ Open Source ฟรี 100% ครอบคลุม 250M+ ผลงาน</li>
          <li>อัปเดต Citations, H-index, Open Access status อัตโนมัติ</li>
          <li>รองรับการค้นหาด้วย OpenAlex ID หรือ ORCID (เช่น orcid:0000-0003-4568-3178)</li>
          <li>กด &quot;Sync All Citations&quot; เพื่ออัปเดตข้อมูลทุกท่านพร้อมกัน</li>
        </ul>
      </div>
    </div>
  );
}
