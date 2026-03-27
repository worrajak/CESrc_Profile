import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getAreaData(id: string) {
  // Get the research area
  const { data: area } = await supabase
    .from('research_areas')
    .select('*')
    .eq('id', id)
    .single();

  if (!area) return null;

  // Search publications by keywords matching area name
  const searchTerms = area.name_en.toLowerCase().split(/[&,]/).map((s: string) => s.trim()).filter(Boolean);

  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  // Filter publications that match research area keywords
  const matchedPubs = (publications || []).filter((pub: any) => {
    const pubKeywords = (pub.keywords || []).map((k: string) => k.toLowerCase()).join(' ');
    const pubTitle = pub.title.toLowerCase();
    const pubJournal = (pub.journal_name || '').toLowerCase();
    const combined = `${pubKeywords} ${pubTitle} ${pubJournal}`;

    return searchTerms.some((term: string) =>
      combined.includes(term.toLowerCase())
    );
  });

  // Get researchers with matching expertise
  const { data: researchers } = await supabase
    .from('researchers')
    .select('*')
    .eq('is_active', true);

  const matchedResearchers = (researchers || []).filter((r: any) => {
    const expertise = (r.expertise || []).map((e: string) => e.toLowerCase()).join(' ');
    return searchTerms.some((term: string) =>
      expertise.includes(term.toLowerCase())
    );
  });

  return { area, publications: matchedPubs, researchers: matchedResearchers };
}

export default async function ResearchAreaPage({ params }: { params: { id: string } }) {
  const data = await getAreaData(params.id);
  if (!data) notFound();

  const { area, publications, researchers } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← กลับหน้าแรก
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{area.name_th}</h1>
        <p className="text-lg text-gray-500 mt-1">{area.name_en}</p>
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

      {/* Publications in this area */}
      {publications.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ผลงานตีพิมพ์ที่เกี่ยวข้อง ({publications.length})
          </h2>
          <div className="space-y-4">
            {publications.map((pub: any) => (
              <div key={pub.id} className="bg-white rounded-lg p-5 shadow-sm border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{pub.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{pub.authors_raw}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">{pub.journal_name}</span>
                      {pub.volume && `, Vol. ${pub.volume}`}
                      {pub.issue && `(${pub.issue})`}
                      {pub.pages && `, ${pub.pages}`}
                      {` (${pub.year})`}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {pub.scopus_indexed && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">Scopus</span>
                      )}
                      {pub.wos_indexed && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Web of Science</span>
                      )}
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          DOI: {pub.doi}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 whitespace-nowrap">{pub.year}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {publications.length === 0 && researchers.length === 0 && (
        <p className="text-gray-500 text-center py-10">ยังไม่มีข้อมูลในสาขานี้</p>
      )}
    </div>
  );
}
