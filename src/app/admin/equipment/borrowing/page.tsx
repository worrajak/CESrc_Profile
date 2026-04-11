'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'รอพิจารณา', cls: 'bg-yellow-100 text-yellow-800' },
  advisor_approved: { label: 'ที่ปรึกษาอนุมัติ', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: 'อนุมัติแล้ว', cls: 'bg-green-100 text-green-800' },
  borrowed: { label: 'กำลังยืม', cls: 'bg-purple-100 text-purple-800' },
  returned: { label: 'คืนแล้ว', cls: 'bg-gray-100 text-gray-700' },
  overdue: { label: 'เกินกำหนด', cls: 'bg-red-100 text-red-800' },
  rejected: { label: 'ปฏิเสธ', cls: 'bg-red-50 text-red-600' },
  cancelled: { label: 'ยกเลิก', cls: 'bg-gray-50 text-gray-500' },
};

const returnCondLabels: Record<string, string> = {
  good: 'สภาพดี',
  minor_damage: 'ชำรุดเล็กน้อย',
  major_damage: 'ชำรุดมาก',
  lost: 'สูญหาย',
};

const borrowerTypeLabels: Record<string, string> = {
  student: 'นักศึกษา',
  teacher: 'อาจารย์',
  staff: 'เจ้าหน้าที่',
  external: 'บุคคลภายนอก',
};

