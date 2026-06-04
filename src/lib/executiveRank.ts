/**
 * Executive seniority ranking for researchers who also serve as RMUTL
 * administrators. Lower number = more senior.
 *
 * Used to sort the researcher listing so executives bubble up within
 * their unit_role group (advisor / head / member / phd_student).
 *
 * Rules ordered from highest seniority to lowest — first regex that
 * matches wins. Researchers with no executive_role_th get NO_ROLE (999)
 * which always sorts after any matched role.
 */
export const NO_ROLE_RANK = 999;
export const UNKNOWN_ROLE_RANK = 500;

type Rule = { rank: number; test: (role: string) => boolean; label: string };

// Order matters — first matching rule wins.
const RULES: Rule[] = [
  // 1) อธิการบดี — rector (top of the org)
  { rank: 1, label: 'อธิการบดี', test: (s) => /^อธิการบดี$|อธิการบดี\s*$/.test(s) && !/รอง|ผู้ช่วย/.test(s) },

  // 2) รองอธิการบดี — vice rector
  { rank: 2, label: 'รองอธิการบดี', test: (s) => /^รองอธิการบดี/.test(s) },

  // 3) ผู้ช่วยอธิการบดี — assistant to rector
  { rank: 3, label: 'ผู้ช่วยอธิการบดี', test: (s) => /^ผู้ช่วยอธิการบดี/.test(s) },

  // 4) ผู้อำนวยการสำนักงานบริหาร — director of central admin office
  { rank: 4, label: 'ผอ.สำนักงานบริหาร', test: (s) => /ผู้อำนวยการสำนักงานบริหาร/.test(s) },

  // 5) คณบดี / ผู้อำนวยการวิทยาลัย (excluding รองคณบดี / ผู้ช่วยคณบดี)
  {
    rank: 5,
    label: 'คณบดี / ผอ.วิทยาลัย',
    test: (s) =>
      (/คณบดี/.test(s) || /ผู้อำนวยการวิทยาลัย/.test(s)) &&
      !/รองคณบดี/.test(s) &&
      !/ผู้ช่วยคณบดี/.test(s),
  },

  // 6) ผู้อำนวยการสำนัก/สถาบัน — institute/office director
  {
    rank: 6,
    label: 'ผอ.สำนัก/สถาบัน',
    test: (s) => /ผู้อำนวยการสำนัก/.test(s) || /ผู้อำนวยการสถาบัน/.test(s),
  },

  // 7) รองคณบดี — vice dean
  { rank: 7, label: 'รองคณบดี', test: (s) => /รองคณบดี/.test(s) },

  // 8) ผู้ช่วยคณบดี — assistant dean
  { rank: 8, label: 'ผู้ช่วยคณบดี', test: (s) => /ผู้ช่วยคณบดี/.test(s) },

  // 9) หัวหน้าสาขา/ภาควิชา — department head
  {
    rank: 9,
    label: 'หัวหน้าสาขา/ภาควิชา',
    test: (s) => /หัวหน้าสาขา/.test(s) || /หัวหน้าภาควิชา/.test(s),
  },

  // 10) Other "หัวหน้า ..." roles (catch-all)
  { rank: 10, label: 'หัวหน้า', test: (s) => /หัวหน้า/.test(s) },
];

export function getExecutiveRank(role: string | null | undefined): number {
  if (!role || !role.trim()) return NO_ROLE_RANK;
  const s = role.trim();
  for (const rule of RULES) {
    if (rule.test(s)) return rule.rank;
  }
  return UNKNOWN_ROLE_RANK;
}

/** True if the researcher holds any executive role we recognize. */
export function isExecutive(role: string | null | undefined): boolean {
  return getExecutiveRank(role) < NO_ROLE_RANK;
}

/**
 * Compare two researcher-like objects by executive rank (asc), then by
 * Thai last name (asc) as a stable tiebreaker. Use with Array.sort().
 */
export function compareByExecutive(
  a: { executive_role_th?: string | null; last_name_th?: string | null },
  b: { executive_role_th?: string | null; last_name_th?: string | null },
): number {
  const ra = getExecutiveRank(a.executive_role_th);
  const rb = getExecutiveRank(b.executive_role_th);
  if (ra !== rb) return ra - rb;
  return (a.last_name_th || '').localeCompare(b.last_name_th || '', 'th');
}
