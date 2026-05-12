'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const catLabels: Record<string, string> = {
  test_measurement: 'เครื่องมือวัด',
  solar_pv_test: 'ทดสอบ PV',
  lab_facility: 'อุปกรณ์ Lab',
  computer_it: 'คอมพิวเตอร์/IT',
  safety: 'ความปลอดภัย',
  other: 'อื่นๆ',
};

const statusLabels: Record<string, { label: string; cls: string }> = {
  available: { label: 'พร้อมใช้', cls: 'bg-green-100 text-green-800' },
  borrowed: { label: 'ถูกยืม', cls: 'bg-yellow-100 text-yellow-800' },
  maintenance: { label: 'ซ่อมบำรุง', cls: 'bg-orange-100 text-orange-800' },
  disposed: { label: 'ตัดจำหน่าย', cls: 'bg-red-100 text-red-700' },
};

export default function AdminEquipmentPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    name_th: '', name_en: '', brand: '', model: '', serial_number: '', asset_number: '',
    category: 'test_measurement', status: 'available', quantity_total: 1, quantity_available: 1,
    location: 'ห้องปฏิบัติการพลังงานแสงอาทิตย์ (Solar Lab)',
    description_th: '', purchase_date: '', purchase_value: '', notes: '',
    disposed_date: '', disposed_reason: '',
  };
  const [form, setForm] = useState(emptyForm);

  const login = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); loadItems(); } else alert('รหัสผ่านไม่ถูกต้อง');
  };

  const loadItems = async () => {
    const q = supabase.from('cesru_equipment').select('*').order('category').order('name_th');
    const { data } = await q;
    setItems(data || []);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload: any = { ...form };
    if (!payload.purchase_date) delete payload.purchase_date;
    if (!payload.purchase_value) delete payload.purchase_value;
    else payload.purchase_value = parseFloat(payload.purchase_value);
    if (!payload.disposed_date) delete payload.disposed_date;
    payload.quantity_total = parseInt(payload.quantity_total as any) || 1;
    payload.quantity_available = parseInt(payload.quantity_available as any) || 1;

    if (editing) {
      await supabase.from('cesru_equipment').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('cesru_equipment').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    await loadItems();
    setLoading(false);
  };

  const handleDispose = async (item: any) => {
    const reason = prompt('เหตุผลในการตัดจำหน่าย:');
    if (!reason) return;
    await supabase.from('cesru_equipment').update({
      status: 'disposed',
      disposed_date: new Date().toISOString().split('T')[0],
      disposed_reason: reason,
      quantity_available: 0,
    }).eq('id', item.id);
    await loadItems();
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`ลบ "${item.name_th}" ออกจากระบบ?`)) return;
    await supabase.from('cesru_equipment').delete().eq('id', item.id);
    await loadItems();
  };

  const startEdit = (item: any) => {
    setForm({
      name_th: item.name_th || '', name_en: item.name_en || '',
      brand: item.brand || '', model: item.model || '',
      serial_number: item.serial_number || '', asset_number: item.asset_number || '',
      category: item.category, status: item.status,
      quantity_total: item.quantity_total, quantity_available: item.quantity_available,
      location: item.location || '', description_th: item.description_th || '',
      purchase_date: item.purchase_date || '', purchase_value: item.purchase_value || '',
      notes: item.notes || '', disposed_date: item.disposed_date || '', disposed_reason: item.disposed_reason || '',
    });
    setEditing(item);
    setShowForm(true);
  };

  const filteredItems = filter === 'all' ? items : items.filter((i: any) => i.status === filter);

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin - จัดการครุภัณฑ์</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="w-full border rounded-lg p-3 mb-3" placeholder="รหัสผ่าน Admin" />
        <button onClick={login} className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700">เข้าสู่ระบบ</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการทะเบียนครุภัณฑ์</h1>
          <p className="text-sm text-gray-500">Equipment Management ({items.length} รายการ)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/equipment/borrowing"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition">
            ระบบยืม-คืน
          </Link>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(!showForm); }}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-700 transition">
            + เพิ่มครุภัณฑ์
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'all', label: 'ทั้งหมด', count: items.length, cls: 'border-gray-300' },
          { key: 'available', label: 'พร้อมใช้', count: items.filter((i: any) => i.status === 'available').length, cls: 'border-green-400' },
          { key: 'borrowed', label: 'ถูกยืม', count: items.filter((i: any) => i.status === 'borrowed').length, cls: 'border-yellow-400' },
          { key: 'maintenance', label: 'ซ่อมบำรุง', count: items.filter((i: any) => i.status === 'maintenance').length, cls: 'border-orange-400' },
          { key: 'disposed', label: 'ตัดจำหน่าย', count: items.filter((i: any) => i.status === 'disposed').length, cls: 'border-red-400' },
        ].map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`border-l-4 ${s.cls} bg-white rounded-lg p-3 text-left hover:shadow transition ${filter === s.key ? 'ring-2 ring-cyan-300' : ''}`}>
            <div className="text-xl font-bold text-gray-800">{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <h3 className="font-bold text-gray-800">{editing ? 'แก้ไขครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-600">ชื่อ (ไทย) *</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.name_th} onChange={(e) => setForm({ ...form, name_th: e.target.value })} required /></div>
            <div><label className="text-xs text-gray-600">ชื่อ (EN)</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">ยี่ห้อ</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">รุ่น</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">Serial Number</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">เลขครุภัณฑ์</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.asset_number} onChange={(e) => setForm({ ...form, asset_number: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">หมวดหมู่</label>
              <select className="w-full border rounded-lg p-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-600">สถานะ</label>
              <select className="w-full border rounded-lg p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-600">จำนวนรวม</label>
                <input type="number" min={1} className="w-full border rounded-lg p-2 text-sm" value={form.quantity_total} onChange={(e) => setForm({ ...form, quantity_total: parseInt(e.target.value) || 1 })} /></div>
              <div><label className="text-xs text-gray-600">จำนวนว่าง</label>
                <input type="number" min={0} className="w-full border rounded-lg p-2 text-sm" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><label className="text-xs text-gray-600">สถานที่</label>
              <input className="w-full border rounded-lg p-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">วันที่ซื้อ</label>
              <input type="date" className="w-full border rounded-lg p-2 text-sm" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
            <div><label className="text-xs text-gray-600">ราคาจัดซื้อ (บาท)</label>
              <input type="number" className="w-full border rounded-lg p-2 text-sm" value={form.purchase_value} onChange={(e) => setForm({ ...form, purchase_value: e.target.value })} /></div>
          </div>
          <div><label className="text-xs text-gray-600">รายละเอียด / หมายเหตุ</label>
            <textarea className="w-full border rounded-lg p-2 text-sm" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50">
              {loading ? 'กำลังบันทึก...' : editing ? 'อัปเดต' : 'บันทึก'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">ครุภัณฑ์</th>
              <th className="text-left p-3 font-semibold text-gray-700 hidden md:table-cell">หมวด</th>
              <th className="text-center p-3 font-semibold text-gray-700">สถานะ</th>
              <th className="text-center p-3 font-semibold text-gray-700">จำนวน</th>
              <th className="text-center p-3 font-semibold text-gray-700">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.map((item: any) => {
              const st = statusLabels[item.status] || statusLabels.available;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{item.name_th}</div>
                    {item.name_en && <div className="text-xs text-gray-500">{item.name_en}</div>}
                    {item.asset_number && <div className="text-[10px] text-gray-400 font-mono">{item.asset_number}</div>}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{catLabels[item.category] || item.category}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="p-3 text-center font-mono">
                    {item.quantity_available}/{item.quantity_total}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => startEdit(item)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">แก้ไข</button>
                      {item.status !== 'disposed' && (
                        <button onClick={() => handleDispose(item)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">ตัดจำหน่าย</button>
                      )}
                      <button onClick={() => handleDelete(item)} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded hover:bg-gray-100">ลบ</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
