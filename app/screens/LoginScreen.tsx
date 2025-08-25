import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import supabase from '../../lib/supabase';

const LoginScreen = () => {
  const audio = require('../../components/AudioPlayerContext').useAudioPlayer();
  // Stop ocean sound on login screen mount
  React.useEffect(() => {
    audio.stop('ocean');
  }, []);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        // Save latest session to AsyncStorage
        if (data?.session) {
          await AsyncStorage.setItem('supabase.session', JSON.stringify(data.session));
        }
        // Check if email exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, first_name, email, subscription_plan')
          .eq('email', email.trim())
          .single();
        if (profileError || !profile) {
          Alert.alert('Invalid Email', 'The email is not registered. Please try again.');
          return;
        }
  // Save user info to AsyncStorage for MeScreen
  await AsyncStorage.setItem('profile.name', profile.first_name || '');
  await AsyncStorage.setItem('profile.email', profile.email || '');
  const plan = profile.subscription_plan ? profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1) : '';
  await AsyncStorage.setItem('profile.plan', plan);
  // Log user id and name for debugging
  console.log('Logged in user:', profile.user_id, profile.first_name);
  // Always navigate to sounds tab after successful login and valid profile
  router.replace('/(tabs)/sounds');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
  router.push('/(auth)/forgot');
  };

  const handleSignUp = () => {
  router.push('/signup');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding-bg.jpg')}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="stretch"
      blurRadius={2}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.paddedContent}>
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#FFD59E" />
            </TouchableOpacity>
            <View style={styles.topContent}>
              <View style={styles.moonTile}>
                <Ionicons name="moon-outline" size={30} color="#fff" />
              </View>
              <Text style={styles.h1}>Welcome Back</Text>
              <Text style={styles.sub}>Continue your journey to better sleep.</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#FFD59E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#FFD59E" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#FFD59E" 
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#1F2937" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  paddedContent: {
    paddingHorizontal: 24,
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  bg: { flex: 1 },
  bgImage: {},
  keyboardView: { flex: 1 },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    width: '100%',
    alignSelf: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    paddingVertical: 16,
    fontWeight: '600',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FFD59E',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FFD59E',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#fff',
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signUpText: {
    color: '#fff',
    fontSize: 14,
  },
  signUpLink: {
    color: '#FFD59E',
    fontSize: 14,
    fontWeight: '600',
  },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  topContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    marginTop: 100,
  },
  moonTile: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFD59E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 10,
  },
  h1: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
  },
  sub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: '78%',
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default LoginScreen;
