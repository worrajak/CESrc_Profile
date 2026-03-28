import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'ผลงานตีพิมพ์ | CESRU - RMUTL',
  description: 'ผลงานตีพิมพ์ของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const pubTypeGroups = [
  { types: ['journal_international'], label: 'วารสารนานาชาติ (International Journal)', color: 'border-blue-500', icon: 'bg-blue-600', badge: 'bg-blue-50 text-blue-700' },
  { types: ['journal_national'], label: 'วารสารในประเทศ (National Journal)', color: 'border-green-500', icon: 'bg-green-600', badge: 'bg-green-50 text-green-700' },
  { types: ['conference_international'], label: 'การประชุมนานาชาติ (International Conference)', color: 'border-purple-500', icon: 'bg-purple-600', badge: 'bg-purple-50 text-purple-700' },
  { types: ['conference_national'], label: 'การประชุมในประเทศ (National Conference)', color: 'border-orange-500', icon: 'bg-orange-600', badge: 'bg-orange-50 text-orange-700' },
  { types: ['book_chapter', 'book', 'technical_report', 'thesis', 'patent', 'petty_patent'], label: 'อื่นๆ (Others)', color: 'border-gray-500', icon: 'bg-gray-600', badge: 'bg-gray-50 text-gray-700' },
];

export default async function PublicationsPage() {
  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  const pubs = publications || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ผลงานตีพิมพ์</h1>
      <p className="text-gray-500 mb-8">
        ผลงานวิจัยที่ผ่านการยืนยันจากฐานข้อมูล Scopus, Web of Science และ DOI ({pubs.length} รายการ)
      </p>

      {pubTypeGroups.map((group) => {
        const items = pubs
          .filter((p: any) => group.types.includes(p.pub_type))
          .sort((a: any, b: any) => b.year - a.year);
        if (items.length === 0) return null;

        // Group by year
        const byYear: Record<number, any[]> = {};
        items.forEach((p: any) => {
          const y = p.year || 0;
          if (!byYear[y]) byYear[y] = [];
          byYear[y].push(p);
        });
        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

        return (
          <section key={group.label} className="mb-10">
            <h2 className={`text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 ${group.color} flex items-center gap-2`}>
              <span className={`w-2.5 h-2.5 rounded-full ${group.icon}`}></span>
              {group.label}
              <span className="text-sm font-normal text-gray-400">({items.length})</span>
            </h2>

            {years.map((year) => (
              <div key={year} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 ml-1">{year}</h3>
                <div className="space-y-4">
                  {byYear[year].map((pub: any) => (
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
            ))}
          </section>
        );
      })}
    </div>
  );
}
