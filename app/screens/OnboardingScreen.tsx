import MixCard from '@/src/components/MixCard';
import { SEED_MIXES } from '@/src/data/mixes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [days, setDays] = useState(['S','M','T','W','T','F','S']);
  const [selectedDays, setSelectedDays] = useState(['S','M','T','W','T','F','S']);
  const [time, setTime] = useState(new Date(0,0,0,23,0));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const nameInputRef = useRef(null);
    const { play, stop } = require('@/components/AudioPlayerContext').useAudioPlayer();
  
    useEffect(() => {
      play('ocean', require('@/assets/sounds/water/ocean.mp3'));
      return () => {
        stop('ocean');
      };
    }, []);

  // Helper to format time as h:mm AM/PM
  const formatTime = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  // Time picker logic
  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      // @ts-ignore
      import('@react-native-community/datetimepicker').then(({ DateTimePickerAndroid }) => {
        DateTimePickerAndroid.open({
          value: time,
          mode: 'time',
          is24Hour: true,
          onChange: (event: any, selectedDate?: Date) => {
            if (selectedDate) setTime(selectedDate);
          },
        });
      });
    } else {
      setShowTimePicker(true);
    }
  };

  // Progress bar width
  const progress = [0.2, 0.4, 0.6, 0.8, 1][step];

  // Avatar colors and initials (fallback)
  const avatarColors = [
    '#A78BFA', '#F472B6', '#F87171', '#34D399', '#60A5FA', '#FBBF24', '#F9A8D4', '#38BDF8', '#FCA5A5', '#A3E635', '#FDBA74', '#818CF8', '#FDE68A', '#FCD34D', '#FECACA', '#C4B5FD', '#FEC8D8', '#B5F4EA', '#B5F4FD'
  ];
  const avatarInitials = ['AL','JS','MK','CP','TR','LS','AM','JD','SK','BP','EM','RS','KT','MG','LB','AD','JP','SM','TC'];

  // Testimonial data
  const testimonials = [
    {
      name: 'Emily R.',
      title: 'Cool app',
      review: 'Slumber helped me finally get a good night’s sleep. The community is so supportive and the reminders keep me on track!',
      stars: 5,
    },
    {
      name: 'James T.',
      title: 'Life-changing',
      review: 'I never thought a simple bedtime routine could make such a difference. Highly recommend to anyone who struggles with sleep.',
      stars: 5,
    },
  ];

  // Step 0: Welcome
  const WelcomeStep = () => (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topContent}>
        <View style={styles.moonTile}>
          <Ionicons name="moon-outline" size={30} color="#fff" />
        </View>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.h1}>Welcome to</Text>
          <Text style={[styles.h1, styles.peach]}>Slumber!</Text>
        </View>
        <Text style={styles.sub}>Your journey to better sleep starts here. Let’s set up your profile.</Text>
      </View>
      <View style={{ marginBottom: 24 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cta}
          onPress={() => setStep(1)}
          accessibilityRole="button"
          accessibilityLabel="Let's Go"
        >
          <Text style={styles.ctaText}>Let's Go</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{ alignSelf: 'center' }}
          accessibilityRole="link"
          accessibilityLabel="Already a member? Log in"
        >
          <Text style={{ color: '#FFD59E', fontSize: 16, fontWeight: '700' }}>Already a member?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );


  // Step 1: Sign Up (Name, Email, Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Supabase sign up logic
  async function handleSignUp() {
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { supabase } = require('@/lib/supabase');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // Persist session after sign up
      if (data.session) {
        await AsyncStorage.setItem('supabase.session', JSON.stringify(data.session));
      }
      const user = data.user;
      if (user) {
        // Upsert profile in 'profiles' table (RLS expects user_id)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              user_id: user.id, // <-- matches RLS policy
              email: email.trim(),
              first_name: name.trim(),
              // add other fields as needed
            }
          ], { onConflict: 'user_id' });
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
      await AsyncStorage.setItem('profile.name', name.trim());
      await AsyncStorage.setItem('profile.email', email.trim());
  setLoading(false);
  setStep(3); // Skip bedtime, go directly to suggestions
    } catch (e) {
      setError('Sign up failed. Please try again.');
      setLoading(false);
    }
  }
