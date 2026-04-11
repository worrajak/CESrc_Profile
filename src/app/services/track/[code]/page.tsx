import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  reviewing: { label: 'กำลังพิจารณา', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-700', icon: '✅' },
  rejected: { label: 'ไม่อนุมัติ', color: 'bg-red-100 text-red-700', icon: '❌' },
  assigned: { label: 'มอบหมายแล้ว', color: 'bg-indigo-100 text-indigo-700', icon: '👤' },
  in_progress: { label: 'กำลังดำเนินการ', color: 'bg-purple-100 text-purple-700', icon: '⚡' },
  completed: { label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700', icon: '🏆' },
  cancelled: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-500', icon: '🚫' },
};

const SERVICE_TYPE_MAP: Record<string, string> = {
  training: 'ฝึกอบรม',
  consulting: 'ที่ปรึกษา',
  design_install: 'ออกแบบ/ติดตั้ง',
  inspection: 'ตรวจสอบ',
};

export default async function TrackingPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Fetch request + timeline
  const [requestRes, timelineRes] = await Promise.all([
    supabase
      .from('service_requests')
      .select('*')
      .eq('tracking_code', code)
      .single(),
    supabase
      .from('service_timeline')
      .select('*')
      .eq('request_id', (await supabase.from('service_requests').select('id').eq('tracking_code', code).single()).data?.id || '')
      .order('created_at', { ascending: true }),
  ]);

  const request = requestRes.data;
  const timeline = timelineRes.data || [];

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-10">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบคำขอ</h1>
          <p className="text-gray-500 mb-6">รหัสติดตาม &quot;{code}&quot; ไม่พบในระบบ</p>
          <Link href="/services" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm">
            กลับหน้าบริการ
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[request.status] || STATUS_MAP.pending;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/services" className="text-sm text-indigo-600 hover:underline">← กลับหน้าบริการ</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {/* Status Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs mb-1">รหัสติดตาม</p>
              <p className="text-2xl font-bold font-mono">{request.tracking_code}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${status.color}`}>
              {status.icon} {status.label}
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{request.title}</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">ประเภทบริการ:</span>
              <p className="font-medium text-gray-700">{SERVICE_TYPE_MAP[request.service_type] || request.service_type}</p>
            </div>
            <div>
              <span className="text-gray-400">ผู้ขอ:</span>
              <p className="font-medium text-gray-700">{request.requester_name}</p>
            </div>
            {request.requester_org && (
              <div>
                <span className="text-gray-400">หน่วยงาน:</span>
                <p className="font-medium text-gray-700">{request.requester_org}</p>
              </div>
            )}
            {request.location && (
              <div>
                <span className="text-gray-400">สถานที่:</span>
                <p className="font-medium text-gray-700">{request.location}</p>
              </div>
            )}
            {request.preferred_date_start && (
              <div>
                <span className="text-gray-400">วันที่ต้องการ:</span>
                <p className="font-medium text-gray-700">
                  {request.preferred_date_start}
                  {request.preferred_date_end ? ` — ${request.preferred_date_end}` : ''}
                </p>
              </div>
            )}
            {request.num_participants && (
              <div>
                <span className="text-gray-400">จำนวนผู้เข้าร่วม:</span>
                <p className="font-medium text-gray-700">{request.num_participants} คน</p>
              </div>
            )}
          </div>

          {request.description && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{request.description}</p>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        {(request.create_tx || request.approve_tx || request.complete_tx) && (
          <div className="p-6 border-b bg-indigo-50">
            <h3 className="text-sm font-bold text-indigo-800 mb-3">🔗 Blockchain Records</h3>
            <div className="space-y-2">
              {request.create_tx && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-600">Create TX:</span>
                  <a href={`https://nile.tronscan.org/#/transaction/${request.create_tx}`}
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-indigo-700 hover:underline truncate">
                    {request.create_tx}
                  </a>
                </div>
              )}
              {request.approve_tx && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-600">Approve TX:</span>
                  <a href={`https://nile.tronscan.org/#/transaction/${request.approve_tx}`}
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-indigo-700 hover:underline truncate">
                    {request.approve_tx}
                  </a>
                </div>
              )}
              {request.complete_tx && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-600">Complete TX:</span>
                  <a href={`https://nile.tronscan.org/#/transaction/${request.complete_tx}`}
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-indigo-700 hover:underline truncate">
                    {request.complete_tx}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">ไทม์ไลน์</h3>

          {timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-4">
                {timeline.map((entry: any, idx: number) => {
                  const entryStatus = STATUS_MAP[entry.status] || STATUS_MAP.pending;
                  return (
                    <div key={entry.id || idx} className="relative pl-10">
                      <div className={`absolute left-2 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        idx === timeline.length - 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {entryStatus.icon}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${entryStatus.color}`}>
                            {entryStatus.label}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(entry.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                        {entry.actor && <p className="text-[10px] text-gray-400 mt-1">โดย: {entry.actor}</p>}
                        {entry.tx_hash && (
                          <a href={`https://nile.tronscan.org/#/transaction/${entry.tx_hash}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 hover:underline mt-1 inline-block">
                            🔗 TX: {entry.tx_hash.substring(0, 16)}...
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">
              <p className="text-sm">ยังไม่มีอัพเดทสถานะ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
