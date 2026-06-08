/**
 * /api/admin/grants/[id]/import-plan
 * ──────────────────────────────────
 * Accepts a "แผนดำเนินงาน" Excel workbook (.xlsx) shaped like the DaaS
 * Wildfire template and bulk-inserts its 11 sheets into the grant_*
 * tables created by migration 058.
 *
 * POST with multipart form-data, field "file" = .xlsx
 * Optional query: ?dry=1  → return parsed counts without writing
 *
 * Re-runs are destructive per-grant: each invocation deletes existing
 * rows for the grant in every grant_workplan_* / grant_team_* /
 * grant_procurement / grant_contracts / grant_cashbook_monthly /
 * grant_budget / grant_disbursement / grant_risks table, then inserts
 * what was parsed. This keeps the import idempotent — re-upload the
 * spreadsheet after edits and the DB matches.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { authorizeAdminRequest } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function clean(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}
function num(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}
function int(v: any): number | null {
  const n = num(v);
  return n === null ? null : Math.trunc(n);
}
function loadFromMark(mark: any): 'low' | 'medium' | 'high' | null {
  const s = clean(mark);
  if (!s) return null;
  // ▪ = low ▪▪ = medium ▪▪▪ = high (count black-square chars)
  const dots = (s.match(/▪/g) || []).length;
  if (dots >= 3) return 'high';
  if (dots === 2) return 'medium';
  if (dots === 1) return 'low';
  return null;
}

// Extract a sheet as array-of-arrays (preserving empty cells)
function sheetAoA(wb: XLSX.WorkBook, sheetName: string): any[][] {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false }) as any[][];
}

// ─────────────────────────────────────────────────────────────────
// Per-sheet parsers — return arrays of rows ready to insert
// ─────────────────────────────────────────────────────────────────

function parseTeamRACI(rows: any[][]) {
  // Header row pattern: ["Code","ชื่อ-นามสกุล","สังกัด","ความเชี่ยวชาญ","%FTE","ตำแหน่ง","เบอร์โทร","หมายเหตุ"]
  const members: any[] = [];
  const raci: any[] = [];

  // Find the team header row
  let teamHeader = -1;
  let raciHeader = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.includes('Code|ชื่อ-นามสกุล') || r.startsWith('Code|ชื่อ-นามสกุล')) teamHeader = i;
    if (r.includes('กิจกรรมหลัก') && r.includes('WP')) raciHeader = i;
  }

  // Members
  if (teamHeader >= 0) {
    for (let i = teamHeader + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      if ((rows[i] || []).map(clean).filter(Boolean).length === 0) break;
      const code = clean(row[0]);
      const name = clean(row[1]);
      if (!code || !name) continue;
      // If we've crossed into RACI section, stop
      if (i >= raciHeader && raciHeader > 0) break;
      members.push({
        member_code: code,
        full_name: name,
        affiliation: clean(row[2]),
        expertise: clean(row[3]),
        fte: num(row[4]),
        position_label: clean(row[5]),
        phone: clean(row[6]),
        notes: clean(row[7]),
        sort_order: i,
      });
    }
  }

  // RACI matrix
  if (raciHeader >= 0) {
    const headerRow = rows[raciHeader] || [];
    // Member column codes start at index 3 (after #, กิจกรรมหลัก, WP)
    const memberCols: { idx: number; code: string }[] = [];
    for (let c = 3; c < headerRow.length; c++) {
      const code = clean(headerRow[c]);
      if (code) memberCols.push({ idx: c, code });
    }
    for (let i = raciHeader + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      if (!row || row.every((x) => x === null)) continue;
      const no = int(row[0]);
      const title = clean(row[1]);
      if (!no || !title) continue;
      const rolesObj: Record<string, string> = {};
      for (const m of memberCols) {
        const v = clean(row[m.idx]);
        if (v) rolesObj[m.code] = v;
      }
      raci.push({
        activity_no: no,
        activity_title: title,
        wp_codes: clean(row[2]),
        roles: rolesObj,
      });
    }
  }

  return { members, raci };
}

function parseWPCalendar(rows: any[][]) {
  // Header row: ["WP","รายละเอียด","Primary Owner","M1","M2",...,"M12"]
  const wp: any[] = [];
  const calendar: any[] = []; // { wp_code, month_no, load }
  const milestones: any[] = []; // { month_no, title }

  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('WP|') && r.includes('M1')) { headerRow = i; break; }
  }
  if (headerRow < 0) return { wp, calendar, milestones };

  const header = rows[headerRow] || [];
  // Find M1..M12 column indexes
  const monthCols: { idx: number; m: number }[] = [];
  for (let c = 0; c < header.length; c++) {
    const v = clean(header[c]);
    if (!v) continue;
    const mm = v.match(/^M(\d+)$/);
    if (mm) monthCols.push({ idx: c, m: parseInt(mm[1], 10) });
  }

  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const firstCell = clean(row[0]);
    if (!firstCell) continue;
    if (firstCell.startsWith('WP')) {
      wp.push({
        wp_code: firstCell,
        title: clean(row[1]) || firstCell,
        primary_owner_code: clean(row[2]),
        sort_order: wp.length + 1,
      });
      for (const mc of monthCols) {
        const load = loadFromMark(row[mc.idx]);
        if (load) {
          calendar.push({ wp_code: firstCell, month_no: mc.m, load });
        }
      }
    } else if (/milestone/i.test(firstCell)) {
      // Milestones row — column values are milestone titles
      for (const mc of monthCols) {
        const t = clean(row[mc.idx]);
        if (!t || /^[—-]+$/.test(t)) continue;
        // Common pattern "★ Title"
        milestones.push({ month_no: mc.m, title: t.replace(/^★\s*/, '') });
      }
    }
  }

  return { wp, calendar, milestones };
}

