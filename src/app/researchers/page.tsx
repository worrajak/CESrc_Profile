import { supabase } from '@/lib/supabase';
import ResearcherCard from '@/components/ResearcherCard';
import { getServerLocale, st } from '@/lib/i18n-server';
import { compareByExecutive } from '@/lib/executiveRank';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata() {
  const locale = getServerLocale();
  return {
    title: locale === 'en' ? 'Researchers | CESRU - RMUTL' : 'นักวิจัย | CESRU - RMUTL',
    description: locale === 'en'
      ? 'Research team of Clean Energy System Research Unit, RMUTL'
      : 'รายชื่อนักวิจัยหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
  };
}

export default async function ResearchersPage() {
  const { data: researchers } = await supabase
    .from('researchers')
    .select('*')
    .eq('is_active', true)
    .order('unit_role', { ascending: true });

  // Within each unit_role group, sort by executive seniority — researchers
  // with higher RMUTL admin positions (อธิการบดี → รองอธิการบดี → คณบดี → ฯลฯ)
  // bubble up. Non-executives keep their original relative order at the end.
  const sortGroup = (rs: any[]) => [...rs].sort(compareByExecutive);

  const grouped = {
    advisor: sortGroup((researchers || []).filter((r: any) => r.unit_role === 'advisor')),
    head: sortGroup((researchers || []).filter((r: any) => r.unit_role === 'head')),
    member: sortGroup((researchers || []).filter((r: any) => r.unit_role === 'member')),
    phd_student: sortGroup((researchers || []).filter((r: any) => r.unit_role === 'phd_student')),
  };

  const locale = getServerLocale();
  const countUnit = st('researchers.count_unit', locale);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{st('researchers.page_title', locale)}</h1>
      <p className="text-gray-500 mb-8">{st('researchers.page_subtitle', locale)}</p>

      {grouped.advisor.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-purple-700 mb-4 pb-2 border-b border-purple-200">
            {st('researchers.section.advisor', locale)} ({grouped.advisor.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.advisor.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}

      {grouped.head.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-4 pb-2 border-b border-yellow-200">
            {st('researchers.section.head', locale)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.head.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}

      {grouped.member.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-blue-200">
            {st('researchers.section.member', locale)} ({grouped.member.length} {countUnit})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.member.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}

      {grouped.phd_student.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-pink-700 mb-4 pb-2 border-b border-pink-200">
            {st('researchers.section.phd_student', locale)} ({grouped.phd_student.length} {countUnit})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.phd_student.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
