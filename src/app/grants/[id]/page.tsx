import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import GrantTrackingClient from './GrantTrackingClient';

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

  // Milestones with deliverables
  const { data: milestones } = await supabase
    .from('grant_milestones')
    .select('*, grant_deliverables(*)')
    .eq('grant_id', params.id)
    .order('sort_order')
    .order('planned_date');

  // Progress logs for S-Curve
  const { data: progressLogs } = await supabase
    .from('grant_progress_logs')
    .select('*')
    .eq('grant_id', params.id)
    .order('log_date');

  // Alerts
  const { data: alerts } = await supabase
    .from('grant_alerts')
    .select('*')
    .eq('grant_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

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

  const milestoneStatusLabels: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'รอดำเนินการ', color: 'bg-gray-100 text-gray-600', icon: '⏳' },
    in_progress: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700', icon: '✅' },
    delayed: { label: 'ล่าช้า', color: 'bg-red-100 text-red-700', icon: '⚠️' },
    cancelled: { label: 'ยกเลิก', color: 'bg-gray-200 text-gray-500', icon: '❌' },
  };

  const st = statusLabels[grant.status] || statusLabels.active;
  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m: any) => m.status === 'completed').length || 0;
  const delayedMilestones = milestones?.filter((m: any) => m.status === 'delayed').length || 0;
  const overallPct = totalMilestones > 0
    ? Math.round(milestones!.reduce((sum: number, m: any) => sum + (m.completion_pct || 0), 0) / totalMilestones)
    : 0;

  // Calculate tracking status
  const latestLog = progressLogs && progressLogs.length > 0 ? progressLogs[progressLogs.length - 1] : null;
  const diff = latestLog ? (latestLog.planned_pct || 0) - (latestLog.actual_pct || 0) : 0;
  const trackingStatus = grant.status === 'completed' ? 'completed'
    : diff <= 0 ? 'on_track'
    : diff > 20 ? 'critical'
    : diff > 10 ? 'delayed'
    : 'slight_delay';

  const trackingLabels: Record<string, { label: string; color: string; icon: string }> = {
    completed: { label: 'โครงการเสร็จสิ้น', color: 'text-green-700 bg-green-50', icon: '🏆' },
    on_track: { label: 'ตามแผน', color: 'text-green-700 bg-green-50', icon: '✅' },
    slight_delay: { label: 'ล่าช้าเล็กน้อย', color: 'text-yellow-700 bg-yellow-50', icon: '⚡' },
    delayed: { label: 'ล่าช้ากว่าแผน', color: 'text-orange-700 bg-orange-50', icon: '⚠️' },
    critical: { label: 'ล่าช้าวิกฤต', color: 'text-red-700 bg-red-50', icon: '🚨' },
    unknown: { label: 'ไม่ระบุ', color: 'text-gray-500 bg-gray-50', icon: '❓' },
  };
  const tl = trackingLabels[trackingStatus] || trackingLabels.unknown;

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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${tl.color}`}>{tl.icon} {tl.label}</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border">
          <div className="text-3xl font-bold text-blue-600">{overallPct}%</div>
          <div className="text-xs text-gray-500 mt-1">ความก้าวหน้ารวม</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border">
          <div className="text-3xl font-bold text-gray-800">{totalMilestones}</div>
          <div className="text-xs text-gray-500 mt-1">Milestones ทั้งหมด</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border">
          <div className="text-3xl font-bold text-green-600">{completedMilestones}</div>
          <div className="text-xs text-gray-500 mt-1">สำเร็จแล้ว</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border">
          <div className="text-3xl font-bold text-red-600">{delayedMilestones}</div>
          <div className="text-xs text-gray-500 mt-1">ล่าช้า</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border">
          <div className="text-3xl font-bold text-orange-600">{(alerts || []).filter((a: any) => !a.is_read).length}</div>
          <div className="text-xs text-gray-500 mt-1">แจ้งเตือนใหม่</div>
        </div>
      </div>

      {/* S-Curve + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">S-Curve Report</h2>
          <GrantTrackingClient
            progressLogs={progressLogs || []}
            startDate={grant.start_date}
            endDate={grant.end_date}
          />
          {latestLog && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center text-sm">
              <div>
                <div className="text-blue-600 font-bold">{latestLog.planned_pct || 0}%</div>
                <div className="text-xs text-gray-500">แผน (Planned)</div>
              </div>
              <div>
                <div className="text-green-600 font-bold">{latestLog.actual_pct || 0}%</div>
                <div className="text-xs text-gray-500">จริง (Actual)</div>
              </div>
              <div>
                <div className={`font-bold ${diff > 10 ? 'text-red-600' : diff > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {diff > 0 ? `-${diff.toFixed(1)}%` : `+${Math.abs(diff).toFixed(1)}%`}
                </div>
                <div className="text-xs text-gray-500">ส่วนต่าง</div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">การแจ้งเตือน</h2>
          {(!alerts || alerts.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-8">ไม่มีการแจ้งเตือน</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map((a: any) => {
                const typeColors: Record<string, string> = {
                  info: 'border-l-blue-400 bg-blue-50',
                  warning: 'border-l-yellow-400 bg-yellow-50',
                  danger: 'border-l-red-400 bg-red-50',
                  success: 'border-l-green-400 bg-green-50',
                };
                return (
                  <div key={a.id} className={`border-l-4 rounded-r-lg p-3 ${typeColors[a.alert_type] || typeColors.info} ${a.is_read ? 'opacity-60' : ''}`}>
                    <div className="font-medium text-sm text-gray-800">{a.title}</div>
                    {a.message && <p className="text-xs text-gray-600 mt-1">{a.message}</p>}
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(a.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Milestones & สิ่งส่งมอบ</h2>

        {(!milestones || milestones.length === 0) ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">ยังไม่มี Milestone</p>
            <p className="text-sm">สามารถเพิ่มได้จากหน้า Admin → จัดการทุนวิจัย</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {milestones.map((m: any, idx: number) => {
                const ms = milestoneStatusLabels[m.status] || milestoneStatusLabels.pending;
                const isOverdue = m.status !== 'completed' && m.status !== 'cancelled' &&
                  m.planned_date && new Date(m.planned_date) < new Date();

                return (
                  <div key={m.id} className="relative pl-14">
                    {/* Timeline dot */}
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center text-[10px] ${
                      m.status === 'completed' ? 'bg-green-500' :
                      m.status === 'delayed' || isOverdue ? 'bg-red-500' :
                      m.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}>
                      <span className="text-white">{idx + 1}</span>
                    </div>

                    <div className={`border rounded-xl p-4 ${isOverdue && m.status === 'pending' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 flex-1">{ms.icon} {m.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ms.color}`}>{ms.label}</span>
                        {isOverdue && m.status !== 'delayed' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">เกินกำหนด</span>
                        )}
                      </div>

                      {m.description && <p className="text-sm text-gray-600 mb-2">{m.description}</p>}

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                        <span>กำหนด: <b className="text-gray-700">{m.planned_date}</b></span>
                        {m.actual_date && <span>จริง: <b className="text-gray-700">{m.actual_date}</b></span>}
                        {m.planned_weight > 0 && <span>น้ำหนัก: <b className="text-gray-700">{m.planned_weight}%</b></span>}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${
                            m.completion_pct >= 100 ? 'bg-green-500' :
                            m.status === 'delayed' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} style={{ width: `${Math.min(m.completion_pct || 0, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-10 text-right">{m.completion_pct || 0}%</span>
                      </div>

                      {/* Deliverables */}
                      {m.grant_deliverables && m.grant_deliverables.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="text-xs font-semibold text-gray-500 mb-2">สิ่งส่งมอบ:</h4>
                          <div className="space-y-1.5">
                            {m.grant_deliverables.map((d: any) => (
                              <div key={d.id} className="flex items-center gap-2 text-sm">
                                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                  d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {d.status === 'completed' ? '✓' : '○'}
                                </span>
                                <span className={d.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'}>
                                  {d.title}
                                </span>
                                {d.file_url && (
                                  <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 text-xs">📎</a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.evidence_url && (
                        <a href={m.evidence_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                          📎 หลักฐาน
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
