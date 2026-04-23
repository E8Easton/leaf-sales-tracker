import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, BorderRadius, Typography } from '../constants/theme';

type Props = {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  progress?: number; // 0-1 for circular progress
};

export default function KpiCard({ label, value, subtitle, color, progress }: Props) {
  const size = 52;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const strokeDash = progress !== undefined ? circumference * (1 - progress) : circumference;

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {progress !== undefined && (
        <Svg width={size} height={size} style={styles.circle}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.15)" strokeWidth={4} fill="none" />
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={4}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 18,
    flex: 1,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  circle: { marginBottom: 8 },
  value: { ...Typography.h2, color: Colors.white },
  label: { ...Typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 4 },
  subtitle: { ...Typography.caption, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
});
