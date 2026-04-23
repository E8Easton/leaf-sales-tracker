import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useLeaderboard } from '../../hooks/useSales';
import LeaderboardRow from '../../components/LeaderboardRow';

type Period = 'day' | 'week' | 'month';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const { stats, loading, refresh } = useLeaderboard(period);

  const myRank = stats.findIndex(s => s.rep_id === profile?.id);
  const myStat = stats[myRank];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
      >
        <Text style={styles.hero}>Sales{'\n'}Leaderboard</Text>

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

        {/* My position callout */}
        {myStat && (
          <View style={styles.myCard}>
            <View>
              <Text style={styles.myRankLabel}>Your Rank</Text>
              <Text style={styles.myRank}>#{myRank + 1}</Text>
            </View>
            <View style={styles.myStats}>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>${myStat.total_revenue.toFixed(0)}</Text>
                <Text style={styles.myStatLabel}>Revenue</Text>
              </View>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myStat.close_rate.toFixed(0)}%</Text>
                <Text style={styles.myStatLabel}>Close Rate</Text>
              </View>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myStat.total_sales}</Text>
                <Text style={styles.myStatLabel}>Sales</Text>
              </View>
            </View>
          </View>
        )}

        {/* Leaderboard list */}
        <Text style={styles.sectionTitle}>All Reps</Text>
        {stats.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.emptyText}>No data for this period yet.</Text>
          </View>
        )}
        {stats.map((stat, i) => (
          <LeaderboardRow key={stat.rep_id} stat={stat} rank={i} isMe={stat.rep_id === profile?.id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  hero: { ...Typography.hero, color: Colors.white, marginBottom: Spacing.lg },
  periodRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.full, padding: 4, marginBottom: Spacing.lg, gap: 4 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.full, alignItems: 'center' },
  periodBtnActive: { backgroundColor: Colors.white },
  periodText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  periodTextActive: { color: Colors.background },
  myCard: {
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  myRankLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  myRank: { fontSize: 36, fontWeight: '900', color: Colors.white },
  myStats: { flexDirection: 'row', gap: Spacing.md },
  myStat: { alignItems: 'center' },
  myStatValue: { ...Typography.h3, color: Colors.white },
  myStatLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginBottom: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { ...Typography.body, color: Colors.textMuted, marginTop: Spacing.sm },
});
