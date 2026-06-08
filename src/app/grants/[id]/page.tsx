import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import WorkplanProgressDashboard from '@/components/admin/grants/WorkplanProgressDashboard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: grant } = await supabase.from('grants').select('title_th').eq('id', params.id).single();
  return {
    title: grant ? `${grant.title_th} | ทุนวิจัย CESRU` : 'ทุนวิจัย | CESRU',
  };
}

export default async function GrantDetailPage({ params }: { params: { id: string } }) {
  const { data: grant } = await supabase
    .from('grants')
    .select(`
      *,
      grant_members (
        role,
        researchers (
          id, title_th, first_name_th, last_name_th, avatar_url, position_th
        )
      )
    `)
    .eq('id', params.id)
    .single();

  if (!grant) notFound();

  const grantRoleLabels: Record<string, string> = {
    pi: 'หัวหน้าโครงการ',
    co_pi: 'ผู้ร่วมโครงการ',
    researcher: 'นักวิจัย',
    consultant: 'ที่ปรึกษา',
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
    active: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-700' },
    pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-700' },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700' },
  };

  const st = statusLabels[grant.status] || statusLabels.active;

  // Duration calc
  let durationText = '';
  if (grant.start_date && grant.end_date) {
    const start = new Date(grant.start_date);
    const end = new Date(grant.end_date);
    const months = Math.round((end.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    durationText = `${months} เดือน`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <a href="/grants" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">&larr; กลับไปหน้าทุนวิจัย</a>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{grant.title_th}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.color}`}>{st.label}</span>
          {/* Tracking status badge ("ตามแผน" / "ล่าช้า") now lives inside
              <WorkplanProgressDashboard /> as the on-track percentage bar — no
              need to duplicate it here. */}
        </div>
        {grant.title_en && <p className="text-gray-500 mb-4">{grant.title_en}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">แหล่งทุน</span>
            <span className="font-semibold text-gray-800">{grant.funding_agency}</span>
          </div>
          {grant.budget && (
            <div>
              <span className="text-gray-500 block">งบประมาณ</span>
              <span className="font-semibold text-green-700">{Number(grant.budget).toLocaleString()} บาท</span>
            </div>
          )}
          {grant.contract_number && (
            <div>
              <span className="text-gray-500 block">เลขที่สัญญา</span>
              <span className="font-semibold text-gray-800">{grant.contract_number}</span>
            </div>
          )}
          {durationText && (
            <div>
              <span className="text-gray-500 block">ระยะเวลา</span>
              <span className="font-semibold text-gray-800">{durationText}</span>
              <span className="text-xs text-gray-400 block">{grant.start_date} — {grant.end_date}</span>
            </div>
          )}
        </div>

        {grant.description_th && (
          <p className="text-sm text-gray-600 mt-4 pt-4 border-t">{grant.description_th}</p>
        )}

        {/* Research team */}
        {grant.grant_members && grant.grant_members.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ทีมวิจัย</h3>
            <div className="flex flex-wrap gap-3">
              {grant.grant_members.map((gm: any, i: number) => {
                const r = gm.researchers;
                if (!r) return null;
                return (
                  <a key={i} href={`/researchers/${r.id}`}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 hover:bg-blue-50 transition text-sm">
                    {r.avatar_url ? (
                      <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {r.first_name_th?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{r.title_th}{r.first_name_th} {r.last_name_th}</div>
                      <div className="text-xs text-gray-400">{grantRoleLabels[gm.role]}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents */}
        {(grant.contract_file_url || grant.progress_report_url || grant.final_report_url) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {grant.contract_file_url && (
              <a href={grant.contract_file_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-100 transition">
                📄 สัญญาทุน
              </a>
            )}
            {grant.progress_report_url && (
              <a href={grant.progress_report_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 transition">
                📊 รายงานความก้าวหน้า
              </a>
            )}
            {grant.final_report_url && (
              <a href={grant.final_report_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-100 transition">
                📋 รายงานฉบับสมบูรณ์
              </a>
            )}
          </div>
        )}
      </div>

      {/* Unified Phase X2 dashboard (read-only) — replaces the old 0% / S-Curve /
          Milestones timeline / Alerts widgets. Same component renders editable on
          /admin/grants/tracking. Shows empty state when xlsx hasn't been imported. */}
      <div className="mb-6">
        <WorkplanProgressDashboard grantId={grant.id} readOnly />
      </div>

      {/* Research Areas */}
      {grant.research_areas && grant.research_areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {grant.research_areas.map((area: string, i: number) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">{area}</span>
          ))}
        </div>
      )}
    </div>
  );
}
