import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type Message = {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  from_profile?: { name: string; avatar_color: string };
  to_profile?: { name: string; avatar_color: string };
};

export function useMessages(myId: string | undefined, otherId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!myId) return;
    setLoading(true);

    let query = supabase
      .from('messages')
      .select('*, from_profile:profiles!messages_from_id_fkey(name, avatar_color), to_profile:profiles!messages_to_id_fkey(name, avatar_color)')
      .order('created_at', { ascending: true });

    if (otherId) {
      query = query.or(`and(from_id.eq.${myId},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${myId})`);
    } else {
      query = query.or(`from_id.eq.${myId},to_id.eq.${myId}`);
    }

    const { data } = await query;
    const msgs = (data ?? []) as Message[];
    setMessages(msgs);
    setUnreadCount(msgs.filter(m => m.to_id === myId && !m.read_at).length);
    setLoading(false);
  }, [myId, otherId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!myId) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myId, fetchMessages]);

  async function sendMessage(toId: string, content: string) {
    if (!myId || !content.trim()) return;
    await supabase.from('messages').insert({ from_id: myId, to_id: toId, content: content.trim() });
    await fetchMessages();
  }

  async function markAllRead() {
    if (!myId) return;
    const unread = messages.filter(m => m.to_id === myId && !m.read_at);
    if (unread.length === 0) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unread.map(m => m.id));
    await fetchMessages();
  }

  return { messages, unreadCount, loading, sendMessage, markAllRead, refresh: fetchMessages };
}

export function useRepInbox(myId: string | undefined) {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchInbox = useCallback(async () => {
    if (!myId) return;
    const { data } = await supabase
      .from('messages')
      .select('*, from_profile:profiles!messages_from_id_fkey(name, avatar_color)')
      .eq('to_id', myId)
      .order('created_at', { ascending: false })
      .limit(20);
    const msgs = (data ?? []) as Message[];
    setInbox(msgs);
    setUnreadCount(msgs.filter(m => !m.read_at).length);
  }, [myId]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  useEffect(() => {
    if (!myId) return;
    const channel = supabase
      .channel(`inbox-${myId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_id=eq.${myId}` }, () => fetchInbox())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myId, fetchInbox]);

  async function markRead(messageId: string) {
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', messageId);
    await fetchInbox();
  }

  return { inbox, unreadCount, markRead, refresh: fetchInbox };
}
