'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import IngestInnovationModal, { type ExtractedInnovation } from '@/components/admin/IngestInnovationModal';

type Researcher = {
  id: string;
  title_th: string | null;
  first_name_th: string | null;
  last_name_th: string | null;
  email: string | null;
  phone: string | null;
};

type Innovation = {
  id: string;
  title_th: string;
  title_en: string | null;
  short_desc_th: string | null;
  innovation_type: string;
  ip_number: string | null;
  filing_date: string | null;
  grant_date: string | null;
  status: string;
  cover_image_url: string | null;
  image_urls: string[] | null;
  inventor_ids: string[] | null;
  contact_researcher_id: string | null;
  license_type: string | null;
  license_holder_name: string | null;
  license_contract_no: string | null;
  license_start_date: string | null;
  license_end_date: string | null;
  license_territory: string | null;
  license_fee_thb: number | null;
  license_fee_breakdown: any;
  documents: any[];
  long_desc_th: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
};

const TYPES = [
  { value: 'petty_patent', label: 'อนุสิทธิบัตร' },
  { value: 'patent', label: 'สิทธิบัตร' },
  { value: 'copyright', label: 'ลิขสิทธิ์' },
  { value: 'trademark', label: 'เครื่องหมายการค้า' },
  { value: 'trade_secret', label: 'ความลับทางการค้า' },
  { value: 'prototype', label: 'ต้นแบบ' },
];

const STATUSES = [
  { value: 'concept', label: 'แนวคิด' },
  { value: 'filed', label: 'ยื่นคำขอแล้ว' },
  { value: 'granted', label: 'ได้รับอนุมัติ' },
  { value: 'expired', label: 'หมดอายุ' },
  { value: 'abandoned', label: 'ยกเลิก' },
];

const LICENSE_TYPES = [
  { value: '', label: '— ไม่ระบุ —' },
  { value: 'exclusive', label: 'Exclusive (เฉพาะแต่ผู้เดียว)' },
  { value: 'sole', label: 'Sole (ร่วมกับผู้อนุญาต)' },
  { value: 'non_exclusive', label: 'Non-exclusive (หลายราย)' },
];

