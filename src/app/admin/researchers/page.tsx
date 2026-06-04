'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SyncExecutivesPanel from '@/components/admin/SyncExecutivesPanel';

const ROLE_OPTIONS = [
  { value: 'advisor', label: '👨‍🏫 ที่ปรึกษา', color: 'bg-purple-100 text-purple-800' },
  { value: 'head', label: '👑 หัวหน้าหน่วย', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'member', label: '👥 สมาชิก', color: 'bg-blue-100 text-blue-800' },
  { value: 'phd_student', label: '🎓 นศ.ปริญญาเอก', color: 'bg-pink-100 text-pink-800' },
];

const TITLE_TH_OPTIONS = ['ศ.ดร.', 'รศ.ดร.', 'รศ.', 'ผศ.ดร.', 'ผศ.', 'ดร.', 'อาจารย์', 'นาย', 'นาง', 'นางสาว'];
const TITLE_EN_OPTIONS = ['Prof.Dr.', 'Assoc.Prof.Dr.', 'Assoc.Prof.', 'Asst.Prof.Dr.', 'Asst.Prof.', 'Dr.', 'Lect.', 'Mr.', 'Mrs.', 'Ms.'];

interface Researcher {
  id: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  title_en: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  unit_role: string;
  position_th: string | null;
  position_en: string | null;
  department: string | null;
  faculty: string | null;
  university: string | null;
  campus: string | null;
  email: string | null;
  phone: string | null;
  orcid_id: string | null;
  scopus_id: string | null;
  openalex_id: string | null;
  google_scholar: string | null;
  website: string | null;
  expertise: string[] | null;
  bio_th: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  is_active: boolean;
  cited_by_count: number | null;
  h_index: number | null;
  i10_index: number | null;
  is_pursuing_phd: boolean | null;
  phd_advisor_id: string | null;
  phd_program: string | null;
  phd_university: string | null;
  phd_start_year: number | null;
}

const emptyForm = {
  title_th: 'อาจารย์',
  first_name_th: '',
  last_name_th: '',
  title_en: 'Lect.',
  first_name_en: '',
  last_name_en: '',
  unit_role: 'member',
  position_th: '',
  position_en: '',
  department: 'Division of Electrical Engineering',
  faculty: 'Faculty of Engineering',
  university: 'Rajamangala University of Technology Lanna',
  campus: 'Chiang Mai',
  email: '',
  phone: '',
  orcid_id: '',
  scopus_id: '',
  openalex_id: '',
  google_scholar: '',
  website: '',
  expertise: [] as string[],
  bio_th: '',
  bio_en: '',
  avatar_url: '',
  is_active: true,
  is_pursuing_phd: false,
  phd_advisor_id: '',
  phd_program: '',
  phd_university: '',
  phd_start_year: '',
};

