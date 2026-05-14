'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';

type Tab = 'magic' | 'password';
type PasswordMode = 'signin' | 'signup';

export default function SignInModal({ onClose }: { onClose: () => void }) {
  const { signInWithMagicLink, signInWithPassword, signUpWithPassword } = useAuth();
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
                autoComplete="email"
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && !busy && handleMagicLink()}
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
                autoComplete="email"
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={locale === 'en' ? 'Password (min 8 chars)' : 'รหัสผ่าน (อย่างน้อย 8 ตัว)'}
                  autoComplete={pwdMode === 'signin' ? 'current-password' : 'new-password'}
                  name={pwdMode === 'signin' ? 'current-password' : 'new-password'}
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
