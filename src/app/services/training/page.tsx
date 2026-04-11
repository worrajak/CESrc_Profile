import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'หลักสูตรอบรม | CESRU - RMUTL',
  description: 'หลักสูตรอบรมด้านพลังงานสะอาด Solar PV, EV Charger, Battery Storage — หน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const LEVEL_BADGES: Record<string, { label: string; color: string }> = {
  beginner: { label: 'เริ่มต้น', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'กลาง', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'สูง', color: 'bg-purple-100 text-purple-700' },
  professional: { label: 'วิชาชีพ', color: 'bg-amber-100 text-amber-700' },
};

const DOMAIN_ICONS: Record<string, string> = {
  solar_pv: '☀️',
  ev_charger: '🔌',
  battery: '🔋',
  energy_audit: '📊',
  microgrid: '⚡',
};

const CREDENTIAL_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  LEVEL_2: { label: 'Bronze NFT', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🥉' },
  LEVEL_3: { label: 'Silver NFT', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🥈' },
  LEVEL_4: { label: 'Gold NFT', color: 'bg-yellow-100 text-yellow-800 border-yellow-400', icon: '🥇' },
  LEVEL_5: { label: 'Diamond NFT', color: 'bg-cyan-100 text-cyan-700 border-cyan-300', icon: '💎' },
};

async function getTrainingData() {
  const [coursesRes, sessionsRes, enrollmentsRes, credentialsRes] = await Promise.all([
    supabase.from('training_courses').select('*').eq('is_active', true).order('code'),
    supabase.from('training_sessions').select('*').in('status', ['open', 'planned']).order('start_date'),
    supabase.from('enrollments').select('id, session_id, status, passed'),
    supabase.from('credential_levels').select('*').order('level_num'),
  ]);

  return {
    courses: coursesRes.data || [],
    sessions: sessionsRes.data || [],
    enrollments: enrollmentsRes.data || [],
    credentials: credentialsRes.data || [],
  };
}

export default async function TrainingPage() {
  const { courses, sessions, enrollments, credentials } = await getTrainingData();

  const totalCourses = courses.length;
  const openSessions = sessions.filter((s: any) => s.status === 'open').length;
  const totalEnrolled = enrollments.length;
  const totalPassed = enrollments.filter((e: any) => e.passed).length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-purple-300 font-semibold text-sm tracking-widest uppercase mb-3">
              CESRU Training Academy
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">หลักสูตรอบรม</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              พัฒนาทักษะด้านพลังงานสะอาด — Solar PV, EV Charger, Battery Storage
              <br />ผ่านแล้วรับใบรับรอง NFT บน Blockchain
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-purple-300">{totalCourses}</div>
              <div className="text-sm text-gray-300">หลักสูตร</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-blue-300">{openSessions}</div>
              <div className="text-sm text-gray-300">เปิดรับสมัคร</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-green-300">{totalEnrolled}</div>
              <div className="text-sm text-gray-300">ผู้เข้าอบรม</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-amber-300">{totalPassed}</div>
              <div className="text-sm text-gray-300">ผ่านการประเมิน</div>
            </div>
          </div>
        </div>
      </section>

      {/* Credential Levels */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">ระดับใบรับรอง (NFT Credential)</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {credentials.map((cred: any) => (
              <div key={cred.level} className="bg-gray-50 rounded-xl border p-4 text-center w-36">
                <div className="text-3xl mb-1">{cred.icon}</div>
                <div className="text-sm font-bold text-gray-800">{cred.name_th}</div>
                <div className="text-[10px] text-gray-500">{cred.name_en}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {cred.nft_tier !== 'none' && <span className="uppercase font-bold">{cred.nft_tier} NFT</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">หลักสูตรทั้งหมด</h2>
          <Link href="/services/request" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            ขอเปิดอบรม (On-demand)
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => {
              const courseSessions = sessions.filter((s: any) => s.course_id === course.id);
              const openSession = courseSessions.find((s: any) => s.status === 'open');
              const levelBadge = LEVEL_BADGES[course.level] || LEVEL_BADGES.beginner;
              const credBadge = course.grants_credential_level ? CREDENTIAL_BADGES[course.grants_credential_level] : null;

              return (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition group">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{DOMAIN_ICONS[course.skill_domain] || '📚'}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelBadge.color}`}>
                        {levelBadge.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mt-2 leading-tight">{course.title_th}</h3>
                    {course.title_en && <p className="text-indigo-200 text-xs mt-1">{course.title_en}</p>}
                  </div>

                  <div className="p-4">
                    {course.description_th && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description_th}</p>
                    )}

                    {/* Info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.duration_days && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {course.duration_days} วัน ({course.duration_hours} ชม.)
                        </span>
                      )}
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                    </div>

                    {/* Credential */}
                    {credBadge && (
                      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 mb-3 ${credBadge.color}`}>
                        <span>{credBadge.icon}</span>
                        <div>
                          <div className="text-xs font-bold">ผ่านแล้วได้ {credBadge.label}</div>
                          <div className="text-[10px]">ใบรับรองบน Blockchain</div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between border-t pt-3">
                      <div>
                        <div className="text-lg font-bold text-gray-800">
                          {course.fee_external > 0 ? `${Number(course.fee_external).toLocaleString()} บาท` : 'ฟรี'}
                        </div>
                        {course.fee_student > 0 && course.fee_student !== course.fee_external && (
                          <div className="text-[10px] text-gray-400">นศ. {Number(course.fee_student).toLocaleString()} บาท</div>
                        )}
                      </div>

                      <Link href={`/services/training/${course.code}`}
                        className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                          openSession
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}>
                        {openSession ? 'ดูรายละเอียด & สมัคร' : 'ดูรายละเอียด'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-lg mb-2">ยังไม่มีหลักสูตรในระบบ</p>
            <p className="text-sm">รัน SQL: <code className="bg-gray-100 px-2 py-1 rounded">025_training_platform.sql</code></p>
          </div>
        )}
      </section>

      {/* How NFT Works */}
      <section className="bg-indigo-50 border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-indigo-800 text-center mb-8">ระบบใบรับรอง NFT ทำงานอย่างไร?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: '📝', title: 'ลงทะเบียน', desc: 'สมัครเข้าอบรม ส่งเอกสารหรือกรอก online — AI ช่วยแยก field อัตโนมัติ' },
              { step: 2, icon: '📚', title: 'เรียนรู้', desc: 'เข้าอบรมทุกโมดูล ทั้งภาคทฤษฎีและปฏิบัติ' },
              { step: 3, icon: '✅', title: 'ประเมินผล', desc: 'สอบแต่ละโมดูล ผ่านเกณฑ์ — ทุกคะแนนบันทึก on-chain' },
              { step: 4, icon: '🏆', title: 'รับ NFT', desc: 'ผ่านแล้วได้ใบรับรอง NFT บน TRON Blockchain — ตรวจสอบได้ตลอด' },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mx-auto mb-3">
                  {s.step}
                </div>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">สนใจเข้าอบรม?</h2>
          <p className="text-purple-200 mb-6">ลงทะเบียนหลักสูตร หรือขอเปิดอบรมเฉพาะกลุ่ม (On-demand)</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/services/request?type=training" className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-purple-50 transition">
              ลงทะเบียน / ขอเปิดอบรม
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
