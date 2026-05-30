'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CURRENT_CONSENT_VERSION } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
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
    let cancelled = false;
    let timeoutId: any;
    let subscription: any;

    const showConsentForm = (sessionUser: any) => {
      if (cancelled) return;
      setUser(sessionUser);
      setDisplayName((sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || '');
      setStatus('consent');
    };

    const handleSession = async (sessionUser: any) => {
      if (cancelled) return;
      setUser(sessionUser);

      // Aggressive race — first try a fast 1.5 s profile lookup so users with
      // existing profiles get redirected. If anything goes wrong (slow RLS,
      // network, hang), fall through to the consent form. The form's upsert
      // handles existing rows gracefully, so we never lose data even if a
      // returning user lands here briefly.
      const profilePromise = supabase
        .from('guest_users')
        .select('id')                          // narrowest possible query
        .eq('id', sessionUser.id)
        .maybeSingle()
        .then(
          (r) => ({ kind: 'data' as const, data: r.data }),
          () => ({ kind: 'error' as const }),  // never let Supabase reject the race
        );
      const timeoutPromise = new Promise<{ kind: 'timeout' }>((resolve) =>
        setTimeout(() => resolve({ kind: 'timeout' }), 1500),
      );

      const result = await Promise.race([profilePromise, timeoutPromise]);
      if (cancelled) return;

      if (result.kind === 'data' && result.data) {
        // Returning user — already has a profile row. Redirect.
        const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
        sessionStorage.removeItem('auth_return_url');
        window.location.href = returnUrl;
      } else {
        // No profile, query errored, or timed out — show consent form.
        // (Returning users without a profile fall here too; if they
        // re-submit the form, upsert is a no-op for non-changed fields.)
        showConsentForm(sessionUser);
      }
    };

    // Safety net #1 (4 s): try to recover session via getSession() and
    // force-show the consent form if a session exists.
    const safetyId = setTimeout(async () => {
      if (cancelled) return;
      try {
        const { data: { session: latest } } = await supabase.auth.getSession();
        if (latest?.user && !user) {
          showConsentForm(latest.user);
        }
      } catch {
        /* ignore — hard fallback below will fire */
      }
    }, 4000);

    // Safety net #2 (6 s): if we're STILL on the spinner after 6 s — meaning
    // getSession() itself is hanging — break out by reading the session
    // synchronously from localStorage. supabase-js persists the session
    // there, so even if the network call is hung we can usually recover.
    // Worst case, fall through to the error UI (no infinite spinner).
    const hardSafetyId = setTimeout(() => {
      if (cancelled) return;
      try {
        // supabase-js v2 storage key — best-effort
        for (const k of Object.keys(localStorage)) {
          if (!k.startsWith('sb-') || !k.endsWith('-auth-token')) continue;
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          const u = parsed?.user || parsed?.currentSession?.user;
          if (u?.id && u?.email) {
            showConsentForm(u);
            return;
          }
        }
      } catch {
        /* fall through */
      }
      // No session anywhere — show error so user can retry login
      setStatus('error');
      setErrorMsg('โหลดข้อมูล session ไม่สำเร็จ — กรุณาลองส่ง Magic Link ใหม่อีกครั้ง');
    }, 6000);

    (async () => {
      // 1) Try existing session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleSession(session.user);
        return;
      }

      // 2) Subscribe to auth changes — Magic Link / OAuth hash takes a moment to process
      const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
        if (sess?.user) handleSession(sess.user);
      });
      subscription = sub.subscription;

      // 3) Give up after 8 seconds — link probably expired or session creation failed
      timeoutId = setTimeout(async () => {
        if (cancelled) return;
        const { data: { session: latest } } = await supabase.auth.getSession();
        if (latest?.user) {
          handleSession(latest.user);
        } else {
          setStatus('error');
          setErrorMsg('ลิงก์อาจหมดอายุ หรือ session สร้างไม่สำเร็จ — ลองส่ง Magic Link ใหม่อีกครั้ง');
        }
      }, 8000);
    })();

    return () => {
      cancelled = true;
      if (safetyId) clearTimeout(safetyId);
      if (hardSafetyId) clearTimeout(hardSafetyId);
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
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
      // Upsert guest_users profile (safe even if row already exists)
      const { error: profileError } = await supabase.from('guest_users').upsert(
        {
          id: user.id,
          email: user.email,
          display_name: displayName.trim(),
          user_type: userType,
          institution: institution.trim() || null,
          consent_version: CURRENT_CONSENT_VERSION,
          consented_at: new Date().toISOString(),
          marketing_opt_in: marketingOptIn,
        },
        { onConflict: 'id' },
      );

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
        <div className="text-center max-w-sm px-4">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">{t('auth.callback.signing_in')}</p>
          <p className="text-xs text-gray-400 mt-6">
            {locale === 'en' ? 'Taking too long?' : 'รอนานเกินไป?'}
          </p>
          <div className="flex gap-2 justify-center mt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              🔄 {locale === 'en' ? 'Reload' : 'โหลดใหม่'}
            </button>
            <Link
              href="/"
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              ← {locale === 'en' ? 'Back to home' : 'กลับหน้าหลัก'}
            </Link>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
              className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              {locale === 'en' ? 'Sign out & retry' : 'ออก & ลองใหม่'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">{t('error.generic')}</h1>
          <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            {locale === 'en' ? 'Back to home' : 'กลับหน้าหลัก'}
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
          <h1 className="text-2xl font-bold">{t('auth.callback.welcome')} 🎉</h1>
          <p className="text-sm text-emerald-100 mt-1">{t('auth.callback.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email (readonly) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('auth.callback.email_label')}</label>
            <input type="email" value={user?.email || ''} readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 text-sm" />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('auth.callback.name_label')} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder={locale === 'en' ? 'e.g. John Doe' : 'เช่น ปัตร ใจดี'} required />
            <p className="text-xs text-gray-500 mt-1">{t('auth.callback.name_help')}</p>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">{t('auth.callback.user_type_label')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'student', l: t('nav.user_type.student') },
                { v: 'researcher', l: t('nav.user_type.researcher') },
                { v: 'general', l: t('nav.user_type.general') },
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
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('auth.callback.institution_label')}</label>
            <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder={locale === 'en' ? 'e.g. RMUTL' : 'เช่น มทร.ล้านนา'} />
          </div>

          {/* Consents */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consentPrivacy}
                onChange={(e) => setConsentPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4" required />
              <span className="text-sm text-gray-700">
                {t('auth.callback.consent_privacy')}{' '}
                <Link href="/privacy-policy" target="_blank" className="text-blue-600 underline">
                  {t('footer.privacy')}
                </Link>
                {' '}<span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                className="mt-1 w-4 h-4" required />
              <span className="text-sm text-gray-700">
                {t('auth.callback.consent_terms')}{' '}
                <Link href="/terms" target="_blank" className="text-blue-600 underline">
                  {t('footer.terms')}
                </Link>
                {' '}<span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-slate-200">
              <input type="checkbox" checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-1 w-4 h-4" />
              <span className="text-sm text-gray-700">{t('auth.callback.consent_marketing')}</span>
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
              {submitting ? t('auth.callback.submitting') : t('auth.callback.submit')}
            </button>
            <button type="button" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
              {t('auth.callback.cancel')}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            {locale === 'en'
              ? 'PDPA compliant · You can delete your account anytime from "My Account"'
              : 'PDPA compliant · ลบบัญชีได้ทุกเมื่อจากหน้า "บัญชีของฉัน"'}
          </p>
        </form>
      </div>
    </div>
  );
}
