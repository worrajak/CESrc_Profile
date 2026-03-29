'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const LEVEL_OPTIONS = [
  { value: 'bachelor', label: 'ป.ตรี (โครงงาน)' },
  { value: 'master', label: 'ป.โท (วิทยานิพนธ์)' },
  { value: 'doctoral', label: 'ป.เอก (วิทยานิพนธ์)' },
];

const TOPIC_STATUS_OPTIONS = [
  { value: 'open', label: 'เปิดรับ' },
  { value: 'reserved', label: 'จองแล้ว' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

const statusColor: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  reserved: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const levelColor: Record<string, string> = {
  bachelor: 'bg-blue-100 text-blue-800',
  master: 'bg-purple-100 text-purple-800',
  doctoral: 'bg-red-100 text-red-800',
};

interface TopicForm {
  title_th: string;
  title_en: string;
  description_th: string;
  topic_level: string;
  max_students: string;
  advisor_id: string;
  co_advisor_id: string;
  research_area_id: string;
  academic_year: string;
  semester: string;
  max_semesters: string;
  required_skills: string;
  status: string;
}

const emptyForm: TopicForm = {
  title_th: '', title_en: '', description_th: '',
  topic_level: 'bachelor', max_students: '2',
  advisor_id: '', co_advisor_id: '', research_area_id: '',
  academic_year: new Date().getFullYear() + 543 + '', semester: '1', max_semesters: '2',
  required_skills: '', status: 'open',
};

export default function AdminProjectsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [researchAreas, setResearchAreas] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<TopicForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'topics' | 'tokens'>('topics');
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    const pwd = sessionStorage.getItem('admin_pwd');
    if (auth === 'true' && pwd) {
      setAuthenticated(true);
      setPassword(pwd);
    }
  }, []);

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_pwd', password);
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const getSupabase = useCallback(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }, []);

  const fetchData = useCallback(async () => {
    const supabase = await getSupabase();
    const [topicsRes, resRes, areasRes, studentsRes, tokensRes] = await Promise.all([
      supabase.from('project_topics').select(`
        *,
        researchers:advisor_id (title_th, first_name_th, last_name_th),
        project_groups (
          id, status, grade,
          project_members (
            student_id,
            students (title_th, first_name_th, last_name_th)
          )
        )
      `).order('created_at', { ascending: false }),
      supabase.from('researchers').select('id, title_th, first_name_th, last_name_th').eq('is_active', true),
      supabase.from('research_areas').select('id, name_th').order('sort_order'),
      supabase.from('students').select('id, title_th, first_name_th, last_name_th, degree_level, status'),
      supabase.from('student_access_tokens').select(`
        *,
        students (title_th, first_name_th, last_name_th),
        researchers:granted_by (title_th, first_name_th, last_name_th)
      `).order('created_at', { ascending: false }),
    ]);
    setTopics(topicsRes.data || []);
    setResearchers(resRes.data || []);
    setResearchAreas(areasRes.data || []);
    setStudents(studentsRes.data || []);
    setTokens(tokensRes.data || []);
  }, [getSupabase]);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  const handleSaveTopic = async () => {
    if (!form.title_th || !form.advisor_id) {
      setMessage('กรุณากรอกชื่อหัวข้อและเลือกอาจารย์ที่ปรึกษา');
      return;
    }
    setSaving(true);
    const supabase = await getSupabase();

    const payload = {
      title_th: form.title_th,
      title_en: form.title_en || null,
      description_th: form.description_th || null,
      topic_level: form.topic_level,
      max_students: parseInt(form.max_students) || 2,
      advisor_id: form.advisor_id,
      co_advisor_id: form.co_advisor_id || null,
      research_area_id: form.research_area_id || null,
      academic_year: parseInt(form.academic_year) || null,
      semester: parseInt(form.semester) || null,
      max_semesters: parseInt(form.max_semesters) || 2,
      required_skills: form.required_skills ? form.required_skills.split(',').map(s => s.trim()) : null,
      status: form.status,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('project_topics').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('project_topics').insert(payload));
    }

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } else {
      setMessage(editingId ? 'แก้ไขสำเร็จ' : 'เพิ่มหัวข้อสำเร็จ');
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleEditTopic = (t: any) => {
    setForm({
      title_th: t.title_th, title_en: t.title_en || '', description_th: t.description_th || '',
      topic_level: t.topic_level, max_students: t.max_students?.toString() || '2',
      advisor_id: t.advisor_id, co_advisor_id: t.co_advisor_id || '',
      research_area_id: t.research_area_id || '',
      academic_year: t.academic_year?.toString() || '', semester: t.semester?.toString() || '1',
      max_semesters: t.max_semesters?.toString() || '2',
      required_skills: t.required_skills?.join(', ') || '', status: t.status,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    if (!confirm(`ลบหัวข้อ "${name}" ?`)) return;
    const supabase = await getSupabase();
    await supabase.from('project_topics').delete().eq('id', id);
    fetchData();
  };

  // Token management
  const [tokenForm, setTokenForm] = useState({ student_id: '', researcher_id: '' });

  const handleCreateToken = async () => {
    if (!tokenForm.student_id || !tokenForm.researcher_id) {
      setMessage('กรุณาเลือกนักศึกษาและอาจารย์');
      return;
    }
    const supabase = await getSupabase();
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from('student_access_tokens').insert({
      granted_by: tokenForm.researcher_id,
      student_id: tokenForm.student_id,
      access_token: token,
      can_post_news: true,
      can_upload_data: false,
      can_edit_project: true,
      is_active: true,
    });
    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } else {
      setMessage(`สร้าง Token สำเร็จ: ${token}`);
      setTokenForm({ student_id: '', researcher_id: '' });
      fetchData();
    }
  };

  const handleRevokeToken = async (id: string) => {
    if (!confirm('ยกเลิก Token นี้?')) return;
    const supabase = await getSupabase();
    await supabase.from('student_access_tokens').update({ is_active: false }).eq('id', id);
    fetchData();
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Admin - จัดการหัวข้อโครงงาน</h1>
        <input type="password" placeholder="รหัสผ่าน Admin" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border rounded-lg px-4 py-2 mb-3" />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const researcherName = (r: any) => r ? `${r.title_th}${r.first_name_th} ${r.last_name_th}` : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">หัวข้อโครงงาน & Token</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">จัดการหัวข้อโครงงาน / วิทยานิพนธ์</h1>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('topics')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'topics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          หัวข้อโครงงาน ({topics.length})
        </button>
        <button onClick={() => setTab('tokens')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'tokens' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Token นักศึกษา ({tokens.length})
        </button>
      </div>

      {/* ===== TOPICS TAB ===== */}
      {tab === 'topics' && (
        <>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4">
            {showForm ? 'ปิดฟอร์ม' : '+ เพิ่มหัวข้อ'}
          </button>

          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">{editingId ? 'แก้ไขหัวข้อ' : 'เพิ่มหัวข้อใหม่'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหัวข้อ (ไทย) *</label>
                  <input value={form.title_th} onChange={e => setForm({ ...form, title_th: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2" placeholder="ชื่อหัวข้อโครงงาน/วิทยานิพนธ์" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title (EN)</label>
                  <input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2" placeholder="English title" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด/ขอบเขตงาน</label>
                  <textarea value={form.description_th} onChange={e => setForm({ ...form, description_th: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 min-h-[100px]" placeholder="รายละเอียดของหัวข้อ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระดับ</label>
                  <select value={form.topic_level} onChange={e => setForm({ ...form, topic_level: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    {LEVEL_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน นศ.สูงสุด</label>
                  <input type="number" value={form.max_students} onChange={e => setForm({ ...form, max_students: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา *</label>
                  <select value={form.advisor_id} onChange={e => setForm({ ...form, advisor_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    <option value="">-- เลือกอาจารย์ --</option>
                    {researchers.map(r => (
                      <option key={r.id} value={r.id}>{researcherName(r)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษาร่วม</label>
                  <select value={form.co_advisor_id} onChange={e => setForm({ ...form, co_advisor_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    <option value="">-- ไม่มี --</option>
                    {researchers.map(r => (
                      <option key={r.id} value={r.id}>{researcherName(r)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิจัย</label>
                  <select value={form.research_area_id} onChange={e => setForm({ ...form, research_area_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    <option value="">-- ไม่ระบุ --</option>
                    {researchAreas.map(a => <option key={a.id} value={a.id}>{a.name_th}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                  <input type="number" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เทอม</label>
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3 (ฤดูร้อน)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2">
                    {TOPIC_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ทักษะที่ต้องการ (คั่นด้วย ,)</label>
                  <input value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2" placeholder="Python, MATLAB, PVsyst" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveTopic} disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มหัวข้อ'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
              </div>
            </div>
          )}

          {/* Topics list */}
          <div className="space-y-4">
            {topics.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor[t.topic_level] || ''}`}>
                        {LEVEL_OPTIONS.find(l => l.value === t.topic_level)?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[t.status] || ''}`}>
                        {TOPIC_STATUS_OPTIONS.find(s => s.value === t.status)?.label}
                      </span>
                      {t.academic_year && (
                        <span className="text-xs text-gray-500">ปีการศึกษา {t.academic_year}/{t.semester}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{t.title_th}</h3>
                    {t.title_en && <p className="text-sm text-gray-500">{t.title_en}</p>}
                    {t.description_th && <p className="text-sm text-gray-600 mt-1">{t.description_th}</p>}
                    <p className="text-sm text-gray-500 mt-2">
                      ที่ปรึกษา: {researcherName(t.researchers)}
                    </p>
                    {t.required_skills && t.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.required_skills.map((s: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                    {/* Show groups/students */}
                    {t.project_groups && t.project_groups.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200">
                        {t.project_groups.map((pg: any) => (
                          <div key={pg.id} className="text-sm text-gray-600">
                            <span className="font-medium">กลุ่ม:</span>{' '}
                            {pg.project_members?.map((pm: any) =>
                              pm.students ? `${pm.students.first_name_th} ${pm.students.last_name_th}` : ''
                            ).filter(Boolean).join(', ')}
                            {pg.grade && <span className="ml-2 text-green-600">(เกรด: {pg.grade})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleEditTopic(t)}
                      className="text-blue-600 hover:text-blue-800 text-sm">แก้ไข</button>
                    <button onClick={() => handleDeleteTopic(t.id, t.title_th)}
                      className="text-red-600 hover:text-red-800 text-sm">ลบ</button>
                  </div>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow">
                ยังไม่มีหัวข้อโครงงาน
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== TOKENS TAB ===== */}
      {tab === 'tokens' && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">ออก Token ให้นักศึกษา</h2>
            <p className="text-sm text-gray-500 mb-4">
              อาจารย์ออก Token ให้ นศ. ใช้โพสต์ข่าว/กิจกรรมเอง
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ผู้ให้สิทธิ์</label>
                <select value={tokenForm.researcher_id} onChange={e => setTokenForm({ ...tokenForm, researcher_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- เลือกอาจารย์ --</option>
                  {researchers.map(r => (
                    <option key={r.id} value={r.id}>{researcherName(r)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">นักศึกษา</label>
                <select value={tokenForm.student_id} onChange={e => setTokenForm({ ...tokenForm, student_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- เลือกนักศึกษา --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title_th}{s.first_name_th} {s.last_name_th}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleCreateToken}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  สร้าง Token
                </button>
              </div>
            </div>
          </div>

          {/* Tokens list */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">นักศึกษา</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Token</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">ออกโดย</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">สิทธิ์</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">สถานะ</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tokens.map((tk: any) => (
                  <tr key={tk.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {tk.students ? `${tk.students.title_th}${tk.students.first_name_th} ${tk.students.last_name_th}` : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{tk.access_token}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {tk.researchers ? `${tk.researchers.first_name_th} ${tk.researchers.last_name_th}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {tk.can_post_news && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">ข่าว</span>}
                        {tk.can_upload_data && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">อัพโหลด</span>}
                        {tk.can_edit_project && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">โครงงาน</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tk.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tk.is_active ? 'ใช้งาน' : 'ยกเลิก'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tk.is_active && (
                        <button onClick={() => handleRevokeToken(tk.id)}
                          className="text-red-600 hover:text-red-800 text-xs">ยกเลิก Token</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tokens.length === 0 && (
              <div className="text-center py-12 text-gray-500">ยังไม่มี Token</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
