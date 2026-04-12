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

  // AI settings (reads from DB via api)
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiModel, setAiModel] = useState('');
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [showApiSettings, setShowApiSettings] = useState(false);

  // Import state
  const [importMode, setImportMode] = useState<'doi' | 'citation'>('doi');
  const [doiInput, setDoiInput] = useState('');
  const [citationInput, setCitationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parseSource, setParseSource] = useState('');

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
    // Load AI providers from DB
    fetch('/api/publications/parse-citation')
      .then(r => r.json())
      .then(d => setAiProviders(d.providers || []))
      .catch(() => {});
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
    setError(''); setSuccess(''); setParseSource('');
  };

  // Fill form from API response
  const fillForm = (data: any) => {
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
    setParseSource(data.source || '');
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

      fillForm(data);
      setSuccess('Fetched from CrossRef successfully');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [doiInput, password]);

  // Parse Citation
  const parseCitation = useCallback(async () => {
    if (!citationInput.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setMatches([]);

    try {
      const res = await fetch('/api/publications/parse-citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          citation: citationInput.trim(),
          ai_provider: aiProvider || undefined,
          ai_model: aiModel || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to parse citation');
        return;
      }

      fillForm(data);
      const srcMap: Record<string, string> = {
        crossref: 'DOI found — fetched from CrossRef',
        ai: 'Parsed with AI — please verify',
        parsed: 'Parsed from citation text (please verify)',
      };
      setSuccess(srcMap[data.source] || 'Parsed');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [citationInput, password]);

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
        <div className="flex items-center gap-3">
          <button onClick={() => setShowApiSettings(!showApiSettings)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
              aiProviders.length > 0
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {aiProvider
              ? `AI: ${aiProviders.find(p => p.provider === aiProvider)?.name || aiProvider} ✓`
              : aiProviders.length > 0 ? 'เลือก AI' : 'ตั้งค่า AI'}
          </button>
          <a href="/admin" className="text-sm text-blue-600 hover:underline">← กลับ Admin</a>
        </div>
      </div>

      {/* AI Settings Panel */}
      {showApiSettings && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">เลือก AI สำหรับ Parse Citation</h3>
            <button onClick={() => setShowApiSettings(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <p className="text-xs text-gray-500">
            ใช้ AI ช่วยแยกข้อมูลจาก citation ให้แม่นยำขึ้น — API Key ตั้งค่าจากหน้า{' '}
            <a href="/admin/ai-settings" className="text-purple-600 hover:underline">ตั้งค่า AI</a>
          </p>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setAiProvider(''); setAiModel(''); }}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition ${
                !aiProvider ? 'ring-2 ring-purple-400 bg-white shadow-sm' : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}>
              อัตโนมัติ
            </button>
            {aiProviders.map((p: any) => (
              <button key={p.provider} onClick={() => { setAiProvider(p.provider); setAiModel(''); }}
                className={`text-xs px-3 py-2 rounded-lg font-medium transition ${
                  aiProvider === p.provider ? 'ring-2 ring-purple-400 bg-white shadow-sm' : 'bg-white/50 text-gray-600 hover:bg-white'
                }`}>
                {p.name}
              </button>
            ))}
          </div>

          {aiProvider && (
            <div>
              <label className="text-xs text-gray-600 block mb-1">เลือกโมเดล</label>
              <select className="border rounded-lg p-2.5 text-sm w-full"
                value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                <option value="">Default</option>
                {aiProviders.find((p: any) => p.provider === aiProvider)?.models?.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {aiProviders.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              ยังไม่มี AI Provider — กรุณาตั้งค่า API Key ที่หน้า{' '}
              <a href="/admin/ai-settings" className="font-medium underline">ตั้งค่า AI</a> ก่อน
            </div>
          )}
        </div>
      )}

      {/* Import Tabs */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setImportMode('doi')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              importMode === 'doi' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Import จาก DOI
          </button>
          <button
            onClick={() => setImportMode('citation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              importMode === 'citation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Import จาก Citation
          </button>
        </div>

        {importMode === 'doi' ? (
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
        ) : (
          <div>
            <textarea
              value={citationInput}
              onChange={e => setCitationInput(e.target.value)}
              placeholder={'วาง citation จาก Google Scholar, สำนักพิมพ์ หรือ reference list เช่น:\n\nM. Ngao-det, J. Thongpron, A. Namin, ... "Title," Journal, vol. 18, no. 7, pp. 1628, 2025.\n\nถ้ามี DOI ใน citation จะดึงจาก CrossRef อัตโนมัติ'}
              className="w-full px-4 py-3 border rounded-lg text-sm h-28 resize-y"
            />
            <button
              onClick={parseCitation}
              disabled={loading || !citationInput.trim()}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'กำลังแยกข้อมูล...' : 'Parse Citation'}
            </button>
          </div>
        )}
      </div>

      {/* Status messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          {success}
          {parseSource === 'parsed' && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">Regex parsed — กรุณาตรวจสอบข้อมูล</span>
          )}
          {parseSource === 'ai' && (
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">AI parsed — กรุณาตรวจสอบข้อมูล</span>
          )}
          {parseSource === 'crossref' && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">CrossRef verified</span>
          )}
        </div>
      )}

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
