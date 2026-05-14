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
      // 1) Supabase user — check researchers.email match
      if (user?.email) {
        const email = user.email.toLowerCase();
        const { data: r } = await supabase
          .from('researchers')
          .select('id, is_admin, is_active, email')
          .ilike('email', email)
          .maybeSingle();

        if (r) {
          if (r.is_admin) {
            setStatus({ loading: false, role: 'superadmin', email: user.email, researcherId: r.id, checked: true });
            return;
          }
          if (r.is_active) {
            setStatus({ loading: false, role: 'admin', email: user.email, researcherId: r.id, checked: true });
            return;
          }
        }
      }

      // 2) Legacy password session
      if (typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true') {
        setStatus({ loading: false, role: 'legacy', checked: true });
        return;
      }

      setStatus({ loading: false, role: null, checked: true });
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
