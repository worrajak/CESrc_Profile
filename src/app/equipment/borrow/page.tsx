'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function BorrowForm() {
  const searchParams = useSearchParams();
  const preId = searchParams.get('id') || '';
  const preName = searchParams.get('name') || '';

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    equipment_id: preId,
    quantity: 1,
    borrower_type: 'student' as string,
    borrower_name: '',
    borrower_student_id: '',
    borrower_email: '',
    borrower_phone: '',
    borrower_department: 'Division of Electrical Engineering',
    advisor_name: '',
    advisor_id: '',
    purpose: '',
    borrow_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
  });

  useEffect(() => {
    supabase.from('equipment').select('id, name_th, name_en, quantity_available, status')
      .eq('status', 'available').order('name_th')
      .then(({ data }) => setEquipmentList(data || []));
    supabase.from('researchers').select('id, title_th, first_name_th, last_name_th')
      .eq('is_active', true).order('last_name_th')
      .then(({ data }) => setResearchers(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.equipment_id) { setError('กรุณาเลือกอุปกรณ์'); setLoading(false); return; }
    if (!form.expected_return_date) { setError('กรุณาระบุวันที่คืน'); setLoading(false); return; }
    if (form.borrower_type === 'student' && !form.advisor_name && !form.advisor_id) {
      setError('นักศึกษาต้องระบุอาจารย์ที่ปรึกษา'); setLoading(false); return;
    }

    const payload: any = { ...form };
    if (!payload.advisor_id) delete payload.advisor_id;
    if (!payload.borrower_student_id) delete payload.borrower_student_id;

    // Get advisor name from researcher if selected
    if (form.advisor_id) {
      const adv = researchers.find((r: any) => r.id === form.advisor_id);
      if (adv) payload.advisor_name = `${adv.title_th}${adv.first_name_th} ${adv.last_name_th}`;
    }

    const { error: err } = await supabase.from('borrow_requests').insert(payload);
    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="text-5xl mb-4">&#9989;</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">ส่งคำขอยืมสำเร็จ!</h2>
          <p className="text-green-700 text-sm mb-6">
            คำขอของคุณอยู่ระหว่างรอพิจารณา
            {form.borrower_type === 'student' && ' อาจารย์ที่ปรึกษาจะได้รับการแจ้งเตือนเพื่ออนุมัติ'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/equipment" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
              กลับหน้าครุภัณฑ์
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">แบบฟอร์มขอยืมครุภัณฑ์</h1>
      <p className="text-gray-500 text-sm mb-6">Equipment Borrow Request Form</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment Selection */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-gray-800">1. เลือกอุปกรณ์</h3>
          <div>
            <label className="text-sm text-gray-600 block mb-1">อุปกรณ์ที่ต้องการยืม *</label>
            <select
              value={form.equipment_id}
              onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm"
              required
            >
              <option value="">-- เลือกอุปกรณ์ --</option>
              {equipmentList.map((eq: any) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name_th} {eq.name_en ? `(${eq.name_en})` : ''} — ว่าง {eq.quantity_available}
                </option>
              ))}
            </select>
            {preName && <p className="text-xs text-cyan-600 mt-1">เลือกไว้: {preName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">จำนวน *</label>
              <input type="number" min={1} value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full border rounded-lg p-2.5 text-sm" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">ประเภทผู้ยืม *</label>
              <select value={form.borrower_type}
                onChange={(e) => setForm({ ...form, borrower_type: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" required>
                <option value="student">นักศึกษา</option>
                <option value="teacher">อาจารย์</option>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="external">บุคคลภายนอก</option>
              </select>
            </div>
          </div>
        </div>

        {/* Borrower Info */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-gray-800">2. ข้อมูลผู้ยืม</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">ชื่อ-สกุล *</label>
              <input type="text" value={form.borrower_name}
                onChange={(e) => setForm({ ...form, borrower_name: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" required placeholder="ชื่อ-นามสกุล" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">เบอร์โทรศัพท์ *</label>
              <input type="tel" value={form.borrower_phone}
                onChange={(e) => setForm({ ...form, borrower_phone: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" required placeholder="08x-xxx-xxxx" />
            </div>
            {form.borrower_type === 'student' && (
              <div>
                <label className="text-sm text-gray-600 block mb-1">รหัสนักศึกษา</label>
                <input type="text" value={form.borrower_student_id}
                  onChange={(e) => setForm({ ...form, borrower_student_id: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm" placeholder="เช่น 64xxxxxx" />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input type="email" value={form.borrower_email}
                onChange={(e) => setForm({ ...form, borrower_email: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" placeholder="example@rmutl.ac.th" />
            </div>
            <div className={form.borrower_type === 'student' ? '' : 'sm:col-span-2'}>
              <label className="text-sm text-gray-600 block mb-1">สาขา/ภาควิชา</label>
              <input type="text" value={form.borrower_department}
                onChange={(e) => setForm({ ...form, borrower_department: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" />
            </div>
          </div>
        </div>

        {/* Advisor (for students) */}
        {form.borrower_type === 'student' && (
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <h3 className="font-bold text-gray-800">3. อาจารย์ที่ปรึกษา / ผู้ประสานงาน</h3>
            <p className="text-xs text-gray-500">นักศึกษาต้องมีอาจารย์ที่ปรึกษาหรือผู้ประสานงานกำกับการยืม</p>
            <div>
              <label className="text-sm text-gray-600 block mb-1">เลือกอาจารย์ CESRU</label>
              <select value={form.advisor_id}
                onChange={(e) => setForm({ ...form, advisor_id: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm">
                <option value="">-- เลือก (ถ้าเป็นสมาชิก CESRU) --</option>
                {researchers.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.title_th}{r.first_name_th} {r.last_name_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">หรือระบุชื่ออาจารย์ที่ปรึกษา</label>
              <input type="text" value={form.advisor_name}
                onChange={(e) => setForm({ ...form, advisor_name: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" placeholder="ชื่อ-สกุล อาจารย์ที่ปรึกษา (ถ้าไม่ได้เลือกจากรายชื่อด้านบน)" />
            </div>
          </div>
        )}

        {/* Borrow Details */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-gray-800">{form.borrower_type === 'student' ? '4' : '3'}. รายละเอียดการยืม</h3>
          <div>
            <label className="text-sm text-gray-600 block mb-1">วัตถุประสงค์การยืม *</label>
            <textarea value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm" rows={3} required
              placeholder="เช่น ใช้ในโครงงานวิศวกรรม เรื่อง... / ใช้ตรวจสอบระบบ Solar Rooftop ที่..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">วันที่ยืม *</label>
              <input type="date" value={form.borrow_date}
                onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">วันที่คืน (กำหนด) *</label>
              <input type="date" value={form.expected_return_date}
                onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm" required />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition disabled:opacity-50"
        >
          {loading ? 'กำลังส่ง...' : 'ส่งคำขอยืม'}
        </button>
      </form>
    </div>
  );
}

export default function BorrowPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">กำลังโหลด...</div>}>
      <BorrowForm />
    </Suspense>
  );
}
