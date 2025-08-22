import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import supabase from '../../lib/supabase';
import PaymentSheetComponent from '../components/PaymentSheet';

// Defensive error boundary for text rendering issues
class TextErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // You can log error here if needed
  }
  render() {
    if (this.state.hasError) {
      return <Text style={{color: 'red', margin: 20}}>A rendering error occurred. Please ensure all text is inside &lt;Text&gt; components.</Text>;
    }
    return this.props.children;
  }
}

const features = [
  { icon: 'moon-outline', color: '#FFD59E', text: 'Relaxing sleep sounds, all unlocked' },
  { icon: 'notifications-outline', color: '#FFD59E', text: 'Custom bedtime reminders' },
  { icon: 'star', color: '#FFD59E', text: 'Exclusive mixes & favorites' },
  { icon: 'lock-open', color: '#FFD59E', text: 'Cancel anytime, no commitment' },
];

export default function SubscriptionScreen() {
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    setShowPaymentSheet(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentSheet(false);
    Alert.alert('Success', 'Your subscription is active!', [
      {
        text: 'Continue',
        // Redirect to the Sounds tab after payment
        onPress: () => router.replace('/(tabs)/sounds'),
      },
    ]);
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
  };

  // Free version handler
  const handleFreeVersion = async () => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userError && userId) {
        // Always create a unique subscription_id for free trial
        const subscriptionId = `free_trial_${userId}`;
        await supabase
          .from('profiles')
          .update({ subscription_plan: 'free', subscription_id: subscriptionId })
          .eq('user_id', userId);
        await AsyncStorage.setItem('profile.subscription_plan', 'free');
        await AsyncStorage.setItem('profile.subscription_id', subscriptionId);
        // Defensive: always set as lowercase and trimmed
        const plan = (await AsyncStorage.getItem('profile.subscription_plan')) || '';
        await AsyncStorage.setItem('profile.subscription_plan', plan.trim().toLowerCase());
        Alert.alert('Free Version', 'You are now using the free version.', [
          { text: 'Continue', onPress: () => router.replace('/(tabs)/sounds') },
        ]);
      } else {
        Alert.alert('Error', 'Could not update profile for free version.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while switching to free version.');
    }
  };

  return (
    <TextErrorBoundary>
      <ImageBackground
        source={require('@/assets/images/onboarding-bg.jpg')}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="stretch"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.75)']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
          {/* App Icon */}
          <View style={styles.appIconContainer}>
            <View style={styles.appIcon}>
              <Ionicons name="moon-outline" size={32} color="#fff" />
            </View>
          </View>
          {/* Title */}
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.h1}>Unlock</Text>
            <Text style={[styles.h1, styles.peach]}>Slumber Pro</Text>
          </View>
          <Text style={[styles.sub, { textAlign: 'center', alignSelf: 'center' }]}>Get the best sleep experience with all features unlocked.</Text>
          {/* Features List */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon as any} size={22} color={feature.color} style={{ marginRight: 10 }} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
          {/* Free Trial Toggle */}
          <View style={styles.trialContainer}>
            <Text style={styles.trialText}>{freeTrialEnabled ? 'Free Trial Enabled' : 'Enable Free Trial'}</Text>
            <TouchableOpacity style={[styles.toggle, freeTrialEnabled && styles.toggleActive]} onPress={() => setFreeTrialEnabled(!freeTrialEnabled)}>
              <View style={[styles.toggleThumb, freeTrialEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
          {/* Pricing Plans */}
          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            <TouchableOpacity style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]} onPress={() => setSelectedPlan('yearly')}>
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>BEST VALUE</Text></View>
              <Text style={styles.planTitle}>YEARLY PLAN</Text>
              <Text style={styles.planPrice}>$49.99/year</Text>
              <Text style={styles.planSubtext}>Just $0.96/week</Text>
            </TouchableOpacity>
            {/* Monthly Plan */}
            <TouchableOpacity style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]} onPress={() => setSelectedPlan('monthly')}>
              <Text style={styles.planTitle}>{freeTrialEnabled ? '3-DAY FREE TRIAL' : 'MONTHLY PLAN'}</Text>
              <Text style={styles.planPrice}>{freeTrialEnabled ? 'then $4.99/month' : '$4.99/month'}</Text>
            </TouchableOpacity>
          </View>
          {/* Continue Button */}
          <TouchableOpacity style={styles.cta} onPress={handleContinue}>
            <Text style={styles.ctaText}>{freeTrialEnabled ? 'Start free trial' : 'Continue'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#1F2937" />
          </TouchableOpacity>
          {/* Continue to Free Version Text Link */}
          <TouchableOpacity onPress={handleFreeVersion} style={{ alignSelf: 'center', marginTop: -8 }}>
            <Text style={{ color: '#FFD59E', fontSize: 16, fontWeight: '700' }}>
              Continue to Free Version
            </Text>
          </TouchableOpacity>

          {/* Stripe Payment Sheet */}
          <PaymentSheetComponent
            planType={selectedPlan}
            amount={selectedPlan === 'yearly' ? 49.99 : 4.99}
            freeTrialEnabled={freeTrialEnabled}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            isVisible={showPaymentSheet}
          />
        </View>
        </SafeAreaView>
      </ImageBackground>
    </TextErrorBoundary>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: {},
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  appIconContainer: { alignItems: 'center', marginBottom: 16 },
  appIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFD59E', alignItems: 'center', justifyContent: 'center', marginBottom: 12, padding: 10 },
  h1: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 38 },
  peach: { color: '#FFD59E', fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', marginTop: 6, maxWidth: '78%', lineHeight: 22, marginBottom: 10 },
  featuresContainer: { marginBottom: 24, paddingHorizontal: 0 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 15, color: '#fff', marginLeft: 0, flex: 1 },
  trialContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 0 },
  trialText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  toggle: { width: 44, height: 26, backgroundColor: '#333', borderRadius: 13, padding: 2 },
  toggleActive: { backgroundColor: '#FFD59E' },
  toggleThumb: { width: 22, height: 22, backgroundColor: 'white', borderRadius: 11 },
  toggleThumbActive: { transform: [{ translateX: 18 }] },
  plansContainer: { marginBottom: 24 },
  planCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  planCardSelected: { borderColor: '#FFD59E', backgroundColor: 'rgba(255,213,158,0.12)' },
  planBadge: { position: 'absolute', top: -6, right: 16, backgroundColor: '#FFD59E', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  planBadgeText: { color: '#1a1a1a', fontSize: 11, fontWeight: 'bold' },
  planTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  planPrice: { fontSize: 18, fontWeight: 'bold', color: '#FFD59E', marginBottom: 3 },
  planSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  cta: { alignSelf: 'center', width: '86%', height: 56, borderRadius: 28, backgroundColor: '#FFD59E', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  ctaText: { color: '#1F2937', fontSize: 18, fontWeight: '700', marginRight: 6 },
  disclaimerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 0 },
  checkbox: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFD59E', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  disclaimerText: { fontSize: 11, color: '#fff', fontWeight: '600', textAlign: 'center' },
});
