import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type Sale = {
  id: string;
  rep_id: string;
  session_id: string | null;
  sale_date: string;
  amount: number;
  service_type: string;
  customer_name: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type Session = {
  id: string;
  rep_id: string;
  session_date: string;
  doors_knocked: number;
};

export type RepStats = {
  rep_id: string;
  name: string;
  avatar_color: string;
  total_revenue: number;
  total_doors: number;
  total_sales: number;
  close_rate: number;
  revenue_per_door: number;
  avg_sale: number;
};

function getDateRange(period: 'day' | 'week' | 'month') {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (period === 'day') return { start: today, end: today };
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return { start: monday.toISOString().split('T')[0], end: today };
  }
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: firstDay.toISOString().split('T')[0], end: today };
}

export function useSales(repId: string | undefined) {
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [weekSales, setWeekSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchAll = useCallback(async () => {
    if (!repId) return;
    setLoading(true);
    const weekRange = getDateRange('week');

    const [salesRes, sessionRes, weekRes] = await Promise.all([
      supabase.from('sales').select('*').eq('rep_id', repId).eq('sale_date', today).order('created_at', { ascending: false }),
      supabase.from('sales_sessions').select('*').eq('rep_id', repId).eq('session_date', today).single(),
      supabase.from('sales').select('*').eq('rep_id', repId).gte('sale_date', weekRange.start).lte('sale_date', weekRange.end),
    ]);

    setTodaySales(salesRes.data ?? []);
    setTodaySession(sessionRes.data ?? null);
    setWeekSales(weekRes.data ?? []);
    setLoading(false);
  }, [repId, today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function addSale(sale: { amount: number; service_type: string; customer_name?: string; address?: string; notes?: string }) {
    if (!repId) return;
    let sessionId = todaySession?.id;
    if (!sessionId) {
      const { data: existing } = await supabase.from('sales_sessions').select('id').eq('rep_id', repId).eq('session_date', today).single();
      if (existing) {
        sessionId = existing.id;
      } else {
        const { data: created } = await supabase.from('sales_sessions').insert({ rep_id: repId, session_date: today, doors_knocked: 0 }).select().single();
        sessionId = created?.id;
      }
    }
    await supabase.from('sales').insert({ rep_id: repId, session_id: sessionId ?? null, sale_date: today, ...sale });
    await fetchAll();
  }

  async function updateDoorsKnocked(count: number) {
    if (!repId) return;
    await supabase.from('sales_sessions').upsert({ rep_id: repId, session_date: today, doors_knocked: count }, { onConflict: 'rep_id,session_date' });
    await fetchAll();
  }

  const todayRevenue = todaySales.reduce((s, x) => s + x.amount, 0);
  const todayDoors = todaySession?.doors_knocked ?? 0;
  const todayCloseRate = todayDoors > 0 ? (todaySales.length / todayDoors) * 100 : 0;

  const weekRevenue = weekSales.reduce((s, x) => s + x.amount, 0);

  const dailyRevenue = getDailyRevenue(weekSales);

  return { todaySales, todaySession, todayRevenue, todayDoors, todayCloseRate, weekRevenue, dailyRevenue, loading, addSale, updateDoorsKnocked, refresh: fetchAll };
}

export function useLeaderboard(period: 'day' | 'week' | 'month') {
  const [stats, setStats] = useState<RepStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const range = getDateRange(period);

    const [salesRes, sessionsRes, profilesRes] = await Promise.all([
      supabase.from('sales').select('rep_id, amount, sale_date').gte('sale_date', range.start).lte('sale_date', range.end),
      supabase.from('sales_sessions').select('rep_id, doors_knocked').gte('session_date', range.start).lte('session_date', range.end),
      supabase.from('profiles').select('id, name, avatar_color'),
    ]);

    const sales = salesRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const profiles = profilesRes.data ?? [];

    const repMap: Record<string, RepStats> = {};
    for (const p of profiles) {
      repMap[p.id] = { rep_id: p.id, name: p.name, avatar_color: p.avatar_color, total_revenue: 0, total_doors: 0, total_sales: 0, close_rate: 0, revenue_per_door: 0, avg_sale: 0 };
    }
    for (const s of sales) {
      if (repMap[s.rep_id]) {
        repMap[s.rep_id].total_revenue += s.amount;
        repMap[s.rep_id].total_sales += 1;
      }
    }
    for (const s of sessions) {
      if (repMap[s.rep_id]) repMap[s.rep_id].total_doors += s.doors_knocked;
    }
    for (const r of Object.values(repMap)) {
      r.close_rate = r.total_doors > 0 ? (r.total_sales / r.total_doors) * 100 : 0;
      r.revenue_per_door = r.total_doors > 0 ? r.total_revenue / r.total_doors : 0;
      r.avg_sale = r.total_sales > 0 ? r.total_revenue / r.total_sales : 0;
    }

    const sorted = Object.values(repMap).sort((a, b) => b.total_revenue - a.total_revenue);
    setStats(sorted);
    setLoading(false);
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, refresh: fetch };
}

function getDailyRevenue(sales: Sale[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const result: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const total = sales.filter(s => s.sale_date === dateStr).reduce((sum, s) => sum + s.amount, 0);
    result.push({ label: dayLabel, value: total });
  }
  return result;
}
