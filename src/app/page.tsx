import { supabase } from '@/lib/supabase';
import ScholarNews from '@/components/ScholarNews';
import ExecutiveHero, { ExecutiveSummary, HomeKpi } from '@/components/home/ExecutiveHero';
import ActivityStream from '@/components/home/ActivityStream';
import Link from 'next/link';
import { getServerLocale, st } from '@/lib/i18n-server';
import { getLocalizedField } from '@/lib/translations';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getHomeData() {
  const [
    newsRes,
    sessionsRes,
    topPubsRes,
    activeGrantsRes,
    kpiRes,
    cacheRes,
  ] = await Promise.all([
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
    // Top featured publications: latest year + most-cited within recent 5 years
    supabase
      .from('publications')
      .select('id, title, journal_name, year, doi, pub_type, cited_by_count, is_open_access, keywords')
      .gte('year', new Date().getFullYear() - 4)
      .order('cited_by_count', { ascending: false, nullsFirst: false })
      .order('year', { ascending: false })
      .limit(8),
    // Active grants
    supabase
      .from('grants')
      .select('id, title_th, title_en, funding_agency, budget, fiscal_year, start_date, end_date, status')
      .eq('status', 'active')
      .order('fiscal_year', { ascending: false })
      .limit(4),
    // Executive overview — KPI summary (migration 050)
    supabase.from('cesru_kpi_summary').select('*').maybeSingle(),
    // AI executive summary cache (may be empty / stale)
    supabase
      .from('cesru_homepage_cache')
      .select('*')
      .eq('id', 'executive_summary')
      .maybeSingle(),
  ]);

  // Hand the cached summary to the client component only if it is still fresh.
  // A stale or missing row makes the client fetch /api/homepage/executive-summary on mount.
  const cached = cacheRes.data;
  const fresh =
    cached &&
    cached.expires_at &&
    new Date(cached.expires_at).getTime() > Date.now() &&
    cached.summary_th
      ? ({
          summary_th: cached.summary_th,
          summary_en: cached.summary_en,
          evidence_chain: cached.evidence_chain || [],
          source: cached.source,
          model: cached.model,
          generated_at: cached.generated_at,
          cached: true,
        } as ExecutiveSummary)
      : null;

  const kpi = (kpiRes.data || {}) as HomeKpi;

  return {
    news: newsRes.data || [],
    sessions: sessionsRes.data || [],
    topPubs: topPubsRes.data || [],
    activeGrants: activeGrantsRes.data || [],
    kpi,
    executiveSummary: fresh,
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

const PUB_TYPE_BADGE: Record<string, { th: string; en: string; color: string }> = {
  journal_international: { th: 'วารสาร Intl', en: 'Intl. Journal', color: 'bg-blue-100 text-blue-700' },
  journal_national: { th: 'วารสาร', en: 'Journal', color: 'bg-green-100 text-green-700' },
  conference_international: { th: 'Conference Intl', en: 'Intl. Conf.', color: 'bg-purple-100 text-purple-700' },
  conference_national: { th: 'Conference', en: 'Conference', color: 'bg-orange-100 text-orange-700' },
  journal: { th: 'วารสาร', en: 'Journal', color: 'bg-blue-100 text-blue-700' },
  conference: { th: 'Conference', en: 'Conference', color: 'bg-purple-100 text-purple-700' },
  book_chapter: { th: 'บทในหนังสือ', en: 'Book Chapter', color: 'bg-amber-100 text-amber-700' },
  book: { th: 'หนังสือ', en: 'Book', color: 'bg-amber-100 text-amber-700' },
  patent: { th: 'สิทธิบัตร', en: 'Patent', color: 'bg-rose-100 text-rose-700' },
  petty_patent: { th: 'อนุสิทธิบัตร', en: 'Petty Patent', color: 'bg-rose-100 text-rose-700' },
};

export default async function HomePage() {
  const { news, sessions, topPubs, activeGrants, kpi, executiveSummary } = await getHomeData();
  const locale = getServerLocale();

  // Tagline for ExecutiveHero (replaces old hero subtitle block)
  const tagline =
    locale === 'en'
      ? st('home.hero.affiliation', locale)
      : `${st('home.hero.subtitle_th', locale)} • ${st('home.hero.affiliation', locale)}`;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Hero — Executive AI Overview (replaces previous hero) */}
      <ExecutiveHero
        initial={executiveSummary}
        kpi={kpi}
        tagline={tagline}
        locale={locale === 'en' ? 'en' : 'th'}
      />

      {/* Recent Activity — derived from publications/patents/grants/innovations */}
      <ActivityStream locale={locale === 'en' ? 'en' : 'th'} limit={7} />

      {/* News & IEEE Spectrum — moved above Featured Research so visitors see latest activity first */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                    📰 CESRU News
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                  {st('home.news.title', locale)}
                </h2>
              </div>
              <Link href="/news" className="text-cyan-600 hover:text-cyan-800 text-sm font-medium inline-flex items-center gap-1">
                {st('common.view_all', locale)} →
              </Link>
            </div>

            {news.length > 0 ? (
              <div className="space-y-3">
                {news.map((item: any) => (
                  <Link key={item.id} href={`/news/${item.id}`} className="block group">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-cyan-300 transition-all duration-300 p-3 flex gap-4">
                      {item.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.content.replace(/[#*_`]/g, '').substring(0, 100)}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(item.published_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                <p className="text-gray-400 text-sm">{st('home.news.empty', locale)}</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                🌐 {st('home.energy_trends.global', locale)}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-lime-700 bg-clip-text text-transparent mb-4">
              {st('home.spectrum.title', locale)}
            </h2>
            <div className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
              <ScholarNews />
            </div>
          </div>
        </div>
      </section>

      {/* Featured CESRU Publications — Compact cards */}
      {topPubs.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  ⚡ {st('home.featured.badge', locale)}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                {st('home.featured.title', locale)}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{st('home.featured.subtitle', locale)}</p>
            </div>
            <Link href="/publications" className="text-emerald-600 hover:text-emerald-800 text-xs font-medium inline-flex items-center gap-1">
              {st('home.featured.see_all', locale)} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {topPubs.slice(0, 8).map((pub: any) => {
              const badge = PUB_TYPE_BADGE[pub.pub_type] || PUB_TYPE_BADGE.journal;
              return (
                <a
                  key={pub.id}
                  href={pub.doi ? `https://doi.org/${pub.doi}` : '/publications'}
                  target={pub.doi ? '_blank' : undefined}
                  rel={pub.doi ? 'noopener noreferrer' : undefined}
                  className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>
                        {locale === 'en' ? badge.en : badge.th}
                      </span>
                      {pub.cited_by_count > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-600">
                          ⭐ {pub.cited_by_count}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm leading-snug line-clamp-3 mb-2">
                      {pub.title}
                    </h3>

                    {pub.journal_name && (
                      <p className="text-[11px] text-gray-500 italic line-clamp-1 mb-1">{pub.journal_name}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-medium text-gray-600">{pub.year}</span>
                      <div className="flex items-center gap-1.5">
                        {pub.is_open_access && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">OA</span>
                        )}
                        {pub.doi && (
                          <span className="text-[9px] text-emerald-600 group-hover:underline">DOI ↗</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Research Grants — Compact */}
      {activeGrants.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 pb-8">
          <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  💰 {st('grants.section.active', locale)}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 via-amber-700 to-orange-700 bg-clip-text text-transparent">
                {st('home.grants.title', locale)}
              </h2>
            </div>
            <Link href="/grants" className="text-amber-700 hover:text-amber-900 text-xs font-medium inline-flex items-center gap-1">
              {st('home.grants.see_all', locale)} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeGrants.map((g: any) => {
              const title = locale === 'en' && g.title_en ? g.title_en : g.title_th;
              return (
                <Link
                  key={g.id}
                  href={`/grants/${g.id}`}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all p-3.5"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors text-sm leading-snug line-clamp-2 mb-2">
                    {title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">{g.funding_agency}</p>
                  <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                    {g.budget && (
                      <div>
                        <div className="text-sm font-bold text-amber-700">
                          {(Number(g.budget) / 1_000_000).toFixed(1)}M
                        </div>
                        <div className="text-[9px] text-gray-400">{st('home.grants.budget', locale)}</div>
                      </div>
                    )}
                    {g.fiscal_year && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">{g.fiscal_year}</div>
                        <div className="text-[9px] text-gray-400">FY</div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Training */}
      {sessions.length > 0 && (
        <section className="relative border-y border-slate-200 bg-gradient-to-b from-violet-50/50 to-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    📅 {st('home.training.badge', locale)}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">
                  {st('home.training.title', locale)}
                </h2>
              </div>
              <Link href="/services/training" className="text-violet-600 hover:text-violet-800 text-sm font-medium inline-flex items-center gap-1">
                {st('common.view_all', locale)}
                <span>→</span>
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
                  <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-violet-300 transition-all duration-300 group">
                    <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-4 py-3 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-[length:200%_100%] animate-gradient"></div>
                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{DOMAIN_ICONS[course.skill_domain] || '📚'}</span>
                          {isOpen ? (
                            <span className="text-[10px] bg-lime-400 text-lime-950 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              {st('home.training.open_for_registration', locale)}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {st('home.training.coming_soon', locale)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm mt-1 leading-tight line-clamp-2">{getLocalizedField(course, 'title', locale)}</h3>
                      </div>
                    </div>

                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📅</span>
                        <span>
                          {startDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short' })}
                          {session.start_date !== session.end_date && (
                            <> — {endDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short' })}</>
                          )}
                        </span>
                        {daysUntil > 0 && daysUntil <= 30 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                            {locale === 'en' ? `in ${daysUntil} days` : `อีก ${daysUntil} วัน`}
                          </span>
                        )}
                      </div>

                      {session.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📍</span>
                          <span>{session.location}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {course.duration_days && (
                          <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded">
                            {course.duration_days} {locale === 'en' ? `day${course.duration_days > 1 ? 's' : ''}` : 'วัน'} ({course.duration_hours} {locale === 'en' ? 'hrs' : 'ชม.'})
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {LEVEL_LABELS[course.level] || course.level}
                        </span>
                        {session.batch_number && (
                          <span className="text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">
                            {locale === 'en' ? `Batch ${session.batch_number}` : `รุ่น ${session.batch_number}`}
                          </span>
                        )}
                      </div>

                      {nft && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg px-2 py-1.5 border border-amber-200">
                          <span className="text-sm">{nft.icon}</span>
                          <div>
                            <div className="text-[10px] font-bold text-amber-700">{locale === 'en' ? `Earn ${nft.label}` : `ได้ ${nft.label}`}</div>
                            <div className="text-[9px] text-amber-600">Blockchain Certificate</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {course.fee_external > 0 ? `${Number(course.fee_external).toLocaleString()} ฿` : st('home.training.free', locale)}
                          </div>
                          {course.fee_student > 0 && course.fee_student !== course.fee_external && (
                            <div className="text-[10px] text-gray-400">{locale === 'en' ? `Student ${Number(course.fee_student).toLocaleString()} ฿` : `นศ. ${Number(course.fee_student).toLocaleString()} ฿`}</div>
                          )}
                        </div>
                        <Link
                          href={`/services/training/${course.code}`}
                          className={`text-[10px] px-3 py-1.5 rounded-lg font-medium transition ${
                            isOpen
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {isOpen ? st('home.training.register_now', locale) : st('common.see_details', locale)}
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

    </div>
  );
}
