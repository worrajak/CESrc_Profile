'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const DEGREE_OPTIONS = [
  { value: 'bachelor', label: 'ปริญญาตรี' },
  { value: 'master', label: 'ปริญญาโท' },
  { value: 'doctoral', label: 'ปริญญาเอก' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'กำลังศึกษา' },
  { value: 'graduated', label: 'สำเร็จการศึกษา' },
  { value: 'withdrawn', label: 'พ้นสภาพ' },
  { value: 'on_leave', label: 'ลาพักการศึกษา' },
];

const degreeLabel: Record<string, string> = {
  bachelor: 'ป.ตรี', master: 'ป.โท', doctoral: 'ป.เอก',
};

const statusLabel: Record<string, string> = {
  active: 'กำลังศึกษา', graduated: 'จบแล้ว', withdrawn: 'พ้นสภาพ', on_leave: 'ลาพัก',
};

interface StudentForm {
  student_code: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  title_en: string;
  first_name_en: string;
  last_name_en: string;
  degree_level: string;
  program_th: string;
  program_en: string;
  enrollment_year: string;
  graduation_year: string;
  status: string;
  email: string;
  phone: string;
}

const emptyForm: StudentForm = {
  student_code: '', title_th: 'นาย', first_name_th: '', last_name_th: '',
  title_en: 'Mr.', first_name_en: '', last_name_en: '',
  degree_level: 'bachelor', program_th: 'วิศวกรรมไฟฟ้า', program_en: 'Electrical Engineering',
  enrollment_year: '', graduation_year: '', status: 'active',
  email: '', phone: '',
};

export default function AdminStudentsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filterDegree, setFilterDegree] = useState('all');

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

  const fetchData = useCallback(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const [studentsRes, researchersRes] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('researchers').select('id, title_th, first_name_th, last_name_th').eq('is_active', true),
    ]);
    setStudents(studentsRes.data || []);
    setResearchers(researchersRes.data || []);
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  const handleSave = async () => {
    if (!form.first_name_th || !form.last_name_th) {
      setMessage('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setSaving(true);
    setMessage('');

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const payload = {
      student_code: form.student_code || null,
      title_th: form.title_th,
      first_name_th: form.first_name_th,
      last_name_th: form.last_name_th,
      title_en: form.title_en || null,
      first_name_en: form.first_name_en || null,
      last_name_en: form.last_name_en || null,
      degree_level: form.degree_level,
      program_th: form.program_th || null,
      program_en: form.program_en || null,
      enrollment_year: form.enrollment_year ? parseInt(form.enrollment_year) : null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      status: form.status,
      email: form.email || null,
      phone: form.phone || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('students').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('students').insert(payload));
    }

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } else {
      setMessage(editingId ? 'แก้ไขสำเร็จ' : 'เพิ่มนักศึกษาสำเร็จ');
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleEdit = (s: any) => {
    setForm({
      student_code: s.student_code || '',
      title_th: s.title_th, first_name_th: s.first_name_th, last_name_th: s.last_name_th,
      title_en: s.title_en || '', first_name_en: s.first_name_en || '', last_name_en: s.last_name_en || '',
      degree_level: s.degree_level, program_th: s.program_th || '', program_en: s.program_en || '',
      enrollment_year: s.enrollment_year?.toString() || '', graduation_year: s.graduation_year?.toString() || '',
      status: s.status, email: s.email || '', phone: s.phone || '',
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบนักศึกษา "${name}" ?`)) return;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    await supabase.from('students').delete().eq('id', id);
    fetchData();
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Admin - จัดการนักศึกษา</h1>
        <input
          type="password" placeholder="รหัสผ่าน Admin" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border rounded-lg px-4 py-2 mb-3"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const filtered = filterDegree === 'all' ? students : students.filter(s => s.degree_level === filterDegree);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">จัดการนักศึกษา</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">จัดการนักศึกษา ({students.length})</h1>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'ปิดฟอร์ม' : '+ เพิ่มนักศึกษา'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'แก้ไขนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thai name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า (ไทย)</label>
              <select value={form.title_th} onChange={e => setForm({ ...form, title_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2">
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ (ไทย) *</label>
              <input value={form.first_name_th} onChange={e => setForm({ ...form, first_name_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="ชื่อ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล (ไทย) *</label>
              <input value={form.last_name_th} onChange={e => setForm({ ...form, last_name_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="นามสกุล" />
            </div>

            {/* English name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
              <select value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2">
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name (EN)</label>
              <input value={form.first_name_en} onChange={e => setForm({ ...form, first_name_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (EN)</label>
              <input value={form.last_name_en} onChange={e => setForm({ ...form, last_name_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="Last name" />
            </div>

            {/* Academic info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา</label>
              <input value={form.student_code} onChange={e => setForm({ ...form, student_code: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="เช่น 641234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ระดับ</label>
              <select value={form.degree_level} onChange={e => setForm({ ...form, degree_level: e.target.value })}
                className="w-full border rounded-lg px-3 py-2">
                {DEGREE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หลักสูตร (ไทย)</label>
              <input value={form.program_th} onChange={e => setForm({ ...form, program_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="วิศวกรรมไฟฟ้า" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่เข้าศึกษา</label>
              <input type="number" value={form.enrollment_year} onChange={e => setForm({ ...form, enrollment_year: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="2569" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่สำเร็จ</label>
              <input type="number" value={form.graduation_year} onChange={e => setForm({ ...form, graduation_year: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="2571" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="student@rmutl.ac.th" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2" placeholder="08X-XXX-XXXX" />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition">
              {saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มนักศึกษา'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterDegree('all')}
          className={`px-3 py-1 rounded-full text-sm ${filterDegree === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          ทั้งหมด ({students.length})
        </button>
        {DEGREE_OPTIONS.map(d => {
          const count = students.filter(s => s.degree_level === d.value).length;
          return (
            <button key={d.value} onClick={() => setFilterDegree(d.value)}
              className={`px-3 py-1 rounded-full text-sm ${filterDegree === d.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {d.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">รหัส</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ระดับ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">สถานะ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ปีเข้า</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.title_th}{s.first_name_th} {s.last_name_th}</p>
                  {s.first_name_en && (
                    <p className="text-xs text-gray-500">{s.title_en} {s.first_name_en} {s.last_name_en}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.student_code || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.degree_level === 'doctoral' ? 'bg-red-100 text-red-700' :
                    s.degree_level === 'master' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{degreeLabel[s.degree_level]}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' :
                    s.status === 'graduated' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>{statusLabel[s.status]}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.enrollment_year || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleEdit(s)}
                    className="text-blue-600 hover:text-blue-800 mr-3 text-xs">แก้ไข</button>
                  <button onClick={() => handleDelete(s.id, `${s.first_name_th} ${s.last_name_th}`)}
                    className="text-red-600 hover:text-red-800 text-xs">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">ยังไม่มีข้อมูลนักศึกษา</div>
        )}
      </div>
    </div>
  );
}
