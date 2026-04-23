import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '../constants/theme';
import type { Sale } from '../hooks/useSales';

const SERVICE_COLORS: Record<string, string> = {
  'Window Cleaning': Colors.coral,
  'Gutter Cleaning': Colors.green,
  'Pressure Washing': Colors.blue,
  'Other': Colors.yellow,
};

type Props = { sale: Sale };

export default function SaleCard({ sale }: Props) {
  const color = SERVICE_COLORS[sale.service_type] ?? Colors.coral;
  const time = new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.left}>
        <Text style={styles.service}>{sale.service_type}</Text>
        {sale.customer_name && <Text style={styles.customer}>{sale.customer_name}</Text>}
        {sale.address && <Text style={styles.address}>{sale.address}</Text>}
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>${sale.amount.toFixed(2)}</Text>
        <Text style={styles.amountLabel}>Total Cost</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  left: { flex: 1 },
  right: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  service: { ...Typography.bodyBold, color: Colors.white, marginBottom: 4 },
  customer: { ...Typography.caption, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  address: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  time: { ...Typography.label, color: 'rgba(255,255,255,0.6)' },
  amount: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  amountLabel: { ...Typography.label, color: '#888', marginTop: 2 },
});
