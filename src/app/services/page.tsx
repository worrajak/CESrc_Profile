import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'บริการวิชาการ | CESRU - RMUTL',
  description: 'ผลงานบริการวิชาการของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา — ออกแบบ ติดตั้ง ที่ปรึกษา ตรวจสอบ และอบรม',
};

const categoryConfig: Record<string, { label: string; labelEn: string; icon: string; color: string; bgColor: string; borderColor: string }> = {
  design_install: {
    label: 'ออกแบบและติดตั้ง',
    labelEn: 'Design & Installation',
    icon: '&#9889;',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  consulting: {
    label: 'ที่ปรึกษา',
    labelEn: 'Consultant',
    icon: '&#128202;',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  inspection: {
    label: 'ตรวจสอบ',
    labelEn: 'Inspection',
    icon: '&#128269;',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  training: {
    label: 'อบรม',
    labelEn: 'Training',
    icon: '&#127891;',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

function formatBudget(budget: number | null): string | null {
  if (!budget) return null;
  if (budget >= 1_000_000_000) return `${(budget / 1_000_000_000).toLocaleString('th-TH', { maximumFractionDigits: 1 })} พันล้านบาท`;
  if (budget >= 1_000_000) return `${(budget / 1_000_000).toLocaleString('th-TH', { maximumFractionDigits: 1 })} ล้านบาท`;
  return `${budget.toLocaleString('th-TH')} บาท`;
}

export default async function ServicesPage() {
  const { data: services } = await supabase
    .from('academic_services')
    .select('*')
    .order('service_type', { ascending: true })
    .order('budget', { ascending: false });

  const allServices = services || [];

  // Group by service_type
  const grouped: Record<string, any[]> = {};
  const categoryOrder = ['design_install', 'consulting', 'inspection', 'training'];

  for (const svc of allServices) {
    const type = svc.service_type || 'other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(svc);
  }

  // Calculate stats
  const totalProjects = allServices.length;
  const designCount = (grouped['design_install'] || []).length;
  const consultCount = (grouped['consulting'] || []).length;
  const inspectCount = (grouped['inspection'] || []).length;
  const trainingCount = (grouped['training'] || []).length;

  // Sum up notable figures
  const consultBudgetTotal = (grouped['consulting'] || [])
    .reduce((sum: number, s: any) => sum + (Number(s.budget) || 0), 0);

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <p className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">
              CES-RMUTL Academic Services
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Site References
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12">
              ตัวอย่างผลงานบริการวิชาการ หน่วยวิจัยระบบพลังงานสะอาด
              <br />มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
            </p>
          </div>

          {/* ===== KEY METRICS ===== */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">&gt; 1 MW</div>
              <div className="text-sm text-gray-300">Design & Install</div>
              <div className="text-xs text-gray-500 mt-1">{designCount} โครงการ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">&gt; 3 MW</div>
              <div className="text-sm text-gray-300">Consultant</div>
              <div className="text-xs text-gray-500 mt-1">{consultCount} โครงการ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">
                {inspectCount}+
              </div>
              <div className="text-sm text-gray-300">Inspection</div>
              <div className="text-xs text-gray-500 mt-1">สถานที่ตรวจสอบ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">&gt; 1,000</div>
              <div className="text-sm text-gray-300">ผู้เข้าอบรม</div>
              <div className="text-xs text-gray-500 mt-1">10+ หลักสูตร</div>
            </div>
            <a href="#equipment" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition block">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">20+</div>
              <div className="text-sm text-gray-300">Lab Equipment</div>
              <div className="text-xs text-gray-500 mt-1">เครื่องมือวัด</div>
            </a>
          </div>
        </div>
      </section>

      {/* ===== Quick Links to Sub-Pages ===== */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/services/training"
              className="group bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎓</span>
                <div>
                  <h3 className="font-bold text-purple-800 group-hover:text-purple-600">หลักสูตรอบรม</h3>
                  <p className="text-xs text-purple-500">Training & NFT Certificate</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">หลักสูตร Solar PV, EV Charger, Battery — ผ่านแล้วรับใบรับรอง NFT บน Blockchain</p>
              <span className="text-xs text-purple-600 font-medium mt-2 inline-block group-hover:underline">ดูหลักสูตรทั้งหมด →</span>
            </Link>

            <Link href="/services/consulting"
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="font-bold text-blue-800 group-hover:text-blue-600">ที่ปรึกษา & ออกแบบ</h3>
                  <p className="text-xs text-blue-500">Consulting & Design</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">ออกแบบระบบ Solar PV, EV Charger, Microgrid — ตรวจสอบระบบไฟฟ้า</p>
              <span className="text-xs text-blue-600 font-medium mt-2 inline-block group-hover:underline">ดูผลงาน →</span>
            </Link>

            <Link href="/services/request"
              className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h3 className="font-bold text-green-800 group-hover:text-green-600">ส่งคำขอบริการ</h3>
                  <p className="text-xs text-green-500">Service Request</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">ส่งคำขออบรม ที่ปรึกษา ออกแบบ ตรวจสอบ — AI ช่วยแยกเอกสารอัตโนมัติ</p>
              <span className="text-xs text-green-600 font-medium mt-2 inline-block group-hover:underline">ส่งคำขอ →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== OUR EXPERIENCES INTRO ===== */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Experiences</h2>
            <p className="text-gray-500">
              ประสบการณ์ครอบคลุมทุกด้านของระบบพลังงานสะอาด ตั้งแต่การออกแบบ ติดตั้ง ที่ปรึกษา ตรวจสอบ ไปจนถึงการอบรม
            </p>
          </div>

          {/* Category summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryOrder.map((catKey) => {
              const cat = categoryConfig[catKey];
              const items = grouped[catKey] || [];
              const linkTarget = catKey === 'training' ? '/services/training' : catKey === 'consulting' ? '/services/consulting' : `#${catKey}`;
              return (
                <Link
                  key={catKey}
                  href={linkTarget}
                  className={`group ${cat.bgColor} ${cat.borderColor} border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                    <div>
                      <h3 className={`font-bold ${cat.color}`}>{cat.label}</h3>
                      <p className="text-xs text-gray-500">{cat.labelEn}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {items.length} <span className="text-sm font-normal text-gray-500">รายการ</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SERVICES BY CATEGORY ===== */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {categoryOrder.map((catKey) => {
          const cat = categoryConfig[catKey];
          const items = grouped[catKey] || [];
          if (items.length === 0) return null;

          return (
            <div key={catKey} id={catKey}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 ${cat.bgColor} ${cat.borderColor} border rounded-xl flex items-center justify-center`}>
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                </div>
                <div>
                  <h2 className={`text-xl md:text-2xl font-bold ${cat.color}`}>{cat.label}</h2>
                  <p className="text-sm text-gray-500">{cat.labelEn} — {items.length} รายการ</p>
                </div>
              </div>

              {/* Service Cards */}
              {catKey === 'consulting' ? (
                /* Consulting gets special large cards because of budget info */
                <div className="space-y-4">
                  {items.map((svc: any) => (
                    <div
                      key={svc.id}
                      className={`bg-white rounded-xl shadow-sm border ${cat.borderColor} p-6 hover:shadow-md transition-all duration-300 group`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                            {svc.title_th}
                          </h3>
                          {svc.title_en && (
                            <p className="text-sm text-gray-500 mt-1">{svc.title_en}</p>
                          )}
                          {svc.description_th && (
                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{svc.description_th}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {svc.capacity && (
                              <span className="inline-flex items-center text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                                {svc.capacity}
                              </span>
                            )}
                            {svc.client && (
                              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                {svc.client}
                              </span>
                            )}
                            {svc.location && (
                              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                {svc.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {svc.budget && (
                          <div className="md:text-right shrink-0">
                            <div className="text-xs text-gray-500 mb-1">มูลค่าโครงการ</div>
                            <div className="text-xl md:text-2xl font-bold text-blue-700">
                              {formatBudget(svc.budget)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : catKey === 'training' ? (
                /* Training gets a clean list format */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                  {items.map((svc: any, idx: number) => (
                    <div
                      key={svc.id}
                      className="p-5 hover:bg-purple-50/50 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {svc.title_th}
                          </h3>
                          {svc.title_en && (
                            <p className="text-sm text-gray-500 mt-0.5">{svc.title_en}</p>
                          )}
                          {svc.description_th && (
                            <p className="text-sm text-gray-600 mt-2">{svc.description_th}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {svc.client && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {svc.client}
                              </span>
                            )}
                            {svc.location && svc.location !== 'มทร.ล้านนา' && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {svc.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : catKey === 'inspection' ? (
                /* Inspection with status-like cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((svc: any) => (
                    <div
                      key={svc.id}
                      className={`bg-white rounded-xl shadow-sm border ${cat.borderColor} p-5 hover:shadow-md transition-all duration-300 group`}
                    >
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {svc.title_th}
                      </h3>
                      {svc.title_en && (
                        <p className="text-sm text-gray-500 mt-1">{svc.title_en}</p>
                      )}
                      {svc.description_th && (
                        <p className="text-sm text-gray-600 mt-2">{svc.description_th}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {svc.client && (
                          <span className="inline-flex items-center text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                            {svc.client}
                          </span>
                        )}
                        {svc.capacity && (
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {svc.capacity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Design & Install — grid cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((svc: any) => (
                    <div
                      key={svc.id}
                      className={`bg-white rounded-xl shadow-sm border ${cat.borderColor} p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-amber-700 transition-colors leading-snug">
                          {svc.title_th}
                        </h3>
                        {svc.capacity && (
                          <span className="shrink-0 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                            {svc.capacity}
                          </span>
                        )}
                      </div>
                      {svc.title_en && (
                        <p className="text-xs text-gray-400 mb-2">{svc.title_en}</p>
                      )}
                      <div className="space-y-1 text-xs text-gray-600">
                        {svc.system_type && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">System:</span>
                            <span className="font-medium">{svc.system_type}</span>
                          </div>
                        )}
                        {svc.location && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Location:</span>
                            <span>{svc.location}</span>
                          </div>
                        )}
                        {svc.client && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Client:</span>
                            <span>{svc.client}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ===== LAB EQUIPMENT & INSTRUMENTS ===== */}
      <section id="equipment" className="bg-gradient-to-b from-gray-50 to-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-cyan-600 font-semibold text-sm tracking-widest uppercase mb-2">
              Lab Equipment & Instruments
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              เครื่องมือและครุภัณฑ์ในห้องปฏิบัติการ
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              เครื่องมือวัดและอุปกรณ์ที่พร้อมให้บริการ ณ ห้องปฏิบัติการพลังงานแสงอาทิตย์ (Solar Lab) มทร.ล้านนา
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test & Measurement Instruments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-cyan-100 border border-cyan-200 rounded-xl flex items-center justify-center text-lg">
                  <span>&#9889;</span>
                </div>
                <div>
                  <h3 className="font-bold text-cyan-800">เครื่องมือวัดทางไฟฟ้า</h3>
                  <p className="text-xs text-gray-500">Test & Measurement Instruments</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-cyan-100 divide-y divide-gray-100">
                {[
                  { name: 'Fluke 289 True-RMS Multimeter', qty: 4, note: 'ใช้ได้ 3 เครื่อง' },
                  { name: 'Fluke 1730 Three-Phase Energy Logger', qty: 2, note: null },
                  { name: 'Fluke 376 FC True-RMS Clamp Meter', qty: 2, note: null },
                  { name: 'Fluke 337 True-RMS Clamp Meter', qty: 1, note: null },
                  { name: 'Fluke 62 MAX+ Infrared Thermometer', qty: 1, note: null },
                  { name: 'Fluke 971 Temperature & Humidity Meter', qty: 1, note: null },
                  { name: 'Fluke Ti25 Thermal Imager', qty: 1, note: null },
                  { name: 'Fluke 1625-2 GEO Earth Ground Tester Kit', qty: 1, note: null },
                  { name: 'HIOKI Memory HiLogger LR8450-01', qty: 1, note: null },
                  { name: 'Digital Power Clamp Meter MS2203', qty: 4, note: null },
                  { name: 'BK Precision 879B LCR Meter', qty: 2, note: null },
                  { name: 'DIGICON DM-690', qty: 1, note: null },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-cyan-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono w-5">{idx + 1}.</span>
                      <span className="text-sm text-gray-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.note && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{item.note}</span>}
                      <span className="text-xs font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-lg">{item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solar PV Test Equipment */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center text-lg">
                  <span>&#9728;&#65039;</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-800">เครื่องมือทดสอบระบบ PV</h3>
                  <p className="text-xs text-gray-500">Solar PV Test Equipment</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 divide-y divide-gray-100">
                {[
                  { name: 'Seaward PV150 Solar Complete Kit', desc: 'ชุดทดสอบระบบ PV ครบชุด (Voc, Isc, Insulation, Continuity)' },
                  { name: 'HT I-V 400W I-V Curve Tracer', desc: 'วัดกราฟ I-V ของแผงโซล่าเซลล์ได้ถึง 400W' },
                  { name: 'HT Solar 300N Irradiance Meter', desc: 'วัดความเข้มแสงอาทิตย์และอุณหภูมิแผง' },
                  { name: 'HT MPP300 MPPT Analyzer', desc: 'วิเคราะห์จุดทำงานสูงสุดของระบบ PV' },
                  { name: 'HT PV CHECKs', desc: 'ตรวจสอบความปลอดภัยระบบ PV' },
                  { name: 'Metrel EurotestPV Remote A1378', desc: 'ทดสอบระบบ PV ระยะไกล' },
                  { name: 'Metrel MI 3109 EurotestPV Lite', desc: 'ทดสอบระบบ PV แบบพกพา' },
                  { name: 'PROVA 210 Solar Module Analyzer', desc: 'วิเคราะห์แผงโซล่าเซลล์' },
                ].map((item, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-amber-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-400 font-mono w-5 mt-0.5">{idx + 1}.</span>
                      <div>
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lab Facilities */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-lg">
                    <span>&#127971;</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">สิ่งอำนวยความสะดวกใน Lab</h3>
                    <p className="text-xs text-gray-500">Lab Facilities</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Hybrid Inverter 3kW x4',
                      'Computer All-in-One x2',
                      'Smart TV / LED TV x2',
                      'Air Conditioner',
                      'Fume Hood',
                    ].map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            สนใจใช้บริการ?
          </h2>
          <p className="text-amber-100 mb-6 max-w-xl mx-auto">
            หน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา พร้อมให้บริการวิชาการ
            ด้านพลังงานแสงอาทิตย์ ระบบกักเก็บพลังงาน ยานยนต์ไฟฟ้า และอื่นๆ
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/services/request"
              className="inline-flex items-center bg-white text-amber-700 font-semibold px-6 py-3 rounded-lg hover:bg-amber-50 transition shadow-lg"
            >
              📝 ส่งคำขอบริการ
            </Link>
            <Link
              href="/services/training"
              className="inline-flex items-center border-2 border-white/80 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              🎓 ดูหลักสูตรอบรม
            </Link>
            <Link
              href="/researchers"
              className="inline-flex items-center border-2 border-white/80 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              ติดต่อทีมนักวิจัย
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
