'use client';

import { useState, useRef } from 'react';

interface Session {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
  max_participants: number;
}

interface Props {
  courseCode: string;
  courseTitle: string;
  sessions: Session[];
  pricing: { student: number; internal: number; external: number };
}

const TRAINEE_TYPES = [
  { value: 'student', label: '👨‍🎓 นักศึกษา', desc: 'นักศึกษา มทร.ล้านนา หรือสถาบันอื่น', feeKey: 'student' as const },
  { value: 'staff', label: '👨‍💼 บุคลากร มทร.ล้านนา', desc: 'อาจารย์ / เจ้าหน้าที่ มทร.ล้านนา', feeKey: 'internal' as const },
  { value: 'public', label: '🏢 บุคคลทั่วไป', desc: 'ช่างเทคนิค วิศวกร ผู้สนใจ', feeKey: 'external' as const },
  { value: 'organization', label: '🏛️ หน่วยงาน/บริษัท', desc: 'ส่งพนักงานเข้าอบรม (ออกใบแจ้งหนี้)', feeKey: 'external' as const },
];

export default function EnrollForm({ courseCode, courseTitle, sessions, pricing }: Props) {
  const [step, setStep] = useState(1); // 1=type, 2=info, 3=confirm
  const [traineeType, setTraineeType] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; tracking_code?: string; error?: string } | null>(null);

  // AI Document Upload
  const [docFile, setDocFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title_th: '',
    first_name_th: '',
    last_name_th: '',
    first_name_en: '',
    last_name_en: '',
    student_id: '',
    organization: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedType = TRAINEE_TYPES.find(t => t.value === traineeType);
  const feeAmount = selectedType ? pricing[selectedType.feeKey] : 0;
  const openSessions = sessions.filter(s => s.status === 'open');

  // AI parse document
  const handleParseDoc = async () => {
    if (!docFile) return;
    setParsing(true);
    setParseMsg('');
    try {
      const fd = new FormData();
      fd.append('file', docFile);
      const res = await fetch('/api/services/parse-document', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.parsed) {
          // Map parsed fields to form
          const p = data.parsed;
          setForm(prev => ({
            ...prev,
            first_name_th: extractFirstName(p.requester_name) || prev.first_name_th,
            last_name_th: extractLastName(p.requester_name) || prev.last_name_th,
            organization: p.requester_org || prev.organization,
            email: p.requester_email || prev.email,
            phone: p.requester_phone || prev.phone,
          }));
          setParseMsg(`AI แยกข้อมูลสำเร็จ (${data.source}) — กรุณาตรวจสอบ`);
        }
      } else {
        setParseMsg('ไม่สามารถแยกข้อมูลได้ กรุณากรอกด้วยตนเอง');
      }
    } catch {
      setParseMsg('เกิดข้อผิดพลาด กรุณากรอกด้วยตนเอง');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !traineeType || !form.first_name_th || !form.last_name_th) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/services/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          trainee_type: traineeType,
          fee_amount: feeAmount,
          fee_type: selectedType?.feeKey || 'external',
          course_code: courseCode,
          ...form,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, tracking_code: data.tracking_code });
      } else {
        setResult({ success: false, error: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch {
      setResult({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (result?.success) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">ลงทะเบียนสำเร็จ!</h3>
        <p className="text-sm text-gray-500 mb-4">หลักสูตร: {courseTitle}</p>
        <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
          <p className="text-xs text-green-600 mb-1">รหัสลงทะเบียน</p>
          <p className="text-2xl font-bold font-mono text-green-800">{result.tracking_code}</p>
        </div>
        {feeAmount > 0 && (
          <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200 text-sm text-amber-700">
            💳 ค่าลงทะเบียน: <strong>{feeAmount.toLocaleString()} บาท</strong>
            <br />
            <span className="text-xs">ทีมงานจะแจ้งช่องทางชำระเงินทางอีเมล</span>
          </div>
        )}
        <p className="text-xs text-gray-400">ทีม CESRU จะยืนยันการลงทะเบียนทางอีเมลภายใน 1–2 วันทำการ</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 text-white">
        <h2 className="font-bold">ลงทะเบียนอบรม</h2>
        <p className="text-[10px] text-green-200">{courseTitle}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-[10px]">
          {['ประเภทผู้เรียน', 'ข้อมูลส่วนตัว', 'ยืนยัน'].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>{step > i + 1 ? '✓' : i + 1}</span>
              <span className={step === i + 1 ? 'font-bold text-gray-800' : 'text-gray-400'}>{s}</span>
              {i < 2 && <span className="text-gray-300 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Trainee Type + Session */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คุณเป็น...</label>
              <div className="space-y-2">
                {TRAINEE_TYPES.map(t => (
                  <button key={t.value}
                    onClick={() => setTraineeType(t.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      traineeType === t.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{t.label}</span>
                        <p className="text-[10px] text-gray-400">{t.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {pricing[t.feeKey] > 0 ? `${pricing[t.feeKey].toLocaleString()} ฿` : 'ฟรี'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session selection */}
            {openSessions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลือกรุ่น</label>
                <div className="space-y-2">
                  {openSessions.map(s => (
                    <button key={s.id}
                      onClick={() => setSessionId(s.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        sessionId === s.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="text-sm font-medium text-gray-800">{s.label}</div>
                      <div className="text-[10px] text-gray-500">
                        📅 {new Date(s.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {s.start_date !== s.end_date && ` — ${new Date(s.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`}
                        {' · '}📍 {s.location || 'มทร.ล้านนา'}
                        {' · '}👥 {s.max_participants} คน
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {openSessions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                ยังไม่มีรุ่นเปิดรับสมัคร — สามารถลงชื่อไว้เพื่อแจ้งเมื่อเปิดรุ่นถัดไป
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!traineeType || (!sessionId && openSessions.length > 0)}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="space-y-4">
            {/* AI Upload */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-700 mb-2">📄 อัพโหลดเอกสาร — AI กรอกให้</p>
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="flex-1 text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:text-[10px]" />
                <button onClick={handleParseDoc} disabled={!docFile || parsing}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-[10px] font-medium hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap">
                  {parsing ? 'กำลังอ่าน...' : 'AI แยก'}
                </button>
              </div>
              {parseMsg && <p className="text-[10px] text-purple-600 mt-2">{parseMsg}</p>}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">คำนำหน้า</label>
                <select name="title_th" value={form.title_th} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm">
                  <option value="">-</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ดร.">ดร.</option>
                  <option value="ผศ.">ผศ.</option>
                  <option value="รศ.">รศ.</option>
                  <option value="ศ.">ศ.</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">ชื่อ *</label>
                <input name="first_name_th" value={form.first_name_th} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">นามสกุล *</label>
                <input name="last_name_th" value={form.last_name_th} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">First Name (EN)</label>
                <input name="first_name_en" value={form.first_name_en} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Last Name (EN)</label>
                <input name="last_name_en" value={form.last_name_en} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Optional" />
              </div>
            </div>

            {/* Conditional fields */}
            {(traineeType === 'student') && (
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">รหัสนักศึกษา</label>
                <input name="student_id" value={form.student_id} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="เช่น 65XXXXX" />
              </div>
            )}

            {(traineeType === 'organization') && (
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">หน่วยงาน/บริษัท *</label>
                <input name="organization" value={form.organization} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
            )}

            {(traineeType === 'staff') && (
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">สังกัด (คณะ/สำนัก)</label>
                <input name="organization" value={form.organization} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="เช่น คณะวิศวกรรมศาสตร์" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">อีเมล *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">โทรศัพท์</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="08X-XXX-XXXX" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                ← ย้อนกลับ
              </button>
              <button onClick={() => setStep(3)}
                disabled={!form.first_name_th || !form.last_name_th || !form.email}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-bold text-gray-800 mb-2">ตรวจสอบข้อมูล</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-[10px] text-gray-400">ประเภท</span>
                  <p className="font-medium text-gray-700">{selectedType?.label}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">รุ่น</span>
                  <p className="font-medium text-gray-700">
                    {sessions.find(s => s.id === sessionId)?.label || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">ชื่อ-สกุล</span>
                  <p className="font-medium text-gray-700">
                    {form.title_th}{form.first_name_th} {form.last_name_th}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">อีเมล</span>
                  <p className="font-medium text-gray-700">{form.email}</p>
                </div>
                {form.phone && (
                  <div>
                    <span className="text-[10px] text-gray-400">โทรศัพท์</span>
                    <p className="font-medium text-gray-700">{form.phone}</p>
                  </div>
                )}
                {form.student_id && (
                  <div>
                    <span className="text-[10px] text-gray-400">รหัสนักศึกษา</span>
                    <p className="font-medium text-gray-700">{form.student_id}</p>
                  </div>
                )}
                {form.organization && (
                  <div>
                    <span className="text-[10px] text-gray-400">หน่วยงาน</span>
                    <p className="font-medium text-gray-700">{form.organization}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fee summary */}
            <div className={`rounded-lg p-4 border ${feeAmount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ค่าลงทะเบียน</span>
                <span className={`text-lg font-bold ${feeAmount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                  {feeAmount > 0 ? `${feeAmount.toLocaleString()} บาท` : 'ฟรี'}
                </span>
              </div>
              {feeAmount > 0 && (
                <p className="text-[10px] text-amber-600 mt-1">ชำระเงินภายหลัง — ทีมงานจะแจ้งช่องทางชำระเงินทางอีเมล</p>
              )}
            </div>

            {result?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{result.error}</div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep(2)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                ← แก้ไข
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition">
                {submitting ? 'กำลังลงทะเบียน...' : '✅ ยืนยันลงทะเบียน'}
              </button>
            </div>

            <p className="text-[9px] text-gray-400 text-center">
              การลงทะเบียนจะถูกบันทึกในระบบ — ทุกขั้นตอนกำกับด้วย Blockchain เมื่ออนุมัติ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function extractFirstName(fullName: string | undefined): string {
  if (!fullName) return '';
  const parts = fullName.replace(/^(นาย|นาง|นางสาว|ดร\.|ผศ\.|รศ\.|ศ\.)\s*/g, '').trim().split(/\s+/);
  return parts[0] || '';
}

function extractLastName(fullName: string | undefined): string {
  if (!fullName) return '';
  const parts = fullName.replace(/^(นาย|นาง|นางสาว|ดร\.|ผศ\.|รศ\.|ศ\.)\s*/g, '').trim().split(/\s+/);
  return parts.slice(1).join(' ') || '';
}
