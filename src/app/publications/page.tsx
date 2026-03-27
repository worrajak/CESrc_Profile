import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'ผลงานตีพิมพ์ | CESRU - RMUTL',
  description: 'ผลงานตีพิมพ์ของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
};

const typeLabels: Record<string, string> = {
  journal_international: 'วารสารนานาชาติ',
  journal_national: 'วารสารในประเทศ',
  conference_international: 'ประชุมวิชาการนานาชาติ',
  conference_national: 'ประชุมวิชาการในประเทศ',
  book_chapter: 'บทในหนังสือ',
  book: 'หนังสือ/ตำรา',
};

export default async function PublicationsPage() {
  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false });

  const pubs = publications || [];

  // Group by year
  const byYear: Record<number, typeof pubs> = {};
  pubs.forEach(p => {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  });
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ผลงานตีพิมพ์</h1>
      <p className="text-gray-500 mb-8">
        ผลงานวิจัยที่ผ่านการยืนยันจากฐานข้อมูล Scopus, Web of Science และ DOI ({pubs.length} รายการ)
      </p>

      {years.map(year => (
        <section key={year} className="mb-10">
          <h2 className="text-xl font-bold text-blue-700 mb-4 pb-2 border-b border-blue-200">
            {year}
          </h2>
          <div className="space-y-6">
            {byYear[year].map((pub: any, idx: number) => (
              <div key={pub.id} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 flex-1">{pub.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                    {typeLabels[pub.pub_type] || pub.pub_type}
                  </span>
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
        </section>
      ))}
    </div>
  );
}
