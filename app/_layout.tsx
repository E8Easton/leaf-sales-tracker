import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { Colors, Typography } from '../constants/theme';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) router.replace('/(auth)/login');
    else if (session && inAuth) router.replace('/(tabs)');
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <View style={styles.logoCircle}>
          <Text style={styles.logoLeaf}>🍃</Text>
        </View>
        <Text style={styles.brand}>Leaf Cleaning</Text>
        <Text style={styles.tagline}>Sales Tracker</Text>
        <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1A1A1A' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="rep/[repId]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoLeaf: { fontSize: 48 },
  brand: { ...Typography.hero, color: Colors.white, fontSize: 36 },
  tagline: { ...Typography.body, color: Colors.textMuted, marginTop: 8 },
});
