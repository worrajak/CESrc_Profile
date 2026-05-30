'use client';

/**
 * Client-side admin auth helper.
 * ─────────────────────────────
 * Decides the current user's admin role based on:
 *  - Supabase session  → looks up researchers.email + flags
 *  - Legacy session    → sessionStorage.admin_auth (password gate)
 *
 * Components use `useAdminAuth()` to decide what to render.
 * API callers use `adminFetch()` which auto-attaches the Supabase token.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export type ClientAdminRole = 'superadmin' | 'admin' | 'legacy' | null;

export type AdminStatus = {
  loading: boolean;
  role: ClientAdminRole;
  email?: string;
  researcherId?: string;
  /** Did we already check the DB for this user? Avoids re-querying. */
  checked: boolean;
};

export function useAdminAuth(): AdminStatus {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<AdminStatus>({ loading: true, role: null, checked: false });

  useEffect(() => {
    if (authLoading) return;

    (async () => {
      let researcherId: string | undefined;
      let email: string | undefined;
      let role: ClientAdminRole = null;

      // 1) Supabase user — check researchers.email match
      //    Single query asks for both is_active + is_admin; if the
      //    is_admin column doesn't exist (migration 049 not run yet)
      //    we retry without it. Collapses 2 sequential round-trips
      //    into 1 in the common case — ~500ms saved per page load.
      if (user?.email) {
        email = user.email;
        const lcEmail = user.email.toLowerCase();

        let r: any = null;
        let hasAdminCol = true;
        const primary = await supabase
          .from('researchers')
          .select('id, is_active, email, is_admin')
          .ilike('email', lcEmail)
          .maybeSingle();
        if (primary.error && /is_admin/i.test(primary.error.message || '')) {
          // is_admin column missing — fall back to legacy selection
          hasAdminCol = false;
          const fallback = await supabase
            .from('researchers')
            .select('id, is_active, email')
            .ilike('email', lcEmail)
            .maybeSingle();
          r = fallback.data;
        } else {
          r = primary.data;
        }

        if (r) {
          researcherId = r.id; // Always expose so user can jump to own profile
          if (hasAdminCol && r.is_admin === true) {
            role = 'superadmin';
          } else if (r.is_active) {
            role = 'admin';
          }
        }
      }

      // 2) Legacy password session
      if (!role && typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true') {
        role = 'legacy';
      }

      setStatus({ loading: false, role, email, researcherId, checked: true });
    })();
  }, [user, authLoading]);

  return status;
}

/**
 * Fetch wrapper that automatically attaches admin credentials:
 *   - Supabase access token as `Authorization: Bearer <token>` header
 *   - Legacy password in body/formData under `password` (fallback)
 *
 * Servers can use `extractAdminInputs(req)` then `checkAdmin(inputs)` from
 * `@/lib/admin-auth` to verify either path.
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(init.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is FormData and no password set, try to add legacy password
  const legacyPwd = typeof window !== 'undefined' ? sessionStorage.getItem('admin_pwd') : null;
  const body = init.body;

  if (body instanceof FormData && legacyPwd && !body.has('password')) {
    body.set('password', legacyPwd);
  }

  return fetch(input, { ...init, headers, body });
}

/**
 * Convenience for JSON POST/PUT admin requests.
 * Automatically merges access_token + password into the body and sets content-type.
 */
export async function adminJSON(
  input: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: Record<string, any> = {},
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || null;
  const legacyPwd = typeof window !== 'undefined' ? sessionStorage.getItem('admin_pwd') : null;

  const payload = {
    ...body,
    ...(token && !body.access_token ? { access_token: token } : {}),
    ...(legacyPwd && !body.password ? { password: legacyPwd } : {}),
  };

  return fetch(input, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
