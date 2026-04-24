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

  const signInWithGoogle = useCallback(async () => {
    // Save the pending redirect so post-auth we know where to go
    const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    sessionStorage.setItem('auth_return_url', returnUrl);

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
      signInWithGoogle, signOut, updateProfile, deleteAccount, refreshProfile,
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
