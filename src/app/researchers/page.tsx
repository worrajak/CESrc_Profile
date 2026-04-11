import { supabase } from '@/lib/supabase';
import ResearcherCard from '@/components/ResearcherCard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'นักวิจัย | CESRU - RMUTL',
  description: 'รายชื่อนักวิจัยหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

export default async function ResearchersPage() {
  const { data: researchers } = await supabase
    .from('researchers')
    .select('*')
    .eq('is_active', true)
    .order('unit_role', { ascending: true });

  const grouped = {
    advisor: (researchers || []).filter((r: any) => r.unit_role === 'advisor'),
    head: (researchers || []).filter((r: any) => r.unit_role === 'head'),
    member: (researchers || []).filter((r: any) => r.unit_role === 'member'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ทีมนักวิจัย</h1>
      <p className="text-gray-500 mb-8">
        สมาชิกหน่วยวิจัยระบบพลังงานสะอาด (CESRU) คณะวิศวกรรมศาสตร์ มทร.ล้านนา
      </p>

      {grouped.advisor.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-purple-700 mb-4 pb-2 border-b border-purple-200">
            ที่ปรึกษาหน่วยวิจัย
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.advisor.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}

      {grouped.head.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-4 pb-2 border-b border-yellow-200">
            หัวหน้าหน่วยวิจัย
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.head.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}

      {grouped.member.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-blue-200">
            สมาชิก ({grouped.member.length} คน)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.member.map((r: any) => <ResearcherCard key={r.id} researcher={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
