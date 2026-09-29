import { supabase } from '@/lib/supabase';
import { getServerLocale, st } from '@/lib/i18n-server';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getServerLocale();
  return {
    title: locale === 'en' ? 'Publications | CESRU - RMUTL' : 'ผลงานตีพิมพ์ | CESRU - RMUTL',
    description: locale === 'en'
      ? 'Publications of CESRU, RMUTL'
      : 'ผลงานตีพิมพ์ของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
  };
}

// Section order follows academic weighting: international before national,
// journal before conference. Within a section, newest year first.
//
// The bare 'journal' / 'conference' / 'report' types come from the OpenAlex
// and ORCID importers, which don't know whether a venue is international or
// national. They get their own sections rather than being folded into the
// international ones — otherwise the page would assert a scope nobody
// verified. Until they're reclassified they sit next to their scoped kin.
const pubTypeGroups = [
  { types: ['journal_international'], labelKey: 'publications.type.journal_international', color: 'border-blue-500', icon: 'bg-blue-600' },
  { types: ['journal'], labelKey: 'publications.type.journal', color: 'border-sky-400', icon: 'bg-sky-500' },
  { types: ['conference_international'], labelKey: 'publications.type.conference_international', color: 'border-purple-500', icon: 'bg-purple-600' },
  { types: ['conference'], labelKey: 'publications.type.conference', color: 'border-violet-400', icon: 'bg-violet-500' },
  { types: ['journal_national'], labelKey: 'publications.type.journal_national', color: 'border-green-500', icon: 'bg-green-600' },
  { types: ['conference_national'], labelKey: 'publications.type.conference_national', color: 'border-orange-500', icon: 'bg-orange-600' },
  { types: ['book_chapter', 'book', 'technical_report', 'report', 'thesis', 'patent', 'petty_patent'], labelKey: 'publications.type.book', color: 'border-gray-500', icon: 'bg-gray-600' },
];

// Anything whose pub_type matches no group above still gets rendered, so a new
// importer value can never silently hide records the way 'journal' did.
const GROUPED_TYPES = new Set(pubTypeGroups.flatMap((g) => g.types));

export default async function PublicationsPage() {
  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  const pubs = publications || [];
  const locale = getServerLocale();

  // Bucket everything by year once; each year then renders its type sections.
  const byYear: Record<number, any[]> = {};
  pubs.forEach((p: any) => {
    const y = p.year || 0;
    (byYear[y] ||= []).push(p);
  });
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{st('publications.page_title', locale)}</h1>
      <p className="text-gray-500 mb-8">
        {locale === 'en'
          ? `Verified publications from Scopus, Web of Science, and DOI databases (${pubs.length} items)`
          : `ผลงานวิจัยที่ผ่านการยืนยันจากฐานข้อมูล Scopus, Web of Science และ DOI (${pubs.length} รายการ)`}
      </p>

      {/* Year is the outer grouping; inside each year the type sections keep
          the order defined by pubTypeGroups (intl journal → intl conference →
          natl journal → natl conference → books). */}
      {years.map((year) => {
        const inYear = byYear[year];
        const ungrouped = inYear.filter((p: any) => !GROUPED_TYPES.has(p.pub_type));
        // A year with no renderable item would otherwise show a bare heading.
        if (inYear.length === 0) return null;

        return (
        <section key={year} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200">
            {year}
          </h2>

          {pubTypeGroups.map((group) => {
            const items = byYear[year]
              .filter((p: any) => group.types.includes(p.pub_type))
              // Stable order within a year+type bucket.
              .sort((a: any, b: any) =>
                String(a.title || '').localeCompare(String(b.title || ''), 'th'),
              );
            if (items.length === 0) return null;

            return (
              <div key={group.labelKey} className="mb-7">
                <h3 className={`text-base font-semibold text-gray-700 mb-3 pb-1.5 border-b-2 ${group.color} flex items-center gap-2`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${group.icon}`}></span>
                  {st(group.labelKey, locale)}
                  <span className="text-sm font-normal text-gray-400">({items.length})</span>
                </h3>

                <div className="space-y-4">
                  {items.map((pub: any) => (
                    <div key={pub.id} className="bg-white rounded-lg shadow-sm p-5 border hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-gray-900 flex-1">{pub.title}</h4>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">{pub.authors_raw}</p>

                      <p className="text-sm text-gray-500 mt-1">
                        {pub.journal_name && <span className="italic">{pub.journal_name}</span>}
                        {pub.volume && <span>, vol. {pub.volume}</span>}
                        {pub.issue && <span>, no. {pub.issue}</span>}
                        {pub.pages && <span>, {pub.pages}</span>}
                        <span>, {pub.year}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {pub.doi && (
                          <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline">
                            DOI: {pub.doi}
                          </a>
                        )}
                        {pub.scopus_indexed && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Scopus</span>}
                        {pub.wos_indexed && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Web of Science</span>}
                      </div>

                      {pub.keywords && pub.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pub.keywords.map((kw: string, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {ungrouped.length > 0 && (
            <div className="mb-7">
              <h3 className="text-base font-semibold text-gray-700 mb-3 pb-1.5 border-b-2 border-gray-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                {locale === 'en' ? 'Other' : 'อื่นๆ'}
                <span className="text-sm font-normal text-gray-400">({ungrouped.length})</span>
              </h3>
              <div className="space-y-4">
                {ungrouped.map((pub: any) => (
                  <div key={pub.id} className="bg-white rounded-lg shadow-sm p-5 border">
                    <h4 className="font-semibold text-gray-900">{pub.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{pub.authors_raw}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pub.journal_name && <span className="italic">{pub.journal_name}</span>}
                      <span>, {pub.year}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        );
      })}
    </div>
  );
}
