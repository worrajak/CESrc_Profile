'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/I18nContext';

export default function ConsentBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if no choice has been made
    if (typeof window === 'undefined') return;
    const choice = localStorage.getItem('cookie_consent');
    if (!choice) {
      // Small delay so it doesn't flash on first load
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.removeItem('analytics_opt_out');
    setVisible(false);
  };

  const rejectOptional = () => {
    localStorage.setItem('cookie_consent', 'essential_only');
    localStorage.setItem('analytics_opt_out', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-50 bg-white border-2 border-emerald-200 rounded-2xl shadow-2xl p-4 md:p-5 animate-in slide-in-from-bottom-10">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">🍪</div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{t('consent.title')}</h3>
          <p className="text-xs text-gray-600 mt-1">{t('consent.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={accept}
          className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-medium rounded-lg hover:opacity-90">
          {t('consent.accept_all')}
        </button>
        <button onClick={rejectOptional}
          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50">
          {t('consent.essential_only')}
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center">
        {t('consent.details')} <Link href="/privacy-policy" className="text-blue-600 underline">{t('footer.privacy')}</Link>
      </p>
    </div>
  );
}
