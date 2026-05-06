'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">CESRU - Clean Energy System Research Unit</h3>
            <p className="text-sm">{t('footer.unit_subtitle')}</p>
            <p className="text-sm">{t('footer.faculty')}</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.research_areas_title')}</h3>
            <ul className="text-sm space-y-1">
              <li>Solar Energy &amp; Solar Rooftop</li>
              <li>Battery Energy Storage Systems</li>
              <li>Electric Vehicles &amp; Charging</li>
              <li>Wireless Power Transfer</li>
              <li>Microgrid &amp; Community Energy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.services_title')}</h3>
            <ul className="text-sm space-y-1">
              <li><Link href="/services/training" className="hover:text-yellow-300 transition">🎓 {t('nav.services.training')}</Link></li>
              <li><Link href="/services/consulting" className="hover:text-yellow-300 transition">💡 {t('nav.services.consulting')}</Link></li>
              <li><Link href="/services" className="hover:text-yellow-300 transition">📋 {t('nav.services.references')}</Link></li>
              <li><Link href="/services/request" className="hover:text-yellow-300 transition">📝 {t('nav.services.request')}</Link></li>
              <li><Link href="/equipment" className="hover:text-yellow-300 transition">🔬 {t('nav.equipment')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.address_title')}</h3>
            <p className="text-sm">
              {t('footer.address_line1')}<br />
              {t('footer.address_line2')}<br />
              {t('footer.address_line3')}<br />
              {t('footer.address_line4')}
            </p>
            <div className="flex gap-3 mt-3 text-xs">
              <Link href="/privacy-policy" className="hover:text-yellow-300 transition">{t('footer.privacy')}</Link>
              <Link href="/terms" className="hover:text-yellow-300 transition">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>{t('footer.copyright').replace('{year}', String(year))}</p>
          <p className="text-gray-500 text-xs mt-1">{t('footer.verified_only')}</p>
        </div>
      </div>
    </footer>
  );
}
