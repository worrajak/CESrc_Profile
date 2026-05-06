'use client';

import { useI18n } from '@/lib/I18nContext';

export default function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  if (compact) {
    // Single-button toggle — just shows the OTHER language
    return (
      <button
        onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
        className="text-xs font-medium text-white/80 hover:text-white px-2 py-1 rounded transition"
        title={locale === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
      >
        {locale === 'th' ? '🇬🇧 EN' : '🇹🇭 TH'}
      </button>
    );
  }

  // Pill-style toggle with both options
  return (
    <div className="inline-flex rounded-full bg-white/10 backdrop-blur-sm border border-white/20 p-0.5">
      <button
        onClick={() => setLocale('th')}
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
          locale === 'th' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/70 hover:text-white'
        }`}
      >
        🇹🇭 TH
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
          locale === 'en' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/70 hover:text-white'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
