import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'ทุนวิจัย | CESRU - RMUTL',
  description: 'ทุนวิจัยและโครงการวิจัยของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

export default async function GrantsPage() {
  const { data: grants } = await supabase
    .from('grants')
    .select(`
      *,
      grant_members (
        role,
        researchers (
          title_th, first_name_th, last_name_th
        )
      )
    `)
    .order('fiscal_year', { ascending: false });

  const allGrants = grants || [];
  const totalBudget = allGrants.reduce((sum: number, g: any) => sum + (Number(g.budget) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ทุนวิจัย / โครงการวิจัย</h1>
      <p className="text-gray-500 mb-4">
        โครงการวิจัยที่ได้รับทุนสนับสนุน ({allGrants.length} โครงการ)
      </p>
      {totalBudget > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 inline-block">
          <span className="text-green-800 font-semibold">งบประมาณรวม (ที่ระบุ): </span>
          <span className="text-green-700 text-lg font-bold">{totalBudget.toLocaleString()} บาท</span>
        </div>
      )}

      <div className="space-y-6">
        {allGrants.map((g: any) => {
          const grantRoleLabels: Record<string, string> = {
            pi: 'หัวหน้าโครงการ',
            co_pi: 'ผู้ร่วมโครงการ',
            researcher: 'นักวิจัย',
            consultant: 'ที่ปรึกษา',
          };

          return (
            <div key={g.id} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 text-lg">{g.title_th}</h3>
              {g.title_en && <p className="text-sm text-gray-500 mt-1">{g.title_en}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">แหล่งทุน: </span>
                  <span className="text-gray-600">{g.funding_agency}</span>
                </div>
                {g.budget && (
                  <div>
                    <span className="font-medium text-gray-700">งบประมาณ: </span>
                    <span className="text-green-700 font-semibold">{Number(g.budget).toLocaleString()} บาท</span>
                  </div>
                )}
                {g.contract_number && (
                  <div>
                    <span className="font-medium text-gray-700">เลขที่สัญญา: </span>
                    <span className="text-gray-600">{g.contract_number}</span>
                  </div>
                )}
                {g.fiscal_year && (
                  <div>
                    <span className="font-medium text-gray-700">ปีงบประมาณ: </span>
                    <span className="text-gray-600">พ.ศ. {g.fiscal_year}</span>
                  </div>
                )}
                {(g.start_date || g.end_date) && (
                  <div>
                    <span className="font-medium text-gray-700">ระยะเวลา: </span>
                    <span className="text-gray-600">
                      {g.start_date || '?'} — {g.end_date || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">สถานะ: </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    g.status === 'completed' ? 'bg-green-100 text-green-700' :
                    g.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {g.status === 'completed' ? 'เสร็จสิ้น' : g.status === 'active' ? 'กำลังดำเนินการ' : g.status}
                  </span>
                </div>
              </div>

              {g.description_th && (
                <p className="text-sm text-gray-500 mt-3">{g.description_th}</p>
              )}

              {g.grant_members && g.grant_members.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-sm font-medium text-gray-700">ทีมวิจัย: </span>
                  {g.grant_members.map((gm: any, i: number) => {
                    const r = gm.researchers;
                    if (!r) return null;
                    return (
                      <span key={i} className="text-sm text-gray-600">
                        {i > 0 && ', '}
                        {r.title_th}{r.first_name_th} {r.last_name_th}
                        <span className="text-xs text-gray-400 ml-1">({grantRoleLabels[gm.role] || gm.role})</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* เอกสารแนบ */}
              {(g.contract_file_url || g.progress_report_url || g.final_report_url) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {g.contract_file_url && (
                    <a href={g.contract_file_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      สัญญาทุน
                    </a>
                  )}
                  {g.progress_report_url && (
                    <a href={g.progress_report_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      รายงานความก้าวหน้า
                    </a>
                  )}
                  {g.final_report_url && (
                    <a href={g.final_report_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      รายงานฉบับสมบูรณ์
                    </a>
                  )}
                </div>
              )}

              {g.research_areas && g.research_areas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {g.research_areas.map((area: string, i: number) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{area}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
