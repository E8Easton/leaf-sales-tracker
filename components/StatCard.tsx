import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Typography } from '../constants/theme';

type Props = {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  small?: boolean;
};

export default function StatCard({ label, value, subtitle, color, small }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: color }, small && styles.small]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, small && styles.valueSmall]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 140,
  },
  small: {
    minHeight: 110,
    padding: 16,
  },
  label: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    ...Typography.h1,
    color: '#FFFFFF',
  },
  valueSmall: {
    fontSize: 22,
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});
