import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import EnrollForm from './EnrollForm';

export const dynamic = 'force-dynamic';

const DOMAIN_ICONS: Record<string, string> = {
  solar_pv: '☀️', ev_charger: '🔌', battery: '🔋',
  energy_audit: '📊', microgrid: '⚡',
};

const LEVEL_MAP: Record<string, { label: string; color: string }> = {
  beginner: { label: 'เริ่มต้น', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'กลาง', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'สูง', color: 'bg-purple-100 text-purple-700' },
  professional: { label: 'วิชาชีพ', color: 'bg-amber-100 text-amber-700' },
};

const NFT_MAP: Record<string, { label: string; icon: string; color: string }> = {
  LEVEL_2: { label: 'Bronze NFT', icon: '🥉', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  LEVEL_3: { label: 'Silver NFT', icon: '🥈', color: 'bg-gray-50 border-gray-300 text-gray-700' },
  LEVEL_4: { label: 'Gold NFT', icon: '🥇', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  LEVEL_5: { label: 'Diamond NFT', icon: '💎', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
};

async function getCourseData(code: string) {
  const [courseRes, modulesRes, sessionsRes, enrollCountRes, compRes] = await Promise.all([
    supabase.from('training_courses').select('*').eq('code', code).single(),
    supabase.from('course_modules').select('*').eq(
      'course_id',
      (await supabase.from('training_courses').select('id').eq('code', code).single()).data?.id || ''
    ).order('module_number'),
    supabase.from('training_sessions').select('*').eq(
      'course_id',
      (await supabase.from('training_courses').select('id').eq('code', code).single()).data?.id || ''
    ).in('status', ['open', 'planned', 'in_progress']).order('start_date'),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq(
      'session_id',
      // count all enrollments across sessions of this course — simplified
      (await supabase.from('training_sessions').select('id').eq(
        'course_id',
        (await supabase.from('training_courses').select('id').eq('code', code).single()).data?.id || ''
      ).limit(1).single()).data?.id || ''
    ),
    // Competencies
    supabase.from('module_competencies').select(`
      *, competency_indicators (*)
    `).in(
      'module_id',
      ((await supabase.from('course_modules').select('id').eq(
        'course_id',
        (await supabase.from('training_courses').select('id').eq('code', code).single()).data?.id || ''
      )).data || []).map((m: any) => m.id)
    ).order('sort_order'),
  ]);

  return {
    course: courseRes.data,
    modules: modulesRes.data || [],
    sessions: sessionsRes.data || [],
    enrollCount: enrollCountRes.count || 0,
    competencies: compRes.data || [],
  };
}

export default async function CourseDetailPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const { course, modules, sessions, competencies } = await getCourseData(code);

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-10">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบหลักสูตร</h1>
          <p className="text-gray-500 mb-6">รหัส &quot;{code}&quot; ไม่พบในระบบ</p>
          <Link href="/services/training" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm">
            กลับหน้าหลักสูตร
          </Link>
        </div>
      </div>
    );
  }

  const level = LEVEL_MAP[course.level] || LEVEL_MAP.beginner;
  const nft = course.grants_credential_level ? NFT_MAP[course.grants_credential_level] : null;
  const openSessions = sessions.filter((s: any) => s.status === 'open');

  // Group competencies by module
  const compByModule: Record<string, any[]> = {};
  competencies.forEach((c: any) => {
    if (!compByModule[c.module_id]) compByModule[c.module_id] = [];
    compByModule[c.module_id].push(c);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/services/training" className="text-purple-300 hover:text-white text-sm mb-4 inline-block">
            ← หลักสูตรทั้งหมด
          </Link>

          <div className="flex items-start gap-4">
            <span className="text-5xl">{DOMAIN_ICONS[course.skill_domain] || '📚'}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">{course.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${level.color}`}>{level.label}</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">{course.title_th}</h1>
              {course.title_en && <p className="text-indigo-300 text-sm">{course.title_en}</p>}
              {course.description_th && (
                <p className="text-gray-300 mt-3 text-sm leading-relaxed max-w-2xl">{course.description_th}</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-300">{course.duration_days || '-'}</div>
              <div className="text-[10px] text-gray-300">วัน</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-300">{course.duration_hours || '-'}</div>
              <div className="text-[10px] text-gray-300">ชั่วโมง</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-300">{modules.length}</div>
              <div className="text-[10px] text-gray-300">โมดูล</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-300">{course.max_participants || 30}</div>
              <div className="text-[10px] text-gray-300">ที่นั่ง/รุ่น</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-pink-300">{openSessions.length}</div>
              <div className="text-[10px] text-gray-300">รุ่นเปิดรับ</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Detail */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                ค่าลงทะเบียน
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                  <div className="text-xs text-blue-600 mb-1">👨‍🎓 นักศึกษา</div>
                  <div className="text-xl font-bold text-blue-800">
                    {course.fee_student > 0 ? `${Number(course.fee_student).toLocaleString()}` : 'ฟรี'}
                  </div>
                  {course.fee_student > 0 && <div className="text-[10px] text-blue-400">บาท</div>}
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                  <div className="text-xs text-indigo-600 mb-1">👨‍💼 บุคลากร มทร.</div>
                  <div className="text-xl font-bold text-indigo-800">
                    {course.fee_internal > 0 ? `${Number(course.fee_internal).toLocaleString()}` : 'ฟรี'}
                  </div>
                  {course.fee_internal > 0 && <div className="text-[10px] text-indigo-400">บาท</div>}
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                  <div className="text-xs text-purple-600 mb-1">🏢 บุคคลทั่วไป</div>
                  <div className="text-xl font-bold text-purple-800">
                    {course.fee_external > 0 ? `${Number(course.fee_external).toLocaleString()}` : 'ฟรี'}
                  </div>
                  {course.fee_external > 0 && <div className="text-[10px] text-purple-400">บาท</div>}
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                โมดูลการเรียนรู้ ({modules.length} โมดูล)
              </h2>
              {modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((mod: any) => {
                    const modComps = compByModule[mod.id] || [];
                    return (
                      <div key={mod.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                              {mod.module_number}
                            </span>
                            <div>
                              <h3 className="font-medium text-gray-800 text-sm">{mod.title_th}</h3>
                              {mod.title_en && <p className="text-[10px] text-gray-400">{mod.title_en}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded ${
                              mod.module_type === 'lab' || mod.module_type === 'practice'
                                ? 'bg-orange-100 text-orange-600'
                                : mod.module_type === 'exam'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {mod.module_type === 'lecture' ? 'ทฤษฎี' : mod.module_type === 'lab' ? 'ปฏิบัติ' : mod.module_type === 'exam' ? 'สอบ' : mod.module_type}
                            </span>
                            <span className="text-[10px] text-gray-400">{mod.duration_hours} ชม.</span>
                            <span className="text-[10px] text-gray-400">({mod.weight_pct}%)</span>
                          </div>
                        </div>

                        {/* Competencies under this module */}
                        {modComps.length > 0 && (
                          <div className="px-4 py-3 border-t bg-white space-y-2">
                            {modComps.map((comp: any) => (
                              <div key={comp.id}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs">🎯</span>
                                  <span className="text-xs font-medium text-indigo-700">{comp.name}</span>
                                  <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                    {comp.competency_type === 'knowledge' ? 'ความรู้' : comp.competency_type === 'skill' ? 'ทักษะ' : 'คุณลักษณะ'}
                                  </span>
                                </div>
                                {comp.competency_indicators?.length > 0 && (
                                  <div className="ml-5 space-y-1">
                                    {comp.competency_indicators.map((ind: any) => (
                                      <div key={ind.id} className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <span className="text-gray-300">📏</span>
                                        <span>{ind.name}</span>
                                        <span className="text-gray-300">(น้ำหนัก {ind.weight}%)</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีข้อมูลโมดูล</p>
              )}
            </div>

            {/* NFT Credential */}
            {nft && (
              <div className={`rounded-xl border p-6 ${nft.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{nft.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">ผ่านแล้วได้ {nft.label}</h3>
                    <p className="text-sm opacity-75">
                      ใบรับรองสมรรถนะ NFT บน TRON Blockchain — ตรวจสอบได้ตลอด ไม่มีวันหมดอายุ
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/50 rounded-lg p-2">
                    <div className="font-bold">ผ่านทุกโมดูล</div>
                    <div className="text-[10px] opacity-60">คะแนน ≥ {modules[0]?.passing_score || 60}%</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <div className="font-bold">Mint NFT</div>
                    <div className="text-[10px] opacity-60">อัตโนมัติ on-chain</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <div className="font-bold">ตรวจสอบได้</div>
                    <div className="text-[10px] opacity-60">TronScan Verify</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Sessions + Enroll */}
          <div className="space-y-6">
            {/* Open Sessions */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                รุ่นที่เปิดรับสมัคร
              </h2>

              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session: any) => {
                    const isOpen = session.status === 'open';
                    const start = new Date(session.start_date);
                    const end = new Date(session.end_date);
                    const daysUntil = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={session.id} className={`rounded-lg border p-4 ${isOpen ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-800">
                            {session.session_code || `รุ่นที่ ${session.batch_number || '-'}`}
                          </span>
                          {isOpen ? (
                            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                              เปิดรับ
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                              {session.status === 'planned' ? 'เร็วๆ นี้' : session.status}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>📅 {start.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {session.start_date !== session.end_date && (
                              <> — {end.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })}</>
                            )}
                          </p>
                          <p>📍 {session.location || 'มทร.ล้านนา'} {session.room && `(${session.room})`}</p>
                          <p>👥 รับ {session.max_participants} คน</p>
                          {daysUntil > 0 && daysUntil <= 60 && (
                            <p className="text-orange-600 font-medium">อีก {daysUntil} วัน</p>
                          )}
                          {session.registration_close && (
                            <p className="text-red-500 text-[10px]">
                              ปิดรับ: {new Date(session.registration_close).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีรุ่นที่เปิด</p>
              )}
            </div>

            {/* Enrollment Form */}
            <EnrollForm
              courseCode={course.code}
              courseTitle={course.title_th}
              sessions={sessions.map((s: any) => ({
                id: s.id,
                label: s.session_code || `รุ่นที่ ${s.batch_number || '-'}`,
                start_date: s.start_date,
                end_date: s.end_date,
                location: s.location,
                status: s.status,
                max_participants: s.max_participants,
              }))}
              pricing={{
                student: course.fee_student || 0,
                internal: course.fee_internal || 0,
                external: course.fee_external || 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