// Restore session on app launch (best practice)
useEffect(() => {
  async function restoreSession() {
    try {
      const { supabase } = require('@/lib/supabase');
      const sessionStr = await AsyncStorage.getItem('supabase.session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // Set session in Supabase client
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
    } catch (err) {
      // Ignore errors, fallback to default Supabase session management
    }
  }
  restoreSession();
}, []);

  const SignUpStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={[styles.topContent, { justifyContent: 'center', marginTop: 0, flex: 1 }]}>
          <Text style={styles.h1}>Hello!</Text>
          <Text style={styles.h2}>Let's gets started</Text>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, { marginTop: 0, marginBottom: 10 }]}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
              keyboardType="default"
              autoCapitalize="words"
              accessibilityRole="text"
              accessibilityLabel="Your name"
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, { marginTop: 0, marginBottom: 10 }]}
              placeholder="Email address"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityRole="text"
              accessibilityLabel="Email address"
              returnKeyType="next"
            />
            <View style={{ width: '90%', alignSelf: 'center', position: 'relative', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginTop: 0, marginBottom: 0, borderWidth: 0, backgroundColor: 'rgba(255,255,255,0.08)', paddingRight: 0 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  accessibilityRole="text"
                  accessibilityLabel="Password"
                  returnKeyType="next"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, height: 52, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setShowPassword(v => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#FFD59E" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ width: '90%', alignSelf: 'center', position: 'relative', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginTop: 0, marginBottom: 0, borderWidth: 0, backgroundColor: 'rgba(255,255,255,0.08)', paddingRight: 0 }]}
                  placeholder="Confirm password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  accessibilityRole="text"
                  accessibilityLabel="Confirm password"
                  returnKeyType="done"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, height: 52, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setShowConfirmPassword(v => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#FFD59E" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {error ? (
            <Text style={{ color: '#F87171', fontWeight: '700', marginTop: 8, textAlign: 'center' }}>{error}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.cta, (loading || name.trim().length < 2 || !email.match(/^\S+@\S+\.\S+$/) || password.length < 6 || password !== confirmPassword) && { opacity: 0.5 }]}
          onPress={handleSignUp}
          accessibilityRole="button"
          accessibilityLabel="Sign Up"
          disabled={loading || name.trim().length < 2 || !email.match(/^\S+@\S+\.\S+$/) || password.length < 6 || password !== confirmPassword}
        >
          <Text style={styles.ctaText}>{loading ? 'Signing Up...' : 'Sign Up & Continue'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );

  const SuggestionsStep = () => (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.suggScroll, { marginTop: 40 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.suggHeader}>
          <Text style={styles.emojiBadge}>😴</Text>
          <Text style={styles.suggH1}>
  Get Better Sleep with
  {'\n'}Personalized Suggestions
</Text>
          <Text style={styles.suggSub}>We have saved them in your favorites.</Text>
        </View>

        {/* Mix list — map SEED_MIXES */}
        <View style={{ gap: 10, marginTop: 10 }}>
          {SEED_MIXES.map(mix => (
            <MixCard key={mix.id} mix={mix} />
          ))}
        </View>


        {/* Sleeping Sounds 101 */}
        <Text style={styles.s101Title}>Sleeping Sounds 101</Text>
        <View style={styles.qaBlock}>
          <Text style={styles.q}><Text style={styles.qEmoji}>❓</Text> Do relaxing sounds really help sleep better?</Text>
          <Text style={styles.a}>Studies suggest steady, neutral audio (rain, stream, cabin) can aid falling asleep and improve perceived sleep quality.</Text>
        </View>
        <View style={styles.qaBlock}>
          <Text style={styles.q}><Text style={styles.qEmoji}>🕰️</Text> What should I do exactly?</Text>
          <Text style={styles.a}>Use soothing sounds during wind-down and keep a consistent bedtime; you’ll notice changes in 2–3 weeks.</Text>
        </View>
        <View style={styles.qaBlock}>
          <Text style={styles.q}><Text style={styles.qEmoji}>🎧</Text> What if I’m a light sleeper?</Text>
          <Text style={styles.a}>Choose low-variance sounds like Airplane Cabin or Campfire and avoid sharp transitions or sudden peaks.</Text>
        </View>
      </ScrollView>


      <TouchableOpacity style={styles.cta} onPress={() => setStep(4)} accessibilityRole="button">
        <Text style={styles.ctaText}>Let’s get it!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

// TrialTeaserStep component (move outside main render)
const TrialTeaserStep = () => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      router.replace('/subscription');
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.trialWrap}>
        <Animated.Text style={[styles.trialLine, { opacity }]}>Start <Text style={styles.trialNumber}>3</Text> days for free!</Animated.Text>
      </View>
    </SafeAreaView>
  );
};

  // Main render
  return (
    <ImageBackground
      source={require('@/assets/images/onboarding-bg.jpg')}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="stretch"
      blurRadius={step === 0 ? 0.5 : 2}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFill}
      />
      {step > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <View style={{ flex: 1, width: '100%' }}>
  {step === 0 && WelcomeStep()}
  {step === 1 && SignUpStep()}
  {step === 3 && SuggestionsStep()}
  {step === 4 && <TrialTeaserStep />}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
// ...existing code...
  suggScroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 1.8 },
  suggHeader: { alignItems: 'center', gap: 8, marginTop: 8 },
  emojiBadge: { fontSize: 28, marginBottom: 4 },
  suggH1: { color:'#fff', fontSize:22, fontWeight: '800', textAlign:'center', lineHeight:28 },
  suggSub: { color:'rgba(255,255,255,0.8)', fontSize:14, textAlign:'center', maxWidth:'90%' },
  // Removed local mix card styles; now using MixCard component for visual consistency
  sectionHint: { color:'rgba(255,255,255,0.7)', textAlign:'center', marginVertical:12, fontWeight:'600', fontSize:18, paddingTop:27, paddingBottom:27 },
  s101Title: { color:'#fff', fontSize:20, fontWeight:'800', marginTop:6, marginBottom:4 },
  qaBlock: { marginTop:8 },
  qEmoji: { fontSize:16 },
  q: { color:'#fff', fontSize:16, fontWeight:'700', marginBottom:4 },
  a: { color:'rgba(255,255,255,0.85)', fontSize:15, lineHeight:21 },
  bg: { flex: 1 },
  bgImage: {},
  progressBarContainer: {
    position: 'absolute',
    top: 82,
    width: '75%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0', // light gray
    borderRadius: 2,
    zIndex: 1,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: '#FFD59E',
    borderRadius: 2,
    zIndex: 2,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  peach: {
    color: '#FFD59E',
    fontWeight: '900',
  },
  h2: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    width: '90%',
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  brand: {
    color: '#FFD59E',
    fontWeight: '900',
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
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
    marginBottom: 10,
    alignSelf: 'center',
  },
  chip: {
    height: 44,
    minWidth: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  chipSelected: {
    backgroundColor: 'rgba(30,30,40,0.5)',
  },
  chipUnselected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipTextUnselected: {
    color: 'rgba(255,255,255,0.6)',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skip: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  skipText: {
    color: '#FFD59E',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  cta: {
    alignSelf: 'center',
    width: '86%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD59E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  ctaText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
  },
  // Add TrialTeaserStep styles to StyleSheet.create
  trialWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 0 },
  trialLine: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  trialNumber: { color: '#FFD59E', fontWeight: '900' },
});
