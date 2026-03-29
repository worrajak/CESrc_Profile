import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'นักศึกษา | CESRU - RMUTL',
  description: 'รายชื่อนักศึกษาในกลุ่มวิจัย CESRU ทุกระดับ ป.ตรี ป.โท ป.เอก',
};

const degreeLabel: Record<string, string> = {
  bachelor: 'ป.ตรี',
  master: 'ป.โท',
  doctoral: 'ป.เอก',
};

const degreeColor: Record<string, string> = {
  bachelor: 'bg-blue-100 text-blue-800',
  master: 'bg-purple-100 text-purple-800',
  doctoral: 'bg-red-100 text-red-800',
};

const statusLabel: Record<string, string> = {
  active: 'กำลังศึกษา',
  graduated: 'สำเร็จการศึกษา',
  withdrawn: 'พ้นสภาพ',
  on_leave: 'ลาพักการศึกษา',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  graduated: 'bg-gray-100 text-gray-700',
  withdrawn: 'bg-red-100 text-red-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
};

async function getStudentsData() {
  // Fetch students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('degree_level', { ascending: true })
    .order('status', { ascending: true })
    .order('enrollment_year', { ascending: false });

  // Fetch thesis info with advisor
  const { data: theses } = await supabase
    .from('theses')
    .select(`
      id, student_id, title_th, title_en, status, degree_level,
      thesis_committee (
        researcher_id, committee_role,
        researchers (title_th, first_name_th, last_name_th)
      )
    `);

  // Fetch project groups with topics
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select(`
      student_id, role,
      project_groups (
        id, project_name_th, status, grade,
        project_topics (
          title_th, advisor_id,
          researchers:advisor_id (title_th, first_name_th, last_name_th)
        )
      )
    `);

  return {
    students: students || [],
    theses: theses || [],
    projectMembers: projectMembers || [],
  };
}

export default async function StudentsPage() {
  const { students, theses, projectMembers } = await getStudentsData();

  // Build thesis map: student_id -> thesis info
  const thesisMap: Record<string, any> = {};
  theses.forEach((t: any) => {
    const advisor = t.thesis_committee?.find((tc: any) => tc.committee_role === 'main_advisor');
    thesisMap[t.student_id] = {
      title: t.title_th || t.title_en,
      status: t.status,
      advisor: advisor?.researchers
        ? `${advisor.researchers.title_th}${advisor.researchers.first_name_th} ${advisor.researchers.last_name_th}`
        : null,
    };
  });

  // Build project map: student_id -> project info
  const projectMap: Record<string, any> = {};
  projectMembers.forEach((pm: any) => {
    const pg = pm.project_groups;
    const pt = pg?.project_topics;
    const advisor = pt?.researchers;
    projectMap[pm.student_id] = {
      title: pg?.project_name_th || pt?.title_th,
      status: pg?.status,
      grade: pg?.grade,
      advisor: advisor
        ? `${advisor.title_th}${advisor.first_name_th} ${advisor.last_name_th}`
        : null,
    };
  });

  // Group students by degree level
  const groups: Record<string, any[]> = { doctoral: [], master: [], bachelor: [] };
  students.forEach((s: any) => {
    if (groups[s.degree_level]) {
      groups[s.degree_level].push(s);
    }
  });

  const degreeOrder = [
    { key: 'doctoral', label: 'ระดับปริญญาเอก (Doctoral)', icon: '🎓', border: 'border-red-500' },
    { key: 'master', label: 'ระดับปริญญาโท (Master)', icon: '📘', border: 'border-purple-500' },
    { key: 'bachelor', label: 'ระดับปริญญาตรี (Bachelor)', icon: '📗', border: 'border-blue-500' },
  ];

  const totalActive = students.filter((s: any) => s.status === 'active').length;
  const totalGraduated = students.filter((s: any) => s.status === 'graduated').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">นักศึกษา</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">นักศึกษาในกลุ่มวิจัย</h1>
        <p className="text-gray-600 mt-2">
          รายชื่อนักศึกษาที่ทำโครงงาน/วิทยานิพนธ์กับนักวิจัย CESRU
        </p>
        <div className="flex gap-4 mt-4">
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold text-green-700">{totalActive}</span>
            <span className="text-sm text-green-600 ml-2">กำลังศึกษา</span>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold text-gray-700">{totalGraduated}</span>
            <span className="text-sm text-gray-600 ml-2">สำเร็จการศึกษา</span>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold text-blue-700">{students.length}</span>
            <span className="text-sm text-blue-600 ml-2">ทั้งหมด</span>
          </div>
        </div>
      </div>

      {/* Student Groups */}
      <div className="space-y-8">
        {degreeOrder.map(({ key, label, icon, border }) => {
          const items = groups[key] || [];
          if (items.length === 0) return null;

          return (
            <section key={key} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className={`text-xl font-bold text-gray-800 mb-4 pb-3 border-b-2 ${border} flex items-center gap-2`}>
                <span>{icon}</span>
                {label}
                <span className="text-sm font-normal text-gray-400">({items.length})</span>
              </h2>
              <div className="space-y-4">
                {items.map((s: any) => {
                  const workInfo = s.degree_level === 'bachelor'
                    ? projectMap[s.id]
                    : thesisMap[s.id];

                  return (
                    <div key={s.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:border-blue-400 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-3 flex-1">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {s.first_name_th.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {s.title_th}{s.first_name_th} {s.last_name_th}
                              {s.student_code && (
                                <span className="text-xs text-gray-400 ml-2">({s.student_code})</span>
                              )}
                            </h3>
                            {s.first_name_en && (
                              <p className="text-xs text-gray-500">
                                {s.title_en || ''} {s.first_name_en} {s.last_name_en || ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${degreeColor[s.degree_level]}`}>
                            {degreeLabel[s.degree_level]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[s.status]}`}>
                            {statusLabel[s.status]}
                          </span>
                          {s.enrollment_year && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              เข้าศึกษา {s.enrollment_year}
                            </span>
                          )}
                          {s.graduation_year && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              จบ {s.graduation_year}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Work info */}
                      {workInfo && (
                        <div className="mt-2 ml-13 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">
                              {s.degree_level === 'bachelor' ? 'โครงงาน: ' : 'วิทยานิพนธ์: '}
                            </span>
                            {workInfo.title}
                          </p>
                          {workInfo.advisor && (
                            <p className="text-xs text-gray-500">
                              อาจารย์ที่ปรึกษา: {workInfo.advisor}
                            </p>
                          )}
                          {workInfo.grade && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              เกรด: {workInfo.grade}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Program */}
                      {s.program_th && (
                        <p className="text-xs text-gray-400 mt-1 ml-13">
                          หลักสูตร: {s.program_th}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">👨‍🎓</p>
          <p className="text-lg">ยังไม่มีข้อมูลนักศึกษา</p>
          <p className="text-sm mt-2">เพิ่มข้อมูลได้ที่หน้า <Link href="/admin/students" className="text-blue-600 hover:underline">Admin</Link></p>
        </div>
      )}
    </div>
  );
}
