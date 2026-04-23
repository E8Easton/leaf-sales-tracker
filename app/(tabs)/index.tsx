import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSales } from '../../hooks/useSales';
import StatCard from '../../components/StatCard';
import WeeklyChart from '../../components/WeeklyChart';
import SaleCard from '../../components/SaleCard';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { todaySales, todayRevenue, todayDoors, todayCloseRate, weekRevenue, dailyRevenue, loading, refresh } = useSales(profile?.id);

  const greeting = getGreeting();
  const firstName = profile?.name?.split(' ')[0] ?? 'Rep';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.heroName}>{firstName}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: profile?.avatar_color ?? Colors.green }]}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Quick stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>On Route</Text>
          <Text style={styles.statsLabel}>Sales Today</Text>
          <Text style={styles.statsLabel}>Close Rate</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsValue}>{todayDoors}</Text>
          <Text style={styles.statsValue}>{todaySales.length}</Text>
          <Text style={styles.statsValue}>{todayCloseRate.toFixed(0)}%</Text>
        </View>

        {/* Revenue cards */}
        <View style={styles.cardRow}>
          <StatCard label="Today" value={`$${todayRevenue.toFixed(0)}`} subtitle="Revenue" color={Colors.coral} />
          <View style={{ width: Spacing.sm }} />
          <StatCard label="This Week" value={`$${weekRevenue >= 1000 ? `${(weekRevenue / 1000).toFixed(1)}k` : weekRevenue.toFixed(0)}`} subtitle="Revenue" color={Colors.green} />
        </View>

        {/* Weekly chart */}
        <WeeklyChart data={dailyRevenue} />

        {/* Today's sales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sales</Text>
          {todaySales.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={40} color={Colors.textFaint} />
              <Text style={styles.emptyText}>No sales yet today.</Text>
              <Text style={styles.emptySubtext}>Tap + to log your first sale!</Text>
            </View>
          ) : (
            todaySales.map(sale => <SaleCard key={sale.id} sale={sale} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { ...Typography.body, color: Colors.textMuted, marginBottom: 2 },
  heroName: { ...Typography.hero, color: Colors.white },
  avatar: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statsLabel: { ...Typography.label, color: Colors.textMuted, flex: 1, textTransform: 'uppercase' },
  statsValue: { ...Typography.h2, color: Colors.white, flex: 1 },
  cardRow: { flexDirection: 'row', marginTop: Spacing.lg },
  section: { marginTop: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginBottom: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  emptyText: { ...Typography.bodyBold, color: Colors.textMuted, marginTop: Spacing.sm },
  emptySubtext: { ...Typography.caption, color: Colors.textFaint, marginTop: 4 },
});
