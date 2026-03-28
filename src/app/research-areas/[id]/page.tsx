import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const pubTypeGroups = [
  { types: ['journal_international'], label: 'วารสารนานาชาติ (International Journal)', color: 'border-blue-500', icon: 'bg-blue-600' },
  { types: ['journal_national'], label: 'วารสารในประเทศ (National Journal)', color: 'border-green-500', icon: 'bg-green-600' },
  { types: ['conference_international'], label: 'การประชุมนานาชาติ (International Conference)', color: 'border-purple-500', icon: 'bg-purple-600' },
  { types: ['conference_national'], label: 'การประชุมในประเทศ (National Conference)', color: 'border-orange-500', icon: 'bg-orange-600' },
  { types: ['book_chapter', 'book', 'technical_report', 'thesis', 'patent', 'petty_patent'], label: 'อื่นๆ (Others)', color: 'border-gray-500', icon: 'bg-gray-600' },
];

async function getAreaData(id: string) {
  const { data: area } = await supabase
    .from('research_areas')
    .select('*')
    .eq('id', id)
    .single();

  if (!area) return null;

  const searchTerms: string[] = (area.search_terms && area.search_terms.length > 0)
    ? area.search_terms.map((s: string) => s.toLowerCase())
    : area.name_en.toLowerCase().split(/[&,]/).map((s: string) => s.trim()).filter(Boolean);

  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  const matchedPubs = (publications || []).filter((pub: any) => {
    const pubKeywords = (pub.keywords || []).map((k: string) => k.toLowerCase()).join(' ');
    const pubTitle = pub.title.toLowerCase();
    const pubJournal = (pub.journal_name || '').toLowerCase();
    const pubAbstract = (pub.abstract || '').toLowerCase();
    const combined = `${pubKeywords} ${pubTitle} ${pubJournal} ${pubAbstract}`;
    return searchTerms.some((term: string) => combined.includes(term));
  });

  // Get publication authors with researcher info
  const pubIds = matchedPubs.map((p: any) => p.id);
  const { data: pubAuthors } = await supabase
    .from('publication_authors')
    .select('publication_id, author_order, researchers(id, title_th, first_name_th, last_name_th)')
    .in('publication_id', pubIds.length > 0 ? pubIds : ['none'])
    .order('author_order', { ascending: true });

  // Map publication_id -> linked researchers
  const pubResearcherMap: Record<string, any[]> = {};
  (pubAuthors || []).forEach((pa: any) => {
    if (!pa.researchers) return;
    if (!pubResearcherMap[pa.publication_id]) pubResearcherMap[pa.publication_id] = [];
    pubResearcherMap[pa.publication_id].push(pa.researchers);
  });

  // Get researchers with matching expertise
  const { data: researchers } = await supabase
    .from('researchers')
    .select('*')
    .eq('is_active', true);

  const matchedResearchers = (researchers || []).filter((r: any) => {
    const expertise = (r.expertise || []).map((e: string) => e.toLowerCase()).join(' ');
    return searchTerms.some((term: string) => expertise.includes(term));
  });

  return { area, publications: matchedPubs, researchers: matchedResearchers, pubResearcherMap };
}

export default async function ResearchAreaPage({ params }: { params: { id: string } }) {
  const data = await getAreaData(params.id);
  if (!data) notFound();

  const { area, publications, researchers, pubResearcherMap } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← กลับหน้าแรก
        </Link>
        <div className="flex items-center gap-3">
          {area.icon && <span className="text-4xl">{area.icon}</span>}
          <h1 className="text-3xl font-bold text-gray-800">{area.name_th}</h1>
        </div>
        <p className="text-lg text-gray-500 mt-1">{area.name_en}</p>
        {area.sdg_goals && area.sdg_goals.length > 0 && (
          <div className="flex gap-2 mt-2">
            {area.sdg_goals.map((sdg: string) => (
              <span key={sdg} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">{sdg}</span>
            ))}
          </div>
        )}
        {area.description_th && <p className="text-gray-600 mt-3">{area.description_th}</p>}
      </div>

      {/* Researchers in this area */}
      {researchers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            นักวิจัยในสาขานี้ ({researchers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchers.map((r: any) => (
              <Link
                key={r.id}
                href={`/researchers/${r.id}`}
                className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition block"
              >
                <p className="font-semibold text-gray-800">
                  {r.title_th}{r.first_name_th} {r.last_name_th}
                </p>
                <p className="text-sm text-gray-500">
                  {r.title_en} {r.first_name_en} {r.last_name_en}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(r.expertise || []).slice(0, 3).map((e: string, i: number) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {e}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Publications grouped by type then year */}
      {publications.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            ผลงานตีพิมพ์ที่เกี่ยวข้อง ({publications.length})
          </h2>

          {pubTypeGroups.map((group) => {
            const items = publications
              .filter((p: any) => group.types.includes(p.pub_type))
              .sort((a: any, b: any) => b.year - a.year);
            if (items.length === 0) return null;

            const byYear: Record<number, any[]> = {};
            items.forEach((p: any) => {
              const y = p.year || 0;
              if (!byYear[y]) byYear[y] = [];
              byYear[y].push(p);
            });
            const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

            return (
              <div key={group.label} className="mb-10">
                <h3 className={`text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 ${group.color} flex items-center gap-2`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${group.icon}`}></span>
                  {group.label}
                  <span className="text-sm font-normal text-gray-400">({items.length})</span>
                </h3>

                {years.map((year) => (
                  <div key={year} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3 ml-1">{year}</h4>
                    <div className="space-y-4">
                      {byYear[year].map((pub: any) => {
                        const linkedResearchers = pubResearcherMap[pub.id] || [];
                        return (
                          <div key={pub.id} className="bg-white rounded-lg shadow-sm p-5 border hover:shadow-md transition">
                            <h4 className="font-semibold text-gray-900">{pub.title}</h4>

                            <p className="text-sm text-gray-600 mt-2">{pub.authors_raw}</p>

                            {linkedResearchers.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {linkedResearchers.map((r: any) => (
                                  <Link
                                    key={r.id}
                                    href={`/researchers/${r.id}`}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-100 transition"
                                  >
                                    {r.title_th}{r.first_name_th} {r.last_name_th}
                                  </Link>
                                ))}
                              </div>
                            )}

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
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {publications.length === 0 && researchers.length === 0 && (
        <p className="text-gray-500 text-center py-10">ยังไม่มีข้อมูลในสาขานี้</p>
      )}
    </div>
  );
}
