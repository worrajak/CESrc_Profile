'use client';

/**
 * GrantPlanImportPanel — admin tool on /admin/grants/tracking
 * ──────────────────────────────────────────────────────────
 * Drop a "แผนดำเนินงาน" Excel workbook here to import all 11 sheets
 * into the grant_workplan_* / grant_team_* / grant_procurement /
 * grant_contracts / grant_cashbook_monthly / grant_budget /
 * grant_disbursement / grant_risks tables for the currently-selected
 * grant.
 *
 * Two-step flow:
 *   1. POST ?dry=1  → returns row counts per table for review.
 *   2. POST         → wipes existing rows for this grant and inserts.
 */

import { useRef, useState } from 'react';
import { adminFetch } from '@/lib/admin-auth-client';

type Counts = Record<string, number>;
type ImportResp = { ok: boolean; dry?: boolean; counts: Counts; errors?: any[]; error?: string };

const TABLE_LABEL: Record<string, string> = {
  team_members: '👥 Team members',
  raci: '📋 RACI matrix',
  wp: '📦 Work packages',
  wp_calendar: '📅 WP calendar (WP × month)',
  milestones: '★ Milestones',
  daily: '📆 Daily workplan',
  procurement: '🛒 Procurement',
  contracts: '📜 Contracts',
  cashbook: '💵 Cashbook (monthly)',
  budget: '💰 Budget',
  disbursement: '💸 Disbursement',
  risks: '⚠ Risks',
};

export default function GrantPlanImportPanel({ grantId, grantTitle }: { grantId: string; grantTitle: string }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Counts | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const post = async (apply: boolean) => {
    if (!file) {
      setMessage({ kind: 'err', text: 'กรุณาเลือกไฟล์ .xlsx ก่อน' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await adminFetch(
        `/api/admin/grants/${grantId}/import-plan${apply ? '' : '?dry=1'}`,
        { method: 'POST', body: form },
      );
      const json = (await res.json()) as ImportResp;
      if (!res.ok || json.error) {
        setMessage({ kind: 'err', text: json.error || `HTTP ${res.status}` });
        return;
      }
      if (apply) {
        const total = Object.values(json.counts || {}).reduce((s, n) => s + n, 0);
        const failed = json.errors?.length || 0;
        setMessage({
          kind: failed > 0 ? 'err' : 'ok',
          text: failed > 0
            ? `Import เสร็จบางส่วน · ${total} rows · ${failed} table(s) error: ${json.errors?.[0]?.error}`
            : `✓ Import สำเร็จ — รวม ${total} rows ใน ${Object.keys(json.counts).length} tables`,
        });
        setPreview(null);
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setPreview(json.counts);
        setMessage({ kind: 'ok', text: 'ตรวจสอบจำนวน row ที่จะ import ด้านล่าง → กด "Apply" เพื่อบันทึก' });
      }
    } catch (e: any) {
      setMessage({ kind: 'err', text: e.message || 'Network error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
            📥 Import แผนดำเนินงานจาก Excel
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            อัปโหลด .xlsx ในรูปแบบ "แผนดำเนินงาน DaaS Wildfire" (11 sheets) เพื่อบันทึก:
            ทีม + RACI · WP × เดือน · Milestones · แผนรายวัน · Procurement · Contracts · Cashbook · Budget · Disbursement · Risks
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            สำหรับโครงการ: <strong>{grantTitle}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setPreview(null);
            setMessage(null);
          }}
          className="text-xs"
        />
        <button
          onClick={() => post(false)}
          disabled={busy || !file}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium disabled:opacity-50"
        >
          🔍 Preview (ไม่บันทึก)
        </button>
        <button
          onClick={() => post(true)}
          disabled={busy || !file || !preview}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium disabled:opacity-50"
          title={!preview ? 'กด Preview ก่อน เพื่อตรวจสอบจำนวน rows' : ''}
        >
          ✓ Apply (เขียนทับข้อมูลเดิม)
        </button>
      </div>

      {preview && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-2">
          <p className="text-[10px] text-gray-500 mb-1.5">จำนวน rows ที่จะ import (จะลบของเดิมก่อน):</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px]">
            {Object.entries(preview).map(([k, v]) => (
              <div
                key={k}
                className={`flex items-center justify-between px-2 py-1 rounded ${
                  v > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span className="truncate">{TABLE_LABEL[k] || k}</span>
                <strong className="ml-1">{v}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            message.kind === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
