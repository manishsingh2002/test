import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isGuest: !isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ user: null, session: null, loading: false, isGuest: true });
      return;
    }

    // Fetch initial session without timeout - let it complete naturally
    // This prevents authenticated users from being forced into guest mode
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          isGuest: false,
        });
      })
      .catch((error) => {
        // Only fall back to guest mode if there's an actual error
        // Don't use timeout-based fallback
        setState({ user: null, session: null, loading: false, isGuest: true });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isGuest: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured' }, data: null };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      return { data, error };
    } catch (e: any) {
      return { error: { message: e.message || 'Sign up failed' }, data: null };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured' }, data: null };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (e: any) {
      return { error: { message: e.message || 'Sign in failed' }, data: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign out errors
    }
    setState({ user: null, session: null, loading: false, isGuest: true });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (e: any) {
      return { error: { message: e.message || 'Reset failed' } };
    }
  }, []);

  return { ...state, signUp, signIn, signOut, resetPassword };
}
