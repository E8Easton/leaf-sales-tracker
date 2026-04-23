import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  name: string;
  role: 'rep' | 'manager' | 'admin';
  avatar_color: string;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // loading = only true during the very first session check on app start
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check — resolve loading as soon as we know auth state
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false); // done — navigate whether session exists or not
      if (s?.user) fetchProfile(s.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    } catch {
      // profiles table may not exist yet — non-fatal
    }
  }

  async function signIn(email: string, password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message ?? '';
      if (msg.toLowerCase().includes('not confirmed')) {
        return { error: { message: 'Email not confirmed — go to Supabase → Authentication → Providers → Email and turn off "Confirm email".' } };
      }
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        return { error: { message: 'Incorrect email or password. Try again.' } };
      }
      return { error };
    }
    return { error: null };
  }

  async function signUp(email: string, password: string, name: string): Promise<{ error: any; needsConfirmation: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error, needsConfirmation: false };
    if (!data.user) return { error: { message: 'Sign up failed — try again.' }, needsConfirmation: false };

    if (!data.session) {
      // Supabase still requires email confirmation
      return { error: null, needsConfirmation: true };
    }

    // No confirmation needed — create profile row immediately
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name,
      role: 'rep',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    }, { onConflict: 'id' });

    return { error: null, needsConfirmation: false };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, profile, loading, signIn, signUp, signOut };
}

const AVATAR_COLORS = ['#4BAEE6', '#7EC4F4', '#3A9AD4', '#1B7FC4', '#5BBEF5'];
