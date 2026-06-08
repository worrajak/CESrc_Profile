'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GrantPlanImportPanel from '@/components/admin/GrantPlanImportPanel';
import WorkplanProgressDashboard from '@/components/admin/grants/WorkplanProgressDashboard';

const SCurveChart = dynamic(() => import('@/components/SCurveChart'), { ssr: false });

const milestoneTypes: Record<string, string> = {
  deliverable: 'สิ่งส่งมอบ',
  report: 'รายงาน',
  presentation: 'นำเสนอ',
  review: 'ตรวจสอบ',
  other: 'อื่นๆ',
};

const statusOptions = [
  { value: 'pending', label: 'รอดำเนินการ', cls: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: 'กำลังดำเนินการ', cls: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'เสร็จสิ้น', cls: 'bg-green-100 text-green-700' },
  { value: 'delayed', label: 'ล่าช้า', cls: 'bg-red-100 text-red-700' },
  { value: 'cancelled', label: 'ยกเลิก', cls: 'bg-gray-200 text-gray-500' },
];

export default function AdminGrantTrackingPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tab, setTab] = useState<'milestones' | 'progress' | 'ai' | 'alerts'>('milestones');
  const [loading, setLoading] = useState(false);

  // AI Parse
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiParsing, setAiParsing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [aiProvider, setAiProvider] = useState('');
  const [aiModel, setAiModel] = useState('');

  // Milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [msForm, setMsForm] = useState({
    title: '', description: '', milestone_type: 'deliverable',
    planned_date: '', planned_weight: '', status: 'pending', completion_pct: '0',
  });

  // Progress form
  const [progressForm, setProgressForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    planned_pct: '', actual_pct: '', budget_spent: '', summary: '', issues: '',
  });

  const login = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); } else alert('รหัสผ่านไม่ถูกต้อง');
  };

  const loadGrants = async () => {
    const { data } = await supabase.from('grants')
      .select('id, title_th, status, funding_agency, start_date, end_date, budget')
      .order('fiscal_year', { ascending: false });
    setGrants(data || []);
  };

  const loadTracking = async (grantId: string) => {
    const res = await fetch(`/api/grants/tracking?grant_id=${grantId}&type=all`);
    const data = await res.json();
    setMilestones(data.milestones || []);
    setProgressLogs(data.progress || []);
    setAlerts(data.alerts || []);
  };

  const loadAIProviders = async () => {
    try {
      const res = await fetch('/api/grants/parse-contract');
      const data = await res.json();
      setAiProviders(data.providers || []);
    } catch {}
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) { loadGrants(); loadAIProviders(); }
  }, [authed]);

  useEffect(() => {
    if (selectedGrant) loadTracking(selectedGrant.id);
  }, [selectedGrant]);

  // Milestone CRUD
  const saveMilestone = async () => {
    setLoading(true);
    const action = editingMilestone ? 'update_milestone' : 'add_milestone';
    const payload: any = {
      action,
      grant_id: selectedGrant.id,
      title: msForm.title,
      description: msForm.description || null,
      milestone_type: msForm.milestone_type,
      planned_date: msForm.planned_date,
      planned_weight: msForm.planned_weight ? parseFloat(msForm.planned_weight) : 0,
      status: msForm.status,
      completion_pct: msForm.completion_pct ? parseFloat(msForm.completion_pct) : 0,
    };
    if (editingMilestone) payload.id = editingMilestone.id;

    await fetch('/api/grants/tracking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setShowMilestoneForm(false);
    setEditingMilestone(null);
    setMsForm({ title: '', description: '', milestone_type: 'deliverable', planned_date: '', planned_weight: '', status: 'pending', completion_pct: '0' });
    await loadTracking(selectedGrant.id);
    setLoading(false);
  };

  const deleteMilestone = async (id: string) => {
    if (!confirm('ลบ Milestone นี้?')) return;
    await fetch('/api/grants/tracking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_milestone', grant_id: selectedGrant.id, id }),
    });
    await loadTracking(selectedGrant.id);
  };

  const editMilestone = (m: any) => {
    setEditingMilestone(m);
    setMsForm({
      title: m.title || '', description: m.description || '',
      milestone_type: m.milestone_type || 'deliverable',
      planned_date: m.planned_date || '', planned_weight: m.planned_weight ? String(m.planned_weight) : '',
      status: m.status || 'pending', completion_pct: m.completion_pct ? String(m.completion_pct) : '0',
    });
    setShowMilestoneForm(true);
  };

  // Progress log
  const saveProgress = async () => {
    setLoading(true);
    await fetch('/api/grants/tracking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_progress',
        grant_id: selectedGrant.id,
        log_date: progressForm.log_date,
        planned_pct: progressForm.planned_pct ? parseFloat(progressForm.planned_pct) : 0,
        actual_pct: progressForm.actual_pct ? parseFloat(progressForm.actual_pct) : 0,
        budget_spent: progressForm.budget_spent ? parseFloat(progressForm.budget_spent) : 0,
        summary: progressForm.summary || null,
        issues: progressForm.issues || null,
      }),
    });
    setProgressForm({ ...progressForm, summary: '', issues: '' });
    await loadTracking(selectedGrant.id);
    setLoading(false);
  };

  // AI Parse
  const handleAIParse = async () => {
    if (!aiFile) return;
    setAiParsing(true);
    setAiError('');
    setAiResult(null);

    const formData = new FormData();
    formData.append('file', aiFile);
    if (aiProvider) formData.append('ai_provider', aiProvider);
    if (aiModel) formData.append('ai_model', aiModel);

    try {
      const res = await fetch('/api/grants/parse-contract', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) { setAiError(data.error); }
      else { setAiResult(data); }
    } catch (err: any) {
      setAiError(err.message);
    }
    setAiParsing(false);
  };

  const importAIResult = async () => {
    if (!aiResult?.data || !selectedGrant) return;
    setLoading(true);
    await fetch('/api/grants/tracking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'import_from_ai',
        grant_id: selectedGrant.id,
        milestones: aiResult.data.milestones || [],
        work_plan: aiResult.data.work_plan || [],
      }),
    });
    setAiResult(null);
    await loadTracking(selectedGrant.id);
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin - ติดตามทุนวิจัย</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="w-full border rounded-lg p-3 mb-3" placeholder="รหัสผ่าน Admin" />
        <button onClick={login} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700">เข้าสู่ระบบ</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ติดตามทุนวิจัย (Grant Tracking)</h1>
          <p className="text-sm text-gray-500">จัดการ Milestones, บันทึกความก้าวหน้า, S-Curve</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/grants" className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300">จัดการทุนวิจัย</Link>
          <Link href="/admin" className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300">กลับ Admin</Link>
        </div>
      </div>

      {/* Grant Selector */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">เลือกโครงการวิจัย</label>
        <select
          className="w-full border rounded-lg p-3 text-sm"
          value={selectedGrant?.id || ''}
          onChange={(e) => setSelectedGrant(grants.find((g: any) => g.id === e.target.value) || null)}
        >
          <option value="">-- เลือกโครงการ --</option>
          {grants.map((g: any) => (
            <option key={g.id} value={g.id}>
              [{g.status === 'active' ? 'ดำเนินการ' : g.status === 'completed' ? 'เสร็จ' : g.status}] {g.title_th} ({g.funding_agency})
            </option>
          ))}
        </select>
      </div>

      {selectedGrant && (
        <>
          {/* Excel plan importer */}
          <GrantPlanImportPanel
            grantId={selectedGrant.id}
            grantTitle={selectedGrant.title_th}
          />

          {/* Workplan progress dashboard (Phase X2) */}
          <div className="mb-6">
            <WorkplanProgressDashboard grantId={selectedGrant.id} />
          </div>

          {/* Grant Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-4 mb-6">
            <h2 className="font-bold text-gray-800 mb-1">{selectedGrant.title_th}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span>แหล่งทุน: <b>{selectedGrant.funding_agency}</b></span>
              {selectedGrant.budget && <span>งบ: <b className="text-green-700">{Number(selectedGrant.budget).toLocaleString()} บาท</b></span>}
              {selectedGrant.start_date && <span>ระยะเวลา: {selectedGrant.start_date} — {selectedGrant.end_date}</span>}
            </div>
          </div>

          {/* S-Curve Preview */}
          {progressLogs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">S-Curve</h3>
              <SCurveChart
                dataPoints={progressLogs}
                startDate={selectedGrant.start_date}
                endDate={selectedGrant.end_date}
                height={280}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'milestones', label: 'Milestones', count: milestones.length },
              { key: 'progress', label: 'บันทึกความก้าวหน้า', count: progressLogs.length },
              { key: 'ai', label: 'AI วิเคราะห์เอกสาร' },
              { key: 'alerts', label: 'แจ้งเตือน', count: alerts.filter((a: any) => !a.is_read).length },
            ].map((t: any) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 text-sm py-2 px-3 rounded-md font-medium transition ${
                  tab === t.key ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label} {t.count !== undefined && t.count > 0 ? `(${t.count})` : ''}
              </button>
            ))}
          </div>

          {/* Milestones Tab */}
          {tab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Milestones & สิ่งส่งมอบ</h3>
                <button onClick={() => { setShowMilestoneForm(true); setEditingMilestone(null); setMsForm({ title: '', description: '', milestone_type: 'deliverable', planned_date: '', planned_weight: '', status: 'pending', completion_pct: '0' }); }}
                  className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">+ เพิ่ม Milestone</button>
              </div>

              {showMilestoneForm && (
                <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-3">
                  <h4 className="font-semibold text-gray-800">{editingMilestone ? 'แก้ไข' : 'เพิ่ม'} Milestone</h4>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ชื่อ Milestone *</label>
                    <input className="w-full border rounded-lg p-2.5 text-sm" value={msForm.title}
                      onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">รายละเอียด</label>
                    <textarea className="w-full border rounded-lg p-2.5 text-sm" rows={2} value={msForm.description}
                      onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">ประเภท</label>
                      <select className="w-full border rounded-lg p-2.5 text-sm" value={msForm.milestone_type}
                        onChange={(e) => setMsForm({ ...msForm, milestone_type: e.target.value })}>
                        {Object.entries(milestoneTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">กำหนดส่ง *</label>
                      <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={msForm.planned_date}
                        onChange={(e) => setMsForm({ ...msForm, planned_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">น้ำหนัก (%)</label>
                      <input type="number" className="w-full border rounded-lg p-2.5 text-sm" value={msForm.planned_weight}
                        onChange={(e) => setMsForm({ ...msForm, planned_weight: e.target.value })} placeholder="15" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">สถานะ</label>
                      <select className="w-full border rounded-lg p-2.5 text-sm" value={msForm.status}
                        onChange={(e) => setMsForm({ ...msForm, status: e.target.value })}>
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ความก้าวหน้า (%): {msForm.completion_pct}%</label>
                    <input type="range" min="0" max="100" step="5" className="w-full" value={msForm.completion_pct}
                      onChange={(e) => setMsForm({ ...msForm, completion_pct: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveMilestone} disabled={loading || !msForm.title || !msForm.planned_date}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                      {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                    <button onClick={() => { setShowMilestoneForm(false); setEditingMilestone(null); }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">ยกเลิก</button>
                  </div>
                </div>
              )}

              {milestones.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
                  <p className="mb-2">ยังไม่มี Milestone</p>
                  <p className="text-sm">เพิ่มด้วยตนเอง หรือใช้ AI วิเคราะห์เอกสารในแท็บ &quot;AI วิเคราะห์เอกสาร&quot;</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m: any, idx: number) => {
                    const st = statusOptions.find(s => s.value === m.status) || statusOptions[0];
                    return (
                      <div key={m.id} className="bg-white rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{idx + 1}</span>
                              <h4 className="font-semibold text-gray-800">{m.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                            </div>
                            {m.description && <p className="text-xs text-gray-500 mb-2">{m.description}</p>}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>กำหนด: <b>{m.planned_date}</b></span>
                              <span>ประเภท: {milestoneTypes[m.milestone_type] || m.milestone_type}</span>
                              {m.planned_weight > 0 && <span>น้ำหนัก: {m.planned_weight}%</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${m.completion_pct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${Math.min(m.completion_pct || 0, 100)}%` }} />
                              </div>
                              <span className="text-xs font-medium w-10 text-right">{m.completion_pct || 0}%</span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => editMilestone(m)}
                              className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded hover:bg-blue-200">แก้ไข</button>
                            <button onClick={() => deleteMilestone(m.id)}
                              className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded hover:bg-red-100">ลบ</button>
                          </div>
                        </div>

                        {/* Deliverables */}
                        {m.grant_deliverables && m.grant_deliverables.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs font-medium text-gray-500 mb-1">สิ่งส่งมอบ:</div>
                            {m.grant_deliverables.map((d: any) => (
                              <div key={d.id} className="flex items-center gap-2 text-xs py-1">
                                <span className={`w-3.5 h-3.5 rounded ${d.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className={d.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}>{d.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {tab === 'progress' && (
            <div className="space-y-6">
              {/* Add Progress */}
              <div className="bg-white rounded-xl border p-5 space-y-4">
                <h3 className="font-bold text-gray-800">บันทึกความก้าวหน้าใหม่</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">วันที่</label>
                    <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={progressForm.log_date}
                      onChange={(e) => setProgressForm({ ...progressForm, log_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">แผน (%)</label>
                    <input type="number" min="0" max="100" className="w-full border rounded-lg p-2.5 text-sm"
                      value={progressForm.planned_pct}
                      onChange={(e) => setProgressForm({ ...progressForm, planned_pct: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">จริง (%)</label>
                    <input type="number" min="0" max="100" className="w-full border rounded-lg p-2.5 text-sm"
                      value={progressForm.actual_pct}
                      onChange={(e) => setProgressForm({ ...progressForm, actual_pct: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">งบที่ใช้ (บาท)</label>
                    <input type="number" className="w-full border rounded-lg p-2.5 text-sm"
                      value={progressForm.budget_spent}
                      onChange={(e) => setProgressForm({ ...progressForm, budget_spent: e.target.value })} placeholder="0" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={saveProgress} disabled={loading}
                      className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                      {loading ? '...' : 'บันทึก'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">สรุปงาน</label>
                    <textarea className="w-full border rounded-lg p-2.5 text-sm" rows={2} value={progressForm.summary}
                      onChange={(e) => setProgressForm({ ...progressForm, summary: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ปัญหา/อุปสรรค</label>
                    <textarea className="w-full border rounded-lg p-2.5 text-sm" rows={2} value={progressForm.issues}
                      onChange={(e) => setProgressForm({ ...progressForm, issues: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Progress Log Table */}
              {progressLogs.length > 0 && (
                <div className="bg-white rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-500">วันที่</th>
                        <th className="text-center p-3 text-xs font-medium text-gray-500">แผน (%)</th>
                        <th className="text-center p-3 text-xs font-medium text-gray-500">จริง (%)</th>
                        <th className="text-center p-3 text-xs font-medium text-gray-500">ส่วนต่าง</th>
                        <th className="text-right p-3 text-xs font-medium text-gray-500">งบใช้ไป</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500">สรุป</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {progressLogs.map((pl: any) => {
                        const diff = (pl.planned_pct || 0) - (pl.actual_pct || 0);
                        return (
                          <tr key={pl.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{pl.log_date}</td>
                            <td className="p-3 text-center text-blue-600">{pl.planned_pct}%</td>
                            <td className="p-3 text-center text-green-600">{pl.actual_pct}%</td>
                            <td className={`p-3 text-center font-bold ${diff > 10 ? 'text-red-600' : diff > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {diff > 0 ? `-${diff.toFixed(1)}%` : `+${Math.abs(diff).toFixed(1)}%`}
                            </td>
                            <td className="p-3 text-right">{pl.budget_spent ? Number(pl.budget_spent).toLocaleString() : '-'}</td>
                            <td className="p-3 text-xs text-gray-500 max-w-[200px] truncate">{pl.summary || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {tab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-gray-800 mb-4">AI วิเคราะห์เอกสารข้อเสนอ/สัญญา</h3>
                <p className="text-sm text-gray-500 mb-4">
                  อัปโหลดเอกสารข้อเสนอโครงการหรือสัญญารับทุน AI จะวิเคราะห์และสกัด Milestones, สิ่งส่งมอบ, แผนการทำงาน ให้อัตโนมัติ
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-600 block mb-1">เอกสาร (PDF, รูปภาพ)</label>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      className="w-full border rounded-lg p-2.5 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">AI Provider</label>
                      <select className="w-full border rounded-lg p-2.5 text-sm" value={aiProvider}
                        onChange={(e) => { setAiProvider(e.target.value); setAiModel(''); }}>
                        <option value="">อัตโนมัติ</option>
                        {aiProviders.map((p: any) => <option key={p.provider} value={p.provider}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Model</label>
                      <select className="w-full border rounded-lg p-2.5 text-sm" value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}>
                        <option value="">Default</option>
                        {aiProviders.find((p: any) => p.provider === aiProvider)?.models?.map((m: string) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button onClick={handleAIParse} disabled={aiParsing || !aiFile}
                  className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                  {aiParsing ? 'กำลังวิเคราะห์...' : '🤖 วิเคราะห์ด้วย AI'}
                </button>

                {aiError && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{aiError}</div>}
              </div>

              {/* AI Result Preview */}
              {aiResult?.data && (
                <div className="bg-white rounded-xl border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">ผลลัพธ์จาก AI ({aiResult.source} / {aiResult.model})</h3>
                    <button onClick={importAIResult} disabled={loading}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                      {loading ? 'กำลังนำเข้า...' : 'นำเข้า Milestones & แผนงาน'}
                    </button>
                  </div>

                  {/* Project Info */}
                  {aiResult.data.project_title_th && (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <div className="font-semibold mb-1">{aiResult.data.project_title_th}</div>
                      {aiResult.data.funding_agency && <div className="text-gray-600">แหล่งทุน: {aiResult.data.funding_agency}</div>}
                      {aiResult.data.budget && <div className="text-green-700 font-medium">งบ: {Number(aiResult.data.budget).toLocaleString()} บาท</div>}
                      {aiResult.data.duration_months && <div className="text-gray-600">ระยะเวลา: {aiResult.data.duration_months} เดือน</div>}
                    </div>
                  )}

                  {/* Milestones Preview */}
                  {aiResult.data.milestones && aiResult.data.milestones.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Milestones ({aiResult.data.milestones.length})</h4>
                      <div className="space-y-2">
                        {aiResult.data.milestones.map((m: any, i: number) => (
                          <div key={i} className="border rounded-lg p-3">
                            <div className="font-medium text-sm">{i + 1}. {m.title}</div>
                            {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                            <div className="flex gap-3 text-xs text-gray-400 mt-1">
                              <span>กำหนด: {m.planned_date}</span>
                              <span>น้ำหนัก: {m.planned_weight}%</span>
                              <span>ประเภท: {m.milestone_type}</span>
                            </div>
                            {m.deliverables && m.deliverables.length > 0 && (
                              <div className="mt-2 ml-4 text-xs text-gray-500">
                                {m.deliverables.map((d: any, j: number) => (
                                  <div key={j}>• {d.title}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Plan Preview */}
                  {aiResult.data.work_plan && aiResult.data.work_plan.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">แผนการทำงาน (S-Curve Baseline)</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-2 text-left">เดือน</th>
                              <th className="p-2 text-center">% สะสม</th>
                              <th className="p-2 text-left">กิจกรรม</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {aiResult.data.work_plan.map((wp: any) => (
                              <tr key={wp.month}>
                                <td className="p-2 font-medium">{wp.month}</td>
                                <td className="p-2 text-center text-blue-600">{wp.planned_pct}%</td>
                                <td className="p-2 text-gray-600">{wp.activities?.join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {tab === 'alerts' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">ไม่มีการแจ้งเตือน</div>
              ) : alerts.map((a: any) => {
                const typeColors: Record<string, string> = {
                  info: 'border-l-blue-400 bg-blue-50',
                  warning: 'border-l-yellow-400 bg-yellow-50',
                  danger: 'border-l-red-400 bg-red-50',
                  success: 'border-l-green-400 bg-green-50',
                };
                return (
                  <div key={a.id} className={`border-l-4 rounded-r-xl p-4 bg-white shadow-sm ${typeColors[a.alert_type] || ''} ${a.is_read ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{a.title}</div>
                        {a.message && <p className="text-xs text-gray-600 mt-1">{a.message}</p>}
                        <div className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleString('th-TH')}</div>
                      </div>
                      {!a.is_read && (
                        <button onClick={async () => {
                          await fetch('/api/grants/tracking', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'mark_alert_read', grant_id: selectedGrant.id, id: a.id }),
                          });
                          await loadTracking(selectedGrant.id);
                        }} className="text-[10px] text-blue-600 hover:underline shrink-0">อ่านแล้ว</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
