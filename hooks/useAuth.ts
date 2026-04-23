import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error };
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      role: 'rep',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
    return { error: profileError };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, profile, loading, signIn, signUp, signOut };
}

const AVATAR_COLORS = ['#C85A30', '#E8C435', '#6BAF6B', '#7BA4C8', '#9B6BB5'];