function parseDaily(rows: any[][]) {
  // Header: ["วันที่","วัน","สัปดาห์","เดือน","งวด","Phase","กิจกรรมหลัก","ผู้รับผิดชอบ (RACI-R)","ผลผลิต"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('วันที่|วัน|สัปดาห์')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const d = clean(row[0]);
    if (!d) continue;
    const activity = clean(row[6]);
    if (!activity) continue;
    // Date may be "15/06/2569" (Thai BE) — convert to ISO
    let isoDate: string | null = null;
    const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      let year = parseInt(m[3], 10);
      if (year > 2400) year -= 543; // BE → AD
      isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    // Parse month "M1 (มิ.ย. 69)" → 1
    let monthNo: number | null = null;
    const monthRaw = clean(row[3]);
    if (monthRaw) {
      const mm = monthRaw.match(/^M(\d+)/);
      if (mm) monthNo = parseInt(mm[1], 10);
    }
    let periodNo: number | null = null;
    const periodRaw = clean(row[4]);
    if (periodRaw) {
      const pm = periodRaw.match(/(\d+)/);
      if (pm) periodNo = parseInt(pm[1], 10);
    }
    items.push({
      entry_date: isoDate || d,
      weekday: clean(row[1]),
      week_no: clean(row[2]),
      month_no: monthNo,
      period_no: periodNo,
      phase: clean(row[5]),
      activity,
      owner_codes: clean(row[7]),
      expected_output: clean(row[8]),
    });
  }
  return items;
}

function parseProcurement(rows: any[][]) {
  // Header: ["#","รายการ","หมวด","ประเภท","วงเงิน (บาท)","แหล่งเงิน","เดือนที่จัดซื้อ","TOR/Spec","ใบเสนอราคา 3 ราย"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('#|รายการ|หมวด')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const no = int(row[0]);
    const name = clean(row[1]);
    if (!no || !name) continue;
    items.push({
      item_no: no,
      item_name: name,
      category: clean(row[2]),
      purchase_kind: clean(row[3]),
      budget_thb: num(row[4]),
      funding_source: clean(row[5]),
      planned_month_range: clean(row[6]),
      needs_tor: /จำเป็น/.test(clean(row[7]) || ''),
      quote_requirement: clean(row[8]),
    });
  }
  return items;
}

function parseContracts(rows: any[][]) {
  // Header: ["#","ชื่อสัญญา","ประเภท","คู่สัญญา","วงเงิน","ระยะเวลา","ผู้รับผิดชอบ","เดือนที่ลงนาม","สถานะ"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('#|ชื่อสัญญา')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const no = int(row[0]);
    const name = clean(row[1]);
    if (!no || !name) continue;
    items.push({
      item_no: no,
      contract_name: name,
      contract_type: clean(row[2]),
      parties: clean(row[3]),
      amount_thb: num(row[4]),
      duration: clean(row[5]),
      responsible: clean(row[6]),
      planned_sign_month: clean(row[7]),
      notes: clean(row[8]),
    });
  }
  return items;
}

