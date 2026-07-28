/**
 * Admin authorization
 * ────────────────────
 * Two ways a request can prove it's an admin (in order of preference):
 *
 * 1. Supabase user token   — pass `Authorization: Bearer <access_token>`
 *    or include `access_token` field in body/formData.
 *    The user's email is matched against `researchers.email` (case-insensitive):
 *      - researchers.is_admin = true        → role 'superadmin'
 *      - researchers.is_active = true        → role 'admin'
 *
 * 2. Legacy password       — include `password` matching ADMIN_PASSWORD env var.
 *    Kept as emergency fallback. Role reported as 'legacy'.
 *
 * Routes are encouraged to migrate clients to token-based auth so we get
 * an identity trail; the legacy path stays open.
 */

import { supabase } from '@/lib/supabase';
import type { NextRequest } from 'next/server';

export type AdminRole = 'superadmin' | 'admin' | 'legacy';

export type AdminAuthResult = {
  authorized: boolean;
  role: AdminRole | null;
  email?: string;
  researcher_id?: string;
  reason?: string;
};

export type AdminAuthInputs = {
  password?: string | null;
  accessToken?: string | null;
};

const adminPwd = () => process.env.ADMIN_PASSWORD || '';

export async function checkAdmin(inputs: AdminAuthInputs): Promise<AdminAuthResult> {
  const { password, accessToken } = inputs;

  // ── Path 1: Supabase access token ──
  if (accessToken && accessToken.trim()) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error || !user || !user.email) {
        // fall through to legacy
      } else {
        const email = user.email.toLowerCase();
        const { data: r } = await supabase
          .from('researchers')
          .select('id, is_admin, is_active, email')
          .ilike('email', email)
          .maybeSingle();

        if (r) {
          if (r.is_admin) {
            return { authorized: true, role: 'superadmin', email: user.email, researcher_id: r.id };
          }
          if (r.is_active) {
            return { authorized: true, role: 'admin', email: user.email, researcher_id: r.id };
          }
        }
      }
    } catch {
      // ignore and fall through to legacy
    }
  }

  // ── Path 2: Legacy password ──
  if (password && password === adminPwd() && adminPwd().length > 0) {
    return { authorized: true, role: 'legacy' };
  }

  return { authorized: false, role: null, reason: 'No valid admin credentials' };
}

/** Extract password + access_token from a NextRequest (JSON or FormData) without consuming the body twice. */
export async function extractAdminInputs(req: NextRequest): Promise<AdminAuthInputs> {
  const contentType = req.headers.get('content-type') || '';
  const headerAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const headerToken = headerAuth.toLowerCase().startsWith('bearer ') ? headerAuth.slice(7).trim() : null;
  // Legacy password sent as header — used by adminFetch() for GET/DELETE
  // requests where there's no body/formData to inject the password into.
  const headerPassword = req.headers.get('x-admin-password') || req.headers.get('X-Admin-Password') || null;

  let password: string | null = headerPassword;
  let accessToken: string | null = headerToken;

  if (contentType.includes('application/json')) {
    try {
      const body = await req.clone().json();
      password = password ?? (body?.password ?? null);
      accessToken = accessToken ?? body?.access_token ?? null;
    } catch {
      // ignore
    }
  } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const fd = await req.clone().formData();
      password = password ?? ((fd.get('password') as string) || null);
      accessToken = accessToken ?? ((fd.get('access_token') as string) || null);
    } catch {
      // ignore
    }
  }

  return { password, accessToken };
}

/** Convenience: extract + check in one call. */
export async function authorizeAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const inputs = await extractAdminInputs(req);
  return checkAdmin(inputs);
}
