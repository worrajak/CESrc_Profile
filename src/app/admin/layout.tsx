'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = () => {
      const v = typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true';
      setAuthed(!!v);
    };
    check();
    // Catch login transitions inside the same tab (the admin page sets
    // sessionStorage without a navigation event, so we poll briefly + listen
    // for storage / focus events)
    const id = setInterval(check, 800);
    window.addEventListener('focus', check);
    window.addEventListener('storage', check);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', check);
      window.removeEventListener('storage', check);
    };
  }, [pathname]);

  return (
    <>
      {authed && <AdminNavbar />}
      {children}
    </>
  );
}
