import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '../constants/theme';
import type { RepStats } from '../hooks/useSales';

const RANK_COLORS = [Colors.yellow, Colors.cream, Colors.coral];
const RANK_LABELS = ['1st', '2nd', '3rd'];

type Props = { stat: RepStats; rank: number; isMe: boolean };

export default function LeaderboardRow({ stat, rank, isMe }: Props) {
  const rankColor = rank < 3 ? RANK_COLORS[rank] : Colors.surface;
  const initials = stat.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.rank, { backgroundColor: rankColor }]}>
        <Text style={[styles.rankText, { color: rank < 3 ? '#1A1A1A' : Colors.textMuted }]}>
          {rank < 3 ? RANK_LABELS[rank] : `${rank + 1}`}
        </Text>
      </View>
      <View style={[styles.avatar, { backgroundColor: stat.avatar_color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{stat.name}{isMe ? ' (You)' : ''}</Text>
        <Text style={styles.sub}>{stat.total_doors} doors · {stat.close_rate.toFixed(0)}% close rate</Text>
      </View>
      <View style={styles.revenueBox}>
        <Text style={styles.revenue}>${stat.total_revenue >= 1000 ? `${(stat.total_revenue / 1000).toFixed(1)}k` : stat.total_revenue.toFixed(0)}</Text>
        <Text style={styles.revenueLabel}>{stat.total_sales} sales</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowMe: {
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  rank: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '800' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { ...Typography.bodyBold, color: Colors.white },
  sub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  revenueBox: { alignItems: 'flex-end' },
  revenue: { ...Typography.h3, color: Colors.white },
  revenueLabel: { ...Typography.caption, color: Colors.textMuted },
});
