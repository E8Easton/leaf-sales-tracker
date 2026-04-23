import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRepDetail } from '../../hooks/useAdmin';
import { useMessages } from '../../hooks/useMessages';
import WeeklyChart from '../../components/WeeklyChart';

export default function RepDetailScreen() {
  const { repId } = useLocalSearchParams<{ repId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { detail, loading, refresh } = useRepDetail(repId);
  const { messages, sendMessage, loading: msgLoading } = useMessages(profile?.id, repId);

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';

  async function handleSend() {
    if (!message.trim() || !repId || !isAdmin) return;
    setSending(true);
    await sendMessage(repId, message.trim());
    setMessage('');
    setSending(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  }

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={Colors.green} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const { stats, recentSales, dailyRevenue } = detail;
  const initials = stats.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{stats.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
        >
          {/* Rep header */}
          <View style={styles.repHeader}>
            <View style={[styles.avatar, { backgroundColor: stats.avatar_color }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.repName}>{stats.name}</Text>
            <Text style={styles.repRole}>Sales Rep · Leaf Cleaning</Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatBox label="Revenue" value={`$${stats.total_revenue >= 1000 ? `${(stats.total_revenue / 1000).toFixed(1)}k` : stats.total_revenue.toFixed(0)}`} color={Colors.coral} />
            <StatBox label="Doors" value={String(stats.total_doors)} color={Colors.yellow} />
            <StatBox label="Sales" value={String(stats.total_sales)} color={Colors.green} />
            <StatBox label="Close %" value={`${stats.close_rate.toFixed(0)}%`} color={Colors.blue} />
          </View>

          {/* Secondary KPIs */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiValue}>${stats.avg_sale.toFixed(0)}</Text>
              <Text style={styles.kpiLabel}>Avg Sale</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiValue}>${stats.revenue_per_door.toFixed(0)}</Text>
              <Text style={styles.kpiLabel}>Rev / Door</Text>
            </View>
          </View>

          {/* Performance indicator */}
          <PerformanceBar closeRate={stats.close_rate} />

          {/* Weekly chart */}
          <WeeklyChart data={dailyRevenue} />

          {/* Recent sales */}
          {recentSales.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Sales</Text>
              {recentSales.slice(0, 5).map(s => (
                <View key={s.id} style={styles.saleRow}>
                  <View style={[styles.saleDot, { backgroundColor: SERVICE_COLORS[s.service_type] ?? Colors.coral }]} />
                  <View style={styles.saleInfo}>
                    <Text style={styles.saleService}>{s.service_type}</Text>
                    <Text style={styles.saleDate}>{s.sale_date}</Text>
                    {s.customer_name && <Text style={styles.saleCust}>{s.customer_name}</Text>}
                  </View>
                  <Text style={styles.saleAmt}>${Number(s.amount).toFixed(0)}</Text>
                </View>
              ))}
            </>
          )}

          {/* Messaging section */}
          {isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Coaching Messages</Text>
              <View style={styles.chatBox}>
                {messages.length === 0 && !msgLoading && (
                  <Text style={styles.noMessages}>No messages yet. Send a coaching note below.</Text>
                )}
                {messages.map(msg => {
                  const fromMe = msg.from_id === profile?.id;
                  return (
                    <View key={msg.id} style={[styles.bubble, fromMe ? styles.bubbleRight : styles.bubbleLeft]}>
                      {!fromMe && <Text style={styles.bubbleAuthor}>{(msg.from_profile as any)?.name ?? 'Rep'}</Text>}
                      <Text style={[styles.bubbleText, fromMe && styles.bubbleTextRight]}>{msg.content}</Text>
                      <Text style={[styles.bubbleTime, fromMe && styles.bubbleTimeRight]}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Quick templates */}
              <Text style={styles.templateTitle}>Quick Templates</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templates}>
                {TEMPLATES.map(t => (
                  <TouchableOpacity key={t} style={styles.templateChip} onPress={() => setMessage(t)} activeOpacity={0.7}>
                    <Text style={styles.templateText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Input */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write a coaching note..."
                  placeholderTextColor={Colors.textFaint}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!message.trim() || sending}
                  activeOpacity={0.8}
                >
                  {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PerformanceBar({ closeRate }: { closeRate: number }) {
  const level = closeRate >= 30 ? 'Strong' : closeRate >= 15 ? 'Average' : closeRate > 0 ? 'Needs Work' : 'No Data';
  const pct = Math.min(closeRate / 50, 1);
  const color = closeRate >= 30 ? Colors.green : closeRate >= 15 ? Colors.yellow : Colors.coral;
  return (
    <View style={styles.perfBar}>
      <View style={styles.perfHeader}>
        <Text style={styles.perfLabel}>Performance</Text>
        <Text style={[styles.perfLevel, { color }]}>{level}</Text>
      </View>
      <View style={styles.perfTrack}>
        <View style={[styles.perfFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const SERVICE_COLORS: Record<string, string> = {
  'Window Cleaning': Colors.coral,
  'Gutter Cleaning': Colors.green,
  'Pressure Washing': Colors.blue,
  'Other': Colors.yellow,
};

const TEMPLATES = [
  'Great work today! Keep it up 💪',
  'Try to increase your close rate — aim for 1 in 4 doors.',
  'Focus on higher-value services like gutter + window combos.',
  'You\'re close to your goal — push through today!',
  'Strong numbers this week. You\'re setting the pace for the team.',
  'Let\'s talk strategy — knock in neighborhoods you\'ve had success before.',
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  topTitle: { ...Typography.h3, color: Colors.white, flex: 1, textAlign: 'center' },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  repHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  repName: { ...Typography.h1, color: Colors.white },
  repRole: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statBox: { width: '47%', borderRadius: BorderRadius.md, padding: 14, alignItems: 'center' },
  statValue: { ...Typography.h2, color: Colors.white },
  statLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  kpiBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 14, alignItems: 'center' },
  kpiValue: { ...Typography.h3, color: Colors.white },
  kpiLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  perfBar: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 14, marginBottom: 4 },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  perfLabel: { ...Typography.bodyBold, color: Colors.white },
  perfLevel: { ...Typography.bodyBold },
  perfTrack: { height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  perfFill: { height: 8, borderRadius: 4 },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  saleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, padding: 12, marginBottom: 6, gap: 10 },
  saleDot: { width: 10, height: 10, borderRadius: 5 },
  saleInfo: { flex: 1 },
  saleService: { ...Typography.bodyBold, color: Colors.white },
  saleDate: { ...Typography.caption, color: Colors.textMuted },
  saleCust: { ...Typography.caption, color: Colors.textFaint },
  saleAmt: { ...Typography.h3, color: Colors.white },
  chatBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, minHeight: 100 },
  noMessages: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.md },
  bubble: { maxWidth: '80%', marginBottom: 10 },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  bubbleAuthor: { ...Typography.label, color: Colors.textMuted, marginBottom: 2 },
  bubbleText: { backgroundColor: Colors.surfaceElevated, borderRadius: 12, borderBottomLeftRadius: 4, padding: 10, ...Typography.body, color: Colors.white },
  bubbleTextRight: { backgroundColor: Colors.green, borderBottomLeftRadius: 12, borderBottomRightRadius: 4 },
  bubbleTime: { ...Typography.label, color: Colors.textFaint, marginTop: 2 },
  bubbleTimeRight: { textAlign: 'right' },
  templateTitle: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  templates: { marginBottom: Spacing.sm },
  templateChip: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  templateText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.white, ...Typography.body, maxHeight: 100 },
  sendBtn: { backgroundColor: Colors.green, width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.surfaceElevated },
});