export default function AdminBorrowingPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');
  const [returnModal, setReturnModal] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({ condition: 'good', notes: '', returned_to: '' });

  const login = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); loadRequests(); } else alert('รหัสผ่านไม่ถูกต้อง');
  };

  const loadRequests = async () => {
    const { data } = await supabase
      .from('borrow_requests')
      .select('*, equipment:equipment_id(name_th, name_en, asset_number)')
      .order('created_at', { ascending: false });

    // Check for overdue
    const now = new Date().toISOString().split('T')[0];
    const processed = (data || []).map((r: any) => {
      if (['borrowed', 'approved'].includes(r.status) && r.expected_return_date < now && !r.actual_return_date) {
        return { ...r, status: 'overdue' };
      }
      return r;
    });
    setRequests(processed);
  };

  const handleApprove = async (req: any, action: 'advisor_approve' | 'approve' | 'reject') => {
    const approverName = prompt('ชื่อผู้อนุมัติ:');
    if (!approverName) return;

    if (action === 'reject') {
      const reason = prompt('เหตุผลในการปฏิเสธ:');
      await supabase.from('borrow_requests').update({
        status: 'rejected', rejection_reason: reason, approved_by: approverName, approved_at: new Date().toISOString(),
      }).eq('id', req.id);
    } else if (action === 'advisor_approve') {
      await supabase.from('borrow_requests').update({
        status: 'advisor_approved', advisor_approved_by: approverName, advisor_approved_at: new Date().toISOString(),
      }).eq('id', req.id);
    } else {
      await supabase.from('borrow_requests').update({
        status: 'borrowed', approved_by: approverName, approved_at: new Date().toISOString(),
      }).eq('id', req.id);
      // Decrement available quantity
      const { data: eq } = await supabase.from('equipment').select('quantity_available').eq('id', req.equipment_id).single();
      if (eq) {
        await supabase.from('equipment').update({
          quantity_available: Math.max(0, eq.quantity_available - req.quantity),
          status: eq.quantity_available - req.quantity <= 0 ? 'borrowed' : 'available',
        }).eq('id', req.equipment_id);
      }
    }
    await loadRequests();
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    const { data: eq } = await supabase.from('equipment').select('quantity_available, quantity_total').eq('id', returnModal.equipment_id).single();

    await supabase.from('borrow_requests').update({
      status: 'returned',
      actual_return_date: new Date().toISOString().split('T')[0],
      return_condition: returnForm.condition,
      return_notes: returnForm.notes,
      returned_to: returnForm.returned_to,
    }).eq('id', returnModal.id);

    // Increment available quantity
    if (eq) {
      const newQty = Math.min(eq.quantity_total, eq.quantity_available + returnModal.quantity);
      await supabase.from('equipment').update({
        quantity_available: newQty,
        status: newQty > 0 ? 'available' : 'borrowed',
      }).eq('id', returnModal.equipment_id);
    }

    setReturnModal(null);
    setReturnForm({ condition: 'good', notes: '', returned_to: '' });
    await loadRequests();
  };

  const filteredRequests = tab === 'all' ? requests : requests.filter((r: any) => r.status === tab);
  const tabs = ['pending', 'advisor_approved', 'approved', 'borrowed', 'overdue', 'returned', 'rejected'];

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin - ระบบยืม-คืน</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="w-full border rounded-lg p-3 mb-3" placeholder="รหัสผ่าน Admin" />
        <button onClick={login} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700">เข้าสู่ระบบ</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ระบบยืม-คืนครุภัณฑ์</h1>
          <p className="text-sm text-gray-500">Equipment Borrowing Management ({requests.length} รายการ)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTab('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${tab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          ทั้งหมด ({requests.length})
        </button>
        {tabs.map((t) => {
          const count = requests.filter((r: any) => r.status === t).length;
          const cfg = statusConfig[t];
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${tab === t ? 'ring-2 ring-offset-1 ring-cyan-400' : ''} ${cfg.cls}`}>
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 && (
          <div className="text-center text-gray-400 py-12">ไม่มีรายการ</div>
        )}
        {filteredRequests.map((req: any) => {
          const st = statusConfig[req.status] || statusConfig.pending;
          const eqName = req.equipment?.name_th || 'N/A';
          const isOverdue = req.status === 'overdue';
          const daysOverdue = isOverdue ? Math.ceil((Date.now() - new Date(req.expected_return_date).getTime()) / 86400000) : 0;

          return (
            <div key={req.id} className={`bg-white rounded-xl border p-5 ${isOverdue ? 'border-red-300 bg-red-50/30' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{eqName}</span>
                    {req.equipment?.name_en && <span className="text-xs text-gray-500">({req.equipment.name_en})</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    {isOverdue && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">เกิน {daysOverdue} วัน</span>}
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">x{req.quantity}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                    <div>ผู้ยืม: <b className="text-gray-800">{req.borrower_name}</b> ({borrowerTypeLabels[req.borrower_type]})</div>
                    <div>โทร: {req.borrower_phone}</div>
                    {req.borrower_student_id && <div>รหัส นศ.: {req.borrower_student_id}</div>}
                    {req.advisor_name && <div>ที่ปรึกษา: <b>{req.advisor_name}</b></div>}
                    <div>วันที่ยืม: {req.borrow_date}</div>
                    <div>กำหนดคืน: <b className={isOverdue ? 'text-red-600' : ''}>{req.expected_return_date}</b></div>
                  </div>
                  <div className="text-xs text-gray-500">วัตถุประสงค์: {req.purpose}</div>
                  {req.approved_by && <div className="text-[10px] text-green-700">อนุมัติโดย: {req.approved_by}</div>}
                  {req.rejection_reason && <div className="text-[10px] text-red-600">เหตุผลปฏิเสธ: {req.rejection_reason}</div>}
                  {req.return_condition && <div className="text-[10px] text-gray-600">สภาพคืน: {returnCondLabels[req.return_condition]} {req.return_notes ? `— ${req.return_notes}` : ''}</div>}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {req.status === 'pending' && req.borrower_type === 'student' && (
                    <button onClick={() => handleApprove(req, 'advisor_approve')}
                      className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">ที่ปรึกษาอนุมัติ</button>
                  )}
                  {['pending', 'advisor_approved'].includes(req.status) && (
                    <>
                      <button onClick={() => handleApprove(req, 'approve')}
                        className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">อนุมัติ</button>
                      <button onClick={() => handleApprove(req, 'reject')}
                        className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200">ปฏิเสธ</button>
                    </>
                  )}
                  {['borrowed', 'approved', 'overdue'].includes(req.status) && (
                    <button onClick={() => { setReturnModal(req); setReturnForm({ condition: 'good', notes: '', returned_to: '' }); }}
                      className="text-xs bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700">บันทึกการคืน</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setReturnModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800">บันทึกการคืนครุภัณฑ์</h3>
            <p className="text-sm text-gray-600">อุปกรณ์: <b>{returnModal.equipment?.name_th}</b></p>
            <p className="text-sm text-gray-600">ผู้ยืม: <b>{returnModal.borrower_name}</b></p>
            <div>
              <label className="text-xs text-gray-600 block mb-1">สภาพเมื่อคืน *</label>
              <select value={returnForm.condition} onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm">
                <option value="good">สภาพดี</option>
                <option value="minor_damage">ชำรุดเล็กน้อย</option>
                <option value="major_damage">ชำรุดมาก</option>
                <option value="lost">สูญหาย</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">ผู้รับคืน</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={returnForm.returned_to}
                onChange={(e) => setReturnForm({ ...returnForm, returned_to: e.target.value })} placeholder="ชื่อผู้รับคืน" />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">หมายเหตุ</label>
              <textarea className="w-full border rounded-lg p-2 text-sm" rows={2} value={returnForm.notes}
                onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleReturn} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">บันทึกการคืน</button>
              <button onClick={() => setReturnModal(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
