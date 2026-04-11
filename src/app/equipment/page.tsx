import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'ทะเบียนครุภัณฑ์ | CESRU - RMUTL',
  description: 'ทะเบียนครุภัณฑ์และเครื่องมือวัดในห้องปฏิบัติการพลังงานแสงอาทิตย์ หน่วยวิจัย CESRU',
};

const catConfig: Record<string, { label: string; labelEn: string; color: string; bg: string; border: string }> = {
  test_measurement: { label: 'เครื่องมือวัด', labelEn: 'Test & Measurement', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  solar_pv_test: { label: 'ทดสอบระบบ PV', labelEn: 'Solar PV Test', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  lab_facility: { label: 'อุปกรณ์ Lab', labelEn: 'Lab Facility', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
  computer_it: { label: 'คอมพิวเตอร์/IT', labelEn: 'Computer & IT', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  safety: { label: 'ความปลอดภัย', labelEn: 'Safety', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  other: { label: 'อื่นๆ', labelEn: 'Other', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  available: { label: 'พร้อมใช้งาน', cls: 'bg-green-100 text-green-800' },
  borrowed: { label: 'ถูกยืม', cls: 'bg-yellow-100 text-yellow-800' },
  maintenance: { label: 'ซ่อมบำรุง', cls: 'bg-orange-100 text-orange-800' },
  disposed: { label: 'ตัดจำหน่าย', cls: 'bg-red-100 text-red-700' },
};

export default async function EquipmentPage() {
  const { data: items } = await supabase
    .from('equipment')
    .select('*')
    .neq('status', 'disposed')
    .order('category')
    .order('name_th');

  const allItems = items || [];

  const grouped: Record<string, any[]> = {};
  for (const item of allItems) {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const totalItems = allItems.length;
  const totalAvailable = allItems.reduce((s: number, i: any) => s + (i.quantity_available || 0), 0);
  const totalBorrowed = allItems.filter((i: any) => i.status === 'borrowed').length;
  const categoryOrder = ['test_measurement', 'solar_pv_test', 'lab_facility', 'computer_it', 'safety', 'other'];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <p className="text-cyan-300 font-semibold text-sm tracking-widest uppercase mb-2">CES-RMUTL Solar Lab</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">ทะเบียนครุภัณฑ์</h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">
            เครื่องมือวัดและอุปกรณ์ในห้องปฏิบัติการพลังงานแสงอาทิตย์ พร้อมระบบยืม-คืน
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-cyan-300">{totalItems}</div>
              <div className="text-xs text-gray-400">รายการทั้งหมด</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400">{totalAvailable}</div>
              <div className="text-xs text-gray-400">พร้อมใช้งาน</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">{totalBorrowed}</div>
              <div className="text-xs text-gray-400">ถูกยืม</div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment List */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {categoryOrder.map((catKey) => {
          const catItems = grouped[catKey];
          if (!catItems || catItems.length === 0) return null;
          const cat = catConfig[catKey] || catConfig.other;

          return (
            <div key={catKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${cat.bg} ${cat.border} border rounded-xl flex items-center justify-center`}>
                  <span className={`text-sm font-bold ${cat.color}`}>{catItems.length}</span>
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${cat.color}`}>{cat.label}</h2>
                  <p className="text-xs text-gray-500">{cat.labelEn}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border divide-y">
                {catItems.map((item: any) => {
                  const st = statusBadge[item.status] || statusBadge.available;
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/50 transition gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{item.name_th}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                        </div>
                        {item.name_en && <p className="text-xs text-gray-500 mt-0.5">{item.name_en}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                          {item.brand && <span>Brand: <b className="text-gray-700">{item.brand}</b></span>}
                          {item.model && <span>Model: <b className="text-gray-700">{item.model}</b></span>}
                          {item.asset_number && <span>เลขครุภัณฑ์: <b className="text-gray-700">{item.asset_number}</b></span>}
                        </div>
                        {item.description_th && <p className="text-xs text-gray-500 mt-1">{item.description_th}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{item.quantity_available}<span className="text-gray-400 text-sm">/{item.quantity_total}</span></div>
                          <div className="text-[10px] text-gray-500">ว่าง/ทั้งหมด</div>
                        </div>
                        {item.status === 'available' && item.quantity_available > 0 && (
                          <Link
                            href={`/equipment/borrow?id=${item.id}&name=${encodeURIComponent(item.name_th)}`}
                            className="text-xs bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 transition font-medium whitespace-nowrap"
                          >
                            ขอยืม
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
