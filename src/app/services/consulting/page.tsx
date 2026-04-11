import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'บริการที่ปรึกษา | CESRU - RMUTL',
  description: 'บริการที่ปรึกษาด้านพลังงานสะอาด Solar PV, EV Charger, Microgrid — หน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const SERVICE_ICONS: Record<string, string> = {
  consulting: '💡',
  design_install: '⚡',
  inspection: '🔍',
  training: '🎓',
};

export default async function ConsultingPage() {
  // Pull consulting & design projects from service_requests or academic_services
  const [servicesRes, requestsRes] = await Promise.all([
    supabase
      .from('academic_services')
      .select('*')
      .in('service_type', ['consulting', 'design_install', 'inspection'])
      .order('created_at', { ascending: false }),
    supabase
      .from('service_requests')
      .select('*')
      .in('status', ['completed', 'in_progress'])
      .in('service_type', ['consulting', 'design_install', 'inspection'])
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const services = servicesRes.data || [];
  const completedProjects = requestsRes.data || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-blue-300 font-semibold text-sm tracking-widest uppercase mb-3">
            CESRU Consulting Services
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">บริการที่ปรึกษาและออกแบบ</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            บริการที่ปรึกษาด้านพลังงานสะอาด ออกแบบระบบ Solar PV / EV Charger / Battery Storage
            <br />ตรวจสอบระบบไฟฟ้า — ทุกขั้นตอนบันทึกบน Blockchain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '💡', title: 'ที่ปรึกษา', desc: 'ให้คำปรึกษาออกแบบ วิเคราะห์ความคุ้มค่า ศึกษาความเป็นไปได้' },
              { icon: '⚡', title: 'ออกแบบ & ติดตั้ง', desc: 'ออกแบบระบบ Solar PV, EV Charger, Microgrid พร้อมควบคุมงาน' },
              { icon: '🔍', title: 'ตรวจสอบ', desc: 'ตรวจสอบระบบไฟฟ้า ทดสอบ PV Performance ออกรายงาน' },
            ].map((s) => (
              <div key={s.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ผลงานโครงการ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ผลงานโครงการ</h2>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc: any) => (
              <div key={svc.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{SERVICE_ICONS[svc.service_type] || '📋'}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{svc.title_th}</h3>
                      {svc.title_en && <p className="text-xs text-gray-400">{svc.title_en}</p>}
                    </div>
                  </div>

                  {svc.capacity && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-gray-400">ขนาดระบบ:</span> {svc.capacity}
                    </p>
                  )}
                  {svc.system_type && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-gray-400">ประเภท:</span> {svc.system_type}
                    </p>
                  )}
                  {svc.location && (
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">สถานที่:</span> {svc.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">💡</div>
            <p className="text-lg">ยังไม่มีผลงานในระบบ</p>
          </div>
        )}
      </section>

      {/* กระบวนการทำงาน */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-8">กระบวนการทำงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: 1, icon: '📝', title: 'ส่งคำขอ', desc: 'กรอกข้อมูลหรืออัพโหลดเอกสาร' },
              { step: 2, icon: '📋', title: 'ประเมินงาน', desc: 'ทีมวิเคราะห์ขอบเขตและเสนอราคา' },
              { step: 3, icon: '🤝', title: 'ทำสัญญา', desc: 'อนุมัติโครงการ บันทึกบน Blockchain' },
              { step: 4, icon: '⚡', title: 'ดำเนินงาน', desc: 'ลงพื้นที่ ออกแบบ ติดตั้ง ตรวจสอบ' },
              { step: 5, icon: '✅', title: 'ส่งมอบ', desc: 'รายงานผล ปิดโครงการ ออก NFT Certificate' },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-xl p-5 text-center shadow-sm relative">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mx-auto mb-2 text-sm">
                  {s.step}
                </div>
                <div className="text-2xl mb-1">{s.icon}</div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h3>
                <p className="text-[10px] text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Completed Projects Timeline */}
      {completedProjects.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">โครงการที่ดำเนินการ</h2>
          <div className="space-y-3">
            {completedProjects.map((proj: any) => (
              <div key={proj.id} className="bg-white rounded-lg border p-4 flex items-center gap-4">
                <span className="text-2xl">{SERVICE_ICONS[proj.service_type] || '📋'}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{proj.title}</h3>
                  <p className="text-xs text-gray-400">
                    {proj.requester_org || proj.requester_name} · {proj.location || '-'}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  proj.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {proj.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">สนใจใช้บริการ?</h2>
          <p className="text-indigo-200 mb-6">ส่งคำขอบริการ หรือติดต่อทีม CESRU เพื่อหารือโครงการ</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/services/request?type=consulting" className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
              ส่งคำขอบริการ
            </Link>
            <Link href="/services" className="border-2 border-white/80 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition">
              ดูบริการทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
