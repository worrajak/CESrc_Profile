'use client';

import { useState, useRef } from 'react';

export default function ServiceRequestPage() {
  const [serviceType, setServiceType] = useState('training');
  const [formData, setFormData] = useState({
    requester_name: '', requester_org: '', requester_email: '', requester_phone: '',
    title: '', description: '', num_participants: '', preferred_date_start: '',
    preferred_date_end: '', location: '', estimated_budget: '', course_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');

  // AI Document Parsing
  const [docFile, setDocFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParsResult] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // AI Provider Selection
  const [aiProvider, setAiProvider] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  // Load available AI providers
  useState(() => {
    fetch('/api/services/parse-document')
      .then(r => r.json())
      .then(d => setAvailableProviders(d.providers || []))
      .catch(() => {});
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // AI Parse Document — ส่งเอกสารให้ AI แยก field
  const handleParseDocument = async () => {
    if (!docFile) return;
    setParsing(true);
    setParsResult('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', docFile);
      formDataUpload.append('service_type', serviceType);
      if (aiProvider) formDataUpload.append('ai_provider', aiProvider);
      if (aiModel) formDataUpload.append('ai_model', aiModel);

      const res = await fetch('/api/services/parse-document', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        // Auto-fill form fields from AI parsing
        if (data.parsed) {
          setFormData(prev => ({
            ...prev,
            requester_name: data.parsed.requester_name || prev.requester_name,
            requester_org: data.parsed.requester_org || prev.requester_org,
            requester_email: data.parsed.requester_email || prev.requester_email,
            requester_phone: data.parsed.requester_phone || prev.requester_phone,
            title: data.parsed.title || prev.title,
            description: data.parsed.description || prev.description,
            num_participants: data.parsed.num_participants || prev.num_participants,
            location: data.parsed.location || prev.location,
          }));
          setParsResult(`AI แยกข้อมูลสำเร็จ (${data.source}) — กรุณาตรวจสอบและแก้ไขข้อมูลก่อนส่ง`);
        }
      } else {
        setParsResult('ไม่สามารถแยกข้อมูลได้ กรุณากรอกด้วยตนเอง');
      }
    } catch {
      setParsResult('เกิดข้อผิดพลาด กรุณากรอกด้วยตนเอง');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, service_type: serviceType }),
      });

      if (res.ok) {
        const data = await res.json();
        setTrackingCode(data.tracking_code);
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (trackingCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-10">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ส่งคำขอสำเร็จ!</h1>
          <p className="text-gray-500 mb-6">ทีม CESRU จะตรวจสอบและติดต่อกลับภายใน 3 วันทำการ</p>
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-indigo-600 mb-1">รหัสติดตาม:</p>
            <p className="text-3xl font-bold text-indigo-800 font-mono">{trackingCode}</p>
          </div>
          <div className="flex justify-center gap-3">
            <a href={`/services/track/${trackingCode}`}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm">
              ติดตามสถานะ
            </a>
            <a href="/services" className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 text-sm">
              กลับหน้าบริการ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ส่งคำขอบริการวิชาการ</h1>
        <p className="text-gray-500">กรอกข้อมูล หรืออัพโหลดเอกสาร — AI จะช่วยแยก field อัตโนมัติ</p>
      </div>

      {/* AI Document Upload */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-purple-800 mb-2">📄 อัพโหลดเอกสารลงทะเบียน (AI Auto-fill)</h3>
        <p className="text-xs text-purple-600 mb-4">
          ส่งใบสมัคร, หนังสือราชการ, หรือเอกสารใดๆ — AI จะอ่านและกรอกฟอร์มให้อัตโนมัติ
          <br />รองรับ: PDF, รูปภาพ (JPG/PNG), Word
        </p>
        <div className="flex gap-3 mb-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-medium file:cursor-pointer"
          />
          <button
            onClick={handleParseDocument}
            disabled={!docFile || parsing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {parsing ? 'AI กำลังอ่าน...' : 'AI แยกข้อมูล'}
          </button>
        </div>
        {/* AI Provider Selector */}
        {availableProviders.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-purple-500">AI:</span>
            <select
              value={aiProvider}
              onChange={(e) => { setAiProvider(e.target.value); setAiModel(''); }}
              className="text-xs border border-purple-200 rounded px-2 py-1 bg-white"
            >
              <option value="">Auto (แนะนำ)</option>
              {availableProviders.map((p: any) => (
                <option key={p.provider} value={p.provider}>{p.name}</option>
              ))}
            </select>
            {aiProvider && (
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="text-xs border border-purple-200 rounded px-2 py-1 bg-white"
              >
                <option value="">Default Model</option>
                {availableProviders.find((p: any) => p.provider === aiProvider)?.models?.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>
        )}
        {parseResult && (
          <div className="mt-3 bg-white rounded-lg p-3 text-sm text-purple-700 border border-purple-200">
            {parseResult}
          </div>
        )}
      </div>

      {/* Service Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { key: 'training', label: 'ฝึกอบรม', icon: '🎓' },
          { key: 'consulting', label: 'ที่ปรึกษา', icon: '💡' },
          { key: 'design_install', label: 'ออกแบบ/ติดตั้ง', icon: '⚡' },
          { key: 'inspection', label: 'ตรวจสอบ', icon: '🔍' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setServiceType(t.key)}
            className={`p-4 rounded-xl border-2 text-center transition ${
              serviceType === t.key
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-sm font-medium">{t.label}</div>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* ข้อมูลผู้ขอ */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-bold text-gray-800 mb-2">ข้อมูลผู้ขอบริการ</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล *</label>
              <input name="requester_name" value={formData.requester_name} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน/บริษัท</label>
              <input name="requester_org" value={formData.requester_org} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
              <input name="requester_email" type="email" value={formData.requester_email} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
              <input name="requester_phone" value={formData.requester_phone} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </fieldset>

        {/* รายละเอียดบริการ */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-bold text-gray-800 mb-2">รายละเอียดบริการ</legend>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ/ชื่อโครงการ *</label>
            <input name="title" value={formData.title} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm" required
              placeholder={serviceType === 'training' ? 'เช่น ขอเปิดอบรม Solar PV ให้พนักงาน 20 คน' : 'ชื่อโครงการ'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={4} className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="อธิบายรายละเอียดที่ต้องการ..." />
          </div>

          {serviceType === 'training' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หลักสูตรที่สนใจ</label>
                <select name="course_code" value={formData.course_code} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- เลือกหลักสูตร --</option>
                  <option value="SOLAR-PV-L2">Solar PV Level 2</option>
                  <option value="SOLAR-PV-L3">Solar PV Level 3</option>
                  <option value="SOLAR-DESIGN">Solar Design & PV SYST</option>
                  <option value="SOLAR-ROOFTOP">Solar Rooftop Installation</option>
                  <option value="EV-CHARGE-101">EV Charger Technology</option>
                  <option value="DC-CHARGER">DC Charger Technology</option>
                  <option value="SOLAR-BATTERY">Solar + Battery Storage</option>
                  <option value="SOLAR-PUMP">Solar Pumping System</option>
                  <option value="other">อื่นๆ (ระบุในรายละเอียด)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เข้าอบรม</label>
                <input name="num_participants" type="number" value={formData.num_participants} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="20" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ต้องการเริ่ม</label>
              <input name="preferred_date_start" type="date" value={formData.preferred_date_start} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input name="preferred_date_end" type="date" value={formData.preferred_date_end} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่</label>
              <input name="location" value={formData.location} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="มทร.ล้านนา / สถานที่ลูกค้า" />
            </div>
          </div>

          {serviceType !== 'training' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">งบประมาณโดยประมาณ (บาท)</label>
              <input name="estimated_budget" type="number" value={formData.estimated_budget} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="100000" />
            </div>
          )}
        </fieldset>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
          {submitting ? 'กำลังส่ง...' : 'ส่งคำขอบริการ'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          ทุกคำขอจะถูกบันทึกบน Blockchain เมื่อได้รับการอนุมัติ — ตรวจสอบได้ตลอด
        </p>
      </form>
    </div>
  );
}
