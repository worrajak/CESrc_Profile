'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';
import LangSwitcher from '@/components/LangSwitcher';

export default function Navbar() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setServiceOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
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
            <Link href="/researchers" className="hover:text-yellow-300 transition">{t('nav.researchers')}</Link>
            <Link href="/research-areas" className="hover:text-yellow-300 transition">{t('nav.research_areas')}</Link>
            <Link href="/publications" className="hover:text-yellow-300 transition">{t('nav.publications')}</Link>
            <Link href="/grants" className="hover:text-yellow-300 transition">{t('nav.grants')}</Link>
            <Link href="/research-plan" className="hover:text-yellow-300 transition flex items-center gap-1 whitespace-nowrap">
              <span>🎯</span><span>{t('nav.research_plan')}</span>
            </Link>
            <Link href="/students" className="hover:text-yellow-300 transition">{t('nav.students')}</Link>

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

            <Link href="/equipment" className="hover:text-yellow-300 transition">{t('nav.equipment')}</Link>

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
              ) : (
                <button onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 bg-white text-gray-700 hover:bg-gray-100 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
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
          <Link href="/researchers" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.researchers')}</Link>
          <Link href="/research-areas" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.research_areas')}</Link>
          <Link href="/publications" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.publications')}</Link>
          <Link href="/grants" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.grants')}</Link>
          <Link href="/research-plan" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>🎯 {t('nav.research_plan')}</Link>
          <Link href="/students" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.students')}</Link>

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

          <div className="border-t border-blue-600 pt-2 flex items-center justify-between">
            <Link href="/equipment" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>{t('nav.equipment')}</Link>
            <LangSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
