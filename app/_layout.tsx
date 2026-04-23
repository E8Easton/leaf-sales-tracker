import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, Image } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { Colors, Typography } from '../constants/theme';
import MobileFrame from '../components/MobileFrame';

function AppContent() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // still checking initial session — wait

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading]);
  // NOTE: intentionally not including `segments` so this only re-runs on
  // actual auth changes, not every navigation event.

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>Leaf Cleaning</Text>
        <Text style={styles.tagline}>Sales Tracker</Text>
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="rep/[repId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="+html" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <MobileFrame>
        <AppContent />
      </MobileFrame>
    );
  }
  return <AppContent />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  brand: { ...Typography.hero, color: Colors.white, fontSize: 36 },
  tagline: { ...Typography.body, color: Colors.textMuted, marginTop: 8 },
});