export default function AdminResearchersPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    const pwd = sessionStorage.getItem('admin_pwd');
    if (auth === 'true' && pwd) {
      setAuthenticated(true);
      setPassword(pwd);
    }
  }, []);

  const getSupabase = useCallback(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }, []);

  const fetchResearchers = useCallback(async () => {
    setLoading(true);
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('researchers')
      .select('*')
      .order('unit_role')
      .order('last_name_th');
    setResearchers(data || []);
    setLoading(false);
  }, [getSupabase]);

  useEffect(() => {
    if (authenticated) fetchResearchers();
  }, [authenticated, fetchResearchers]);

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
      setAuthError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const startEdit = (r: Researcher) => {
    setEditingId(r.id);
    setForm({
      title_th: r.title_th,
      first_name_th: r.first_name_th,
      last_name_th: r.last_name_th,
      title_en: r.title_en || 'Lect.',
      first_name_en: r.first_name_en || '',
      last_name_en: r.last_name_en || '',
      unit_role: r.unit_role,
      position_th: r.position_th || '',
      position_en: r.position_en || '',
      department: r.department || '',
      faculty: r.faculty || '',
      university: r.university || '',
      campus: r.campus || '',
      email: r.email || '',
      phone: r.phone || '',
      orcid_id: r.orcid_id || '',
      scopus_id: r.scopus_id || '',
      openalex_id: r.openalex_id || '',
      google_scholar: r.google_scholar || '',
      website: r.website || '',
      expertise: r.expertise || [],
      bio_th: r.bio_th || '',
      bio_en: r.bio_en || '',
      avatar_url: r.avatar_url || '',
      is_active: r.is_active,
      is_pursuing_phd: r.is_pursuing_phd || false,
      phd_advisor_id: r.phd_advisor_id || '',
      phd_program: r.phd_program || '',
      phd_university: r.phd_university || '',
      phd_start_year: r.phd_start_year ? String(r.phd_start_year) : '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleAddExpertise = () => {
    const val = expertiseInput.trim();
    if (val && !form.expertise.includes(val)) {
      setForm({ ...form, expertise: [...form.expertise, val] });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (val: string) => {
    setForm({ ...form, expertise: form.expertise.filter((e) => e !== val) });
  };

  const handleUploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', sessionStorage.getItem('admin_pwd') || password);
      formData.append('folder', 'avatars');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, avatar_url: data.url }));
      else setMessage('อัพโหลด avatar ไม่สำเร็จ: ' + (data.error || 'unknown'));
    } catch (err: any) {
      setMessage('อัพโหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.first_name_th.trim() || !form.last_name_th.trim()) {
      setMessage('กรุณากรอก ชื่อ-นามสกุล (ไทย)');
      return;
    }
    setSaving(true);
    setMessage('');

    const supabase = await getSupabase();
    const payload: any = {
      title_th: form.title_th,
      first_name_th: form.first_name_th.trim(),
      last_name_th: form.last_name_th.trim(),
      title_en: form.title_en || null,
      first_name_en: form.first_name_en.trim() || null,
      last_name_en: form.last_name_en.trim() || null,
      unit_role: form.unit_role,
      position_th: form.position_th.trim() || null,
      position_en: form.position_en.trim() || null,
      department: form.department.trim() || null,
      faculty: form.faculty.trim() || null,
      university: form.university.trim() || null,
      campus: form.campus.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      orcid_id: form.orcid_id.trim() || null,
      scopus_id: form.scopus_id.trim() || null,
      openalex_id: form.openalex_id.trim() || null,
      google_scholar: form.google_scholar.trim() || null,
      website: form.website.trim() || null,
      expertise: form.expertise.length > 0 ? form.expertise : null,
      bio_th: form.bio_th.trim() || null,
      bio_en: form.bio_en.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      is_active: form.is_active,
      is_pursuing_phd: form.is_pursuing_phd,
      phd_advisor_id: form.phd_advisor_id || null,
      phd_program: form.phd_program.trim() || null,
      phd_university: form.phd_university.trim() || null,
      phd_start_year: form.phd_start_year ? parseInt(form.phd_start_year) : null,
    };

    if (editingId) {
      const { error } = await supabase
        .from('researchers')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single();
      if (error) {
        setMessage('อัปเดตไม่สำเร็จ: ' + error.message);
      } else {
        setMessage('✅ อัปเดตสำเร็จ');
        setShowForm(false);
        setEditingId(null);
        fetchResearchers();
      }
    } else {
      const { error } = await supabase.from('researchers').insert(payload);
      if (error) {
        setMessage('เพิ่มไม่สำเร็จ: ' + error.message);
      } else {
        setMessage('✅ เพิ่มนักวิจัยสำเร็จ');
        setShowForm(false);
        setForm(emptyForm);
        fetchResearchers();
      }
    }
    setSaving(false);
  };

  const handleToggleActive = async (id: string, newState: boolean) => {
    const supabase = await getSupabase();
    await supabase.from('researchers').update({ is_active: newState }).eq('id', id);
    fetchResearchers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบนักวิจัย "${name}" ?\n\n⚠️ การลบจะลบ publication_authors, grant_members, ฯลฯ ที่เชื่อมโยงด้วย`)) return;
    const supabase = await getSupabase();
    const { error } = await supabase.from('researchers').delete().eq('id', id);
    if (error) {
      alert('ลบไม่สำเร็จ: ' + error.message + '\n\nหากมี FK references ให้ใช้ "ปิดใช้งาน" แทน');
    } else {
      fetchResearchers();
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Admin - จัดการนักวิจัย</h1>
        <input
          type="password"
          placeholder="รหัสผ่าน Admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full border rounded-lg px-4 py-2 mb-3"
        />
        {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const filtered = filterRole === 'all' ? researchers : researchers.filter((r) => r.unit_role === filterRole);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">จัดการนักวิจัย</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">จัดการนักวิจัย ({researchers.length})</h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
        >
          + เพิ่มนักวิจัย
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Executive role sync tool */}
      <div className="mb-6">
        <SyncExecutivesPanel />
      </div>

      {/* Form (collapsible) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{editingId ? '✏️ แก้ไขนักวิจัย' : '➕ เพิ่มนักวิจัยใหม่'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          {/* Section: Basic Info */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-4">ข้อมูลพื้นฐาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">คำนำหน้า (ไทย)</label>
              <select value={form.title_th} onChange={(e) => setForm({ ...form, title_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {TITLE_TH_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ชื่อ (ไทย) *</label>
              <input value={form.first_name_th} onChange={(e) => setForm({ ...form, first_name_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ชื่อ" required />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">นามสกุล (ไทย) *</label>
              <input value={form.last_name_th} onChange={(e) => setForm({ ...form, last_name_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="นามสกุล" required />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Title (EN)</label>
              <select value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {TITLE_EN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">First Name (EN)</label>
              <input value={form.first_name_en} onChange={(e) => setForm({ ...form, first_name_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Last Name (EN)</label>
              <input value={form.last_name_en} onChange={(e) => setForm({ ...form, last_name_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Last name" />
            </div>
          </div>

          {/* Section: Role */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">บทบาทในหน่วย</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">บทบาท</label>
              <select value={form.unit_role} onChange={(e) => setForm({ ...form, unit_role: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4" />
                <span>{form.is_active ? '🟢 ใช้งาน (Active)' : '🔴 ปิดใช้งาน'}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">ตำแหน่ง (ไทย)</label>
              <input value={form.position_th} onChange={(e) => setForm({ ...form, position_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="เช่น หัวหน้าหน่วยวิจัย" />
            </div>
          </div>

          {/* Section: Affiliation */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">สังกัด</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">ภาควิชา (Department)</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">คณะ (Faculty)</label>
              <input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">มหาวิทยาลัย</label>
              <input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">วิทยาเขต</label>
              <input value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Section: Contact */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">ติดต่อ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="user@rmutl.ac.th" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">โทรศัพท์</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="08X-XXX-XXXX" />
            </div>
          </div>

          {/* Section: Identifiers */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">ID นักวิจัย (สำหรับ Citation Tracking)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                ORCID ID
                <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-[10px]">สมัครฟรี →</a>
              </label>
              <input value={form.orcid_id} onChange={(e) => setForm({ ...form, orcid_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="0000-0000-0000-0000" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                OpenAlex ID
                <span className="ml-2 text-gray-400 text-[10px]">(auto-fetched via Sync)</span>
              </label>
              <input value={form.openalex_id} onChange={(e) => setForm({ ...form, openalex_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="A5077950520" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Scopus Author ID</label>
              <input value={form.scopus_id} onChange={(e) => setForm({ ...form, scopus_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="57XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Google Scholar URL</label>
              <input value={form.google_scholar} onChange={(e) => setForm({ ...form, google_scholar: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://scholar.google.com/citations?user=..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Website</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
          </div>

          {/* Section: Avatar */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">รูปโปรไฟล์</h3>
          <div className="flex items-start gap-4">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-200">
                {form.first_name_th.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <input type="text" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="URL รูปภาพ หรือกดอัพโหลด" />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAvatar(f); }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 disabled:opacity-50">
                {uploading ? 'กำลังอัพ...' : '📤 อัพโหลดรูป'}
              </button>
              {form.avatar_url && (
                <button type="button" onClick={() => setForm({ ...form, avatar_url: '' })}
                  className="mt-2 ml-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">
                  🗑️ ลบรูป
                </button>
              )}
            </div>
          </div>

          {/* Section: Expertise */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">สาขาความเชี่ยวชาญ</h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.expertise.map((exp, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {exp}
                <button onClick={() => handleRemoveExpertise(exp)} className="text-blue-400 hover:text-blue-700 font-bold">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExpertise(); } }}
              className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="เช่น Solar Energy, Battery Storage" />
            <button type="button" onClick={handleAddExpertise} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ เพิ่ม</button>
          </div>

          {/* Section: Bio */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">ประวัติย่อ (Bio)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bio (ไทย)</label>
              <textarea value={form.bio_th} onChange={(e) => setForm({ ...form, bio_th: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="ประวัติย่อภาษาไทย..." />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bio (English)</label>
              <textarea value={form.bio_en} onChange={(e) => setForm({ ...form, bio_en: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Bio in English..." />
            </div>
          </div>

          {/* Section: PhD Status */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">การศึกษา ป.เอก (ในกรณีที่กำลังเรียน)</h3>
          <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={form.is_pursuing_phd}
                onChange={(e) => setForm({ ...form, is_pursuing_phd: e.target.checked })}
                className="w-4 h-4" />
              <span className="font-medium text-sm">กำลังศึกษาปริญญาเอก</span>
            </label>
            {form.is_pursuing_phd && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">อาจารย์ที่ปรึกษา (ในหน่วย)</label>
                  <select value={form.phd_advisor_id} onChange={(e) => setForm({ ...form, phd_advisor_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">-- เลือก --</option>
                    {researchers.filter((r) => r.id !== editingId).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title_th}{r.first_name_th} {r.last_name_th}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ปีเริ่มศึกษา (พ.ศ.)</label>
                  <input type="number" value={form.phd_start_year}
                    onChange={(e) => setForm({ ...form, phd_start_year: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="2569" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">หลักสูตร</label>
                  <input value={form.phd_program} onChange={(e) => setForm({ ...form, phd_program: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ปริญญาเอก สาขา..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">มหาวิทยาลัย</label>
                  <input value={form.phd_university} onChange={(e) => setForm({ ...form, phd_university: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="เช่น มทร.ล้านนา" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-md">
              {saving ? 'กำลังบันทึก...' : editingId ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มนักวิจัย'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterRole('all')}
          className={`px-3 py-1 rounded-full text-sm ${filterRole === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          ทั้งหมด ({researchers.length})
        </button>
        {ROLE_OPTIONS.map((r) => {
          const count = researchers.filter((x) => x.unit_role === r.value).length;
          return (
            <button key={r.value} onClick={() => setFilterRole(r.value)}
              className={`px-3 py-1 rounded-full text-sm ${filterRole === r.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {r.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-gray-700">นักวิจัย</th>
                <th className="px-3 py-3 text-left text-gray-700">บทบาท</th>
                <th className="px-3 py-3 text-center text-gray-700">ORCID</th>
                <th className="px-3 py-3 text-center text-gray-700">Citations</th>
                <th className="px-3 py-3 text-center text-gray-700">Active</th>
                <th className="px-3 py-3 text-center text-gray-700">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => {
                const role = ROLE_OPTIONS.find((x) => x.value === r.unit_role);
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${!r.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {r.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {r.first_name_th.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.title_th}{r.first_name_th} {r.last_name_th}</p>
                          {r.first_name_en && <p className="text-[10px] text-gray-400 truncate">{r.title_en} {r.first_name_en} {r.last_name_en}</p>}
                          {r.is_pursuing_phd && (
                            <span className="text-[10px] text-pink-600">🎓 กำลังเรียน ป.เอก</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${role?.color || ''}`}>{role?.label || r.unit_role}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.orcid_id ? <span className="text-[10px] font-mono text-emerald-700">{r.orcid_id}</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {(r.cited_by_count || 0) > 0 ? (
                        <span className="text-xs font-semibold text-orange-600">⭐ {r.cited_by_count}</span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleToggleActive(r.id, !r.is_active)}
                        className={`relative w-10 h-5 rounded-full transition ${r.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800 text-xs mr-2">แก้ไข</button>
                      <Link href={`/researchers/${r.id}`} target="_blank" className="text-gray-600 hover:text-gray-800 text-xs mr-2">ดู</Link>
                      <button onClick={() => handleDelete(r.id, `${r.first_name_th} ${r.last_name_th}`)}
                        className="text-red-600 hover:text-red-800 text-xs">ลบ</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">ไม่พบข้อมูล</div>
          )}
        </div>
      )}
    </div>
  );
}
