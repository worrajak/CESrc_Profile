'use client';

/**
 * /admin/training/enrollments — รายชื่อผู้เรียนรายคน + ปิดจบ + ออกใบรับรอง
 *
 * แยกออกมาจาก /admin/training (ซึ่งยาว 1,400 บรรทัดและจัดการหลักสูตร/รุ่น)
 * เพราะงานคนละชั้นกัน หน้านี้ทำงานกับ view cesru_enrollment_people ที่รวม
 * ผู้เรียนจากทั้งสองทาง — ผูกกับบัญชี SkillChain แล้วจะได้ชื่อจาก skc_users
 * ถ้ายังไม่มีบัญชีจะได้จาก trainees
 *
 * ปุ่มปิดจบเรียก /api/services/enroll/complete ซึ่งจะออกใบรับรองลง
 * skc_student_credentials ให้อัตโนมัติเมื่อผู้เรียนมีบัญชี SkillChain
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAdminAuth, adminJSON } from '@/lib/admin-auth-client';

type Row = {
  enrollment_id: string;
  session_id: string | null;
  tracking_code: string | null;
  status: string;
  skc_user_id: string | null;
  email: string | null;
  display_name: string | null;
  campus: string | null;
  affiliation: string | null;
  skc_role: string | null;
  trust_grade: string | null;
  skc_tier: string | null;
  is_skillchain_member: boolean;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  registered: { label: 'ลงทะเบียน', cls: 'bg-gray-100 text-gray-600' },
  confirmed:  { label: 'ยืนยันแล้ว', cls: 'bg-blue-100 text-blue-700' },
  attending:  { label: 'กำลังอบรม', cls: 'bg-indigo-100 text-indigo-700' },
  completed:  { label: 'จบหลักสูตร', cls: 'bg-green-100 text-green-700' },
  failed:     { label: 'ไม่ผ่าน', cls: 'bg-red-100 text-red-700' },
  cancelled:  { label: 'ยกเลิก', cls: 'bg-gray-200 text-gray-500' },
};

export default function EnrollmentsPage() {
  const { role, loading: roleLoading } = useAdminAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingView, setMissingView] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cesru_enrollment_people')
      .select('*')
      .order('tracking_code', { ascending: false });
    if (error) {
      if (/does not exist|schema cache/i.test(error.message)) setMissingView(true);
    } else {
      setRows((data as Row[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const complete = async (r: Row, passed: boolean) => {
    setBusy(r.enrollment_id);
    setMsg(null);
    try {
      const res = await adminJSON('/api/services/enroll/complete', 'POST', {
        enrollment_id: r.enrollment_id,
        passed,
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setMsg({ kind: 'err', text: json.error || `HTTP ${res.status}` });
      } else if (json.credential_skipped) {
        // บันทึกผลสำเร็จ แต่ยังไม่ได้ใบรับรอง — บอกเหตุผลตรง ๆ
        setMsg({ kind: 'err', text: `บันทึกผลแล้ว แต่ยังไม่ออกใบรับรอง: ${json.credential_skipped}` });
      } else if (json.credential) {
        setMsg({
          kind: 'ok',
          text: json.credential.already_existed
            ? `ปิดจบแล้ว — มีใบรับรองของรหัสนี้อยู่ก่อนแล้ว ไม่ออกซ้ำ`
            : `ปิดจบและออกใบรับรองใน SkillChain เรียบร้อย`,
        });
      } else {
        setMsg({ kind: 'ok', text: 'บันทึกผลเรียบร้อย' });
      }
      await load();
    } catch (e: any) {
      setMsg({ kind: 'err', text: e.message || 'Network error' });
    } finally {
      setBusy(null);
    }
  };

  if (!roleLoading && !role) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">ต้องเข้าสู่ระบบแอดมิน</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ผู้เรียนรายคน</h1>
          <p className="text-sm text-gray-500">
            ปิดจบหลักสูตรแล้วออกใบรับรองลง SkillChain — ผู้เรียนต้องมีบัญชี SkillChain จึงจะได้ใบรับรอง
          </p>
        </div>
        <Link href="/admin/training" className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300">
          กลับหน้าหลักสูตร
        </Link>
      </div>

      {msg && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${
          msg.kind === 'ok'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          {msg.text}
        </div>
      )}

      {missingView ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
          <p className="font-semibold mb-1">ยังไม่ได้สร้าง view cesru_enrollment_people</p>
          <p>รัน <code className="bg-amber-100 px-1 rounded">supabase/064_skillchain_owns_people.sql</code> และ{' '}
            <code className="bg-amber-100 px-1 rounded">065_issue_credential_rpc.sql</code> ใน Supabase SQL Editor</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border p-10 text-center text-sm text-gray-400">กำลังโหลด…</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-sm text-gray-400">
          ยังไม่มีผู้ลงทะเบียนอบรม
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">ผู้เรียน</th>
                <th className="text-left px-3 py-2">SkillChain</th>
                <th className="text-left px-3 py-2">รหัสติดตาม</th>
                <th className="text-left px-3 py-2">สถานะ</th>
                <th className="text-right px-3 py-2">ปิดจบ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const st = STATUS[r.status] || STATUS.registered;
                const done = r.status === 'completed' || r.status === 'failed';
                return (
                  <tr key={r.enrollment_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">{r.display_name || '—'}</div>
                      <div className="text-xs text-gray-400">{r.email}</div>
                      {r.affiliation && <div className="text-[11px] text-gray-400">{r.affiliation}</div>}
                    </td>
                    <td className="px-3 py-2">
                      {r.is_skillchain_member ? (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[11px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">มีบัญชี</span>
                          {r.skc_tier && <span className="text-[11px] text-gray-500">tier {r.skc_tier}</span>}
                          {r.trust_grade && <span className="text-[11px] text-gray-400">{r.trust_grade}</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                          title="ออกใบรับรองไม่ได้จนกว่าจะสมัคร SkillChain">
                          ยังไม่มีบัญชี
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{r.tracking_code || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => complete(r, true)}
                        disabled={busy === r.enrollment_id || done}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded disabled:opacity-40"
                      >
                        {busy === r.enrollment_id ? '…' : 'ผ่าน'}
                      </button>
                      <button
                        onClick={() => complete(r, false)}
                        disabled={busy === r.enrollment_id || done}
                        className="ml-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded disabled:opacity-40"
                      >
                        ไม่ผ่าน
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
