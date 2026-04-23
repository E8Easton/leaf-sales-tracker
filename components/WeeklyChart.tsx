import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Colors, BorderRadius } from '../constants/theme';

type DataPoint = { label: string; value: number };

type Props = {
  data: DataPoint[];
  height?: number;
};

export default function WeeklyChart({ data, height = 160 }: Props) {
  const chartH = height - 32;
  const barW = 28;
  const spacing = 12;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const totalW = data.length * (barW + spacing) - spacing + 40;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week's Revenue</Text>
      <View style={styles.yLabels}>
        {['$4k', '$2k', '$0'].map((l, i) => (
          <Text key={i} style={styles.yLabel}>{l}</Text>
        ))}
      </View>
      <Svg width={totalW} height={chartH}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * (chartH - 28), 4);
          const x = 30 + i * (barW + spacing);
          const y = chartH - barH - 18;
          const isToday = i === data.length - 1;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                fill={isToday ? Colors.white : Colors.surfaceElevated}
              />
              <SvgText
                x={x + barW / 2}
                y={chartH - 4}
                textAnchor="middle"
                fontSize="10"
                fill={Colors.textMuted}
                fontWeight="600"
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  yLabels: {
    position: 'absolute',
    top: 44,
    left: 16,
    height: 100,
    justifyContent: 'space-between',
  },
  yLabel: {
    fontSize: 9,
    color: '#888888',
    fontWeight: '600',
  },
});
