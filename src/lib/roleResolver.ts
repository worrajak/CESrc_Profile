/**
 * ============================================================
 * CES-RMUTL Role Resolver
 * แยก First Author / Corresponding Author / Co-Author อัตโนมัติ
 * สำหรับ Researcher Profile CV
 * ============================================================
 */

// ============================================================
// Types
// ============================================================

export type AuthorRole = 'first_author' | 'corresponding_author' | 'co_author' | 'last_author';

export interface Author {
  name: string;           // e.g. "T. Somsak" or "Teerasak Somsak"
  isCorresponding?: boolean; // marked with * or "corresponding" note
}

export interface PublicationAuthor {
  publicationId: string;
  researcherId: string;
  authorRole: AuthorRole;
  authorOrder: number;
  isCorresponding: boolean;
}

export interface ResearcherIdentity {
  id: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameTh?: string;
  lastNameTh?: string;
}

export interface ResolvedPublication {
  publicationId: string;
  role: AuthorRole;
  authorOrder: number;
  isCorresponding: boolean;
  roleDisplay: string;
  roleDisplayTh: string;
}

export interface CVSection {
  asFirstAuthor: ResolvedPublication[];
  asCorrespondingAuthor: ResolvedPublication[];
  asCoAuthor: ResolvedPublication[];
  asLastAuthor: ResolvedPublication[];
}

// ============================================================
// Core Role Resolver
// ============================================================

/**
 * Resolve author role from raw author string + researcher identity.
 *
 * Algorithm:
 * 1. Parse raw authors string into individual authors
 * 2. Match researcher against each author position
 * 3. Determine role based on:
 *    - Position 1 = First Author
 *    - Last position = Last Author (typically senior/advisor)
 *    - Marked with * = Corresponding Author
 *    - Otherwise = Co-Author
 * 4. Check for corresponding author markers
 */
export function resolveAuthorRole(
  authorsRaw: string,
  researcher: ResearcherIdentity,
  correspondingMarker?: string  // e.g. email or * marker
): PublicationAuthor | null {
  const authors = parseAuthors(authorsRaw);
  const totalAuthors = authors.length;

  for (let i = 0; i < authors.length; i++) {
    if (matchAuthor(authors[i], researcher)) {
      const order = i + 1;
      const isCorresponding = authors[i].isCorresponding || false;

      let role: AuthorRole;
      if (order === 1) {
        role = 'first_author';
      } else if (order === totalAuthors && totalAuthors > 1) {
        role = 'last_author';
      } else if (isCorresponding) {
        role = 'corresponding_author';
      } else {
        role = 'co_author';
      }

      return {
        publicationId: '',  // to be filled by caller
        researcherId: researcher.id,
        authorRole: role,
        authorOrder: order,
        isCorresponding,
      };
    }
  }

  return null; // researcher not found in this publication
}

/**
 * Resolve all publications for a single researcher and group by role.
 * This is the main function used for CV generation.
 */
export function resolveForCV(
  publications: Array<{
    id: string;
    authorsRaw: string;
    correspondingEmail?: string;
  }>,
  researcher: ResearcherIdentity
): CVSection {
  const result: CVSection = {
    asFirstAuthor: [],
    asCorrespondingAuthor: [],
    asCoAuthor: [],
    asLastAuthor: [],
  };

  for (const pub of publications) {
    const resolved = resolveAuthorRole(pub.authorsRaw, researcher);
    if (!resolved) continue;

    const entry: ResolvedPublication = {
      publicationId: pub.id,
      role: resolved.authorRole,
      authorOrder: resolved.authorOrder,
      isCorresponding: resolved.isCorresponding,
      roleDisplay: getRoleDisplay(resolved.authorRole, resolved.isCorresponding),
      roleDisplayTh: getRoleDisplayTh(resolved.authorRole, resolved.isCorresponding),
    };

    switch (resolved.authorRole) {
      case 'first_author':
        result.asFirstAuthor.push(entry);
        break;
      case 'corresponding_author':
        result.asCorrespondingAuthor.push(entry);
        break;
      case 'last_author':
        result.asLastAuthor.push(entry);
        break;
      default:
        result.asCoAuthor.push(entry);
    }

    // If first author is also corresponding, add to both
    if (resolved.authorRole === 'first_author' && resolved.isCorresponding) {
      result.asCorrespondingAuthor.push({ ...entry, role: 'corresponding_author' });
    }
  }

  return result;
}

// ============================================================
// Author Parsing
// ============================================================

/**
 * Parse raw author string into structured author list.
 *
 * Supports formats:
 * - "A. Surname, B. Surname, and C. Surname"
 * - "Surname, A., Surname, B., & Surname, C."
 * - "A. Surname*, B. Surname" (corresponding marked with *)
 */
