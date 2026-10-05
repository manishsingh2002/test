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
    console.log("🔐 useAuth: Checking Supabase configuration...");
    console.log("🔐 isSupabaseConfigured:", isSupabaseConfigured);
    console.log("🔐 supabase client:", supabase ? "Available" : "Not available");
    
    if (!isSupabaseConfigured || !supabase) {
      console.log("🔐 Supabase not configured, using guest mode");
      setState({ user: null, session: null, loading: false, isGuest: true });
      return;
    }

    console.log("🔐 Fetching session...");
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Session fetch timed out, using guest mode");
      setState({ user: null, session: null, loading: false, isGuest: true });
    }, 5000); // 5 second timeout

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId);
        console.log("✅ Session fetched:", session ? "User logged in" : "No session");
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          isGuest: false,
        });
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("❌ Session fetch failed:", error);
        setState({ user: null, session: null, loading: false, isGuest: true });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", _event);
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isGuest: false,
      });
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Supabase not configured' } };
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
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Supabase not configured' } };
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
    } catch {}
    setState({ user: null, session: null, loading: false, isGuest: true });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (e: any) {
      return { error: { message: e.message || 'Reset failed' } };
    }
  }, []);

  return { ...state, signUp, signIn, signOut, resetPassword };
}
