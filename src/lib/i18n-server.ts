/**
 * Server-side i18n helper — read locale from cookie in Server Components
 *
 * Usage in Server Component:
 * ```tsx
 * import { getServerLocale, st } from '@/lib/i18n-server';
 *
 * export default async function Page() {
 *   const locale = getServerLocale();
 *   return <h1>{st('home.hero.title', locale)}</h1>;
 * }
 * ```
 */

import { cookies } from 'next/headers';
import { translate, type Locale } from '@/lib/translations';

/**
 * Read locale from cookie. Defaults to 'th' if not set.
 */
export function getServerLocale(): Locale {
  try {
    const cookieStore = cookies();
    const value = cookieStore.get('cesru_locale')?.value;
    if (value === 'th' || value === 'en') return value;
  } catch {
    // cookies() may throw in some edge cases (static generation) — fallback safely
  }
  return 'th';
}

/**
 * Server-side translate helper.
 * Use in Server Components where useI18n() hook isn't available.
 */
export function st(key: string, locale?: Locale): string {
  return translate(key, locale || getServerLocale());
}

export { translate, type Locale };
