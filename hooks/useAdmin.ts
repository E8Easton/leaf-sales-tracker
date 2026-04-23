import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RepStats } from './useSales';

type Period = 'day' | 'week' | 'month';

function getDateRange(period: Period) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (period === 'day') return { start: today, end: today };
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date().setDate(diff));
    return { start: monday.toISOString().split('T')[0], end: today };
  }
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: firstDay.toISOString().split('T')[0], end: today };
}

export type TeamSummary = {
  totalRevenue: number;
  totalDoors: number;
  totalSales: number;
  activeReps: number;
  teamCloseRate: number;
  teamAvgSale: number;
};

export function useTeamStats(period: Period) {
  const [repStats, setRepStats] = useState<RepStats[]>([]);
  const [summary, setSummary] = useState<TeamSummary>({ totalRevenue: 0, totalDoors: 0, totalSales: 0, activeReps: 0, teamCloseRate: 0, teamAvgSale: 0 });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const range = getDateRange(period);

    const [salesRes, sessionsRes, profilesRes] = await Promise.all([
      supabase.from('sales').select('rep_id, amount, sale_date').gte('sale_date', range.start).lte('sale_date', range.end),
      supabase.from('sales_sessions').select('rep_id, doors_knocked, session_date').gte('session_date', range.start).lte('session_date', range.end),
      supabase.from('profiles').select('id, name, avatar_color, role'),
    ]);

    const sales = salesRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const profiles = profilesRes.data ?? [];

    const repMap: Record<string, RepStats> = {};
    for (const p of profiles) {
      repMap[p.id] = { rep_id: p.id, name: p.name, avatar_color: p.avatar_color, total_revenue: 0, total_doors: 0, total_sales: 0, close_rate: 0, revenue_per_door: 0, avg_sale: 0 };
    }
    for (const s of sales) {
      if (repMap[s.rep_id]) { repMap[s.rep_id].total_revenue += s.amount; repMap[s.rep_id].total_sales += 1; }
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
    setRepStats(sorted);

    const totalRevenue = sorted.reduce((s, r) => s + r.total_revenue, 0);
    const totalDoors = sorted.reduce((s, r) => s + r.total_doors, 0);
    const totalSales = sorted.reduce((s, r) => s + r.total_sales, 0);
    const activeReps = sorted.filter(r => r.total_revenue > 0 || r.total_doors > 0).length;

    setSummary({
      totalRevenue,
      totalDoors,
      totalSales,
      activeReps,
      teamCloseRate: totalDoors > 0 ? (totalSales / totalDoors) * 100 : 0,
      teamAvgSale: totalSales > 0 ? totalRevenue / totalSales : 0,
    });
    setLoading(false);
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { repStats, summary, loading, refresh: fetch };
}

export type RepDetail = {
  profile: { id: string; name: string; avatar_color: string; role: string; created_at: string };
  stats: RepStats;
  recentSales: Array<{ id: string; amount: number; service_type: string; customer_name: string | null; sale_date: string; created_at: string }>;
  dailyRevenue: Array<{ label: string; value: number }>;
};

export function useRepDetail(repId: string | undefined, period: Period = 'week') {
  const [detail, setDetail] = useState<RepDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!repId) return;
    setLoading(true);
    const range = getDateRange(period);

    const [profileRes, salesRes, sessionsRes, recentRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', repId).single(),
      supabase.from('sales').select('rep_id, amount, sale_date').eq('rep_id', repId).gte('sale_date', range.start).lte('sale_date', range.end),
      supabase.from('sales_sessions').select('rep_id, doors_knocked').eq('rep_id', repId).gte('session_date', range.start).lte('session_date', range.end),
      supabase.from('sales').select('id, amount, service_type, customer_name, sale_date, created_at').eq('rep_id', repId).order('created_at', { ascending: false }).limit(10),
    ]);

    const profile = profileRes.data;
    const sales = salesRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const recentSales = recentRes.data ?? [];

    const totalRevenue = sales.reduce((s: number, x: any) => s + x.amount, 0);
    const totalSales = sales.length;
    const totalDoors = sessions.reduce((s: number, x: any) => s + x.doors_knocked, 0);
    const closeRate = totalDoors > 0 ? (totalSales / totalDoors) * 100 : 0;
    const revPerDoor = totalDoors > 0 ? totalRevenue / totalDoors : 0;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const now = new Date();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const value = sales.filter((s: any) => s.sale_date === dateStr).reduce((sum: number, s: any) => sum + s.amount, 0);
      return { label, value };
    });

    setDetail({
      profile,
      stats: { rep_id: repId, name: profile?.name ?? '', avatar_color: profile?.avatar_color ?? '#6BAF6B', total_revenue: totalRevenue, total_doors: totalDoors, total_sales: totalSales, close_rate: closeRate, revenue_per_door: revPerDoor, avg_sale: avgSale },
      recentSales,
      dailyRevenue,
    });
    setLoading(false);
  }, [repId, period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { detail, loading, refresh: fetch };
}
