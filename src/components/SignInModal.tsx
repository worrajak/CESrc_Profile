'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';

type Tab = 'magic' | 'password';
type PasswordMode = 'signin' | 'signup';

export default function SignInModal({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithMagicLink, signInWithPassword, signUpWithPassword } = useAuth();
  const { locale } = useI18n();

  const [tab, setTab] = useState<Tab>('magic');
  const [pwdMode, setPwdMode] = useState<PasswordMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMagicLink = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    const res = await signInWithMagicLink(email);
    if (!res.ok) {
      setError(res.error || (locale === 'en' ? 'Could not send link' : 'ส่งลิงก์ไม่สำเร็จ'));
    } else {
      setSuccess(
        locale === 'en'
          ? `Magic link sent to ${email}. Open your inbox and click the link to sign in.`
          : `ส่งลิงก์ไปที่ ${email} แล้ว — เปิดเมลแล้วคลิกลิงก์เพื่อเข้าสู่ระบบ`,
      );
    }
    setBusy(false);
  };

  const handlePasswordSubmit = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    if (pwdMode === 'signup' && password !== confirmPwd) {
      setError(locale === 'en' ? 'Passwords do not match' : 'รหัสผ่านไม่ตรงกัน');
      setBusy(false);
      return;
    }
    const res =
      pwdMode === 'signin'
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);
    if (!res.ok) {
      setError(res.error || (locale === 'en' ? 'Failed' : 'ไม่สำเร็จ'));
    } else if (pwdMode === 'signup' && (res as any).needsEmailConfirm) {
      setSuccess(
        locale === 'en'
          ? `Sign-up email sent to ${email}. Click the link in your inbox to confirm.`
          : `ส่งเมลยืนยันไปที่ ${email} — คลิกลิงก์ในเมลเพื่อยืนยันบัญชี`,
      );
    } else {
      // Already signed in — close modal, AuthContext will pick it up
      onClose();
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    setBusy(true);
    await signInWithGoogle();
    // page will redirect away
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{locale === 'en' ? 'Sign in to CESRU' : 'เข้าสู่ระบบ CESRU'}</h2>
            <p className="text-[11px] text-blue-100">
              {locale === 'en' ? 'Choose how you want to sign in' : 'เลือกวิธีเข้าสู่ระบบที่สะดวก'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Tab toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('magic');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                tab === 'magic' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ✨ {locale === 'en' ? 'Magic Link' : 'ลิงก์ทางอีเมล'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('password');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                tab === 'password' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔒 {locale === 'en' ? 'Password' : 'รหัสผ่าน'}
            </button>
          </div>

          {tab === 'magic' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {locale === 'en'
                  ? 'No password needed. We email you a one-click sign-in link.'
                  : 'ไม่ต้องตั้งรหัส — เราส่งลิงก์ให้ใน email พิมพ์ email แล้วเปิดเมลคลิกลิงก์ เข้าได้เลย'}
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && !busy && handleMagicLink()}
                autoFocus
              />
              <button
                onClick={handleMagicLink}
                disabled={busy || !email}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {busy
                  ? locale === 'en' ? 'Sending…' : 'กำลังส่ง…'
                  : locale === 'en' ? 'Send magic link' : '✉️ ส่งลิงก์เข้าสู่ระบบ'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="space-y-3">
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPwdMode('signin')}
                  className={`flex-1 py-1.5 rounded ${
                    pwdMode === 'signin'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {locale === 'en' ? 'Sign in' : 'เข้าสู่ระบบ'}
                </button>
                <button
                  type="button"
                  onClick={() => setPwdMode('signup')}
                  className={`flex-1 py-1.5 rounded ${
                    pwdMode === 'signup'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {locale === 'en' ? 'Sign up' : 'สมัครสมาชิก'}
                </button>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={locale === 'en' ? 'Password (min 8 chars)' : 'รหัสผ่าน (อย่างน้อย 8 ตัว)'}
                  className="w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && !busy && pwdMode === 'signin' && handlePasswordSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>

              {pwdMode === 'signup' && (
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder={locale === 'en' ? 'Confirm password' : 'ยืนยันรหัสผ่าน'}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && !busy && handlePasswordSubmit()}
                />
              )}

              <button
                onClick={handlePasswordSubmit}
                disabled={busy || !email || !password || (pwdMode === 'signup' && !confirmPwd)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {busy
                  ? '...'
                  : pwdMode === 'signin'
                  ? locale === 'en' ? 'Sign in' : '🔓 เข้าสู่ระบบ'
                  : locale === 'en' ? 'Create account' : '✅ สร้างบัญชี'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{error}</div>
          )}
          {success && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700">
              ✓ {success}
            </div>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>{locale === 'en' ? 'or continue with' : 'หรือเข้าผ่าน'}</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {locale === 'en' ? 'Continue with Google' : 'เข้าด้วย Google'}
          </button>

          <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
            {locale === 'en'
              ? 'By signing in you agree to our Privacy Policy and Terms.'
              : 'การเข้าสู่ระบบถือว่ายอมรับ Privacy Policy และข้อกำหนดการใช้งาน'}
          </p>
        </div>
      </div>
    </div>
  );
}
