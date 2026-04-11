'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const statusLabels: Record<string, { label: string; cls: string }> = {
  active: { label: 'กำลังดำเนินการ', cls: 'bg-blue-100 text-blue-800' },
  completed: { label: 'เสร็จสิ้น', cls: 'bg-green-100 text-green-800' },
  pending: { label: 'รอดำเนินการ', cls: 'bg-yellow-100 text-yellow-800' },
  cancelled: { label: 'ยกเลิก', cls: 'bg-red-100 text-red-700' },
};

const grantRoleLabels: Record<string, string> = {
  pi: 'หัวหน้าโครงการ',
  co_pi: 'ผู้ร่วมโครงการ',
  researcher: 'นักวิจัย',
  consultant: 'ที่ปรึกษา',
};

export default function AdminGrantsPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [grants, setGrants] = useState<any[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string>(''); // 'contract' | 'progress' | 'final'

  // Members management
  const [editingMembers, setEditingMembers] = useState<string | null>(null); // grant id
  const [members, setMembers] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ researcher_id: '', role: 'researcher' });

  const emptyForm = {
    title_th: '', title_en: '', contract_number: '',
    funding_agency: '', funding_agency_en: '', budget: '',
    start_date: '', end_date: '', fiscal_year: '',
    status: 'active', description_th: '', description_en: '',
    research_areas: '',
    contract_file_url: '', progress_report_url: '', final_report_url: '',
  };
  const [form, setForm] = useState(emptyForm);

  const login = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); loadGrants(); loadResearchers(); } else alert('รหัสผ่านไม่ถูกต้อง');
  };

  const loadResearchers = async () => {
    const { data } = await supabase.from('researchers').select('id, title_th, first_name_th, last_name_th')
      .eq('is_active', true).order('last_name_th');
    setResearchers(data || []);
  };

  const loadGrants = async () => {
    const { data } = await supabase.from('grants')
      .select(`*, grant_members(id, role, researcher_id, researchers(title_th, first_name_th, last_name_th))`)
      .order('fiscal_year', { ascending: false });
    setGrants(data || []);
  };

  const loadMembers = async (grantId: string) => {
    const { data } = await supabase.from('grant_members')
      .select('id, role, researcher_id, researchers(title_th, first_name_th, last_name_th)')
      .eq('grant_id', grantId);
    setMembers(data || []);
  };

  const handleUpload = async (field: 'contract_file_url' | 'progress_report_url' | 'final_report_url', file: File) => {
    setUploading(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password || sessionStorage.getItem('admin_pwd') || '');
    formData.append('folder', 'grants');

    const res = await fetch('/api/admin/grants/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setForm({ ...form, [field]: url });
    } else {
      alert('อัปโหลดไม่สำเร็จ');
    }
    setUploading('');
  };

  const handleSave = async () => {
    setLoading(true);
    const payload: any = {
      title_th: form.title_th,
      title_en: form.title_en || null,
      contract_number: form.contract_number || null,
      funding_agency: form.funding_agency,
      funding_agency_en: form.funding_agency_en || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      fiscal_year: form.fiscal_year ? parseInt(form.fiscal_year) : null,
      status: form.status,
      description_th: form.description_th || null,
      description_en: form.description_en || null,
      research_areas: form.research_areas ? form.research_areas.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
      contract_file_url: form.contract_file_url || null,
      progress_report_url: form.progress_report_url || null,
      final_report_url: form.final_report_url || null,
    };

    if (editing) {
      await supabase.from('grants').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('grants').insert(payload);
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    await loadGrants();
    setLoading(false);
  };

  const handleEdit = (g: any) => {
    setEditing(g);
    setForm({
      title_th: g.title_th || '',
      title_en: g.title_en || '',
      contract_number: g.contract_number || '',
      funding_agency: g.funding_agency || '',
      funding_agency_en: g.funding_agency_en || '',
      budget: g.budget ? String(g.budget) : '',
      start_date: g.start_date || '',
      end_date: g.end_date || '',
      fiscal_year: g.fiscal_year ? String(g.fiscal_year) : '',
      status: g.status || 'active',
      description_th: g.description_th || '',
      description_en: g.description_en || '',
      research_areas: g.research_areas ? g.research_areas.join(', ') : '',
      contract_file_url: g.contract_file_url || '',
      progress_report_url: g.progress_report_url || '',
      final_report_url: g.final_report_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบทุนวิจัยนี้?')) return;
    await supabase.from('grants').delete().eq('id', id);
    await loadGrants();
  };

  const handleAddMember = async (grantId: string) => {
    if (!newMember.researcher_id) return;
    await supabase.from('grant_members').insert({
      grant_id: grantId,
      researcher_id: newMember.researcher_id,
      role: newMember.role,
    });
    setNewMember({ researcher_id: '', role: 'researcher' });
    await loadMembers(grantId);
    await loadGrants();
  };

  const handleRemoveMember = async (memberId: string, grantId: string) => {
    await supabase.from('grant_members').delete().eq('id', memberId);
    await loadMembers(grantId);
    await loadGrants();
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthed(true);
      loadGrants();
      loadResearchers();
    }
  }, []);

  const filtered = filter === 'all' ? grants : grants.filter((g: any) => g.status === filter);
  const totalBudget = grants.reduce((sum: number, g: any) => sum + (Number(g.budget) || 0), 0);

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin - จัดการทุนวิจัย</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="w-full border rounded-lg p-3 mb-3" placeholder="รหัสผ่าน Admin" />
        <button onClick={login} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">เข้าสู่ระบบ</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการทุนวิจัย</h1>
          <p className="text-sm text-gray-500">
            {grants.length} โครงการ | งบรวม {totalBudget.toLocaleString()} บาท
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300">
            กลับ Admin
          </Link>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
            + เพิ่มทุนวิจัย
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          ทั้งหมด ({grants.length})
        </button>
        {Object.entries(statusLabels).map(([key, cfg]) => {
          const count = grants.filter((g: any) => g.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${filter === key ? 'ring-2 ring-offset-1 ring-green-400' : ''} ${cfg.cls}`}>
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border-2 border-green-200 p-6 mb-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">{editing ? 'แก้ไขทุนวิจัย' : 'เพิ่มทุนวิจัยใหม่'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>

          {/* ข้อมูลพื้นฐาน */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">ข้อมูลโครงการ</h3>
            <div>
              <label className="text-xs text-gray-600 block mb-1">ชื่อโครงการ (ไทย) *</label>
              <input className="w-full border rounded-lg p-2.5 text-sm" value={form.title_th}
                onChange={(e) => setForm({ ...form, title_th: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">ชื่อโครงการ (อังกฤษ)</label>
              <input className="w-full border rounded-lg p-2.5 text-sm" value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">แหล่งทุน *</label>
                <input className="w-full border rounded-lg p-2.5 text-sm" value={form.funding_agency}
                  onChange={(e) => setForm({ ...form, funding_agency: e.target.value })}
                  placeholder="เช่น กฟผ., บพข., วช." required />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">แหล่งทุน (อังกฤษ)</label>
                <input className="w-full border rounded-lg p-2.5 text-sm" value={form.funding_agency_en}
                  onChange={(e) => setForm({ ...form, funding_agency_en: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">เลขที่สัญญา</label>
                <input className="w-full border rounded-lg p-2.5 text-sm" value={form.contract_number}
                  onChange={(e) => setForm({ ...form, contract_number: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">งบประมาณ (บาท)</label>
                <input type="number" className="w-full border rounded-lg p-2.5 text-sm" value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">ปีงบประมาณ (พ.ศ.)</label>
                <input type="number" className="w-full border rounded-lg p-2.5 text-sm" value={form.fiscal_year}
                  onChange={(e) => setForm({ ...form, fiscal_year: e.target.value })} placeholder="2567" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">วันเริ่มต้น</label>
                <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">วันสิ้นสุด</label>
                <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">สถานะ</label>
                <select className="w-full border rounded-lg p-2.5 text-sm" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="active">กำลังดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">รายละเอียด (ไทย)</label>
              <textarea className="w-full border rounded-lg p-2.5 text-sm" rows={2} value={form.description_th}
                onChange={(e) => setForm({ ...form, description_th: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">สาขาวิจัย (คั่นด้วย comma)</label>
              <input className="w-full border rounded-lg p-2.5 text-sm" value={form.research_areas}
                onChange={(e) => setForm({ ...form, research_areas: e.target.value })}
                placeholder="Solar Energy, Power Electronics, Smart Grid" />
            </div>
          </div>

          {/* เอกสารแนบ */}
          <div className="bg-amber-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">เอกสารแนบ</h3>

            {/* สัญญาทุน */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">สัญญาทุนวิจัย (PDF)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleUpload('contract_file_url', e.target.files[0])}
                  className="text-sm flex-1" />
                {uploading === 'contract_file_url' && <span className="text-xs text-amber-600 animate-pulse">กำลังอัปโหลด...</span>}
              </div>
              {form.contract_file_url && (
                <div className="flex items-center gap-2 mt-1">
                  <a href={form.contract_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline">ดูไฟล์ที่อัปโหลด</a>
                  <button onClick={() => setForm({ ...form, contract_file_url: '' })}
                    className="text-xs text-red-500 hover:text-red-700">[ลบ]</button>
                </div>
              )}
            </div>

            {/* รายงานความก้าวหน้า */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">รายงานความก้าวหน้า (PDF)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleUpload('progress_report_url', e.target.files[0])}
                  className="text-sm flex-1" />
                {uploading === 'progress_report_url' && <span className="text-xs text-amber-600 animate-pulse">กำลังอัปโหลด...</span>}
              </div>
              {form.progress_report_url && (
                <div className="flex items-center gap-2 mt-1">
                  <a href={form.progress_report_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline">ดูไฟล์ที่อัปโหลด</a>
                  <button onClick={() => setForm({ ...form, progress_report_url: '' })}
                    className="text-xs text-red-500 hover:text-red-700">[ลบ]</button>
                </div>
              )}
            </div>

            {/* รายงานฉบับสมบูรณ์ */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">รายงานฉบับสมบูรณ์ (PDF)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleUpload('final_report_url', e.target.files[0])}
                  className="text-sm flex-1" />
                {uploading === 'final_report_url' && <span className="text-xs text-amber-600 animate-pulse">กำลังอัปโหลด...</span>}
              </div>
              {form.final_report_url && (
                <div className="flex items-center gap-2 mt-1">
                  <a href={form.final_report_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline">ดูไฟล์ที่อัปโหลด</a>
                  <button onClick={() => setForm({ ...form, final_report_url: '' })}
                    className="text-xs text-red-500 hover:text-red-700">[ลบ]</button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400">หรือวาง URL โดยตรง:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className="border rounded p-2 text-xs" value={form.contract_file_url}
                onChange={(e) => setForm({ ...form, contract_file_url: e.target.value })}
                placeholder="URL สัญญาทุน" />
              <input className="border rounded p-2 text-xs" value={form.progress_report_url}
                onChange={(e) => setForm({ ...form, progress_report_url: e.target.value })}
                placeholder="URL รายงานความก้าวหน้า" />
              <input className="border rounded p-2 text-xs" value={form.final_report_url}
                onChange={(e) => setForm({ ...form, final_report_url: e.target.value })}
                placeholder="URL รายงานฉบับสมบูรณ์" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading || !form.title_th || !form.funding_agency}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-sm">
              {loading ? 'กำลังบันทึก...' : editing ? 'อัปเดต' : 'บันทึก'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-300">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Grants List */}
      <div className="space-y-4">
        {filtered.length === 0 && <div className="text-center text-gray-400 py-12">ไม่มีรายการ</div>}
        {filtered.map((g: any) => {
          const st = statusLabels[g.status] || statusLabels.active;
          const hasFiles = g.contract_file_url || g.progress_report_url || g.final_report_url;

          return (
            <div key={g.id} className="bg-white rounded-xl border p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{g.title_th}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${st.cls}`}>{st.label}</span>
                  </div>
                  {g.title_en && <p className="text-xs text-gray-500">{g.title_en}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                    <div>แหล่งทุน: <b className="text-gray-800">{g.funding_agency}</b></div>
                    {g.contract_number && <div>เลขที่สัญญา: {g.contract_number}</div>}
                    {g.budget && <div>งบประมาณ: <b className="text-green-700">{Number(g.budget).toLocaleString()} บาท</b></div>}
                    {g.fiscal_year && <div>ปีงบประมาณ: พ.ศ. {g.fiscal_year}</div>}
                    {(g.start_date || g.end_date) && <div>ระยะเวลา: {g.start_date || '?'} — {g.end_date || '?'}</div>}
                  </div>

                  {/* ทีมวิจัย */}
                  {g.grant_members && g.grant_members.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">ทีมวิจัย: </span>
                      {g.grant_members.map((gm: any, i: number) => {
                        const r = gm.researchers;
                        if (!r) return null;
                        return (
                          <span key={gm.id}>
                            {i > 0 && ', '}
                            {r.title_th}{r.first_name_th} {r.last_name_th}
                            <span className="text-gray-400"> ({grantRoleLabels[gm.role] || gm.role})</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* เอกสารแนบ */}
                  {hasFiles && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {g.contract_file_url && (
                        <a href={g.contract_file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 transition">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          สัญญาทุน
                        </a>
                      )}
                      {g.progress_report_url && (
                        <a href={g.progress_report_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          รายงานก้าวหน้า
                        </a>
                      )}
                      {g.final_report_url && (
                        <a href={g.final_report_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          รายงานสมบูรณ์
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button onClick={() => handleEdit(g)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200">แก้ไข</button>
                  <button onClick={() => { setEditingMembers(editingMembers === g.id ? null : g.id); if (editingMembers !== g.id) loadMembers(g.id); }}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200">
                    ทีมวิจัย
                  </button>
                  <button onClick={() => handleDelete(g.id)}
                    className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100">ลบ</button>
                </div>
              </div>

              {/* Members Panel */}
              {editingMembers === g.id && (
                <div className="mt-4 pt-4 border-t bg-purple-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-purple-800">จัดการทีมวิจัย</h4>
                  {members.length > 0 ? (
                    <div className="space-y-1">
                      {members.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                          <span>
                            {m.researchers?.title_th}{m.researchers?.first_name_th} {m.researchers?.last_name_th}
                            <span className="text-gray-400 ml-1">({grantRoleLabels[m.role] || m.role})</span>
                          </span>
                          <button onClick={() => handleRemoveMember(m.id, g.id)}
                            className="text-red-500 hover:text-red-700 text-xs">ลบ</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">ยังไม่มีสมาชิก</p>
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 block mb-0.5">นักวิจัย</label>
                      <select className="w-full border rounded p-2 text-xs" value={newMember.researcher_id}
                        onChange={(e) => setNewMember({ ...newMember, researcher_id: e.target.value })}>
                        <option value="">-- เลือก --</option>
                        {researchers.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.title_th}{r.first_name_th} {r.last_name_th}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">บทบาท</label>
                      <select className="border rounded p-2 text-xs" value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                        <option value="pi">หัวหน้าโครงการ</option>
                        <option value="co_pi">ผู้ร่วมโครงการ</option>
                        <option value="researcher">นักวิจัย</option>
                        <option value="consultant">ที่ปรึกษา</option>
                      </select>
                    </div>
                    <button onClick={() => handleAddMember(g.id)}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-xs hover:bg-purple-700 shrink-0">เพิ่ม</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
