import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSales } from '../../hooks/useSales';
import { useRepInbox } from '../../hooks/useMessages';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { todayRevenue, todayDoors, todayCloseRate, weekRevenue, todaySales } = useSales(profile?.id);
  const { inbox, unreadCount, markRead } = useRepInbox(profile?.id);
  const [inboxOpen, setInboxOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  const initials = (profile?.name ?? 'R').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: profile?.avatar_color ?? Colors.green }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.name ?? 'Sales Rep'}</Text>
          <View style={styles.roleRow}>
            <Text style={styles.role}>{isAdmin ? 'CEO / Admin' : 'Sales Rep'}</Text>
            {isAdmin && <Ionicons name="shield-checkmark" size={14} color={Colors.yellow} style={{ marginLeft: 4 }} />}
          </View>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Inbox — reps only */}
        {!isAdmin && inbox.length > 0 && (
          <TouchableOpacity
            style={[styles.inboxBanner, unreadCount > 0 && styles.inboxBannerUnread]}
            onPress={() => setInboxOpen(!inboxOpen)}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={20} color={unreadCount > 0 ? Colors.white : Colors.textMuted} />
            <Text style={[styles.inboxBannerText, unreadCount > 0 && { color: Colors.white }]}>
              {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''} from manager` : 'Messages from manager'}
            </Text>
            <Ionicons name={inboxOpen ? 'chevron-up' : 'chevron-down'} size={16} color={unreadCount > 0 ? Colors.white : Colors.textMuted} />
          </TouchableOpacity>
        )}

        {inboxOpen && (
          <View style={styles.inboxList}>
            {inbox.map(msg => (
              <TouchableOpacity
                key={msg.id}
                style={[styles.msgCard, !msg.read_at && styles.msgCardUnread]}
                onPress={() => markRead(msg.id)}
                activeOpacity={0.8}
              >
                <View style={styles.msgTop}>
                  <View style={[styles.msgAvatar, { backgroundColor: (msg.from_profile as any)?.avatar_color ?? Colors.green }]}>
                    <Text style={styles.msgAvatarText}>{((msg.from_profile as any)?.name ?? 'M')[0]}</Text>
                  </View>
                  <View style={styles.msgMeta}>
                    <Text style={styles.msgFrom}>{(msg.from_profile as any)?.name ?? 'Manager'}</Text>
                    <Text style={styles.msgTime}>{new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  {!msg.read_at && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.msgContent}>{msg.content}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Today's summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <SummaryItem label="Revenue" value={`$${todayRevenue.toFixed(2)}`} color={Colors.coral} />
            <SummaryItem label="Doors" value={String(todayDoors)} color={Colors.yellow} />
            <SummaryItem label="Sales" value={String(todaySales.length)} color={Colors.green} />
            <SummaryItem label="Close Rate" value={`${todayCloseRate.toFixed(0)}%`} color={Colors.blue} />
          </View>
        </View>

        {/* Weekly summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weekRow}>
            <View style={styles.weekStat}>
              <Text style={styles.weekValue}>${weekRevenue >= 1000 ? `${(weekRevenue / 1000).toFixed(1)}k` : weekRevenue.toFixed(0)}</Text>
              <Text style={styles.weekLabel}>Revenue</Text>
            </View>
            <View style={styles.weekDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekValue}>${(weekRevenue / 5).toFixed(0)}</Text>
              <Text style={styles.weekLabel}>Daily Avg</Text>
            </View>
          </View>
        </View>

        {/* Tips — only for reps */}
        {!isAdmin && (
          <View style={[styles.card, { backgroundColor: Colors.green }]}>
            <Text style={[styles.cardTitle, { color: Colors.white }]}>Today's Tip</Text>
            <Text style={styles.tip}>{getTip()}</Text>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.settingsText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.settingsText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
            <Text style={[styles.settingsText, { color: Colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Leaf Cleaning Sales Tracker v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryItem, { backgroundColor: color }]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function getTip() {
  const tips = [
    'Start with a warm greeting — mention a neighbor you just helped nearby.',
    "Don't skip rainy-season pitches. Gutters overflow and windows get dirty.",
    'Bundle services: offer window + gutter cleaning for a 10% discount.',
    'Follow up on "not right now" — schedule a call back in 2 weeks.',
    'Knock before 11am and after 4pm for the best answer rates.',
  ];
  return tips[new Date().getDay() % tips.length];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 32 },
  name: { ...Typography.h1, color: Colors.white, marginBottom: 4 },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  role: { ...Typography.bodyBold, color: Colors.green },
  date: { ...Typography.caption, color: Colors.textMuted },
  inboxBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: 10 },
  inboxBannerUnread: { backgroundColor: Colors.coral },
  inboxBannerText: { flex: 1, ...Typography.bodyBold, color: Colors.textMuted },
  inboxList: { marginBottom: Spacing.md, gap: 8 },
  msgCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md },
  msgCardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.coral },
  msgTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  msgAvatar: { width: 32, height: 32, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  msgMeta: { flex: 1 },
  msgFrom: { ...Typography.bodyBold, color: Colors.white },
  msgTime: { ...Typography.caption, color: Colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.coral },
  msgContent: { ...Typography.body, color: Colors.white, lineHeight: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTitle: { ...Typography.h3, color: Colors.white, marginBottom: Spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryItem: { flex: 1, minWidth: '45%', borderRadius: BorderRadius.md, padding: 14, alignItems: 'center' },
  summaryValue: { ...Typography.h2, color: Colors.white },
  summaryLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 4 },
  weekRow: { flexDirection: 'row', alignItems: 'center' },
  weekStat: { flex: 1, alignItems: 'center' },
  weekValue: { ...Typography.h1, color: Colors.white },
  weekLabel: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase', marginTop: 4 },
  weekDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  tip: { ...Typography.body, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  settingsCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.sm },
  settingsText: { ...Typography.body, color: Colors.white, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
  footer: { ...Typography.caption, color: Colors.textFaint, textAlign: 'center' },
});
