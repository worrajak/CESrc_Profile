'use client';

import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'reviewing', label: 'กำลังพิจารณา', color: 'bg-blue-100 text-blue-700' },
  { value: 'approved', label: 'อนุมัติ', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'ไม่อนุมัติ', color: 'bg-red-100 text-red-700' },
  { value: 'assigned', label: 'มอบหมาย', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'in_progress', label: 'ดำเนินการ', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'ยกเลิก', color: 'bg-gray-100 text-gray-500' },
];

const SERVICE_TYPE_MAP: Record<string, string> = {
  training: '🎓 ฝึกอบรม',
  consulting: '💡 ที่ปรึกษา',
  design_install: '⚡ ออกแบบ',
  inspection: '🔍 ตรวจสอบ',
};

interface ServiceRequest {
  id: string;
  tracking_code: string;
  service_type: string;
  requester_name: string;
  requester_org: string | null;
  requester_email: string;
  title: string;
  status: string;
  created_at: string;
  num_participants: number | null;
}

export default function AdminServicesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', note: '' });
  const [updating, setUpdating] = useState(false);

  // Course Creation via AI
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [parsingCourse, setParsingCourse] = useState(false);
  const [parsedCourse, setParsedCourse] = useState<any>(null);
  const courseFileRef = useRef<HTMLInputElement>(null);
  const [aiProviders, setAiProviders] = useState<{provider: string; name: string; models: string[]}[]>([]);
  const [selProvider, setSelProvider] = useState('');
  const [selModel, setSelModel] = useState('');

  useEffect(() => {
    fetchRequests();
    // Load AI providers
    fetch('/api/services/parse-course').then(r => r.json()).then(async (d) => {
      const provs = d.providers instanceof Promise ? await d.providers : d.providers;
      if (Array.isArray(provs) && provs.length > 0) {
        setAiProviders(provs);
        setSelProvider(provs[0].provider);
        setSelModel(provs[0].models?.[0] || '');
      }
    }).catch(() => {});
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/services';
      if (filter !== 'all') url += `?status=${filter}`;

      // Direct Supabase call (client-side)
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      let query = supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setRequests(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !statusUpdate.status) return;
    setUpdating(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // Update request status (with verification)
      const { data: updated, error: updateErr } = await supabase
        .from('service_requests')
        .update({ status: statusUpdate.status })
        .eq('id', selectedRequest.id)
        .select()
        .single();
      if (updateErr) {
        alert('อัปเดตสถานะไม่สำเร็จ: ' + updateErr.message);
        return;
      }
      if (updated && updated.status !== statusUpdate.status) {
        alert(`เตือน: status ที่บันทึกไม่ตรงกับที่ส่ง\nส่ง: ${statusUpdate.status}\nDB: ${updated.status}`);
      }

      // Add timeline entry
      const { error: timelineErr } = await supabase.from('service_timeline').insert({
        request_id: selectedRequest.id,
        status: statusUpdate.status,
        note: statusUpdate.note || `สถานะเปลี่ยนเป็น ${STATUS_OPTIONS.find(s => s.value === statusUpdate.status)?.label}`,
        actor: 'Admin',
      });
      if (timelineErr) {
        console.warn('Timeline insert failed:', timelineErr.message);
      }

      setSelectedRequest(null);
      setStatusUpdate({ status: '', note: '' });
      fetchRequests();
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  // AI Course Document Parsing
  const handleParseCourse = async () => {
    if (!courseFile) return;
    setParsingCourse(true);
    setParsedCourse(null);

    try {
      const formData = new FormData();
      formData.append('file', courseFile);
      if (selProvider) formData.append('ai_provider', selProvider);
      if (selModel) formData.append('ai_model', selModel);

      const res = await fetch('/api/services/parse-course', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setParsedCourse(data);
      }
    } catch (err) {
      console.error('Course parse error:', err);
    } finally {
      setParsingCourse(false);
    }
  };

  const handleSaveParsedCourse = async () => {
    if (!parsedCourse?.course) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const course = parsedCourse.course;

      // Insert course
      const { data: courseData, error: courseError } = await supabase
        .from('training_courses')
        .insert({
          code: 'AI-' + Date.now().toString(36).toUpperCase(),
          title_th: course.title,
          title_en: course.title_en || null,
          description_th: course.description,
          level: course.level || 'intermediate',
          duration_hours: course.total_hours,
          duration_days: Math.ceil(course.total_hours / 6),
          is_active: true,
        })
        .select()
        .single();

      if (courseError || !courseData) {
        alert('ไม่สามารถบันทึกหลักสูตรได้');
        return;
      }

      // Insert modules with competencies and indicators
      for (const mod of course.modules || []) {
        const { data: moduleData } = await supabase
          .from('course_modules')
          .insert({
            course_id: courseData.id,
            module_number: mod.module_number,
            title: mod.title,
            description: mod.description,
            hours: mod.hours,
            is_practical: mod.is_practical || false,
          })
          .select()
          .single();

        if (moduleData) {
          // Insert competencies
          for (const comp of mod.competencies || []) {
            const { data: compData } = await supabase
              .from('module_competencies')
              .insert({
                module_id: moduleData.id,
                name: comp.name,
                description: comp.description,
              })
              .select()
              .single();

            if (compData) {
              // Insert indicators with rubrics
              for (const ind of comp.indicators || []) {
                await supabase.from('competency_indicators').insert({
                  competency_id: compData.id,
                  name: ind.name,
                  weight: ind.weight || 25,
                  rubric_excellent: ind.rubric_excellent,
                  rubric_good: ind.rubric_good,
                  rubric_fair: ind.rubric_fair,
                  rubric_poor: ind.rubric_poor,
                });
              }
            }
          }
        }
      }

      alert(`บันทึกหลักสูตร "${course.title}" สำเร็จ — ${course.modules?.length || 0} โมดูล`);
      setParsedCourse(null);
      setCourseFile(null);
      setShowCourseCreator(false);
    } catch (err) {
      console.error('Save course error:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">จัดการคำขอบริการ</h1>
          <p className="text-gray-500 text-sm">Admin Panel — อนุมัติ/มอบหมาย/ติดตามคำขอบริการวิชาการ</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/training" className="border border-purple-300 text-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition">
            📚 จัดการหลักสูตร
          </a>
          <button
            onClick={() => setShowCourseCreator(!showCourseCreator)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
          >
            📄 นำเข้าหลักสูตร (AI)
          </button>
        </div>
      </div>

      {/* AI Course Creator */}
      {showCourseCreator && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-purple-800 mb-2">📚 สร้างหลักสูตรจากเอกสาร (AI Auto-parse)</h3>
          <p className="text-xs text-purple-600 mb-3">
            อัพโหลดเล่มหลักสูตร กำหนดการอบรม หรือเอกสารหลักสูตร — AI จะแยกกำหนดการ โมดูล สมรรถนะ ตัวชี้วัด และเกณฑ์การวัดผลอัตโนมัติ
          </p>
          <p className="text-xs text-purple-500 mb-4">
            สำหรับ preview กำหนดการ/เกณฑ์ประเมินแบบเต็ม ใช้ <a href="/admin/training" className="underline font-medium">หน้าจัดการหลักสูตร</a>
          </p>
          {/* AI Provider */}
          {aiProviders.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {aiProviders.map(p => (
                <button key={p.provider} onClick={() => { setSelProvider(p.provider); setSelModel(p.models?.[0] || ''); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${selProvider === p.provider ? 'bg-purple-600 text-white' : 'bg-white border text-purple-700'}`}>
                  {p.name}
                </button>
              ))}
              {(aiProviders.find(p => p.provider === selProvider)?.models || []).length > 0 && (
                <select value={selModel} onChange={e => setSelModel(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-xs bg-white">
                  {(aiProviders.find(p => p.provider === selProvider)?.models || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="flex gap-3 mb-4">
            <input
              ref={courseFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-medium"
            />
            <button
              onClick={handleParseCourse}
              disabled={!courseFile || parsingCourse}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
            >
              {parsingCourse ? 'AI กำลังวิเคราะห์...' : 'AI แยกหลักสูตร'}
            </button>
          </div>

          {/* Parsed Course Preview */}
          {parsedCourse?.course && (
            <div className="bg-white rounded-xl border p-6 mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{parsedCourse.course.title}</h4>
                  {parsedCourse.course.title_en && (
                    <p className="text-sm text-gray-400">{parsedCourse.course.title_en}</p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>แหล่ง: {parsedCourse.source}</p>
                  <p>{parsedCourse.stats?.modules} โมดูล · {parsedCourse.stats?.competencies} สมรรถนะ · {parsedCourse.stats?.indicators} ตัวชี้วัด</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">{parsedCourse.course.description}</p>

              <div className="flex gap-3 text-xs">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{parsedCourse.course.total_hours} ชม.</span>
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">{parsedCourse.course.level}</span>
              </div>

              {/* Modules */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-700 text-sm">โมดูล:</h5>
                {parsedCourse.course.modules?.map((mod: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        M{mod.module_number}
                      </span>
                      <span className="font-medium text-gray-800 text-sm">{mod.title}</span>
                      <span className="text-[10px] text-gray-400">{mod.hours} ชม. {mod.is_practical ? '(ปฏิบัติ)' : '(ทฤษฎี)'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{mod.description}</p>

                    {/* Competencies */}
                    {mod.competencies?.map((comp: any, ci: number) => (
                      <div key={ci} className="ml-4 mb-2">
                        <p className="text-xs font-medium text-indigo-700">🎯 {comp.name}</p>
                        {comp.indicators?.map((ind: any, ii: number) => (
                          <div key={ii} className="ml-4 mt-1 text-[10px] text-gray-500">
                            <p className="font-medium text-gray-600">📏 {ind.name} (น้ำหนัก {ind.weight}%)</p>
                            <div className="grid grid-cols-4 gap-1 mt-1">
                              <span className="bg-green-50 p-1 rounded">4: {ind.rubric_excellent?.substring(0, 40)}...</span>
                              <span className="bg-blue-50 p-1 rounded">3: {ind.rubric_good?.substring(0, 40)}...</span>
                              <span className="bg-yellow-50 p-1 rounded">2: {ind.rubric_fair?.substring(0, 40)}...</span>
                              <span className="bg-red-50 p-1 rounded">1: {ind.rubric_poor?.substring(0, 40)}...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveParsedCourse}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  ✅ บันทึกหลักสูตรลง DB
                </button>
                <button
                  onClick={() => setParsedCourse(null)}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ทั้งหมด ({requests.length})
        </button>
        {STATUS_OPTIONS.slice(0, 6).map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
              filter === s.value ? 'bg-indigo-600 text-white' : `${s.color} hover:opacity-80`
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">กำลังโหลด...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📋</div>
            <p>ยังไม่มีคำขอบริการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">รหัส</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">หัวข้อ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ผู้ขอ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusInfo = STATUS_OPTIONS.find(s => s.value === req.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">{req.tracking_code}</td>
                      <td className="px-4 py-3 text-xs">{SERVICE_TYPE_MAP[req.service_type] || req.service_type}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 truncate max-w-[200px]">{req.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{req.requester_name}</div>
                        <div className="text-[10px] text-gray-400">{req.requester_org || req.requester_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setStatusUpdate({ status: req.status, note: '' });
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-1">อัพเดทสถานะ</h3>
            <p className="text-sm text-gray-400 mb-4">
              {selectedRequest.tracking_code} — {selectedRequest.title}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะใหม่</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  value={statusUpdate.note}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {updating ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
