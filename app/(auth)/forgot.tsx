// app/(auth)/forgot.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  // Basic email validation
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

  // Debounce logic (simple, disables button while loading)
  async function handleSendReset() {
    if (!isValidEmail || loading) return;
    setLoading(true);
    try {
      // Never reveal if email exists!
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'slumber://reset',
      });
      setSent(true);
      // Log for analytics (placeholder)
      console.log('Password reset requested');
      // Neutral toast
      Alert.alert('If that email exists, we sent a reset link.');
    } catch (err) {
      // Log error for analytics (placeholder)
      console.log('Reset error', err);
      Alert.alert('If that email exists, we sent a reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding-bg.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.desc}>Enter your email to receive a password reset link.</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email address"
            returnKeyType="done"
            autoComplete="off"
            textContentType="none"
          />
          <TouchableOpacity
            style={[styles.button, (!isValidEmail || loading) && { opacity: 0.5 }]}
            onPress={handleSendReset}
            disabled={!isValidEmail || loading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send reset link'}</Text>
          </TouchableOpacity>
          {sent && (
            <Text style={styles.success}>If that email exists, we sent a reset link.</Text>
          )}
          <Text style={styles.helpText}>Need help? Contact us: slumberhelpdesk@gmail.com</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, textAlign: 'center', color: '#111' },
  desc: { fontSize: 16, color: '#FFD59E', marginBottom: 18, textAlign: 'center' },
  input: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#FFD59E', paddingHorizontal: 16, fontSize: 16, marginBottom: 18, color: '#111', backgroundColor: '#fff' },
  button: { backgroundColor: '#FFD59E', borderRadius: 24, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  buttonText: { color: '#111', fontWeight: '700', fontSize: 18 },
  success: { color: '#34D399', textAlign: 'center', marginTop: 12, fontWeight: '600' },
  helpText: { color: '#FFD59E', textAlign: 'center', marginTop: 24, fontSize: 15 },
});
