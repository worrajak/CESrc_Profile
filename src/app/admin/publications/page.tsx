'use client';

import { useState, useEffect, useCallback } from 'react';

interface Author {
  given: string;
  family: string;
  order: number;
  orcid?: string | null;
}

interface MatchResult {
  input_author: { given: string; family: string };
  author_order: number;
  matched_researcher: {
    id: string;
    first_name_en: string;
    last_name_en: string;
    title_th: string;
    first_name_th: string;
    last_name_th: string;
  } | null;
  confidence: number;
  suggested_role: string;
  is_corresponding: boolean;
}

export default function AdminPublicationsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Import state
  const [doiInput, setDoiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Publication form
  const [title, setTitle] = useState('');
  const [authorsRaw, setAuthorsRaw] = useState('');
  const [journalName, setJournalName] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [year, setYear] = useState('');
  const [doi, setDoi] = useState('');
  const [pubType, setPubType] = useState('journal_international');
  const [scopusIndexed, setScopusIndexed] = useState(false);
  const [wosIndexed, setWosIndexed] = useState(false);
  const [keywordsStr, setKeywordsStr] = useState('');

  // Authors matching
  const [parsedAuthors, setParsedAuthors] = useState<Author[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
      setPassword(sessionStorage.getItem('admin_pwd') || '');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_pwd', password);
      } else {
        setLoginError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setLoginError('เกิดข้อผิดพลาด');
    }
  };

  const clearForm = () => {
    setTitle(''); setAuthorsRaw(''); setJournalName('');
    setVolume(''); setIssue(''); setPages('');
    setYear(''); setDoi(''); setPubType('journal_international');
    setScopusIndexed(false); setWosIndexed(false); setKeywordsStr('');
    setParsedAuthors([]); setMatches([]);
    setError(''); setSuccess('');
  };

  // Fetch DOI
  const fetchDoi = useCallback(async () => {
    if (!doiInput.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setMatches([]);

    try {
      const res = await fetch('/api/publications/import-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, doi: doiInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch DOI');
        return;
      }

      // Fill form
      setTitle(data.title || '');
      setAuthorsRaw(data.authors_raw || '');
      setJournalName(data.journal_name || '');
      setVolume(data.volume || '');
      setIssue(data.issue || '');
      setPages(data.pages || '');
      setYear(data.year?.toString() || '');
      setDoi(data.doi || '');
      setPubType(data.pub_type || 'journal_international');
      setKeywordsStr((data.keywords || []).join(', '));
      setParsedAuthors(data.authors || []);
      setSuccess('Fetched from CrossRef successfully');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [doiInput, password]);

  // Match authors
  const matchAuthors = useCallback(async () => {
    if (parsedAuthors.length === 0) return;
    setMatchLoading(true);

    try {
      const res = await fetch('/api/publications/match-authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, authors: parsedAuthors }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches.map((m: any) => ({ ...m, is_corresponding: false })));
      }
    } catch {
      setError('Failed to match authors');
    } finally {
      setMatchLoading(false);
    }
  }, [parsedAuthors, password]);

  // Auto-match when authors are loaded
  useEffect(() => {
    if (parsedAuthors.length > 0) {
      matchAuthors();
    }
  }, [parsedAuthors, matchAuthors]);

  // Save publication
  const savePub = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    setSuccess('');

    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
    const authorLinks = matches
      .filter(m => m.matched_researcher)
      .map(m => ({
        researcher_id: m.matched_researcher!.id,
        author_role: m.suggested_role,
        author_order: m.author_order,
        is_corresponding: m.is_corresponding,
      }));

    try {
      const res = await fetch('/api/publications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          publication: {
            title, authors_raw: authorsRaw, journal_name: journalName,
            volume: volume || null, issue: issue || null, pages: pages || null,
            year: year || null, doi: doi || null, pub_type: pubType,
            scopus_indexed: scopusIndexed, wos_indexed: wosIndexed, keywords,
          },
          author_links: authorLinks,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setSuccess(`Saved successfully! (${authorLinks.length} researchers linked)`);
      clearForm();
      setDoiInput('');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin - จัดการผลงานตีพิมพ์</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg" placeholder="รหัสผ่าน" required />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">นำเข้าผลงานตีพิมพ์</h1>
        <a href="/admin" className="text-sm text-blue-600 hover:underline">← กลับ Admin</a>
      </div>

      {/* DOI Import */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Import จาก DOI</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={doiInput}
            onChange={e => setDoiInput(e.target.value)}
            placeholder="เช่น 10.3390/en18071628 หรือ https://doi.org/..."
            className="flex-1 px-4 py-2 border rounded-lg text-sm"
            onKeyDown={e => e.key === 'Enter' && fetchDoi()}
          />
          <button
            onClick={fetchDoi}
            disabled={loading || !doiInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {loading ? 'กำลังดึง...' : 'Fetch DOI'}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

      {/* Publication Form */}
      {title && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">ข้อมูลบทความ</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Authors</label>
              <input value={authorsRaw} onChange={e => setAuthorsRaw(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Journal / Conference</label>
                <input value={journalName} onChange={e => setJournalName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Publication Type</label>
                <select value={pubType} onChange={e => setPubType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="journal_international">วารสารนานาชาติ</option>
                  <option value="journal_national">วารสารในประเทศ</option>
                  <option value="conference_international">การประชุมนานาชาติ</option>
                  <option value="conference_national">การประชุมในประเทศ</option>
                  <option value="book_chapter">Book Chapter</option>
                  <option value="book">Book</option>
                  <option value="technical_report">Technical Report</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Volume</label>
                <input value={volume} onChange={e => setVolume(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Issue</label>
                <input value={issue} onChange={e => setIssue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Pages</label>
                <input value={pages} onChange={e => setPages(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Year</label>
                <input value={year} onChange={e => setYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">DOI</label>
                <input value={doi} onChange={e => setDoi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={scopusIndexed} onChange={e => setScopusIndexed(e.target.checked)} />
                Scopus
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={wosIndexed} onChange={e => setWosIndexed(e.target.checked)} />
                Web of Science
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Keywords (comma separated)</label>
              <input value={keywordsStr} onChange={e => setKeywordsStr(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Author Matching */}
      {matches.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            จับคู่นักวิจัย CESRU ({matches.filter(m => m.matched_researcher).length}/{matches.length} matched)
          </h2>

          {matchLoading && <p className="text-sm text-gray-500 mb-3">กำลังจับคู่...</p>}

          <div className="space-y-2">
            {matches.map((m, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                m.matched_researcher ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="w-6 text-center font-mono text-gray-400">{m.author_order}</span>
                <span className="w-44 font-medium text-gray-700">
                  {m.input_author.given} {m.input_author.family}
                </span>
                <span className="text-gray-400">→</span>
                {m.matched_researcher ? (
                  <>
                    <span className="flex-1 text-green-700 font-medium">
                      {m.matched_researcher.title_th}{m.matched_researcher.first_name_th} {m.matched_researcher.last_name_th}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      m.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      m.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(m.confidence * 100)}%
                    </span>
                    <select
                      value={m.suggested_role}
                      onChange={e => {
                        const updated = [...matches];
                        updated[idx].suggested_role = e.target.value;
                        setMatches(updated);
                      }}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      <option value="first_author">First Author</option>
                      <option value="co_author">Co-Author</option>
                      <option value="last_author">Last Author</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={m.is_corresponding}
                        onChange={e => {
                          const updated = [...matches];
                          updated[idx].is_corresponding = e.target.checked;
                          setMatches(updated);
                        }} />
                      Corr.
                    </label>
                    <button
                      onClick={() => {
                        const updated = [...matches];
                        updated[idx].matched_researcher = null;
                        setMatches(updated);
                      }}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="flex-1 text-gray-400 italic">External Author</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {title && (
        <div className="flex gap-3">
          <button
            onClick={savePub}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกผลงาน'}
          </button>
          <button onClick={clearForm}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            ล้างฟอร์ม
          </button>
        </div>
      )}
    </div>
  );
}
