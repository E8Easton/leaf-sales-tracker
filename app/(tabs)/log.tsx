import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSales } from '../../hooks/useSales';

const SERVICE_TYPES = ['Window Cleaning', 'Gutter Cleaning', 'Pressure Washing', 'Other'];

const SERVICE_COLORS: Record<string, string> = {
  'Window Cleaning': Colors.coral,
  'Gutter Cleaning': Colors.green,
  'Pressure Washing': Colors.blue,
  'Other': Colors.yellow,
};

export default function LogScreen() {
  const { profile } = useAuth();
  const { todayDoors, addSale, updateDoorsKnocked, refresh } = useSales(profile?.id);

  const [amount, setAmount] = useState('');
  const [service, setService] = useState('Window Cleaning');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [doors, setDoors] = useState(String(todayDoors));
  const [busy, setBusy] = useState(false);
  const [doorsBusy, setDoorsBusy] = useState(false);

  async function handleSaleSubmit() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid amount', 'Enter a valid sale amount.'); return; }
    setBusy(true);
    await addSale({ amount: amt, service_type: service, customer_name: customerName || undefined, address: address || undefined, notes: notes || undefined });
    setBusy(false);
    setAmount(''); setCustomerName(''); setAddress(''); setNotes('');
    Alert.alert('Sale logged!', `$${amt.toFixed(2)} ${service} sale recorded.`);
  }

  async function handleDoorsUpdate() {
    const d = parseInt(doors);
    if (isNaN(d) || d < 0) { Alert.alert('Invalid', 'Enter a valid number of doors.'); return; }
    setDoorsBusy(true);
    await updateDoorsKnocked(d);
    setDoorsBusy(false);
    Alert.alert('Updated!', `Doors knocked updated to ${d}.`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.hero}>Log Activity</Text>

          {/* Doors knocked */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doors Knocked Today</Text>
            <View style={styles.doorsRow}>
              <TouchableOpacity style={styles.doorsBtn} onPress={() => setDoors(d => String(Math.max(0, parseInt(d || '0') - 1)))} activeOpacity={0.7}>
                <Ionicons name="remove" size={24} color={Colors.white} />
              </TouchableOpacity>
              <TextInput
                style={styles.doorsInput}
                value={doors}
                onChangeText={setDoors}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <TouchableOpacity style={styles.doorsBtn} onPress={() => setDoors(d => String(parseInt(d || '0') + 1))} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.updateBtn} onPress={handleDoorsUpdate} disabled={doorsBusy} activeOpacity={0.8}>
              {doorsBusy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.updateBtnText}>Update Doors</Text>}
            </TouchableOpacity>
          </View>

          {/* Log a sale */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Log a Sale</Text>

            {/* Service type */}
            <Text style={styles.fieldLabel}>Service Type</Text>
            <View style={styles.serviceGrid}>
              {SERVICE_TYPES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.serviceChip, service === s && { backgroundColor: SERVICE_COLORS[s] }]}
                  onPress={() => setService(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.serviceChipText, service === s && styles.serviceChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <Text style={styles.fieldLabel}>Sale Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.dollar}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={Colors.textFaint}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Customer name */}
            <Text style={styles.fieldLabel}>Customer Name <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="e.g. John Smith"
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="words"
            />

            {/* Address */}
            <Text style={styles.fieldLabel}>Address <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St"
              placeholderTextColor={Colors.textFaint}
            />

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes about this sale..."
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saleBtn} onPress={handleSaleSubmit} disabled={busy} activeOpacity={0.8}>
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saleBtnText}>Log Sale</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  hero: { ...Typography.hero, color: Colors.white, marginBottom: Spacing.lg },
  section: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.white, marginBottom: Spacing.md },
  doorsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  doorsBtn: { backgroundColor: Colors.surfaceElevated, width: 48, height: 48, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  doorsInput: { flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: Spacing.sm, textAlign: 'center', color: Colors.white, fontSize: 28, fontWeight: '700' },
  updateBtn: { backgroundColor: Colors.blue, borderRadius: BorderRadius.sm, padding: Spacing.sm, alignItems: 'center' },
  updateBtnText: { ...Typography.bodyBold, color: Colors.white },
  fieldLabel: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 6, marginTop: Spacing.sm },
  optional: { fontWeight: '400', color: Colors.textFaint },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  serviceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceElevated },
  serviceChipText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  serviceChipTextActive: { color: Colors.white },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md },
  dollar: { fontSize: 24, fontWeight: '700', color: Colors.white, marginRight: 4 },
  amountInput: { flex: 1, color: Colors.white, fontSize: 28, fontWeight: '700', paddingVertical: Spacing.sm },
  input: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: Spacing.md, color: Colors.white, ...Typography.body },
  textArea: { height: 80, textAlignVertical: 'top' },
  saleBtn: { backgroundColor: Colors.green, borderRadius: BorderRadius.sm, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: Spacing.md },
  saleBtnText: { ...Typography.bodyBold, color: Colors.white },
});
