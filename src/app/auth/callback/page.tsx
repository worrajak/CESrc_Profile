'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CURRENT_CONSENT_VERSION } from '@/lib/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'consent' | 'error'>('loading');
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'student' | 'researcher' | 'general'>('general');
  const [institution, setInstitution] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      // Wait for Supabase to process the OAuth hash
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus('error');
        setErrorMsg('ไม่พบข้อมูลการเข้าสู่ระบบ');
        return;
      }

      const u = session.user;
      setUser(u);

      // Check if profile exists
      const { data: existing } = await supabase
        .from('guest_users')
        .select('*')
        .eq('id', u.id)
        .single();

      if (existing) {
        // Already registered — redirect back
        const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
        sessionStorage.removeItem('auth_return_url');
        router.push(returnUrl);
      } else {
        // New user — show consent form
        setDisplayName((u.user_metadata?.full_name as string) || u.email?.split('@')[0] || '');
        setStatus('consent');
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentPrivacy || !consentTerms) {
      setErrorMsg('กรุณายอมรับ Privacy Policy และข้อกำหนดการใช้งาน');
      return;
    }
    if (!displayName.trim()) {
      setErrorMsg('กรุณาใส่ชื่อที่แสดง');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Insert guest_users profile
      const { error: profileError } = await supabase.from('guest_users').insert({
        id: user.id,
        email: user.email,
        display_name: displayName.trim(),
        user_type: userType,
        institution: institution.trim() || null,
        consent_version: CURRENT_CONSENT_VERSION,
        consented_at: new Date().toISOString(),
        marketing_opt_in: marketingOptIn,
      });

      if (profileError) throw profileError;

      // Log consents
      const consents = [
        { type: 'privacy', action: 'granted' },
        { type: 'cookies', action: 'granted' },
      ];
      if (marketingOptIn) consents.push({ type: 'marketing', action: 'granted' });

      await supabase.from('consent_log').insert(
        consents.map((c) => ({
          user_id: user.id,
          consent_version: CURRENT_CONSENT_VERSION,
          consent_type: c.type,
          action: c.action,
        }))
      );

      // Redirect
      const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
      sessionStorage.removeItem('auth_return_url');
      window.location.href = returnUrl; // full reload to refresh AuthContext
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด');
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <h1 className="text-2xl font-bold">ยินดีต้อนรับสู่ CESRU! 🎉</h1>
          <p className="text-sm text-emerald-100 mt-1">
            เพิ่มข้อมูลเล็กน้อยเพื่อให้การใช้งานสมบูรณ์
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email (readonly) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email (จาก Google)</label>
            <input type="email" value={user?.email || ''} readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 text-sm" />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ชื่อที่แสดง <span className="text-red-500">*</span>
            </label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="เช่น ปัตร ใจดี" required />
            <p className="text-xs text-gray-500 mt-1">ชื่อนี้จะแสดงกับ comment ของท่าน — แก้ไขภายหลังได้</p>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">ท่านเป็น</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'student', l: '🎓 นักศึกษา' },
                { v: 'researcher', l: '🔬 นักวิจัย' },
                { v: 'general', l: '👤 บุคคลทั่วไป' },
              ].map((opt) => (
                <button key={opt.v} type="button"
                  onClick={() => setUserType(opt.v as any)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    userType === opt.v
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Institution (optional) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              สถาบัน / มหาวิทยาลัย (ไม่บังคับ)
            </label>
            <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="เช่น มทร.ล้านนา" />
          </div>

          {/* Consents */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consentPrivacy}
                onChange={(e) => setConsentPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4" required />
              <span className="text-sm text-gray-700">
                ฉันได้อ่านและยอมรับ{' '}
                <Link href="/privacy-policy" target="_blank" className="text-blue-600 underline">
                  นโยบายความเป็นส่วนตัว (Privacy Policy)
                </Link>
                {' '}<span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                className="mt-1 w-4 h-4" required />
              <span className="text-sm text-gray-700">
                ฉันยอมรับ{' '}
                <Link href="/terms" target="_blank" className="text-blue-600 underline">
                  ข้อกำหนดการใช้งาน (Terms of Service)
                </Link>
                {' '}<span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-slate-200">
              <input type="checkbox" checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-1 w-4 h-4" />
              <span className="text-sm text-gray-700">
                <strong>(ไม่บังคับ)</strong> ฉันยินยอมรับข่าวสารและข้อมูลกิจกรรม CESRU ทาง email
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting || !consentPrivacy || !consentTerms}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition">
              {submitting ? 'กำลังสมัคร...' : 'ยืนยันและเริ่มต้นใช้งาน'}
            </button>
            <button type="button" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
              ยกเลิก
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            PDPA compliant · ลบบัญชีได้ทุกเมื่อจากหน้า &quot;บัญชีของฉัน&quot;
          </p>
        </form>
      </div>
    </div>
  );
}
