'use client';

/**
 * FundingCalendar — ปฏิทินแหล่งทุนภายนอกที่เปิดรับซ้ำทุกปี
 *
 * ต่างจากแท็บ "ปฏิทินแหล่งทุน" (grant_calls) ตรงที่ตารางนี้เก็บ *เดือน*
 * ไม่ใช่วันที่ เพราะช่วงเวลาเปิดรับของแต่ละแหล่งทุนค่อนข้างคงที่ทุกปี
 * ส่วนธีม/กรอบวิจัยเปลี่ยนไปในแต่ละรอบ
 *
 * หัวใจของหน้านี้คือแถบบนสุด "เดือนนี้ควรเริ่มเตรียมอะไร" ซึ่งคำนวณย้อน
 * จาก prep_lead_months — ทุนที่ต้องร่วมมือหลายหน่วยงานหรือต่างประเทศ
 * ต้องเริ่มหาพาร์ตเนอร์ก่อนเปิดรับหลายเดือน ถ้ารอให้ประกาศออกมักไม่ทัน
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Row = {
  id: string;
  agency_code: string;
  agency_name_th: string;
  agency_url: string | null;
  open_month: number;
  close_month: number | null;
  program_th: string;
  proposal_stage: 'concept' | 'full' | 'report' | 'other' | null;
  collaboration: 'international' | 'multi_agency' | 'industry_cofund' | null;
  partner_note_th: string | null;
  prep_lead_months: number | null;
  note_th: string | null;
  source_label: string | null;
  source_url: string | null;
  needs_review: boolean;
  sort_order: number | null;
};

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const MONTHS_TH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const COLLAB = {
  international:   { label: 'ร่วมต่างประเทศ', chip: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  multi_agency:    { label: 'หลายหน่วยงาน',  chip: 'bg-teal-100 text-teal-700 border-teal-200' },
  industry_cofund: { label: 'ร่วมทุนเอกชน',  chip: 'bg-amber-100 text-amber-800 border-amber-200' },
} as const;

const STAGE: Record<string, string> = {
  concept: 'Concept Proposal',
  full: 'Full Proposal',
  report: 'รายงานผล',
  other: 'อื่นๆ',
};

/** ระยะจากเดือน a ไปเดือน b แบบวนปี (1-12) */
const monthsAhead = (from: number, to: number) => (to - from + 12) % 12;

/** เดือน m อยู่ในช่วง open..close หรือไม่ (รองรับช่วงคาบเกี่ยวข้ามปี) */
function isOpenIn(m: number, open: number, close: number | null) {
  const c = close ?? open;
  return open <= c ? m >= open && m <= c : m >= open || m <= c;
}

