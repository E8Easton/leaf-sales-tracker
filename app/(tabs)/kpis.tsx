import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, RefreshControl,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSales } from '../../hooks/useSales';
import { useLeaderboard } from '../../hooks/useSales';
import KpiCard from '../../components/KpiCard';

type Period = 'day' | 'week' | 'month';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export default function KpisScreen() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const { todayRevenue, todayDoors, todayCloseRate, weekRevenue, todaySales, loading, refresh } = useSales(profile?.id);
  const { stats } = useLeaderboard(period);

  const myStat = stats.find(s => s.rep_id === profile?.id);
  const myRank = stats.findIndex(s => s.rep_id === profile?.id);

  const revenue = period === 'day' ? todayRevenue : myStat?.total_revenue ?? 0;
  const doors = period === 'day' ? todayDoors : myStat?.total_doors ?? 0;
  const salesCount = period === 'day' ? todaySales.length : myStat?.total_sales ?? 0;
  const closeRate = period === 'day' ? todayCloseRate : myStat?.close_rate ?? 0;
  const revPerDoor = doors > 0 ? revenue / doors : 0;
  const avgSale = salesCount > 0 ? revenue / salesCount : 0;

  const weeklyGoal = 5000;
  const monthlyGoal = 20000;
  const goalRevenue = period === 'week' ? weekRevenue : revenue;
  const goal = period === 'day' ? 1000 : period === 'week' ? weeklyGoal : monthlyGoal;
  const goalPct = Math.min(goalRevenue / goal, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
      >
        <Text style={styles.hero}>Intensity{'\n'}Values</Text>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <KpiCard
              label="Revenue"
              value={`$${revenue >= 1000 ? `${(revenue / 1000).toFixed(1)}k` : revenue.toFixed(0)}`}
              subtitle={period === 'day' ? 'Today' : period === 'week' ? 'This week' : 'This month'}
              color={Colors.coral}
            />
            <View style={{ width: Spacing.sm }} />
            <KpiCard
              label="Close Rate"
              value={`${closeRate.toFixed(0)}%`}
              subtitle={`${salesCount} of ${doors} doors`}
              color={Colors.yellow}
              progress={closeRate / 100}
            />
          </View>

          <View style={styles.gridRow}>
            <KpiCard
              label="Rev / Door"
              value={`$${revPerDoor.toFixed(0)}`}
              subtitle="Per door knocked"
              color={Colors.green}
            />
            <View style={{ width: Spacing.sm }} />
            <KpiCard
              label="Avg Sale"
              value={`$${avgSale.toFixed(0)}`}
              subtitle="Per closed sale"
              color={Colors.blue}
            />
          </View>

          {/* Wide goal card */}
          <View style={[styles.goalCard]}>
            <View style={styles.goalLeft}>
              <Text style={styles.goalTitle}>Sales Goal</Text>
              <Text style={styles.goalSub}>${goalRevenue.toFixed(0)} of ${goal.toLocaleString()} Goal</Text>
              <Text style={styles.goalPct}>{(goalPct * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.goalBarWrap}>
              <View style={styles.goalBarBg}>
                <View style={[styles.goalBarFill, { width: `${goalPct * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Doors knocked tiers */}
        <Text style={styles.sectionTitle}>Door Count Guide</Text>
        <View style={styles.tierGrid}>
          <TierCard range="0–20" label="Low" color={Colors.coral} />
          <TierCard range="21–40" label="Building" color={Colors.yellow} />
          <TierCard range="41–60" label="Average" color={Colors.green} />
          <TierCard range="61–100" label="High" color={Colors.blue} />
          <View style={[styles.tierCardWide, { backgroundColor: Colors.cream }]}>
            <Text style={[styles.tierRange, { color: '#333' }]}>100+</Text>
            <Text style={[styles.tierLabel, { color: '#666' }]}>Elite</Text>
          </View>
        </View>

        {/* Team rank */}
        {myRank >= 0 && (
          <View style={styles.rankBanner}>
            <Text style={styles.rankBannerText}>You're ranked #{myRank + 1} out of {stats.length} reps</Text>
            {myRank === 0 && <Text style={styles.rankEmoji}>🏆 You're on top!</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TierCard({ range, label, color }: { range: string; label: string; color: string }) {
  const isLight = color === Colors.cream;
  return (
    <View style={[styles.tierCard, { backgroundColor: color }]}>
      <Text style={[styles.tierRange, isLight && { color: '#333' }]}>{range}</Text>
      <Text style={[styles.tierLabel, isLight && { color: '#666' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  hero: { ...Typography.hero, color: Colors.white, marginBottom: Spacing.lg },
  periodRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.full, padding: 4, marginBottom: Spacing.lg, gap: 4 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.full, alignItems: 'center' },
  periodBtnActive: { backgroundColor: Colors.white },
  periodText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  periodTextActive: { color: Colors.background },
  grid: { gap: Spacing.sm },
  gridRow: { flexDirection: 'row' },
  goalCard: { backgroundColor: Colors.coral, borderRadius: BorderRadius.lg, padding: 20, justifyContent: 'center' },
  goalLeft: { marginBottom: 16 },
  goalTitle: { ...Typography.h3, color: Colors.white },
  goalSub: { ...Typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  goalPct: { fontSize: 42, fontWeight: '900', color: Colors.white, marginTop: 8 },
  goalBarWrap: { marginTop: 4 },
  goalBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  goalBarFill: { height: 8, backgroundColor: Colors.white, borderRadius: 4 },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierCard: { flex: 1, minWidth: '45%', borderRadius: BorderRadius.lg, padding: 16, minHeight: 100, justifyContent: 'flex-end' },
  tierCardWide: { width: '100%', borderRadius: BorderRadius.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierRange: { fontSize: 18, fontWeight: '800', color: Colors.white },
  tierLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  rankBanner: { marginTop: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  rankBannerText: { ...Typography.bodyBold, color: Colors.white },
  rankEmoji: { ...Typography.body, color: Colors.yellow, marginTop: 4 },
});
