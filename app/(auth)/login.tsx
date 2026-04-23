import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image,
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
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit() {
    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setBusy(true);

    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      setBusy(false);
      if (error) Alert.alert('Sign In Failed', error.message);
    } else {
      const result = await signUp(email.trim(), password, name.trim());
      setBusy(false);
      if (result.error) {
        Alert.alert('Sign Up Failed', result.error.message);
      } else if (result.needsConfirmation) {
        setConfirmed(true);
      }
    }
  }

  // Show "check your email" screen after signup when confirmation is required
  if (confirmed) {
    return (
      <View style={styles.confirmWrap}>
        <Image source={require('../../assets/logo.png')} style={styles.confirmLogo} resizeMode="contain" />
        <Text style={styles.confirmTitle}>Check your email</Text>
        <Text style={styles.confirmBody}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.confirmEmail}>{email}</Text>
          {'\n\n'}Click the link in that email, then come back and sign in.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setConfirmed(false); setMode('login'); }}>
          <Text style={styles.btnText}>Back to Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.confirmHint}>
          No email? Ask your admin to disable email confirmation in Supabase → Authentication → Providers → Email.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoArea}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Leaf Cleaning</Text>
          <Text style={styles.tagline}>Sales Tracker</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </Text>

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

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={busy} activeOpacity={0.85}>
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
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
  logo: { width: 90, height: 90, marginBottom: 14 },
  brand: { ...Typography.h1, color: Colors.white, marginBottom: 4 },
  tagline: { ...Typography.body, color: Colors.textMuted },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { ...Typography.h2, color: Colors.white, marginBottom: Spacing.lg },

  field: { marginBottom: Spacing.md },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    color: Colors.white,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnText: { ...Typography.bodyBold, color: Colors.white },

  switchBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  switchText: { ...Typography.body, color: Colors.textMuted },
  switchLink: { color: Colors.primary, fontWeight: '700' },

  // Confirmation screen
  confirmWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  confirmLogo: { width: 80, height: 80, marginBottom: 24 },
  confirmTitle: { ...Typography.h1, color: Colors.white, marginBottom: 16, textAlign: 'center' },
  confirmBody: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  confirmEmail: { color: Colors.primary, fontWeight: '700' },
  confirmHint: { ...Typography.caption, color: Colors.textFaint, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
