'use client';

/**
 * I18n Context — Thai/English translation system
 *
 * Usage:
 * ```tsx
 * import { useI18n } from '@/lib/I18nContext';
 *
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n();
 *   return <h1>{t('home.hero.title')}</h1>;
 * }
 * ```
 *
 * For DB content with _th/_en columns:
 * ```tsx
 * import { useI18n } from '@/lib/I18nContext';
 * import { getLocalizedField } from '@/lib/translations';
 *
 * const { locale } = useI18n();
 * const name = getLocalizedField(researcher, 'first_name', locale);
 * ```
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { translate, type Locale } from '@/lib/translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const COOKIE_NAME = 'cesru_locale';
const STORAGE_KEY = 'cesru_locale';

function setCookie(value: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(th|en)`));
  return match ? (match[1] as Locale) : null;
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'th');

  // On mount: hydrate from localStorage/cookie if differs from initial
  useEffect(() => {
    const stored =
      (typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Locale | null) : null) ||
      getCookie();
    if (stored && (stored === 'th' || stored === 'en') && stored !== locale) {
      setLocaleState(stored);
    }
  }, [locale]);

  // Update <html lang="..."> attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, l);
    setCookie(l);
  }, []);

  const t = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback: return Thai by default if context missing
    // This prevents crashes if a component is used outside Provider
    return {
      locale: 'th' as Locale,
      setLocale: () => {},
      t: (key: string) => translate(key, 'th'),
    };
  }
  return ctx;
}

export type { Locale };
