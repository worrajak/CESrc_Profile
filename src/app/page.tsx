import { supabase } from '@/lib/supabase';
import ScholarNews from '@/components/ScholarNews';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getHomeData() {
  const [researchersRes, pubCountRes, grantCountRes, newsRes, sessionsRes] = await Promise.all([
    supabase
      .from('researchers')
      .select('*')
      .eq('is_active', true)
      .order('unit_role', { ascending: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
    supabase.from('grants').select('id', { count: 'exact', head: true }),
    supabase
      .from('news')
      .select(`
        *,
        news_images (id, image_url, caption, sort_order),
        researchers:author_id (title_th, first_name_th, last_name_th)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(5),
    // ดึงรุ่นอบรมที่กำลังเปิด/วางแผน พร้อมข้อมูลหลักสูตร
    supabase
      .from('training_sessions')
      .select(`
        *,
        training_courses (
          code, title_th, title_en, description_th,
          skill_domain, level, duration_hours, duration_days,
          fee_external, fee_student, grants_credential_level, image_url
        )
      `)
      .in('status', ['open', 'planned'])
      .order('start_date', { ascending: true })
      .limit(4),
  ]);

  return {
    researchers: researchersRes.data || [],
    pubCount: pubCountRes.count || 0,
    grantCount: grantCountRes.count || 0,
    news: newsRes.data || [],
    sessions: sessionsRes.data || [],
  };
}

const DOMAIN_ICONS: Record<string, string> = {
  solar_pv: '☀️', ev_charger: '🔌', battery: '🔋',
  energy_audit: '📊', microgrid: '⚡',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'เริ่มต้น', intermediate: 'กลาง',
  advanced: 'สูง', professional: 'วิชาชีพ',
};

const NFT_LABELS: Record<string, { label: string; icon: string }> = {
  LEVEL_2: { label: 'Bronze NFT', icon: '🥉' },
  LEVEL_3: { label: 'Silver NFT', icon: '🥈' },
  LEVEL_4: { label: 'Gold NFT', icon: '🥇' },
  LEVEL_5: { label: 'Diamond NFT', icon: '💎' },
};

export default async function HomePage() {
  const { researchers, pubCount, grantCount, news, sessions } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Image src="/logo-cesru.jpeg" alt="CESRU Logo" width={80} height={80} className="mx-auto mb-3 rounded-xl bg-white p-1.5 shadow-lg" />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Clean Energy System Research Unit
          </h1>
          <p className="text-blue-200 text-sm">หน่วยวิจัยระบบพลังงานสะอาด</p>
          <p className="text-blue-300 text-xs">
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
          </p>

          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{researchers.length}</div>
              <div className="text-xs text-blue-200">นักวิจัย</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{pubCount}</div>
              <div className="text-xs text-blue-200">ผลงานตีพิมพ์</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {researchers.reduce((sum: number, r: any) => sum + (r.cited_by_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-200">Citations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{grantCount}</div>
              <div className="text-xs text-blue-200">ทุนวิจัย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Training */}
      {sessions.length > 0 && (
        <section className="bg-gradient-to-b from-purple-50 to-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
                หลักสูตรอบรมเร็วๆ นี้
              </h2>
              <Link href="/services/training" className="text-purple-600 hover:text-purple-800 text-sm">
                ดูหลักสูตรทั้งหมด →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sessions.map((session: any) => {
                const course = session.training_courses;
                if (!course) return null;
                const nft = course.grants_credential_level ? NFT_LABELS[course.grants_credential_level] : null;
                const isOpen = session.status === 'open';
                const startDate = new Date(session.start_date);
                const endDate = new Date(session.end_date);
                const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={session.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition group">
                    {/* Color Banner */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white relative">
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{DOMAIN_ICONS[course.skill_domain] || '📚'}</span>
                        {isOpen ? (
                          <span className="text-[10px] bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            เปิดรับสมัคร
                          </span>
                        ) : (
                          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                            เร็วๆ นี้
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm mt-1 leading-tight line-clamp-2">{course.title_th}</h3>
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📅</span>
                        <span>
                          {startDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          {session.start_date !== session.end_date && (
                            <> — {endDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</>
                          )}
                        </span>
                        {daysUntil > 0 && daysUntil <= 30 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                            อีก {daysUntil} วัน
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      {session.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📍</span>
                          <span>{session.location}</span>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {course.duration_days && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {course.duration_days} วัน ({course.duration_hours} ชม.)
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {LEVEL_LABELS[course.level] || course.level}
                        </span>
                        {session.batch_number && (
                          <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                            รุ่นที่ {session.batch_number}
                          </span>
                        )}
                      </div>

                      {/* NFT Badge */}
                      {nft && (
                        <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-200">
                          <span className="text-sm">{nft.icon}</span>
                          <div>
                            <div className="text-[10px] font-bold text-amber-700">ผ่านแล้วได้ {nft.label}</div>
                            <div className="text-[9px] text-amber-500">ใบรับรองบน Blockchain</div>
                          </div>
                        </div>
                      )}

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {course.fee_external > 0 ? `${Number(course.fee_external).toLocaleString()} บาท` : 'ฟรี'}
                          </div>
                          {course.fee_student > 0 && course.fee_student !== course.fee_external && (
                            <div className="text-[10px] text-gray-400">นศ. {Number(course.fee_student).toLocaleString()} บาท</div>
                          )}
                        </div>
                        <Link
                          href={`/services/training/${course.code}`}
                          className={`text-[10px] px-3 py-1.5 rounded-lg font-medium transition ${
                            isOpen
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {isOpen ? 'ดูรายละเอียด & สมัคร' : 'ดูรายละเอียด'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* News & IEEE Spectrum */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: CESrc News */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                ข่าวสารและกิจกรรม
              </h2>
              <Link href="/news" className="text-blue-600 hover:text-blue-800 text-sm">
                ดูทั้งหมด →
              </Link>
            </div>

            {news.length > 0 ? (
              <div className="space-y-3">
                {news.map((item: any) => (
                  <Link key={item.id} href={`/news/${item.id}`} className="block group">
                    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md hover:border-blue-300 transition p-3 flex gap-4">
                      {item.cover_image_url && (
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.content.replace(/[#*_`]/g, '').substring(0, 100)}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(item.published_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center border">
                <p className="text-gray-400 text-sm">ยังไม่มีข่าวสาร</p>
              </div>
            )}
          </div>

          {/* Right: IEEE Spectrum News */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-600 rounded-full"></span>
              IEEE Spectrum News
            </h2>
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 border border-green-100">
              <ScholarNews />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
