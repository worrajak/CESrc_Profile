'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { useAdminAuth } from '@/lib/admin-auth-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, loading: roleLoading } = useAdminAuth();
  const [legacyAuthed, setLegacyAuthed] = useState(false);

  // Keep the legacy sessionStorage check in case user logged in via password
  // before the new flow.
  useEffect(() => {
    const check = () => {
      const v = typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true';
      setLegacyAuthed(!!v);
    };
    check();
    const id = setInterval(check, 800);
    window.addEventListener('focus', check);
    window.addEventListener('storage', check);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', check);
      window.removeEventListener('storage', check);
    };
  }, [pathname]);

  // Show admin navbar if EITHER:
  //   - Supabase user is admin (superadmin / admin via researchers.email match)
  //   - OR legacy admin session is set in sessionStorage
  const showNavbar = !roleLoading && (role === 'superadmin' || role === 'admin' || legacyAuthed);

  return (
    <>
      {showNavbar && <AdminNavbar />}
      {children}
    </>
  );
}
