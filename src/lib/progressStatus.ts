/**
 * Shared progress-status vocabulary used across the grant tracking UI.
 * Lives in /lib so any tab/page can render the same chips and lookups.
 */

export type ProgressStatus =
  | 'not_started'
  | 'on_plan'
  | 'slight_delay'
  | 'off_plan'
  | 'blocked'
  | 'done'
  | 'cancelled';

export type EntityType =
  | 'daily'
  | 'milestone'
  | 'wp_month'
  | 'procurement'
  | 'contract'
  | 'disbursement'
  | 'risk';

export const STATUS_META: Record<
  ProgressStatus,
  { label: string; icon: string; chip: string; cell: string }
> = {
  not_started:  { label: 'ยังไม่เริ่ม',     icon: '⚪', chip: 'bg-slate-100 text-slate-600 border-slate-200', cell: 'bg-slate-50' },
  on_plan:      { label: 'ตามแผน',          icon: '🟢', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', cell: 'bg-emerald-100' },
  slight_delay: { label: 'ล่าช้าเล็กน้อย',   icon: '🟡', chip: 'bg-amber-100 text-amber-700 border-amber-200', cell: 'bg-amber-100' },
  off_plan:     { label: 'ไม่ตามแผน',       icon: '🔴', chip: 'bg-rose-100 text-rose-700 border-rose-200', cell: 'bg-rose-100' },
  blocked:      { label: 'บล็อค',           icon: '🟣', chip: 'bg-violet-100 text-violet-700 border-violet-200', cell: 'bg-violet-100' },
  done:         { label: 'เสร็จแล้ว',       icon: '✅', chip: 'bg-emerald-200 text-emerald-900 border-emerald-300', cell: 'bg-emerald-300' },
  cancelled:    { label: 'ยกเลิก',          icon: '⚫', chip: 'bg-slate-200 text-slate-600 border-slate-300', cell: 'bg-slate-200' },
};

/** A reason is mandatory when reporting a not-ok status. */
export function requiresReason(s: ProgressStatus): boolean {
  return s === 'slight_delay' || s === 'off_plan' || s === 'blocked';
}

export const ENTITY_LABEL: Record<EntityType, string> = {
  daily: 'งานรายวัน',
  milestone: 'Milestone',
  wp_month: 'WP × เดือน',
  procurement: 'จัดซื้อจัดจ้าง',
  contract: 'สัญญา',
  disbursement: 'งวดเงิน',
  risk: 'ความเสี่ยง',
};
