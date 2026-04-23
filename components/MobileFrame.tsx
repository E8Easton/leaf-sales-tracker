import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors } from '../constants/theme';

type Props = { children: React.ReactNode };

export default function MobileFrame({ children }: Props) {
  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View style={styles.page}>
      <View style={styles.glow} />
      <View style={styles.phone}>
        <View style={styles.notch} />
        <View style={styles.screen}>{children}</View>
        <View style={styles.homeBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  glow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: Colors.green,
    opacity: 0.06,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -300 }, { translateY: -300 }],
    pointerEvents: 'none' as any,
  },
  phone: {
    width: 390,
    height: 844,
    backgroundColor: Colors.background,
    borderRadius: 54,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    elevation: 40,
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%' as any,
    transform: [{ translateX: -65 }],
    width: 130,
    height: 34,
    backgroundColor: '#2A2A2A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 44,
  },
  homeBar: {
    position: 'absolute',
    bottom: 8,
    left: '50%' as any,
    transform: [{ translateX: -67 }],
    width: 134,
    height: 5,
    backgroundColor: '#555',
    borderRadius: 3,
  },
});
