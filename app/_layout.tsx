import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';
import MobileFrame from '../components/MobileFrame';

function AppContent() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
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