export default function FundingCalendar() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [collabOnly, setCollabOnly] = useState(false);

  // เดือนปัจจุบัน 1-12
  const now = new Date();
  const thisMonth = now.getMonth() + 1;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('funding_calendar')
        .select('*')
        .eq('is_active', true)
        .order('open_month')
        .order('sort_order');
      if (error) {
        // ยังไม่ได้รัน migration 061
        if (/does not exist|schema cache/i.test(error.message)) setMissingTable(true);
      } else {
        setRows((data as Row[]) || []);
      }
      setLoading(false);
    })();
  }, []);

  const visible = useMemo(
    () => (collabOnly ? rows.filter((r) => r.collaboration) : rows),
    [rows, collabOnly],
  );

  /** ทุนที่เข้าสู่ช่วงเตรียมตัวแล้ว — เรียงตามความใกล้ของเดือนเปิดรับ */
  const prepNow = useMemo(() => {
    return rows
      .map((r) => ({ r, ahead: monthsAhead(thisMonth, r.open_month) }))
      .filter(({ r, ahead }) => ahead > 0 && ahead <= (r.prep_lead_months ?? 2))
      .sort((a, b) => a.ahead - b.ahead || (b.r.prep_lead_months ?? 0) - (a.r.prep_lead_months ?? 0));
  }, [rows, thisMonth]);

  const openNow = useMemo(
    () => rows.filter((r) => isOpenIn(thisMonth, r.open_month, r.close_month)),
    [rows, thisMonth],
  );

  if (loading) {
    return <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">กำลังโหลดปฏิทิน…</div>;
  }

  if (missingTable) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
        <p className="font-semibold mb-1">ยังไม่ได้สร้างตาราง funding_calendar</p>
        <p>รัน <code className="bg-amber-100 px-1 rounded">supabase/061_funding_calendar.sql</code> แล้วตามด้วย{' '}
          <code className="bg-amber-100 px-1 rounded">061b_funding_calendar_seed.sql</code> ใน Supabase SQL Editor</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">
        ยังไม่มีข้อมูลปฏิทิน — รัน <code>061b_funding_calendar_seed.sql</code> เพื่อใส่ข้อมูลตั้งต้น
      </div>
    );
  }

  const card = (r: Row, ahead?: number) => {
    const collab = r.collaboration ? COLLAB[r.collaboration] : null;
    return (
      <div key={r.id} className="bg-white rounded-lg border p-3.5 hover:shadow-sm transition">
        <div className="flex items-start gap-2 flex-wrap mb-1.5">
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            {r.agency_code}
          </span>
          {collab && (
            <span className={`text-[11px] px-2 py-0.5 rounded border ${collab.chip}`}>{collab.label}</span>
          )}
          {r.proposal_stage && (
            <span className="text-[11px] text-gray-500">{STAGE[r.proposal_stage]}</span>
          )}
          {typeof ahead === 'number' && (
            <span className="ml-auto text-[11px] font-medium text-rose-600">
              เปิดรับอีก {ahead} เดือน ({MONTHS_TH_SHORT[r.open_month - 1]})
            </span>
          )}
          {r.needs_review && (
            <span className="text-[10px] text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded"
              title="ถอดความจากอินโฟกราฟิก ยังไม่ยืนยันกับประกาศต้นฉบับ">
              ยังไม่ยืนยัน
            </span>
          )}
        </div>

        <p className="text-sm text-gray-800 leading-snug">{r.program_th}</p>

        <div className="mt-1.5 text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
          <span>
            {MONTHS_TH_SHORT[r.open_month - 1]}
            {r.close_month && r.close_month !== r.open_month ? `–${MONTHS_TH_SHORT[r.close_month - 1]}` : ''}
          </span>
          {r.agency_url && (
            <a href={r.agency_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {r.agency_name_th}
            </a>
          )}
        </div>

        {r.partner_note_th && (
          <p className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-1">
            พาร์ตเนอร์: {r.partner_note_th}
          </p>
        )}
        {r.note_th && <p className="mt-1 text-[11px] text-gray-400">{r.note_th}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── เดือนนี้ควรเริ่มเตรียมอะไร ── */}
      <section className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4">
        <h3 className="font-bold text-gray-800 mb-1">
          เดือน{MONTHS_TH[thisMonth - 1]} — ควรเริ่มเตรียมแล้ว
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">
          คำนวณย้อนจากเดือนเปิดรับ ลบด้วยระยะเตรียมตัวของทุนแต่ละประเภท
          ทุนที่ต้องหาพาร์ตเนอร์จะเตือนล่วงหน้านานกว่า
        </p>
        {prepNow.length === 0 ? (
          <p className="text-sm text-gray-500">เดือนนี้ยังไม่มีทุนที่เข้าช่วงเตรียมตัว</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-2.5">
            {prepNow.map(({ r, ahead }) => card(r, ahead))}
          </div>
        )}
      </section>

      {/* ── เปิดรับอยู่ตอนนี้ ── */}
      {openNow.length > 0 && (
        <section>
          <h3 className="font-bold text-gray-800 mb-2">
            เปิดรับช่วงเดือนนี้ <span className="text-sm font-normal text-gray-400">({openNow.length})</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-2.5">{openNow.map((r) => card(r))}</div>
        </section>
      )}

      {/* ── ตลอดปี ── */}
      <section>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="font-bold text-gray-800">ปฏิทินตลอดปี</h3>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={collabOnly} onChange={(e) => setCollabOnly(e.target.checked)} />
            เฉพาะทุนที่ต้องร่วมมือ ({rows.filter((r) => r.collaboration).length})
          </label>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const items = visible.filter((r) => r.open_month === m);
            if (items.length === 0) return null;
            return (
              <div key={m}>
                <h4 className={`text-sm font-semibold mb-2 pb-1 border-b ${
                  m === thisMonth ? 'text-rose-600 border-rose-300' : 'text-gray-600 border-gray-200'
                }`}>
                  {MONTHS_TH[m - 1]}
                  {m === thisMonth && <span className="ml-2 text-[11px] font-normal">เดือนนี้</span>}
                </h4>
                <div className="grid md:grid-cols-2 gap-2.5">{items.map((r) => card(r))}</div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-[11px] text-gray-400 border-t pt-3">
        ที่มา: {rows[0]?.source_label || '—'}
        {rows[0]?.source_url && (
          <> · <a href={rows[0].source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{rows[0].source_url}</a></>
        )}
        {' '}· ช่วงเดือนซ้ำทุกปี แต่ธีมเปลี่ยนตามรอบ ควรตรวจกับประกาศจริงก่อนยื่น
      </p>
    </div>
  );
}
