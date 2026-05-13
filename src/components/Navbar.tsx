'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';
import LangSwitcher from '@/components/LangSwitcher';
import SignInModal from '@/components/SignInModal';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [outputsOpen, setOutputsOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const outputsRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAboutOpen(false);
      if (outputsRef.current && !outputsRef.current.contains(e.target as Node)) setOutputsOpen(false);
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setServiceOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo-cesru.jpeg" alt="CESRU Logo" width={44} height={44} className="rounded-full bg-white" />
            <div>
              <span className="font-bold text-lg block leading-tight">CESRU</span>
              <span className="text-xs text-blue-200">Clean Energy System Research Unit</span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center space-x-5 text-sm">
            <Link href="/" className="hover:text-yellow-300 transition">{t('nav.home')}</Link>
            <Link href="/news" className="hover:text-yellow-300 transition">{t('nav.news')}</Link>

            {/* About dropdown */}
            <div ref={aboutRef} className="relative">
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className="hover:text-yellow-300 transition flex items-center gap-1"
              >
                {t('nav.about_group')}
                <svg className={`w-3 h-3 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {aboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <Link href="/researchers" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-sm">
                    👨‍🔬 {t('nav.researchers')}
                  </Link>
                  <Link href="/research-areas" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-sm">
                    🔬 {t('nav.research_areas')}
                  </Link>
                  <Link href="/equipment" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-sm">
                    🛠️ {t('nav.equipment')}
                  </Link>
                </div>
              )}
            </div>

            {/* Outputs dropdown */}
            <div ref={outputsRef} className="relative">
              <button
                onClick={() => setOutputsOpen(!outputsOpen)}
                className="hover:text-yellow-300 transition flex items-center gap-1"
              >
                {t('nav.outputs_group')}
                <svg className={`w-3 h-3 transition-transform ${outputsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {outputsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <Link href="/publications" onClick={() => setOutputsOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm">
                    📄 {t('nav.publications')}
                  </Link>
                  <Link href="/innovations" onClick={() => setOutputsOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 text-sm">
                    💡 {t('nav.innovations')}
                    <span className="ml-1 text-[9px] font-semibold text-amber-600 bg-amber-100 px-1 py-0.5 rounded">NEW</span>
                  </Link>
                  <Link href="/grants" onClick={() => setOutputsOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm">
                    💰 {t('nav.grants')}
                  </Link>
                  <Link href="/students" onClick={() => setOutputsOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm">
                    🎓 {t('nav.students')}
                  </Link>
                </div>
              )}
            </div>

            <Link href="/research-plan" className="hover:text-yellow-300 transition flex items-center gap-1 whitespace-nowrap">
              <span>🎯</span><span>{t('nav.research_plan')}</span>
            </Link>

            {/* Services Dropdown */}
            <div ref={serviceRef} className="relative">
              <button
                onClick={() => setServiceOpen(!serviceOpen)}
                className="hover:text-yellow-300 transition flex items-center gap-1"
              >
                {t('nav.services')}
                <svg className={`w-3 h-3 transition-transform ${serviceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {serviceOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <Link href="/services" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                    <div className="font-medium text-sm">{t('nav.services.references')}</div>
                    <div className="text-[10px] text-gray-400">{t('nav.services.references_subtitle')}</div>
                  </Link>
                  <div className="border-t my-1" />
                  <Link href="/services/training" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <div>
                        <div className="font-medium text-sm">{t('nav.services.training')}</div>
                        <div className="text-[10px] text-gray-400">{t('nav.services.training_subtitle')}</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/services/consulting" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                    <div className="flex items-center gap-2">
                      <span>💡</span>
                      <div>
                        <div className="font-medium text-sm">{t('nav.services.consulting')}</div>
                        <div className="text-[10px] text-gray-400">{t('nav.services.consulting_subtitle')}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t my-1" />
                  <Link href="/services/request" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition">
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <div>
                        <div className="font-medium text-sm">{t('nav.services.request')}</div>
                        <div className="text-[10px] text-gray-400">{t('nav.services.request_subtitle')}</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <LangSwitcher />

            {/* User menu */}
            <div ref={userMenuRef} className="relative ml-2">
              {user && profile ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs">{profile.display_name.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : user ? (
                <Link
                  href="/auth/callback"
                  className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition"
                  title="กรอก profile ให้เสร็จเพื่อใช้งานเต็มรูปแบบ"
                >
                  <span>✅</span>
                  กรอก profile
                </Link>
              ) : (
                <button onClick={() => setSignInOpen(true)}
                  className="flex items-center gap-1.5 bg-white text-gray-700 hover:bg-gray-100 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition">
                  <span>🔓</span>
                  Sign in
                </button>
              )}

              {userMenuOpen && user && profile && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <div className="px-4 pb-2 border-b">
                    <p className="text-sm font-semibold text-gray-800">{profile.display_name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{profile.email}</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {profile.user_type === 'student' ? t('nav.user_type.student') :
                        profile.user_type === 'researcher' ? t('nav.user_type.researcher') : t('nav.user_type.general')}
                    </p>
                  </div>
                  <Link href="/account" onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    ⚙️ {t('nav.account')}
                  </Link>
                  <button onClick={() => { setUserMenuOpen(false); signOut(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    🚪 {t('nav.signout')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden px-4 pb-4 space-y-1">
          <Link href="/" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.home')}</Link>
          <Link href="/news" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.news')}</Link>

          {/* About group (mobile) */}
          <div className="border-t border-blue-600 pt-2 mt-2">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">{t('nav.about_group')}</p>
            <Link href="/researchers" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">👨‍🔬 {t('nav.researchers')}</Link>
            <Link href="/research-areas" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">🔬 {t('nav.research_areas')}</Link>
            <Link href="/equipment" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">🛠️ {t('nav.equipment')}</Link>
          </div>

          {/* Outputs group (mobile) */}
          <div className="border-t border-blue-600 pt-2 mt-2">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">{t('nav.outputs_group')}</p>
            <Link href="/publications" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">📄 {t('nav.publications')}</Link>
            <Link href="/innovations" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">💡 {t('nav.innovations')} <span className="ml-1 text-[9px] font-semibold text-amber-300">NEW</span></Link>
            <Link href="/grants" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">💰 {t('nav.grants')}</Link>
            <Link href="/students" onClick={() => setOpen(false)} className="block py-2 pl-4 text-sm hover:text-yellow-300">🎓 {t('nav.students')}</Link>
          </div>

          <Link href="/research-plan" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>🎯 {t('nav.research_plan')}</Link>

          {/* Services sub-menu (mobile) */}
          <div className="border-t border-blue-600 pt-2 mt-2">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">{t('nav.services')}</p>
            <Link href="/services" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              📋 {t('nav.services.references')}
            </Link>
            <Link href="/services/training" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              🎓 {t('nav.services.training')}
            </Link>
            <Link href="/services/consulting" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              💡 {t('nav.services.consulting')}
            </Link>
            <Link href="/services/request" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              📝 {t('nav.services.request')}
            </Link>
          </div>

          <div className="border-t border-blue-600 pt-2 flex items-center justify-end">
            <LangSwitcher />
          </div>
          {!user && (
            <button
              onClick={() => { setOpen(false); setSignInOpen(true); }}
              className="block w-full mt-2 py-2 bg-white text-blue-700 rounded-full text-sm font-medium"
            >
              🔓 Sign in
            </button>
          )}
          {user && !profile && (
            <Link
              href="/auth/callback"
              onClick={() => setOpen(false)}
              className="block w-full mt-2 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium text-center"
            >
              ✅ กรอก profile ให้เสร็จ
            </Link>
          )}
        </div>
      )}

      {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
    </nav>
  );
}
