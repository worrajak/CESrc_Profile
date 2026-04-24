'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * Silent tracker — fires anonymous page_view event on route change.
 * PDPA-safe: no cookies set here, only server-side ephemeral session hash.
 */
export default function EngagementTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Don't track admin/auth pages
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    if (pathname.startsWith('/auth')) return;
    if (pathname === '/privacy-policy' || pathname === '/terms') return;

    // Respect Do Not Track
    if (typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1') return;

    // Check user has opt-out via localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('analytics_opt_out') === '1') return;

    fetch('/api/engagement/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page_path: pathname,
        user_id: user?.id || null,
      }),
    }).catch(() => { /* ignore errors */ });
  }, [pathname, user]);

  return null;
}
