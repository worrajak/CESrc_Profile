'use client';

import { useState, useEffect } from 'react';

interface SyncResult {
  success?: boolean;
  processed?: number;
  updated?: number;
  errors?: any[];
  error?: string;
}

export default function SyncClassificationButton() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [scope, setScope] = useState<'openalex' | 'all'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdminAuth(sessionStorage.getItem('admin_auth') === 'true');
    }
  }, []);

  const handleSync = async () => {
    const pwd = sessionStorage.getItem('admin_pwd');
    if (!pwd) {
      alert('กรุณา login ที่หน้า /admin ก่อน');
      return;
    }
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/publications/auto-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          source: scope,
          use_ai: useAI,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        // Reload the page after a short delay so new keywords show up
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setSyncing(false);
  };

  if (!adminAuth) return null;

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90 shadow-md text-sm font-medium transition"
      >
        <span>🤖</span>
        <span>Sync ข้อมูล + SDGs</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !syncing && setShowPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>🤖</span>
                <span>จัดประเภทผลงานวิจัยอัตโนมัติ</span>
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                ดึง keywords + จัด SDG + จับคู่สาขาวิจัย
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ขอบเขต</label>
                <select value={scope} onChange={(e) => setScope(e.target.value as any)}
                  disabled={syncing}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="all">📋 ทุก publication ในระบบ</option>
                  <option value="openalex">🌍 เฉพาะ OpenAlex (ดึง concepts ได้)</option>
                </select>
              </div>

              <label className="flex items-start gap-2 cursor-pointer p-3 bg-violet-50 rounded-lg border border-violet-200">
                <input type="checkbox" checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  disabled={syncing}
                  className="mt-0.5 w-4 h-4" />
                <div className="text-sm">
                  <p className="font-medium text-violet-900">🧠 ใช้ AI เพิ่มเติม</p>
                  <p className="text-xs text-violet-600">ใช้ Claude/Gemini วิเคราะห์ publications ที่ keyword matching ไม่ครอบคลุม (ช้ากว่า แต่แม่นยำกว่า)</p>
                </div>
              </label>

              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 border border-amber-200">
                💡 <strong>วิธีทำงาน:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-0.5 ml-1">
                  <li>ดึง concepts/topics จาก OpenAlex (ถ้ามี)</li>
                  <li>วิเคราะห์ title + abstract + journal</li>
                  <li>จับคู่ research areas (10 sectors) + SDG goals (6 หมวด)</li>
                  {useAI && <li className="text-violet-700 font-semibold">ใช้ AI สำหรับเคสที่ keyword ไม่ครอบคลุม</li>}
                </ol>
              </div>

              {result && (
                <div className={`rounded-lg p-3 text-sm ${
                  result.error ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  {result.error ? (
                    <p>❌ {result.error}</p>
                  ) : (
                    <div>
                      <p className="font-semibold">✅ เสร็จเรียบร้อย!</p>
                      <p className="text-xs mt-1">
                        ประมวลผล {result.processed} รายการ · อัปเดต {result.updated} รายการ
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">กำลัง refresh หน้านี้ใน 2 วินาที...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={handleSync} disabled={syncing}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
                  {syncing ? '⏳ กำลังประมวลผล...' : '▶️ เริ่ม Sync'}
                </button>
                <button onClick={() => setShowPanel(false)} disabled={syncing}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
