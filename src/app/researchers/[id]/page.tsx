import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
      publications!inner (*)
    `)
    .eq('researcher_id', id)
    .order('year', { referencedTable: 'publications', ascending: false });

  const { data: grants } = await supabase
    .from('grant_members')
    .select(`
      role,
      grants (*)
    `)
    .eq('researcher_id', id);

  // Fetch thesis students (ป.โท/เอก) with publications from thesis
  const { data: thesisStudents } = await supabase
    .from('thesis_committee')
    .select(`
      committee_role,
      theses (
        id, title_th, title_en, status, degree_level, academic_year,
        students (id, title_th, first_name_th, last_name_th, degree_level, status, student_code, enrollment_year),
        thesis_publications (
          publications (id, title, year, doi, journal_name, pub_type)
        )
      )
    `)
    .eq('researcher_id', id)
    .in('committee_role', ['main_advisor', 'co_advisor']);

  // Fetch project students (ป.ตรี) with publications
  const { data: projectTopics } = await supabase
    .from('project_topics')
    .select(`
      id, title_th, title_en, status, topic_level, academic_year,
      project_groups (
        id, status, grade, actual_end_date,
        project_members (
          role,
          students (id, title_th, first_name_th, last_name_th, degree_level, status, student_code, enrollment_year)
        ),
        project_publications (
          publications (id, title, year, doi, journal_name, pub_type)
        )
      )
    `)
    .eq('advisor_id', id);

  // Fetch PhD advisor (if researcher is pursuing PhD)
  let phdAdvisor = null;
  if (researcher.phd_advisor_id) {
    const { data } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th')
      .eq('id', researcher.phd_advisor_id)
      .single();
    phdAdvisor = data;
  }

  // Fetch PhD students that this researcher advises
  const { data: phdAdvisees } = await supabase
    .from('researchers')
    .select('id, title_th, first_name_th, last_name_th, unit_role, phd_program, phd_start_year')
    .eq('phd_advisor_id', id);

  return {
    researcher,
    publications: publications || [],
    grants: grants || [],
    thesisStudents: thesisStudents || [],
    projectTopics: projectTopics || [],
    phdAdvisor,
    phdAdvisees: phdAdvisees || [],
  };
}

export default async function ResearcherProfilePage({ params }: { params: { id: string } }) {
  const data = await getResearcher(params.id);
  if (!data) notFound();

  const { researcher: r, publications, grants, thesisStudents, projectTopics, phdAdvisor, phdAdvisees } = data;
  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en
    ? `${r.title_en || ''} ${r.first_name_en} ${r.last_name_en || ''}`
    : '';

  // Build student data for sidebar
  const studentSidebarData = (() => {
    const degreeLabel: Record<string, string> = { bachelor: 'ป.ตรี', master: 'ป.โท', doctoral: 'ป.เอก' };
    const degreeColor: Record<string, string> = {
      bachelor: 'bg-blue-100 text-blue-800', master: 'bg-purple-100 text-purple-800', doctoral: 'bg-red-100 text-red-800',
    };
    const statusLabel: Record<string, string> = {
      active: 'กำลังศึกษา', graduated: 'สำเร็จการศึกษา', withdrawn: 'พ้นสภาพ', on_leave: 'ลาพัก',
    };

    const items: any[] = [];

    // Thesis students (ป.โท/เอก)
    thesisStudents.filter((tc: any) => tc.theses?.students).forEach((tc: any) => {
      const t = tc.theses;
      const s = t.students;
      const pubs = (t.thesis_publications || [])
        .map((tp: any) => tp.publications)
        .filter(Boolean);
      items.push({
        id: s.id,
        name: `${s.title_th}${s.first_name_th} ${s.last_name_th}`,
        degree: t.degree_level,
        degreeLabel: degreeLabel[t.degree_level],
        degreeColor: degreeColor[t.degree_level],
        status: s.status,
        statusLabel: statusLabel[s.status],
        enrollmentYear: s.enrollment_year,
        thesisTitle: t.title_th || t.title_en,
        role: tc.committee_role === 'main_advisor' ? 'ที่ปรึกษาหลัก' : 'ที่ปรึกษาร่วม',
        publications: pubs,
        type: 'thesis',
      });
    });

    // Project students (ป.ตรี)
    projectTopics.forEach((pt: any) => {
      pt.project_groups?.forEach((pg: any) => {
        const pubs = (pg.project_publications || [])
          .map((pp: any) => pp.publications)
          .filter(Boolean);
        pg.project_members?.forEach((pm: any) => {
          if (!pm.students) return;
          const s = pm.students;
          items.push({
            id: s.id,
            name: `${s.title_th}${s.first_name_th} ${s.last_name_th}`,
            degree: 'bachelor',
            degreeLabel: degreeLabel.bachelor,
            degreeColor: degreeColor.bachelor,
            status: s.status,
            statusLabel: statusLabel[s.status],
            enrollmentYear: s.enrollment_year,
            thesisTitle: pt.title_th || pt.title_en,
            role: 'ที่ปรึกษา',
            grade: pg.grade,
            publications: pubs,
            type: 'project',
          });
        });
      });
    });

    // Sort: active first, then by enrollment year desc
    items.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return (b.enrollmentYear || 0) - (a.enrollmentYear || 0);
    });

    return items;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <Link href="/researchers" className="hover:text-blue-600">นักวิจัย</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{r.first_name_th} {r.last_name_th}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Main Content */}
      <div className="flex-1 min-w-0">

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {r.avatar_url ? (
            <img src={r.avatar_url} alt={fullNameTh} className="w-24 h-24 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {r.first_name_th.charAt(0)}
            </div>
          )}
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
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">{r.email}</a>
              </p>
            )}

            {/* Identifier Badges */}
            {(r.orcid_id || r.openalex_id || r.scopus_id || r.google_scholar) && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {r.orcid_id && (
                  <a href={`https://orcid.org/${r.orcid_id}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs text-emerald-800 transition group">
                    <svg viewBox="0 0 256 256" className="w-4 h-4">
                      <path d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z" fill="#A6CE39"/>
                      <path d="M86.3,186.2H70.9V79.1h15.4v107.1z M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1C84.2,46.7,88.7,51.3,88.7,56.8z" fill="#FFF"/>
                    </svg>
                    <span className="font-medium">ORCID</span>
                    <span className="font-mono text-[10px] text-emerald-600 group-hover:text-emerald-800">{r.orcid_id}</span>
                  </a>
                )}
                {r.openalex_id && (
                  <a href={`https://openalex.org/${r.openalex_id}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs text-blue-800 transition group">
                    <span className="font-bold text-sm">OA</span>
                    <span className="font-medium">OpenAlex</span>
                    <span className="font-mono text-[10px] text-blue-600 group-hover:text-blue-800">{r.openalex_id}</span>
                  </a>
                )}
                {r.scopus_id && (
                  <a href={`https://www.scopus.com/authid/detail.uri?authorId=${r.scopus_id}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs text-orange-800 transition">
                    <span className="font-bold">S</span>
                    <span className="font-medium">Scopus</span>
                  </a>
                )}
                {r.google_scholar && (
                  <a href={r.google_scholar} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg text-xs text-violet-800 transition">
                    <span className="font-bold">G</span>
                    <span className="font-medium">Scholar</span>
                  </a>
                )}
              </div>
            )}

            {/* Citation Stats */}
            {(r.cited_by_count > 0 || r.h_index > 0) && (
              <div className="flex items-center gap-6 mt-4 p-3 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg">
                {r.cited_by_count > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{r.cited_by_count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Citations</p>
                  </div>
                )}
                {r.h_index > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{r.h_index}</p>
                    <p className="text-xs text-gray-500">H-index</p>
                  </div>
                )}
                {r.i10_index > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{r.i10_index}</p>
                    <p className="text-xs text-gray-500">i10-index</p>
                  </div>
                )}
                {publications.length > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{publications.length}</p>
                    <p className="text-xs text-gray-500">Publications</p>
                  </div>
                )}
              </div>
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

        {/* PhD Status: This researcher is pursuing PhD */}
        {(r.is_pursuing_phd || r.unit_role === 'phd_student') && phdAdvisor && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🎓 <span>กำลังศึกษาปริญญาเอก</span>
            </h3>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
              <p className="text-xs text-gray-500">อาจารย์ที่ปรึกษาวิทยานิพนธ์</p>
              <Link href={`/researchers/${phdAdvisor.id}`}
                className="text-base font-semibold text-pink-700 hover:text-pink-900 hover:underline">
                {phdAdvisor.title_th}{phdAdvisor.first_name_th} {phdAdvisor.last_name_th}
              </Link>
              {(r.phd_program || r.phd_university || r.phd_start_year) && (
                <div className="mt-2 text-sm text-gray-600">
                  {r.phd_program && <p><span className="text-gray-400">หลักสูตร:</span> {r.phd_program}</p>}
                  {r.phd_university && <p><span className="text-gray-400">สถาบัน:</span> {r.phd_university}</p>}
                  {r.phd_start_year && <p><span className="text-gray-400">เริ่มศึกษา:</span> {r.phd_start_year + 543} ({r.phd_start_year})</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PhD Advisees: This researcher advises PhD students */}
        {phdAdvisees && phdAdvisees.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👨‍🎓 <span>นักศึกษา ป.เอก ในความดูแล ({phdAdvisees.length} คน)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {phdAdvisees.map((advisee: any) => (
                <Link key={advisee.id} href={`/researchers/${advisee.id}`}
                  className="block bg-white border border-pink-200 hover:border-pink-400 rounded-lg p-3 transition">
                  <p className="text-sm font-medium text-gray-800">
                    {advisee.title_th}{advisee.first_name_th} {advisee.last_name_th}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {advisee.unit_role === 'phd_student' ? 'นักศึกษาปริญญาเอก' : 'สมาชิก + นศ.ป.เอก'}
                    {advisee.phd_program && ` · ${advisee.phd_program}`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publications - grouped by type then year */}
      {publications.length > 0 && (() => {
        const roleColors: Record<string, string> = {
          first_author: 'bg-green-100 text-green-800',
          corresponding_author: 'bg-yellow-100 text-yellow-800',
          last_author: 'bg-purple-100 text-purple-800',
          co_author: 'bg-gray-100 text-gray-700',
        };

        const pubTypeGroups = [
          { types: ['journal_international'], label: 'วารสารนานาชาติ (International Journal)', color: 'border-blue-500', icon: 'bg-blue-600' },
          { types: ['journal_national'], label: 'วารสารในประเทศ (National Journal)', color: 'border-green-500', icon: 'bg-green-600' },
          { types: ['conference_international'], label: 'การประชุมนานาชาติ (International Conference)', color: 'border-purple-500', icon: 'bg-purple-600' },
          { types: ['conference_national'], label: 'การประชุมในประเทศ (National Conference)', color: 'border-orange-500', icon: 'bg-orange-600' },
          { types: ['book_chapter', 'book', 'technical_report', 'thesis', 'patent', 'petty_patent'], label: 'อื่นๆ (Others)', color: 'border-gray-500', icon: 'bg-gray-600' },
        ];

        const renderPub = (pa: any) => {
          const pub = pa.publications;
          const role = pa.author_role;
          return (
            <div key={pub.id} className="border-l-4 border-blue-300 pl-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900 text-sm">{pub.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${roleColors[role] || roleColors.co_author}`}>
                  {roleLabelTh[role] || role}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{pub.authors_raw}</p>
              <p className="text-xs text-gray-500 mt-1">
                {pub.journal_name && <span className="italic">{pub.journal_name}</span>}
                {pub.volume && <span>, vol. {pub.volume}</span>}
                {pub.issue && <span>, no. {pub.issue}</span>}
                {pub.pages && <span>, {pub.pages}</span>}
                <span>, {pub.year}</span>
              </p>
              {pub.doi && (
                <a href={`https://doi.org/${pub.doi}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                  DOI: {pub.doi}
                </a>
              )}
              <div className="flex gap-2 mt-1">
                {pub.scopus_indexed && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Scopus</span>}
                {pub.wos_indexed && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">WoS</span>}
              </div>
            </div>
          );
        };

        return (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ผลงานตีพิมพ์ ({publications.length})
            </h2>
            <div className="space-y-8">
              {pubTypeGroups.map((group) => {
                const items = publications
                  .filter((pa: any) => pa.publications && group.types.includes(pa.publications.pub_type))
                  .sort((a: any, b: any) => (b.publications?.year || 0) - (a.publications?.year || 0));
                if (items.length === 0) return null;

                // Group by year within each type
                const byYear: Record<number, any[]> = {};
                items.forEach((pa: any) => {
                  const y = pa.publications.year || 0;
                  if (!byYear[y]) byYear[y] = [];
                  byYear[y].push(pa);
                });
                const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

                return (
                  <div key={group.label}>
                    <h3 className={`text-base font-bold text-gray-700 mb-3 pb-2 border-b-2 ${group.color} flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${group.icon}`}></span>
                      {group.label}
                      <span className="text-sm font-normal text-gray-400">({items.length})</span>
                    </h3>
                    <div className="space-y-5 ml-2">
                      {years.map((year) => (
                        <div key={year}>
                          <p className="text-sm font-semibold text-gray-500 mb-2">{year}</p>
                          <div className="space-y-3 ml-2">
                            {byYear[year].map(renderPub)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

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

      </div>{/* End Left Column */}

      {/* Right Sidebar - Students */}
      {studentSidebarData.length > 0 && (
        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-5 lg:sticky lg:top-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                {studentSidebarData.length}
              </span>
              นักศึกษาในที่ปรึกษา
            </h2>

            <div className="space-y-4">
              {studentSidebarData.map((item: any, idx: number) => (
                <div key={`${item.id}-${idx}`} className="border-l-3 border-indigo-300 pl-3 py-2">
                  {/* Student name + badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.degreeColor}`}>
                      {item.degreeLabel}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.statusLabel}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.name}
                  </h4>

                  {/* Thesis/Project title */}
                  <p className="text-xs text-gray-600 mt-1 leading-snug">
                    <span className="font-medium text-gray-500">
                      {item.type === 'thesis' ? 'วิทยานิพนธ์' : 'โครงงาน'}:
                    </span>{' '}
                    {item.thesisTitle}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-gray-400">
                    <span>{item.role}</span>
                    {item.enrollmentYear && <span>เข้าศึกษา {item.enrollmentYear}</span>}
                    {item.grade && <span className="text-green-600 font-medium">เกรด: {item.grade}</span>}
                  </div>

                  {/* Publications from this thesis/project */}
                  {item.publications && item.publications.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {item.publications.map((pub: any) => (
                        <div key={pub.id} className="bg-gray-50 rounded px-2 py-1.5">
                          <p className="text-[11px] text-gray-800 font-medium leading-snug line-clamp-2">
                            {pub.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {pub.journal_name && (
                              <span className="text-[10px] text-gray-500 italic truncate max-w-[140px]">
                                {pub.journal_name}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">{pub.year}</span>
                            {pub.doi && (
                              <a href={`https://doi.org/${pub.doi}`} target="_blank"
                                className="text-[10px] text-blue-500 hover:underline flex-shrink-0">
                                DOI
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t text-center">
              <Link href="/students" className="text-xs text-blue-600 hover:underline">
                ดูรายชื่อนักศึกษาทั้งหมด
              </Link>
            </div>
          </div>
        </aside>
      )}

      </div>{/* End flex row */}
    </div>
  );
}
