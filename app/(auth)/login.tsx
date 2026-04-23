import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setBusy(true);
    const { error } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, name.trim());
    setBusy(false);
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLeaf}>🍃</Text>
          </View>
          <Text style={styles.brand}>Leaf Cleaning</Text>
          <Text style={styles.tagline}>Sales Tracker</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>

          {mode === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Jake Miller"
                placeholderTextColor={Colors.textFaint}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@email.com"
              placeholderTextColor={Colors.textFaint}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textFaint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={busy} activeOpacity={0.8}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "New rep? " : "Already have an account? "}
              <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: BorderRadius.full,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoLeaf: { fontSize: 36 },
  brand: { ...Typography.h1, color: Colors.white, marginBottom: 4 },
  tagline: { ...Typography.body, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  cardTitle: { ...Typography.h2, color: Colors.white, marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.label, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    color: Colors.white,
    ...Typography.body,
  },
  btn: {
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnText: { ...Typography.bodyBold, color: Colors.white },
  switchBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  switchText: { ...Typography.body, color: Colors.textMuted },
  switchLink: { color: Colors.green, fontWeight: '700' },
});
