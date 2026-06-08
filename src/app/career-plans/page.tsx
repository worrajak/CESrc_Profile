'use client';

import CareerPlanView from '@/components/research-plan/career/CareerPlanView';
import { useI18n } from '@/lib/I18nContext';

export default function CareerPlansPage() {
  const { locale } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 border border-white/20 mb-2">
            🎓 {locale === 'en' ? 'About CESRU' : 'เกี่ยวกับ CESRU'}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">
            {locale === 'en' ? 'Academic Career Plans' : 'แผนตำแหน่งวิชาการ'}
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-2xl">
            {locale === 'en'
              ? 'Track each researcher\'s progress toward Asst. Prof / Assoc. Prof / Full Prof under ก.พ.อ. criteria. Self-service for each researcher; team-wide visibility for everyone.'
              : 'ติดตามความก้าวหน้าของนักวิจัยแต่ละท่านสู่ ผศ./รศ./ศ. ตามเกณฑ์ ก.พ.อ. · นักวิจัยจัดการของตัวเอง · ทีมเห็นภาพรวม'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <CareerPlanView />
      </div>
    </div>
  );
}