export function parseAuthors(raw: string): Author[] {
  if (!raw || raw.trim() === '') return [];

  // Normalize: remove "and " / "& " before last author
  let normalized = raw
    .replace(/,?\s+and\s+/gi, ', ')
    .replace(/,?\s+&\s+/gi, ', ')
    .trim();

  // Split by comma (but handle "Surname, I." format)
  const parts = smartSplit(normalized);

  return parts.map(part => {
    const trimmed = part.trim();
    const isCorresponding = trimmed.includes('*');
    const name = trimmed.replace(/\*/g, '').trim();
    return { name, isCorresponding };
  });
}

/**
 * Smart split that handles both "I. Surname" and "Surname, I." formats.
 */
function smartSplit(input: string): string[] {
  // Detect if format is "Surname, I., Surname, I." (APA style)
  const apaPattern = /^[A-Za-z\u0E00-\u0E7F]+,\s*[A-Z]\./;

  if (apaPattern.test(input)) {
    // APA: split on pattern "., " followed by uppercase letter
    return input.split(/\.\,\s*(?=[A-Z\u0E00-\u0E7F])/).map(s =>
      s.endsWith('.') ? s : s + '.'
    );
  }

  // IEEE/standard: split on ", "
  return input.split(/,\s*/);
}

// ============================================================
// Author Matching
// ============================================================

/**
 * Match a parsed author name against a researcher identity.
 *
 * Handles:
 * - "T. Somsak" matches { firstNameEn: "Teerasak", lastNameEn: "Somsak" }
 * - "Teerasak Somsak" exact match
 * - "Somsak, T." APA format
 * - Thai names: "ธีระศักดิ์ สมศักดิ์"
 */
export function matchAuthor(author: Author, researcher: ResearcherIdentity): boolean {
  const name = author.name.toLowerCase().trim();
  const firstName = researcher.firstNameEn?.toLowerCase() || '';
  const lastName = researcher.lastNameEn?.toLowerCase() || '';
  const firstNameTh = researcher.firstNameTh || '';
  const lastNameTh = researcher.lastNameTh || '';

  // Skip if researcher has no English name
  if (!firstName && !lastName && !firstNameTh) return false;

  // 1. Exact full name match (English)
  if (name === `${firstName} ${lastName}`) return true;

  // 2. Abbreviated first name: "T. Somsak"
  if (firstName && lastName) {
    const initial = firstName.charAt(0);
    if (name === `${initial}. ${lastName}`.toLowerCase()) return true;
    if (name === `${initial}.${lastName}`.toLowerCase()) return true;
  }

  // 3. APA format: "Somsak, T."
  if (firstName && lastName) {
    const initial = firstName.charAt(0);
    if (name === `${lastName}, ${initial}.`.toLowerCase()) return true;
  }

  // 4. Last name only match (for single-word entries)
  if (lastName && name === lastName) return true;

  // 5. Thai name match
  if (firstNameTh && lastNameTh) {
    if (name.includes(firstNameTh) && name.includes(lastNameTh)) return true;
  }

  // 6. Fuzzy: last name appears in the name string
  if (lastName && name.includes(lastName)) {
    // Double check with first initial
    if (firstName && name.includes(firstName.charAt(0) + '.')) return true;
  }

  return false;
}

// ============================================================
// Display Helpers
// ============================================================

export function getRoleDisplay(role: AuthorRole, isCorresponding: boolean): string {
  if (isCorresponding && role === 'first_author') return 'First & Corresponding Author';
  switch (role) {
    case 'first_author': return 'First Author';
    case 'corresponding_author': return 'Corresponding Author';
    case 'last_author': return 'Last Author';
    case 'co_author': return 'Co-Author';
  }
}

export function getRoleDisplayTh(role: AuthorRole, isCorresponding: boolean): string {
  if (isCorresponding && role === 'first_author') return 'ผู้แต่งหลักและผู้รับผิดชอบบทความ';
  switch (role) {
    case 'first_author': return 'ผู้แต่งหลัก';
    case 'corresponding_author': return 'ผู้รับผิดชอบบทความ';
    case 'last_author': return 'ผู้แต่งอาวุโส';
    case 'co_author': return 'ผู้แต่งร่วม';
  }
}

// ============================================================
// Citation Formatters (IEEE & APA)
// ============================================================

export interface PublicationData {
  title: string;
  authorsRaw: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year: number;
  doi?: string;
  pubType: string;
}

/**
 * Format a publication in IEEE citation style.
 * Example: [1] T. Somsak, N. Patcharaprakiti, and W. Muangjai, "Title here,"
 *          Journal Name, vol. X, no. Y, pp. 1-10, 2024.
 */
