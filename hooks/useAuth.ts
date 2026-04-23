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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
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
      setProfile(data);
    } catch {
      // profile not yet created
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Give a clearer message for the most common failure
      if (error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('not confirmed')) {
        return { error: { ...error, message: 'Please confirm your email first — check your inbox for a link from Supabase.' } };
      }
      if (error.message.toLowerCase().includes('invalid login')) {
        return { error: { ...error, message: 'Incorrect email or password.' } };
      }
    }
    return { error };
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error, needsConfirmation: false };
    if (!data.user) return { error: new Error('Sign up failed — try again.') as any, needsConfirmation: false };

    // If session is null, Supabase requires email confirmation before the user can log in
    if (!data.session) {
      return { error: null, needsConfirmation: true };
    }

    // Session returned immediately — email confirmation is off, create profile now
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
