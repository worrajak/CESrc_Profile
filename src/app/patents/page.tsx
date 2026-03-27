import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'สิทธิบัตร / อนุสิทธิบัตร | CESRU - RMUTL',
  description: 'สิทธิบัตรและอนุสิทธิบัตรของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const typeLabels: Record<string, string> = {
  patent: 'สิทธิบัตร',
  petty_patent: 'อนุสิทธิบัตร',
  copyright: 'ลิขสิทธิ์',
  trade_secret: 'ความลับทางการค้า',
};

const statusLabels: Record<string, string> = {
  filed: 'ยื่นคำขอแล้ว',
  pending: 'อยู่ระหว่างดำเนินการ',
  granted: 'ได้รับแล้ว',
  expired: 'หมดอายุ',
  rejected: 'ถูกปฏิเสธ',
};

const statusColors: Record<string, string> = {
  filed: 'bg-blue-50 text-blue-700',
  pending: 'bg-yellow-50 text-yellow-700',
  granted: 'bg-green-50 text-green-700',
  expired: 'bg-gray-50 text-gray-500',
  rejected: 'bg-red-50 text-red-700',
};

const typeColors: Record<string, string> = {
  patent: 'bg-purple-50 text-purple-700',
  petty_patent: 'bg-indigo-50 text-indigo-700',
  copyright: 'bg-pink-50 text-pink-700',
  trade_secret: 'bg-orange-50 text-orange-700',
};

export default async function PatentsPage() {
  const { data: patents } = await supabase
    .from('patents')
    .select('*')
    .order('filing_date', { ascending: false });

  // Fetch inventors for each patent
  const patentIds = (patents || []).map((p: any) => p.id);
  const { data: inventors } = await supabase
    .from('patent_inventors')
    .select('patent_id, inventor_order, researcher_id, researchers (title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, id)')
    .in('patent_id', patentIds.length > 0 ? patentIds : ['none'])
    .order('inventor_order', { ascending: true });

  // Group inventors by patent
  const inventorMap: Record<string, any[]> = {};
  (inventors || []).forEach((inv: any) => {
    if (!inventorMap[inv.patent_id]) inventorMap[inv.patent_id] = [];
    inventorMap[inv.patent_id].push(inv);
  });

  // Count by type
  const patentCount = (patents || []).filter((p: any) => p.patent_type === 'patent').length;
  const pettyCount = (patents || []).filter((p: any) => p.patent_type === 'petty_patent').length;
  const otherCount = (patents || []).length - patentCount - pettyCount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">สิทธิบัตร / อนุสิทธิบัตร</h1>
      <p className="text-gray-500 mb-6">ทรัพย์สินทางปัญญาของนักวิจัย CESRU</p>

      {/* Summary */}
      <div className="flex gap-4 mb-8">
        {patentCount > 0 && (
          <div className="bg-purple-50 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{patentCount}</div>
            <div className="text-sm text-purple-600">สิทธิบัตร</div>
          </div>
        )}
        {pettyCount > 0 && (
          <div className="bg-indigo-50 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-indigo-700">{pettyCount}</div>
            <div className="text-sm text-indigo-600">อนุสิทธิบัตร</div>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-gray-700">{(patents || []).length}</div>
          <div className="text-sm text-gray-500">รวมทั้งหมด</div>
        </div>
      </div>

      {/* Patent List */}
      {(!patents || patents.length === 0) ? (
        <p className="text-gray-500 text-center py-10">ยังไม่มีข้อมูลสิทธิบัตร/อนุสิทธิบัตร</p>
      ) : (
        <div className="space-y-4">
          {patents.map((patent: any, i: number) => {
            const patentInventors = inventorMap[patent.id] || [];
            return (
              <div key={patent.id} className="bg-white rounded-lg p-5 shadow-sm border hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-800 mb-1">{patent.title_th}</h3>
                    {patent.title_en && (
                      <p className="text-sm text-gray-500 mb-2">{patent.title_en}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${typeColors[patent.patent_type] || 'bg-gray-50 text-gray-700'}`}>
                        {typeLabels[patent.patent_type] || patent.patent_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[patent.status] || 'bg-gray-50 text-gray-500'}`}>
                        {statusLabels[patent.status] || patent.status}
                      </span>
                      {patent.application_no && (
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                          เลขที่คำขอ: {patent.application_no}
                        </span>
                      )}
                      {patent.patent_no && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          เลขที่สิทธิบัตร: {patent.patent_no}
                        </span>
                      )}
                    </div>

                    {/* Inventors */}
                    {patentInventors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-400">ผู้ประดิษฐ์:</span>
                        {patentInventors.map((inv: any, j: number) => {
                          const r = inv.researchers;
                          if (!r) return null;
                          return (
                            <Link
                              key={j}
                              href={`/researchers/${r.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {r.title_th}{r.first_name_th} {r.last_name_th}
                              {j < patentInventors.length - 1 ? ',' : ''}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Abstract */}
                    {patent.abstract_th && (
                      <p className="text-sm text-gray-600 mt-2">{patent.abstract_th}</p>
                    )}
                  </div>

                  {/* Number badge */}
                  <div className="text-3xl font-bold text-gray-200">{i + 1}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
