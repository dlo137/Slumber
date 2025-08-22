import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import supabase from '../lib/supabase';
import PaymentSheetComponent from './components/PaymentSheet';

export default function ManageSubscriptionScreen() {
  // ...existing code...
  const router = useRouter();
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState<'yearly' | 'monthly'>('yearly');
  const [userPlan, setUserPlan] = useState<string>('');

  React.useEffect(() => {
    (async () => {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      let plan = '';
      if (!userError && userData?.user?.id) {
        // Fetch profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('user_id', userData.user.id)
          .single();
        if (!error && data) {
          plan = data.subscription_plan || '';
          // Optionally update local AsyncStorage for consistency
          await AsyncStorage.setItem('profile.subscription_plan', plan);
        }
      }
      // Fallback to AsyncStorage if Supabase fails
      if (!plan) {
        plan = (await AsyncStorage.getItem('profile.subscription_plan')) || '';
      }
  setUserPlan(typeof plan === 'string' ? plan.trim().toLowerCase() : '');
    })();
  }, []);

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Yearly Plan',
      'Are you sure you want to upgrade to the yearly plan for $49.99?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => {
            setPlanType('yearly');
            setShowPaymentSheet(true);
          }
        },
      ]
    );
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        Alert.alert('Error', 'User not found.');
        setLoading(false);
        return;
      }
      const userId = userData.user.id;

      // Downgrade user to free plan in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_plan: 'free' })
        .eq('user_id', userId);
      if (updateError) {
        Alert.alert('Error', updateError.message || 'Failed to downgrade to free plan.');
        setLoading(false);
        return;
      }

      // Update local plan
      await AsyncStorage.setItem('profile.subscription_plan', 'free');

      Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled and you have been downgraded to the free plan.', [
        { text: 'OK', onPress: () => {
            // Force MeScreen to refresh and fetch latest plan from Supabase
            router.replace({ pathname: '/(tabs)/me', params: { refresh: Date.now().toString() } });
          }
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'An error occurred while downgrading to free plan.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentSheet(false);
    Alert.alert('Success', 'Your subscription has been upgraded!', [
  { text: 'Continue', onPress: () => router.replace({ pathname: '/(tabs)/me', params: { refresh: Date.now().toString() } }) },
    ]);
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
  };

  // Downgrade handler
  const handleDowngrade = () => {
    Alert.alert(
  'Downgrade to Monthly Plan',
  'Are you sure you want to switch to the monthly plan for $4.99/month? Your yearly plan will remain active until the end of your current billing period.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: async () => {
            setLoading(true);
            try {
              // Get current user
              const { data: userData, error: userError } = await supabase.auth.getUser();
              if (userError || !userData?.user?.id) {
                Alert.alert('Error', 'User not found.');
                setLoading(false);
                return;
              }
              const userId = userData.user.id;

              // Downgrade user to monthly plan in Supabase
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ subscription_plan: 'monthly' })
                .eq('user_id', userId);
              if (updateError) {
                Alert.alert('Error', updateError.message || 'Failed to downgrade to monthly plan.');
                setLoading(false);
                return;
              }

              // Update local plan
              await AsyncStorage.setItem('profile.subscription_plan', 'monthly');

              Alert.alert('Success', 'Your subscription has been changed to monthly. You will be charged $4.99/month after your yearly period ends.', [
                { text: 'OK', onPress: () => router.replace({ pathname: '/(tabs)/me', params: { refresh: Date.now().toString() } }) },
              ]);
            } catch (err) {
              Alert.alert('Error', 'An error occurred while downgrading to monthly plan.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/images/onboarding-bg.jpg')}
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
      <SafeAreaView style={styles.safe}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#FFD59E" />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Manage Subscription</Text>
          <Text style={styles.explanation}>
            Change or cancel your subscription. 
          </Text>
          {userPlan.toLowerCase() === 'free' ? (
            <>
              <TouchableOpacity style={styles.upgradeButton} onPress={() => {
                Alert.alert(
                  'Upgrade to Monthly Plan',
                  'Are you sure you want to upgrade to the monthly plan for $4.99/month?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => {
                        setPlanType('monthly');
                        setShowPaymentSheet(true);
                      }
                    },
                  ]
                );
              }} disabled={loading}>
                <Text style={styles.upgradeButtonText}>Upgrade to Monthly Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.upgradeButton} onPress={() => {
                Alert.alert(
                  'Upgrade to Yearly Plan',
                  'Are you sure you want to upgrade to the yearly plan for $49.99?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => {
                        setPlanType('yearly');
                        setShowPaymentSheet(true);
                      }
                    },
                  ]
                );
              }} disabled={loading}>
                <Text style={styles.upgradeButtonText}>Upgrade to Yearly Plan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Show downgrade button for yearly plans */}
              {userPlan.toLowerCase() === 'yearly' && (
                <TouchableOpacity style={styles.downgradeButton} onPress={() => {
                  Alert.alert(
                    'Downgrade to Monthly Plan',
                    'Are you sure you want to downgrade to the monthly plan for $4.99/month? Your yearly plan will remain active until the end of your current billing period.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Yes', onPress: handleDowngrade },
                    ]
                  );
                }} disabled={loading}>
                  <Text style={styles.downgradeButtonText}>Downgrade to Monthly Plan</Text>
                </TouchableOpacity>
              )}
              {/* Show upgrade to yearly button for monthly users */}
              {userPlan.toLowerCase() === 'monthly' && (
                <TouchableOpacity style={styles.upgradeButton} onPress={() => {
                  Alert.alert(
                    'Upgrade to Yearly Plan',
                    'Are you sure you want to upgrade to the yearly plan for $49.99?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Yes', onPress: () => {
                          setPlanType('yearly');
                          setShowPaymentSheet(true);
                        }
                      },
                    ]
                  );
                }} disabled={loading}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Yearly Plan</Text>
                </TouchableOpacity>
              )}
              {/* Show cancel button for any paying user */}
              {(userPlan.toLowerCase() === 'monthly' || userPlan.toLowerCase() === 'yearly') && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    Alert.alert(
                      'Cancel Subscription',
                      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
                      [
                        { text: 'Keep Subscription', style: 'cancel' },
                        { text: 'Cancel Subscription', style: 'destructive', onPress: handleCancel },
                      ]
                    );
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
        {showPaymentSheet && (
          <PaymentSheetComponent
            planType={planType}
            amount={planType === 'yearly' ? 49.99 : 5.99}
            freeTrialEnabled={false}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            isVisible={showPaymentSheet}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  explanation: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 2,
    paddingHorizontal: 8,
  },
  downgradeButton: {
    backgroundColor: '#FFD59E',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    width: 280,
    maxWidth: '90%',
  },
  downgradeButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  bg: { flex: 1 },
  bgImage: {},
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  upgradeButton: { backgroundColor: '#FFD59E', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18, width: 280, maxWidth: '90%' },
  upgradeButtonText: { color: '#1F2937', fontSize: 18, fontWeight: '700', marginRight: 8 },
  cancelButton: { backgroundColor: '#2D145D', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 280, maxWidth: '90%' },
  cancelButtonText: { color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 8 },
});
