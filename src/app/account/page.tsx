'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, profile, loading, updateProfile, deleteAccount, signOut } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'student' | 'researcher' | 'general'>('general');
  const [institution, setInstitution] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setUserType(profile.user_type);
    setInstitution(profile.institution || '');
    setMarketingOptIn(profile.marketing_opt_in);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName.trim(),
      user_type: userType,
      institution: institution.trim() || null,
      marketing_opt_in: marketingOptIn,
    });
    setEditing(false);
    setSaving(false);
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const { data } = await supabase.rpc('export_user_data', { p_user_id: user.id });
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteAccount();
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-700 mb-3">กรุณาเข้าสู่ระบบ</h1>
        <Link href="/" className="text-blue-600 underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← หน้าหลัก</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">บัญชีของฉัน</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
          {!editing && (
            <button onClick={startEdit} className="text-sm text-blue-600 hover:underline">
              ✏️ แก้ไข
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3 text-sm">
            <Row label="Email">{profile.email}</Row>
            <Row label="ชื่อที่แสดง">{profile.display_name}</Row>
            <Row label="ประเภทผู้ใช้">
              {profile.user_type === 'student' ? '🎓 นักศึกษา' :
                profile.user_type === 'researcher' ? '🔬 นักวิจัย' : '👤 บุคคลทั่วไป'}
            </Row>
            <Row label="สถาบัน">{profile.institution || '-'}</Row>
            <Row label="Comments">{profile.comment_count} ข้อความ</Row>
            <Row label="เข้าร่วมเมื่อ">
              {new Date(profile.consented_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' · ตาม Privacy Policy v'}{profile.consent_version}
            </Row>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อที่แสดง</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ประเภทผู้ใช้</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="student">🎓 นักศึกษา</option>
                <option value="researcher">🔬 นักวิจัย</option>
                <option value="general">👤 บุคคลทั่วไป</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">สถาบัน</label>
              <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm pt-2">
              <input type="checkbox" checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)} />
              <span>รับข่าวสารจาก CESRU ทาง email</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'บันทึก...' : 'บันทึก'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-1.5 border text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDPA Rights */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">สิทธิของฉันตาม PDPA</h2>
        <p className="text-xs text-gray-500 mb-4">
          พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ให้สิทธิท่านในข้อมูลส่วนบุคคล
        </p>

        <div className="space-y-3">
          <button onClick={handleExport} disabled={exporting}
            className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">📋 Export ข้อมูลของฉัน</p>
              <p className="text-xs text-blue-600">ดาวน์โหลดข้อมูลทั้งหมด (JSON)</p>
            </div>
            <span className="text-blue-600">{exporting ? '...' : '→'}</span>
          </button>

          <button onClick={signOut}
            className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">🚪 ออกจากระบบ</p>
              <p className="text-xs text-gray-500">Sign out — ข้อมูลไม่ถูกลบ</p>
            </div>
            <span className="text-gray-500">→</span>
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">🗑️ ลบบัญชีและข้อมูลทั้งหมด</p>
                <p className="text-xs text-red-600">ไม่สามารถกู้คืนได้</p>
              </div>
              <span className="text-red-600">→</span>
            </button>
          ) : (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg space-y-2">
              <p className="text-sm font-medium text-red-800">⚠️ ยืนยันการลบบัญชี</p>
              <p className="text-xs text-red-700">
                การลบนี้จะลบ: ข้อมูลโปรไฟล์, comment ทั้งหมดของท่าน ({profile.comment_count} ข้อความ)
                <br />
                <strong>audit log การยินยอมจะถูกเก็บ 5 ปี</strong> ตามข้อกำหนดกฎหมาย (โดยไม่มีข้อมูลระบุตัวตน)
              </p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                  {deleting ? 'กำลังลบ...' : 'ยืนยันลบบัญชี'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 border text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        ดูเพิ่มเติม: <Link href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link>
        {' · '}<Link href="/terms" className="text-blue-600 underline">Terms</Link>
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{children}</span>
    </div>
  );
}