function parseCashbook(rows: any[][]) {
  // Header layout:
  // row N:   "เดือน","รับเข้า (บาท)","","","รายจ่าย (บาท)",...
  // row N+1: "","บพข. (Inflow)","In-Cash sjtw","รวมรับ","1.ค่าตอบแทน","2.ค่าจ้าง","3.ค่าวัสดุ","4.ค่าจัดทำต้นแบบ","5.ค่าใช้สอย",...
  // row N+2+: M1 · มิ.ย. 69 | 790000 | 175000 | ...
  const items: any[] = [];
  let monthLabelCol = 0;
  let dataStart = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean);
    if (r[0] && r[0].startsWith('M') && /^M\d+/.test(r[0])) {
      dataStart = i;
      break;
    }
  }
  if (dataStart < 0) return items;
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i] || [];
    const label = clean(row[monthLabelCol]);
    if (!label || !label.startsWith('M')) continue;
    const mNo = parseInt((label.match(/^M(\d+)/) || [, '0'])[1], 10);
    if (!mNo) continue;
    items.push({
      month_no: mNo,
      month_label: label,
      inflow_agency_thb: num(row[1]) || 0,
      inflow_in_cash_thb: num(row[2]) || 0,
      out_compensation_thb: num(row[4]) || 0,
      out_labor_thb: num(row[5]) || 0,
      out_materials_thb: num(row[6]) || 0,
      out_prototype_thb: num(row[7]) || 0,
      out_misc_thb: num(row[8]) || 0,
    });
  }
  return items;
}

function parseBudget(rows: any[][]) {
  // Header: ["หมวด","Budget บพข.","Budget In-Cash","Budget In-Kind","Total Budget","Actual ที่จ่าย","คงเหลือ","% ใช้","หมายเหตุ"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('หมวด|Budget')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  let no = 1;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const name = clean(row[0]);
    if (!name || /^รวม/i.test(name)) continue;
    items.push({
      category_no: no++,
      category_name: name,
      budget_agency_thb: num(row[1]) || 0,
      budget_in_cash_thb: num(row[2]) || 0,
      budget_in_kind_thb: num(row[3]) || 0,
      notes: clean(row[8]),
    });
  }
  return items;
}

function parseDisbursement(rows: any[][]) {
  // Header: ["งวด","ช่วงเดือน","รายการ","บพข. (บาท)","In-Cash (บาท)","In-Kind (บาท)","เงื่อนไขเบิกจ่าย","ผู้รับผิดชอบ"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('งวด|ช่วงเดือน|รายการ')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const periodLabel = clean(row[0]);
    if (!periodLabel || !/งวด/.test(periodLabel)) continue;
    const pm = periodLabel.match(/(\d+)/);
    if (!pm) continue;
    items.push({
      period_no: parseInt(pm[1], 10),
      month_range: clean(row[1]),
      description: clean(row[2]),
      amount_agency_thb: num(row[3]) || 0,
      amount_in_cash_thb: num(row[4]) || 0,
      amount_in_kind_thb: num(row[5]) || 0,
      conditions: clean(row[6]),
      responsible: clean(row[7]),
    });
  }
  return items;
}

function levelFromTh(v: string | null): 'low' | 'medium' | 'high' | 'critical' | null {
  if (!v) return null;
  if (/วิกฤต|critical/i.test(v)) return 'critical';
  if (/สูง|high/i.test(v)) return 'high';
  if (/กลาง|medium/i.test(v)) return 'medium';
  if (/ต่ำ|low/i.test(v)) return 'low';
  if (v === 'H') return 'high';
  if (v === 'M') return 'medium';
  if (v === 'L') return 'low';
  return null;
}

