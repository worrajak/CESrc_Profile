'use client';

/**
 * ConditionalNavbar — pathname-aware wrapper around the public Navbar.
 *
 * Hides the public site nav on /admin/* routes because AdminNavbar
 * (the Operations console) already covers admin navigation. Without
 * this wrapper the admin pages stack two nav bars on top of each other.
 */

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }
  return <Navbar />;
}
