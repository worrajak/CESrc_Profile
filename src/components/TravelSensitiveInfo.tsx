'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

interface SensitiveData {
  travel_approval_number: string | null;
  travel_approval_doc_url: string | null;
  travel_approval_link: string | null;
  travel_budget: number | null;
  travel_funding_source: string | null;
}

interface Props {
  newsId: string;
}

export default function TravelSensitiveInfo({ newsId }: Props) {
  const { user, profile, signInWithGoogle, loading: authLoading } = useAuth();
  const [data, setData] = useState<SensitiveData | null>(null);
  const [viewer, setViewer] = useState<'admin' | 'researcher' | 'public' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // Don't even try if not logged in (skip API call)
    if (!user) {
      setViewer('public');
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/news/${newsId}/sensitive`, { headers });
        const json = await res.json();

        if (res.ok) {
          setData(json.sensitive);
          setViewer(json.viewer);
        } else {
          setError(json.message || 'ไม่สามารถดึงข้อมูลได้');
          setViewer('public');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [newsId, user, authLoading]);

  // === Public: not logged in ===
  if (!user && !authLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-200 bg-amber-50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">ข้อมูลเพิ่มเติม (เฉพาะนักวิจัยในหน่วย)</p>
            <p className="text-xs text-amber-700 mt-1">
              งบประมาณ, เลขที่หนังสืออนุมัติ, และเอกสารแนบ — แสดงเฉพาะนักวิจัย CESRU ที่ login ด้วย email หน่วยงาน
            </p>
            <button onClick={signInWithGoogle}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium shadow-sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === Loading ===
  if (loading || authLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-200 text-center text-xs text-gray-400">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  // === Logged in but not researcher ===
  if (viewer === 'public' || error) {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-200 bg-red-50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">🚫</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">ไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
            <p className="text-xs text-red-700 mt-1">
              ข้อมูลงบประมาณและเอกสารอนุมัติเปิดให้เฉพาะนักวิจัยในหน่วย CESRU เท่านั้น
              {profile && (
                <> · บัญชีของท่าน ({profile.email}) ไม่ได้ลงทะเบียนเป็นนักวิจัย</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // === Authorized: Admin or Researcher ===
  if (!data) return null;

  const hasContent = data.travel_approval_number || data.travel_budget ||
    data.travel_funding_source || data.travel_approval_doc_url || data.travel_approval_link;

  if (!hasContent) return null;

  return (
    <div className="mt-3 pt-3 border-t border-emerald-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
          🔓 เฉพาะนักวิจัย CESRU
        </span>
        {viewer === 'admin' && (
          <span className="text-[10px] text-gray-500">(viewing as admin)</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {data.travel_approval_number && (
          <div className="bg-white/60 rounded-lg p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">📋 เลขที่หนังสืออนุมัติ</p>
            <p className="text-gray-800 font-medium font-mono text-xs">{data.travel_approval_number}</p>
          </div>
        )}

        {data.travel_budget && (
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
            <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">💰 งบประมาณ</p>
            <p className="text-amber-900 font-bold">
              {Number(data.travel_budget).toLocaleString()} บาท
            </p>
          </div>
        )}

        {data.travel_funding_source && (
          <div className="bg-violet-50 rounded-lg p-2.5 border border-violet-200 md:col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">🏦 แหล่งงบประมาณ</p>
            <p className="text-violet-900">{data.travel_funding_source}</p>
          </div>
        )}
      </div>

      {(data.travel_approval_doc_url || data.travel_approval_link) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {data.travel_approval_doc_url && (
            <a href={data.travel_approval_doc_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition font-medium">
              <span>📄</span>
              <span>ดูเอกสารอนุมัติ (PDF)</span>
            </a>
          )}
          {data.travel_approval_link && (
            <a href={data.travel_approval_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs bg-white border border-emerald-300 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition font-medium">
              <span>🔗</span>
              <span>ลิงก์เอกสาร</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
