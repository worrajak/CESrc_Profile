import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { st, getServerLocale } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const TYPE_COLOR: Record<string, string> = {
  petty_patent: 'bg-amber-100 text-amber-800 border-amber-300',
  patent: 'bg-violet-100 text-violet-800 border-violet-300',
  copyright: 'bg-blue-100 text-blue-800 border-blue-300',
  trademark: 'bg-pink-100 text-pink-800 border-pink-300',
  trade_secret: 'bg-gray-100 text-gray-700 border-gray-300',
  prototype: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

const STATUS_COLOR: Record<string, string> = {
  concept: 'bg-gray-100 text-gray-600',
  filed: 'bg-amber-100 text-amber-700',
  granted: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-red-100 text-red-600',
  abandoned: 'bg-gray-100 text-gray-500',
};

export default async function InnovationsPage() {
  const locale = getServerLocale();
  const { data: items } = await supabase
    .from('cesru_innovations')
    .select(`
      id, title_th, title_en, short_desc_th, short_desc_en,
      innovation_type, ip_number, filing_date, grant_date, status,
      cover_image_url, image_urls, license_fee_thb, license_type,
      contact_researcher_id, inventor_ids
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const all = items || [];

  // Look up contact researchers
  const contactIds = Array.from(new Set(all.map((it: any) => it.contact_researcher_id).filter(Boolean)));
  let researcherMap: Record<string, any> = {};
  if (contactIds.length > 0) {
    const { data: rs } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, email, phone, avatar_url')
      .in('id', contactIds);
    (rs || []).forEach((r: any) => (researcherMap[r.id] = r));
  }

  const fmtTHB = (n: number | null) => {
    if (n == null) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M ฿`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K ฿`;
    return `${n.toFixed(0)} ฿`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-900 to-rose-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <p className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-2">CESRU IP Portfolio</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{st('innov.title', locale)}</h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-6">{st('innov.subtitle', locale)}</p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <Stat label={locale === 'en' ? 'Total' : 'รายการทั้งหมด'} value={all.length} color="amber" />
            <Stat label={locale === 'en' ? 'Granted' : 'ได้รับอนุมัติ'} value={all.filter((i: any) => i.status === 'granted').length} color="emerald" />
            <Stat label={locale === 'en' ? 'Filed' : 'ยื่นคำขอ'} value={all.filter((i: any) => i.status === 'filed').length} color="yellow" />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {all.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-5xl mb-3">💡</div>
            <h2 className="text-lg font-semibold text-gray-700">{st('innov.empty.title', locale)}</h2>
            <p className="text-sm text-gray-500 mt-1">{st('innov.empty.subtitle', locale)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {all.map((it: any) => {
              const contact = it.contact_researcher_id ? researcherMap[it.contact_researcher_id] : null;
              const title = locale === 'en' && it.title_en ? it.title_en : it.title_th;
              const desc = locale === 'en' && it.short_desc_en ? it.short_desc_en : it.short_desc_th;
              return (
                <Link key={it.id} href={`/innovations/${it.id}`} className="block group">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-amber-300 overflow-hidden transition-all duration-300 flex flex-col h-full">
                    {/* Cover */}
                    {it.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.cover_image_url} alt={title}
                        className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform" />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-5xl">💡</div>
                    )}

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${TYPE_COLOR[it.innovation_type] || ''}`}>
                          {st(`innov.type.${it.innovation_type}` as any, locale)}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_COLOR[it.status] || ''}`}>
                          {st(`innov.status.${it.status}` as any, locale)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-3 mb-1 min-h-[3.5rem]">
                        {title}
                      </h3>
                      {it.ip_number && (
                        <p className="text-[11px] text-gray-500 font-mono mb-2">
                          {st('innov.field.ip_number', locale)}: {it.ip_number}
                        </p>
                      )}
                      {desc && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{desc}</p>
                      )}

                      <div className="mt-auto space-y-2 pt-2 border-t border-gray-100">
                        {/* License value */}
                        {it.license_fee_thb && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">{st('innov.field.license_fee', locale)}</span>
                            <span className="text-xs font-bold text-emerald-700">{fmtTHB(it.license_fee_thb)}</span>
                          </div>
                        )}
                        {/* Contact */}
                        {contact && (
                          <div className="flex items-center gap-2 text-[11px]">
                            {contact.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={contact.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
                                {(contact.first_name_th || contact.first_name_en || '?').charAt(0)}
                              </div>
                            )}
                            <span className="text-gray-600 truncate">
                              {locale === 'en' && contact.first_name_en
                                ? `${contact.first_name_en} ${contact.last_name_en || ''}`
                                : `${contact.title_th || ''}${contact.first_name_th || ''} ${contact.last_name_th || ''}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    yellow: 'text-yellow-300',
  };
  return (
    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
