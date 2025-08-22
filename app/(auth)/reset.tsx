// app/(auth)/reset.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  // Removed resend email input state

  // Password rules: min 8, at least one letter, one number, special characters allowed
  const isValidPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

  async function handleUpdatePassword() {
    setError('');
    if (!isValidPassword) {
      setError('Password must be at least 8 characters and include a number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        // Show more detailed error if password is reused
        if (updateError.message && updateError.message.toLowerCase().includes('new password should be different')) {
          setError('New password should be different from the old password.');
        } else {
          setError(updateError.message || 'Link expired or invalid. Please request a new reset link.');
        }
        // Log for analytics (placeholder)
        console.log('Password update error', updateError);
        setLoading(false);
        return;
      }
      // Success: show message and route to sign-in
      Alert.alert('Password updated. Please sign in.');
      router.replace('/login'); // Or /sign-in if that's your route
    } catch (err) {
      setError('Network error. Please try again.');
      console.log('Network error', err);
    } finally {
      setLoading(false);
    }
  }

  // Removed resend email handler

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding-bg.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.desc}>Enter your new password below.</Text>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            accessibilityLabel="New password"
            returnKeyType="next"
            autoComplete="off"
            textContentType="none"
          />
          <TouchableOpacity onPress={() => setShow(v => !v)} style={styles.showHide}>
            <Text style={styles.showHideText}>{show ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#aaa"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            accessibilityLabel="Confirm new password"
            returnKeyType="done"
            autoComplete="off"
            textContentType="none"
          />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.showHide}>
            <Text style={styles.showHideText}>{showConfirm ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, (!isValidPassword || password !== confirm || loading) && { opacity: 0.5 }]}
            onPress={handleUpdatePassword}
            disabled={!isValidPassword || password !== confirm || loading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/forgot')} style={styles.fallback}>
            <Text style={styles.fallbackText}>Request new link</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>Need help? Contact us: slumberhelpdesk@gmail.com</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, color: '#111', marginBottom: 18, textAlign: 'center' },
  input: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#FFD59E', paddingHorizontal: 16, fontSize: 16, marginBottom: 8, color: '#222', backgroundColor: '#fff' },
  button: { backgroundColor: '#FFD59E', borderRadius: 24, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 12 },
  buttonText: { color: '#222', fontWeight: '700', fontSize: 18 },
  error: { color: '#000000ff', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  showHide: { alignSelf: 'flex-end', marginBottom: 8, marginRight: 8 },
  showHideText: { color: '#FFD59E', fontWeight: '700', fontSize: 15 },
  fallback: { alignSelf: 'center', marginTop: 8 },
  fallbackText: { color: '#FFD59E', fontWeight: '700', fontSize: 16 },
  helpText: { color: '#FFD59E', textAlign: 'center', marginTop: 24, fontSize: 15 },
  success: { color: '#34D399', textAlign: 'center', marginTop: 12, fontWeight: '600' },
});
