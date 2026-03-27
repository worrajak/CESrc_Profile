import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

const roleLabel: Record<string, string> = {
  first_author: 'First Author',
  corresponding_author: 'Corresponding Author',
  co_author: 'Co-Author',
  last_author: 'Last Author',
};

const roleLabelTh: Record<string, string> = {
  first_author: 'ผู้แต่งหลัก',
  corresponding_author: 'ผู้รับผิดชอบบทความ',
  co_author: 'ผู้แต่งร่วม',
  last_author: 'ผู้แต่งอาวุโส',
};

const grantRoleLabel: Record<string, string> = {
  pi: 'หัวหน้าโครงการ',
  co_pi: 'ผู้ร่วมโครงการ',
  researcher: 'นักวิจัย',
  consultant: 'ที่ปรึกษา',
};

async function getResearcher(id: string) {
  const { data: researcher } = await supabase
    .from('researchers')
    .select('*')
    .eq('id', id)
    .single();

  if (!researcher) return null;

  const { data: publications } = await supabase
    .from('publication_authors')
    .select(`
      author_role,
      author_order,
      is_corresponding,
      publications (*)
    `)
    .eq('researcher_id', id)
    .order('author_order', { ascending: true });

  const { data: grants } = await supabase
    .from('grant_members')
    .select(`
      role,
      grants (*)
    `)
    .eq('researcher_id', id);

  return { researcher, publications: publications || [], grants: grants || [] };
}

export default async function ResearcherProfilePage({ params }: { params: { id: string } }) {
  const data = await getResearcher(params.id);
  if (!data) notFound();

  const { researcher: r, publications, grants } = data;
  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en
    ? `${r.title_en || ''} ${r.first_name_en} ${r.last_name_en || ''}`
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <Link href="/researchers" className="hover:text-blue-600">นักวิจัย</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{r.first_name_th} {r.last_name_th}</span>
      </nav>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {r.first_name_th.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{fullNameTh}</h1>
            {fullNameEn && <p className="text-lg text-gray-500 mt-1">{fullNameEn.trim()}</p>}

            {r.position_th && <p className="text-blue-600 font-medium mt-2">{r.position_th}</p>}

            <p className="text-gray-600 mt-1">
              {r.department}, {r.faculty}
            </p>
            <p className="text-gray-500 text-sm">{r.university}, {r.campus}</p>

            {r.email && (
              <p className="text-gray-600 mt-3">
                <span className="font-medium">Email:</span> {r.email}
              </p>
            )}
            {r.orcid_id && (
              <p className="text-gray-600">
                <span className="font-medium">ORCID:</span>{' '}
                <a href={`https://orcid.org/${r.orcid_id}`} target="_blank" className="text-blue-600 hover:underline">
                  {r.orcid_id}
                </a>
              </p>
            )}

            {/* CV Download */}
            <div className="mt-4 flex gap-3">
              <a
                href={`/api/cv/${r.id}?format=ieee`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Download CV (IEEE)
              </a>
              <a
                href={`/api/cv/${r.id}?format=apa`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Download CV (APA)
              </a>
            </div>
          </div>
        </div>

        {/* Expertise */}
        {r.expertise && r.expertise.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-3">สาขาความเชี่ยวชาญ</h3>
            <div className="flex flex-wrap gap-2">
              {r.expertise.map((exp: string, i: number) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publications */}
      {publications.length > 0 && (
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ผลงานตีพิมพ์ ({publications.length})
          </h2>
          <div className="space-y-6">
            {publications.map((pa: any, idx: number) => {
              const pub = pa.publications;
              if (!pub) return null;
              const role = pa.author_role;
              const roleColors: Record<string, string> = {
                first_author: 'bg-green-100 text-green-800',
                corresponding_author: 'bg-yellow-100 text-yellow-800',
                last_author: 'bg-purple-100 text-purple-800',
                co_author: 'bg-gray-100 text-gray-700',
              };
              return (
                <div key={pub.id} className="border-l-4 border-blue-400 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{pub.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${roleColors[role] || roleColors.co_author}`}>
                      {roleLabelTh[role] || role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{pub.authors_raw}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {pub.journal_name && <span className="italic">{pub.journal_name}</span>}
                    {pub.volume && <span>, vol. {pub.volume}</span>}
                    {pub.issue && <span>, no. {pub.issue}</span>}
                    {pub.pages && <span>, {pub.pages}</span>}
                    <span>, {pub.year}</span>
                  </p>
                  {pub.doi && (
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" className="text-sm text-blue-600 hover:underline">
                      DOI: {pub.doi}
                    </a>
                  )}
                  <div className="flex gap-2 mt-1">
                    {pub.scopus_indexed && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Scopus</span>}
                    {pub.wos_indexed && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">WoS</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grants */}
      {grants.length > 0 && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ทุนวิจัย / โครงการวิจัย ({grants.length})
          </h2>
          <div className="space-y-6">
            {grants.map((gm: any) => {
              const g = gm.grants;
              if (!g) return null;
              return (
                <div key={g.id} className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-semibold text-gray-900">{g.title_th}</h3>
                  {g.title_en && <p className="text-sm text-gray-500">{g.title_en}</p>}
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">แหล่งทุน:</span> {g.funding_agency}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                      {grantRoleLabel[gm.role] || gm.role}
                    </span>
                    {g.budget && <span>งบประมาณ: {Number(g.budget).toLocaleString()} บาท</span>}
                    {g.contract_number && <span>สัญญา: {g.contract_number}</span>}
                    {g.fiscal_year && <span>ปีงบประมาณ: {g.fiscal_year}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
