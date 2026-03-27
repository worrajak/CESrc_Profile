import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'บริการวิชาการ | CESRU - RMUTL',
  description: 'บริการวิชาการของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const typeLabels: Record<string, string> = {
  design_install: 'ออกแบบและติดตั้ง',
  consulting: 'ที่ปรึกษา',
  training: 'อบรม',
  inspection: 'ตรวจสอบ',
  testing: 'ทดสอบ',
};

export default async function ServicesPage() {
  const { data: services } = await supabase
    .from('academic_services')
    .select('*')
    .order('capacity', { ascending: true });

  const allServices = services || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">บริการวิชาการ</h1>
      <p className="text-gray-500 mb-8">
        ผลงานบริการวิชาการด้านการออกแบบและติดตั้งระบบพลังงานแสงอาทิตย์ ({allServices.length} โครงการ)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allServices.map((svc: any) => (
          <div key={svc.id} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{svc.title_th}</h3>
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                {svc.capacity}
              </span>
            </div>
            {svc.title_en && <p className="text-sm text-gray-500 mt-1">{svc.title_en}</p>}

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">ประเภท:</span> {typeLabels[svc.service_type] || svc.service_type}
              </p>
              {svc.system_type && (
                <p>
                  <span className="font-medium">ระบบ:</span> {svc.system_type}
                </p>
              )}
              {svc.location && (
                <p>
                  <span className="font-medium">สถานที่:</span> {svc.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
