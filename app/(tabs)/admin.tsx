import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useTeamStats } from '../../hooks/useAdmin';
import type { RepStats } from '../../hooks/useSales';

type Period = 'day' | 'week' | 'month';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export default function AdminScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('week');
  const { repStats, summary, loading, refresh } = useTeamStats(period);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.denied}>
          <Ionicons name="lock-closed" size={48} color={Colors.textFaint} />
          <Text style={styles.deniedText}>Admin access only</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>CEO Dashboard</Text>
            <Text style={styles.hero}>Team{'\n'}Overview</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.yellow }]}>
            <Ionicons name="shield-checkmark" size={18} color="#333" />
            <Text style={styles.badgeText}>Admin</Text>
          </View>
        </View>

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

        {/* Company summary cards */}
        <View style={styles.grid2}>
          <SummaryCard label="Team Revenue" value={`$${summary.totalRevenue >= 1000 ? `${(summary.totalRevenue / 1000).toFixed(1)}k` : summary.totalRevenue.toFixed(0)}`} color={Colors.coral} icon="cash" />
          <SummaryCard label="Doors Knocked" value={String(summary.totalDoors)} color={Colors.blue} icon="home" />
        </View>
        <View style={styles.grid2}>
          <SummaryCard label="Total Sales" value={String(summary.totalSales)} color={Colors.green} icon="checkmark-circle" />
          <SummaryCard label="Active Reps" value={String(summary.activeReps)} color={Colors.yellow} icon="people" />
        </View>

        {/* Team KPIs */}
        <View style={styles.kpiRow}>
          <KpiBadge label="Team Close Rate" value={`${summary.teamCloseRate.toFixed(0)}%`} />
          <KpiBadge label="Avg Sale" value={`$${summary.teamAvgSale.toFixed(0)}`} />
          <KpiBadge label="Rev / Door" value={`$${summary.totalDoors > 0 ? (summary.totalRevenue / summary.totalDoors).toFixed(0) : '0'}`} />
        </View>

        {/* Rep list */}
        <Text style={styles.sectionTitle}>All Reps</Text>
        {repStats.map((rep, i) => (
          <RepRow
            key={rep.rep_id}
            rep={rep}
            rank={i}
            onPress={() => router.push({ pathname: '/rep/[repId]', params: { repId: rep.rep_id } })}
          />
        ))}

        {repStats.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.emptyText}>No reps have data for this period.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color="rgba(255,255,255,0.8)" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function KpiBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiBadge}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function RepRow({ rep, rank, onPress }: { rep: RepStats; rank: number; onPress: () => void }) {
  const initials = rep.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const performance = rep.close_rate >= 30 ? 'strong' : rep.close_rate >= 15 ? 'average' : rep.total_doors > 0 ? 'needs-help' : 'inactive';
  const perfColor = { strong: Colors.green, average: Colors.yellow, 'needs-help': Colors.coral, inactive: Colors.textFaint }[performance];

  return (
    <TouchableOpacity style={styles.repRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rankNum}><Text style={styles.rankText}>#{rank + 1}</Text></View>
      <View style={[styles.avatar, { backgroundColor: rep.avatar_color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.repInfo}>
        <Text style={styles.repName}>{rep.name}</Text>
        <Text style={styles.repSub}>{rep.total_doors} doors · {rep.total_sales} sales · {rep.close_rate.toFixed(0)}%</Text>
      </View>
      <View style={styles.repRight}>
        <Text style={styles.repRevenue}>${rep.total_revenue >= 1000 ? `${(rep.total_revenue / 1000).toFixed(1)}k` : rep.total_revenue.toFixed(0)}</Text>
        <View style={[styles.perfDot, { backgroundColor: perfColor }]} />
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  deniedText: { ...Typography.body, color: Colors.textMuted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  label: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase' },
  hero: { ...Typography.hero, color: Colors.white },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full },
  badgeText: { ...Typography.label, color: '#333', fontWeight: '700' },
  periodRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.full, padding: 4, marginBottom: Spacing.md, gap: 4 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.full, alignItems: 'center' },
  periodBtnActive: { backgroundColor: Colors.white },
  periodText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  periodTextActive: { color: Colors.background },
  grid2: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard: { flex: 1, borderRadius: BorderRadius.lg, padding: 16, gap: 6 },
  summaryValue: { ...Typography.h1, color: Colors.white },
  summaryLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  kpiBadge: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 12, alignItems: 'center' },
  kpiValue: { ...Typography.h3, color: Colors.white },
  kpiLabel: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginBottom: Spacing.sm },
  repRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 12, marginBottom: 8, gap: 10 },
  rankNum: { width: 28 },
  rankText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  avatar: { width: 42, height: 42, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  repInfo: { flex: 1 },
  repName: { ...Typography.bodyBold, color: Colors.white },
  repSub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  repRight: { alignItems: 'flex-end', gap: 4 },
  repRevenue: { ...Typography.h3, color: Colors.white },
  perfDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 8 },
  emptyText: { ...Typography.body, color: Colors.textMuted },
});
