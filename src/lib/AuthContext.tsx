'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

const CURRENT_CONSENT_VERSION = '1.0';

export interface GuestProfile {
  id: string;
  email: string;
  display_name: string;
  user_type: 'student' | 'researcher' | 'general';
  institution: string | null;
  consent_version: string;
  consented_at: string;
  marketing_opt_in: boolean;
  comment_count: number;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: GuestProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ ok: boolean; needsEmailConfirm?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<GuestProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const { data } = await supabase
      .from('guest_users')
      .select('*')
      .eq('id', u.id)
      .single();
    if (data) setProfile(data as GuestProfile);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) loadProfile(session.user);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const rememberReturnUrl = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('auth_return_url', window.location.pathname);
  };

  const signInWithGoogle = useCallback(async () => {
    rememberReturnUrl();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    rememberReturnUrl();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      return { ok: false, error: 'อีเมลไม่ถูกต้อง' };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    rememberReturnUrl();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { ok: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    rememberReturnUrl();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'อีเมลไม่ถูกต้อง' };
    }
    if (!password || password.length < 8) {
      return { ok: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    }
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    // If Supabase project has "Confirm email" enabled, session is null until confirmed
    const needsEmailConfirm = !data.session && !!data.user;
    return { ok: true, needsEmailConfirm };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<GuestProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from('guest_users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) await refreshProfile();
  }, [user, refreshProfile]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    // Log the deletion in consent_log before removing
    await supabase.from('consent_log').insert({
      user_id: user.id,
      consent_version: CURRENT_CONSENT_VERSION,
      consent_type: 'privacy',
      action: 'revoked',
    });

    // Delete guest_users row (cascade will delete comments)
    await supabase.from('guest_users').delete().eq('id', user.id);

    // Sign out (auth.users row needs admin to delete — but RLS prevents access)
    await supabase.auth.signOut();
  }, [user]);

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signInWithGoogle, signInWithMagicLink, signInWithPassword, signUpWithPassword,
      signOut, updateProfile, deleteAccount, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { CURRENT_CONSENT_VERSION };