function parseRisks(rows: any[][]) {
  // Header: ["#","ความเสี่ยง","หมวด","ความน่าจะเป็น","ผลกระทบ","ระดับ","แผนรองรับ (Mitigation)","ผู้รับผิดชอบ"]
  const items: any[] = [];
  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] || []).map(clean).filter(Boolean).join('|');
    if (r.startsWith('#|ความเสี่ยง')) { headerRow = i; break; }
  }
  if (headerRow < 0) return items;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const no = int(row[0]);
    const title = clean(row[1]);
    if (!no || !title) continue;
    items.push({
      item_no: no,
      risk_title: title,
      category: clean(row[2]),
      probability: levelFromTh(clean(row[3])),
      impact: levelFromTh(clean(row[4])),
      level: levelFromTh(clean(row[5])),
      mitigation: clean(row[6]),
      responsible: clean(row[7]),
    });
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await authorizeAdminRequest(req);
  if (!admin.authorized || !admin.role) {
    return NextResponse.json({ error: 'Admin auth required.' }, { status: 403 });
  }
  const grantId = params.id;

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get('file') as File | null;
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form.' }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 });

  const dry = req.nextUrl.searchParams.get('dry') === '1';

  // Parse workbook
  const buffer = Buffer.from(await file.arrayBuffer());
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  } catch (e: any) {
    return NextResponse.json({ error: `Could not parse .xlsx: ${e.message}` }, { status: 400 });
  }

  // Sheet names we expect — accept any prefix to be lenient
  const findSheet = (substr: string): any[][] => {
    const name = wb.SheetNames.find((n) => n.includes(substr));
    return name ? sheetAoA(wb, name) : [];
  };

  const teamSheet = findSheet('Team') || findSheet('RACI');
  const wpSheet = findSheet('WP_Calendar') || findSheet('Calendar');
  const dailySheet = findSheet('Daily') || findSheet('Workplan_Daily');
  const procSheet = findSheet('Procurement');
  const contractSheet = findSheet('Contract');
  const cashbookSheet = findSheet('CashBook') || findSheet('Cashbook');
  const budgetSheet = findSheet('Budget');
  const disbSheet = findSheet('Disbursement');
  const riskSheet = findSheet('Risk');

  const { members, raci } = parseTeamRACI(teamSheet);
  const { wp, calendar, milestones } = parseWPCalendar(wpSheet);
  const daily = parseDaily(dailySheet);
  const procurement = parseProcurement(procSheet);
  const contracts = parseContracts(contractSheet);
  const cashbook = parseCashbook(cashbookSheet);
  const budget = parseBudget(budgetSheet);
  const disbursement = parseDisbursement(disbSheet);
  const risks = parseRisks(riskSheet);

  const counts = {
    team_members: members.length,
    raci: raci.length,
    wp: wp.length,
    wp_calendar: calendar.length,
    milestones: milestones.length,
    daily: daily.length,
    procurement: procurement.length,
    contracts: contracts.length,
    cashbook: cashbook.length,
    budget: budget.length,
    disbursement: disbursement.length,
    risks: risks.length,
  };

  if (dry) {
    return NextResponse.json({ ok: true, dry: true, counts });
  }

  // Bulk insert via service-role client
  const client = getAdminClient();
  const ctx = { grant_id: grantId };

  // Wipe existing rows for this grant (idempotent re-imports)
  const wipeTables = [
    'grant_workplan_wp_calendar', // children before parents
    'grant_workplan_milestones',
    'grant_workplan_daily',
    'grant_team_raci',
    'grant_team_members',
    'grant_procurement',
    'grant_contracts',
    'grant_cashbook_monthly',
    'grant_budget',
    'grant_disbursement',
    'grant_risks',
    'grant_workplan_wp', // last because wp_calendar depends on it
  ];
  for (const t of wipeTables) {
    await client.from(t).delete().eq('grant_id', grantId);
  }

  const errors: any[] = [];
  const tryInsert = async (table: string, rows: any[]) => {
    if (rows.length === 0) return;
    const { error } = await client
      .from(table)
      .insert(rows.map((r) => ({ ...ctx, ...r })));
    if (error) errors.push({ table, error: error.message });
  };

  await tryInsert('grant_team_members', members);
  await tryInsert('grant_team_raci', raci);

  // WP must be inserted before wp_calendar (needs id lookup)
  if (wp.length > 0) {
    const { data: insertedWP, error } = await client
      .from('grant_workplan_wp')
      .insert(wp.map((r) => ({ ...ctx, ...r })))
      .select();
    if (error) {
      errors.push({ table: 'grant_workplan_wp', error: error.message });
    } else {
      const wpIdByCode = new Map(
        (insertedWP || []).map((r: any) => [r.wp_code, r.id]),
      );
      const calRows = calendar
        .map((c) => ({
          ...ctx,
          wp_id: wpIdByCode.get(c.wp_code),
          month_no: c.month_no,
          load: c.load,
        }))
        .filter((r) => r.wp_id);
      await tryInsert('grant_workplan_wp_calendar', calRows);
    }
  }

  await tryInsert('grant_workplan_milestones', milestones);
  await tryInsert('grant_workplan_daily', daily);
  await tryInsert('grant_procurement', procurement);
  await tryInsert('grant_contracts', contracts);
  await tryInsert('grant_cashbook_monthly', cashbook);
  await tryInsert('grant_budget', budget);
  await tryInsert('grant_disbursement', disbursement);
  await tryInsert('grant_risks', risks);

  return NextResponse.json({
    ok: errors.length === 0,
    counts,
    errors: errors.length > 0 ? errors : undefined,
  });
}