export function formatIEEE(pub: PublicationData, index: number): string {
  const parts: string[] = [];

  // [number]
  parts.push(`[${index}]`);

  // Authors (keep original order, IEEE format: I. Surname)
  parts.push(pub.authorsRaw);

  // Title in quotes for articles, italic for books
  const isBook = pub.pubType === 'book' || pub.pubType === 'book_chapter';
  if (isBook) {
    parts.push(pub.title);
  } else {
    parts.push(`"${pub.title}"`);
  }

  // Journal/Conference name (italic in actual rendering)
  if (pub.journalName) {
    parts.push(pub.journalName);
  }

  // Volume and issue
  if (pub.volume) {
    let volStr = `vol. ${pub.volume}`;
    if (pub.issue) volStr += `, no. ${pub.issue}`;
    parts.push(volStr);
  }

  // Pages
  if (pub.pages) {
    parts.push(pub.pages.startsWith('pp.') ? pub.pages : `pp. ${pub.pages}`);
  }

  // Year
  parts.push(pub.year.toString());

  // DOI
  if (pub.doi) {
    parts.push(`doi: ${pub.doi}`);
  }

  return parts.join(', ') + '.';
}

/**
 * Format a publication in APA 7th edition citation style.
 * Example: Somsak, T., Patcharaprakiti, N., & Muangjai, W. (2024). Title here.
 *          Journal Name, X(Y), 1-10. https://doi.org/10.xxxx
 */
export function formatAPA(pub: PublicationData): string {
  const parts: string[] = [];

  // Authors in APA format: Surname, I., Surname, I., & Surname, I.
  const authors = parseAuthors(pub.authorsRaw);
  const apaAuthors = authors.map((a, i) => {
    const nameParts = a.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      // Check if already in "Surname, I." format
      if (nameParts[0].endsWith(',')) {
        return a.name.trim();
      }
      // Convert "I. Surname" to "Surname, I."
      const initial = nameParts[0];
      const surname = nameParts.slice(1).join(' ');
      if (initial.endsWith('.')) {
        return `${surname}, ${initial}`;
      }
      // Full name: "Teerasak Somsak" -> "Somsak, T."
      return `${surname}, ${initial.charAt(0)}.`;
    }
    return a.name;
  });

  // Join with ", " and "& " before last
  let authorStr: string;
  if (apaAuthors.length === 1) {
    authorStr = apaAuthors[0];
  } else if (apaAuthors.length === 2) {
    authorStr = `${apaAuthors[0]} & ${apaAuthors[1]}`;
  } else {
    authorStr = apaAuthors.slice(0, -1).join(', ') + ', & ' + apaAuthors[apaAuthors.length - 1];
  }
  parts.push(authorStr);

  // Year in parentheses
  parts.push(`(${pub.year}).`);

  // Title (sentence case for articles, title case for books)
  parts.push(`${pub.title}.`);

  // Source (journal name in italic + volume/issue/pages)
  if (pub.journalName) {
    let source = pub.journalName;
    if (pub.volume) {
      source += `, ${pub.volume}`;
      if (pub.issue) source += `(${pub.issue})`;
    }
    if (pub.pages) {
      source += `, ${pub.pages}`;
    }
    parts.push(source + '.');
  }

  // DOI
  if (pub.doi) {
    parts.push(`https://doi.org/${pub.doi}`);
  }

  return parts.join(' ');
}

// ============================================================
// Supabase Query Helpers
// ============================================================

/**
 * SQL query to get all publications for a researcher grouped by role.
 * Use with Supabase .rpc() or direct query.
 */
export const SQL_GET_RESEARCHER_CV = `
  SELECT
    p.id,
    p.title,
    p.pub_type,
    p.journal_name,
    p.volume,
    p.issue,
    p.pages,
    p.year,
    p.doi,
    p.authors_raw,
    pa.author_role,
    pa.author_order,
    pa.is_corresponding,
    CASE
      WHEN pa.author_role = 'first_author' AND pa.is_corresponding THEN 'First & Corresponding Author'
      WHEN pa.author_role = 'first_author' THEN 'First Author'
      WHEN pa.is_corresponding THEN 'Corresponding Author'
      WHEN pa.author_role = 'last_author' THEN 'Last Author'
      ELSE 'Co-Author'
    END AS role_display
  FROM publications p
  JOIN publication_authors pa ON pa.publication_id = p.id
  WHERE pa.researcher_id = $1
  ORDER BY
    CASE pa.author_role
      WHEN 'first_author' THEN 1
      WHEN 'corresponding_author' THEN 2
      WHEN 'co_author' THEN 3
      WHEN 'last_author' THEN 4
    END,
    p.year DESC;
`;