export default function AdminInnovationsPage() {
  const [items, setItems] = useState<Innovation[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Innovation> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const gallInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Fee calculator inputs
  const [feeInputs, setFeeInputs] = useState({ disclosure_fee: 0, vat_pct: 7 });

  // AI ingest modal
  const [showAIIngest, setShowAIIngest] = useState(false);

  const applyAIExtract = (data: ExtractedInnovation, meta: { source: string; model: string }) => {
    // Merge into editing — only set fields the AI provided (non-empty values)
    const merged: any = { ...(editing || {}) };
    const fields = [
      'title_th', 'title_en', 'short_desc_th', 'long_desc_th',
      'innovation_type', 'ip_number', 'filing_date', 'grant_date', 'status',
      'license_type', 'license_holder_name', 'license_contract_no',
      'license_start_date', 'license_end_date', 'license_territory',
      'license_fee_thb', 'notes',
    ];
    for (const k of fields) {
      const v = (data as any)[k];
      if (v != null && v !== '') merged[k] = v;
    }
    // license_fee_breakdown gets merged
    if (data.license_fee_breakdown) {
      merged.license_fee_breakdown = {
        ...(merged.license_fee_breakdown || {}),
        ...data.license_fee_breakdown,
      };
      // Sync fee calculator inputs if AI gave disclosure_fee / vat_pct
      const fb = data.license_fee_breakdown;
      setFeeInputs({
        disclosure_fee: fb.disclosure_fee || feeInputs.disclosure_fee,
        vat_pct: fb.vat_pct ?? feeInputs.vat_pct,
      });
    }
    setEditing(merged);
    setMessage(`✓ AI กรอกข้อมูลให้แล้ว (${meta.source})`);
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [innRes, rsRes] = await Promise.all([
      supabase.from('cesru_innovations').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('researchers')
        .select('id, title_th, first_name_th, last_name_th, email, phone, unit_role, is_active')
        .eq('is_active', true)
        .order('first_name_th'),
    ]);
    setItems((innRes.data || []) as Innovation[]);
    setResearchers((rsRes.data || []) as Researcher[]);
    setLoading(false);
  };

  const startNew = () => {
    setEditing({
      title_th: '',
      innovation_type: 'petty_patent',
      status: 'filed',
      inventor_ids: [],
      image_urls: [],
      documents: [],
      is_active: true,
      sort_order: 0,
    });
    setFeeInputs({ disclosure_fee: 0, vat_pct: 7 });
  };

  const startEdit = (it: Innovation) => {
    setEditing({ ...it });
    const fb = it.license_fee_breakdown || {};
    setFeeInputs({
      disclosure_fee: fb.disclosure_fee || 0,
      vat_pct: fb.vat_pct || 7,
    });
  };

  const getAdminPwd = () =>
    (typeof window !== 'undefined' && sessionStorage.getItem('admin_pwd')) || '';

  const uploadImage = async (file: File, target: 'cover' | 'gallery') => {
    setUploading(true);
    setMessage('');
    try {
      const pwd = getAdminPwd();
      if (!pwd) {
        throw new Error('ไม่พบ admin password ใน session — โปรด sign in ที่ /admin ก่อน');
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('password', pwd);
      fd.append('folder', 'innovations');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'upload failed');
      if (target === 'cover') {
        setEditing((p) => ({ ...p!, cover_image_url: data.url }));
      } else {
        setEditing((p) => ({
          ...p!,
          image_urls: [...((p?.image_urls as string[]) || []), data.url].slice(0, 4),
        }));
      }
    } catch (e: any) {
      setMessage('อัปโหลดรูปไม่สำเร็จ: ' + (e.message || ''));
    } finally {
      setUploading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);
    setMessage('');
    try {
      const pwd = getAdminPwd();
      if (!pwd) {
        throw new Error('ไม่พบ admin password ใน session — โปรด sign in ที่ /admin ก่อน');
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('password', pwd);
      fd.append('folder', 'innovations');
      fd.append('type', file.type === 'application/pdf' ? 'document' : '');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'upload failed');
      const ext = file.name.split('.').pop()?.toLowerCase();
      const type = ext === 'pdf' ? 'pdf' : ['jpg', 'jpeg', 'png'].includes(ext || '') ? 'image' : ext;
      setEditing((p) => ({
        ...p!,
        documents: [
          ...((p?.documents as any[]) || []),
          { label: file.name, url: data.url, type, size_kb: Math.round(file.size / 1024) },
        ],
      }));
    } catch (e: any) {
      setMessage('อัปโหลดเอกสารไม่สำเร็จ: ' + (e.message || ''));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing || !editing.title_th?.trim()) {
      setMessage('กรุณาใส่ชื่อนวัตกรรม');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      // Compute fee
      const vatAmount = (feeInputs.disclosure_fee * feeInputs.vat_pct) / 100;
      const total = feeInputs.disclosure_fee + vatAmount;

      const payload: any = {
        ...editing,
        license_fee_thb: total > 0 ? total : editing.license_fee_thb || null,
        license_fee_breakdown: {
          disclosure_fee: feeInputs.disclosure_fee,
          vat_pct: feeInputs.vat_pct,
          vat_amount: vatAmount,
          ...(editing.license_fee_breakdown || {}),
        },
        filing_date: editing.filing_date || null,
        grant_date: editing.grant_date || null,
        license_start_date: editing.license_start_date || null,
        license_end_date: editing.license_end_date || null,
        contact_researcher_id: editing.contact_researcher_id || null,
      };

      let result;
      if (editing.id) {
        result = await supabase.from('cesru_innovations').update(payload).eq('id', editing.id);
      } else {
        delete payload.id;
        result = await supabase.from('cesru_innovations').insert(payload);
      }
      if (result.error) throw result.error;

      setMessage(editing.id ? '✓ บันทึกการแก้ไขแล้ว' : '✓ เพิ่มนวัตกรรมใหม่แล้ว');
      setEditing(null);
      await fetchAll();
    } catch (e: any) {
      setMessage('บันทึกไม่สำเร็จ: ' + (e.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบนวัตกรรมนี้?')) return;
    await supabase.from('cesru_innovations').delete().eq('id', id);
    await fetchAll();
  };

  const fmtName = (r: Researcher) =>
    `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`.trim();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💡 จัดการนวัตกรรม</h1>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin Dashboard</Link>
        </div>
        {!editing && (
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/innovations/draft-filing"
              className="px-3 py-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white text-sm rounded-lg hover:opacity-90 font-medium shadow-sm"
              title="มีแค่ไอเดีย — ให้ AI ร่างเอกสารสำหรับยื่นจดสิทธิบัตร"
            >
              🪄 ร่างเอกสารยื่นจด
            </Link>
            <button
              onClick={() => setShowAIIngest(true)}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:opacity-90 font-medium shadow-sm"
              title="วาง URL/ข้อความ หรืออัปโหลดรูป แล้วให้ AI กรอกฟอร์มให้"
            >
              ✨ AI สกัดเอกสารที่มี
            </button>
            <button
              onClick={startNew}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              + เพิ่มเปล่า
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${message.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-800">
              {editing.id ? '✏️ แก้ไข' : '+ เพิ่ม'} นวัตกรรม
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAIIngest(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-lg hover:opacity-90 font-medium shadow-sm"
                title="วาง URL/ข้อความ หรืออัปโหลดรูปเอกสาร แล้วให้ AI กรอกฟอร์มให้"
              >
                ✨ AI สกัดเอกสาร
              </button>
              <button type="button" onClick={() => { setEditing(null); setMessage(''); }} className="text-gray-500 hover:text-gray-800 text-xl leading-none">×</button>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อนวัตกรรม (ไทย) *</label>
              <input type="text" value={editing.title_th || ''} onChange={(e) => setEditing({ ...editing, title_th: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title (English)</label>
              <input type="text" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Type / Status / IP No */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
              <select value={editing.innovation_type} onChange={(e) => setEditing({ ...editing, innovation_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">เลขที่ (อนุสิทธิบัตร/สิทธิบัตร)</label>
              <input type="text" value={editing.ip_number || ''} onChange={(e) => setEditing({ ...editing, ip_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="2001008879" />
            </div>
          </div>

          {/* Short desc */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">คำอธิบายสั้น</label>
            <textarea value={editing.short_desc_th || ''} onChange={(e) => setEditing({ ...editing, short_desc_th: e.target.value })}
              rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">วันยื่นคำขอ</label>
              <input type="date" value={editing.filing_date || ''} onChange={(e) => setEditing({ ...editing, filing_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">วันได้รับอนุมัติ</label>
              <input type="date" value={editing.grant_date || ''} onChange={(e) => setEditing({ ...editing, grant_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Inventors + Contact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ผู้ประดิษฐ์ (เลือกได้หลายคน)</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {researchers.map((r) => {
                const checked = (editing.inventor_ids || []).includes(r.id);
                return (
                  <label key={r.id} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-blue-50 p-1 rounded">
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const ids = editing.inventor_ids || [];
                      setEditing({
                        ...editing,
                        inventor_ids: e.target.checked ? [...ids, r.id] : ids.filter((x: string) => x !== r.id),
                      });
                    }} />
                    <span className="truncate">{fmtName(r)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ผู้ติดต่อหลัก (เลือก 1 คน)</label>
            <select value={editing.contact_researcher_id || ''} onChange={(e) => setEditing({ ...editing, contact_researcher_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">— เลือก —</option>
              {researchers.map((r) => (
                <option key={r.id} value={r.id}>
                  {fmtName(r)} {r.email ? `(${r.email})` : ''}
                </option>
              ))}
            </select>
            {editing.contact_researcher_id && (() => {
              const c = researchers.find((r) => r.id === editing.contact_researcher_id);
              return c ? (
                <p className="text-[10px] text-blue-600 mt-1">
                  ✉️ {c.email || '—'} · 📱 {c.phone || '—'}
                </p>
              ) : null;
            })()}
          </div>

          {/* Cover image upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">รูป Cover (1 รูป)</label>
              {editing.cover_image_url ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.cover_image_url} alt="cover" className="w-full h-32 object-cover rounded-lg border" />
                  <button type="button" onClick={() => setEditing({ ...editing, cover_image_url: null })}
                    className="absolute top-1 right-1 w-6 h-6 bg-white shadow rounded-full text-red-600 hover:bg-red-50">×</button>
                </div>
              ) : (
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 text-sm">
                  {uploading ? '⏳ อัปโหลด...' : '📤 อัปโหลด cover'}
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'cover'); }} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">รูปประกอบ (สูงสุด 3 รูป)</label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {(editing.image_urls || []).map((url: string, i: number) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-20 object-cover rounded border" />
                    <button type="button" onClick={() => setEditing({ ...editing, image_urls: (editing.image_urls || []).filter((_: string, idx: number) => idx !== i) })}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-white shadow rounded-full text-red-600 text-xs hover:bg-red-50">×</button>
                  </div>
                ))}
                {(editing.image_urls?.length || 0) < 3 && (
                  <button type="button" onClick={() => gallInputRef.current?.click()} disabled={uploading}
                    className="h-20 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:bg-gray-50 text-2xl">+</button>
                )}
              </div>
              <input ref={gallInputRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'gallery'); }} />
            </div>
          </div>

          {/* License info */}
          <div className="border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-emerald-800">💰 ข้อมูลการให้สิทธิ (License info)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">ประเภทสิทธิ</label>
                <select value={editing.license_type || ''} onChange={(e) => setEditing({ ...editing, license_type: e.target.value || null })}
                  className="w-full px-3 py-1.5 border rounded text-sm">
                  {LICENSE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">สัญญาเลขที่</label>
                <input type="text" value={editing.license_contract_no || ''} onChange={(e) => setEditing({ ...editing, license_contract_no: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm font-mono" placeholder="TLO-LCA-2567-002" />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">ผู้รับสิทธิ</label>
                <input type="text" value={editing.license_holder_name || ''} onChange={(e) => setEditing({ ...editing, license_holder_name: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">อาณาเขต</label>
                <input type="text" value={editing.license_territory || ''} onChange={(e) => setEditing({ ...editing, license_territory: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm" placeholder="Thailand" />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">เริ่มต้นสิทธิ</label>
                <input type="date" value={editing.license_start_date || ''} onChange={(e) => setEditing({ ...editing, license_start_date: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">สิ้นสุดสิทธิ</label>
                <input type="date" value={editing.license_end_date || ''} onChange={(e) => setEditing({ ...editing, license_end_date: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm" />
              </div>
            </div>

            {/* Fee calculator */}
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-2">🧮 คำนวณค่าสิทธิ</p>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Disclosure fee (฿)</label>
                  <input type="number" value={feeInputs.disclosure_fee} onChange={(e) => setFeeInputs({ ...feeInputs, disclosure_fee: +e.target.value })}
                    className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">VAT (%)</label>
                  <input type="number" value={feeInputs.vat_pct} onChange={(e) => setFeeInputs({ ...feeInputs, vat_pct: +e.target.value })}
                    className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <p className="block text-[10px] text-gray-600 mb-1">รวมสุทธิ</p>
                  <p className="text-sm font-bold text-emerald-700">
                    {(feeInputs.disclosure_fee * (1 + feeInputs.vat_pct / 100)).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">เอกสารแนบ (PDF, รูป)</label>
            <div className="space-y-1.5 mb-2">
              {(editing.documents || []).map((doc: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border">
                  <span>{doc.type === 'pdf' ? '📄' : '🖼️'}</span>
                  <input type="text" value={doc.label} onChange={(e) => {
                    const docs = [...(editing.documents || [])];
                    docs[i] = { ...docs[i], label: e.target.value };
                    setEditing({ ...editing, documents: docs });
                  }} className="flex-1 px-2 py-1 border-0 bg-transparent text-xs focus:bg-white" />
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">view</a>
                  <button type="button" onClick={() => setEditing({ ...editing, documents: (editing.documents || []).filter((_: any, idx: number) => idx !== i) })}
                    className="text-red-500 text-xs">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploading}
              className="text-xs px-3 py-1 border rounded hover:bg-gray-50">
              📎 {uploading ? 'อัปโหลด...' : 'เพิ่มเอกสาร'}
            </button>
            <input ref={docInputRef} type="file" accept=".pdf,image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); }} />
          </div>

          {/* Long description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea value={editing.long_desc_th || ''} onChange={(e) => setEditing({ ...editing, long_desc_th: e.target.value })}
              rows={4} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            แสดงบนเว็บไซต์
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">
              {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button type="button" onClick={() => { setEditing(null); setMessage(''); }}
              className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {!editing && (
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-3 border-b">
            <h2 className="font-semibold text-gray-800">นวัตกรรมทั้งหมด ({items.length})</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">💡</div>
              <p className="text-gray-500">ยังไม่มีนวัตกรรมในระบบ</p>
              <button onClick={startNew} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">+ เพิ่ม</button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((it) => (
                <div key={it.id} className="px-6 py-3 flex items-center gap-3 hover:bg-amber-50/30">
                  {it.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.cover_image_url} alt="" className="w-14 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">💡</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 line-clamp-1">{it.title_th}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-500">{TYPES.find((t) => t.value === it.innovation_type)?.label}</span>
                      {it.ip_number && <span className="text-[10px] font-mono text-gray-500">#{it.ip_number}</span>}
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">{STATUSES.find((s) => s.value === it.status)?.label}</span>
                      {it.license_fee_thb && <span className="text-[10px] font-semibold text-emerald-700">{Number(it.license_fee_thb).toLocaleString()} ฿</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/innovations/${it.id}`} target="_blank" className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">ดู</Link>
                    <button onClick={() => startEdit(it)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100">✏️ แก้ไข</button>
                    <button onClick={() => handleDelete(it.id)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAIIngest && (
        <IngestInnovationModal
          onClose={() => setShowAIIngest(false)}
          onApply={(data, meta) => {
            // If no form is open, start a new one so user sees the populated fields
            if (!editing) {
              setEditing({
                title_th: '',
                innovation_type: 'petty_patent',
                status: 'filed',
                inventor_ids: [],
                image_urls: [],
                documents: [],
                is_active: true,
                sort_order: 0,
              });
              // wait a tick so editing state is set before applying
              setTimeout(() => applyAIExtract(data, meta), 0);
            } else {
              applyAIExtract(data, meta);
            }
          }}
        />
      )}
    </div>
  );
}
