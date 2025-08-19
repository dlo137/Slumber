import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useConfirmSetupIntent,
  usePaymentSheet,
  usePlatformPay
} from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StripeService } from '../../services/stripeService';

interface PaymentSheetProps {
  planType: 'weekly' | 'yearly';
  amount: number;
  freeTrialEnabled: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

const PaymentSheetComponent: React.FC<PaymentSheetProps> = ({
  planType,
  amount,
  freeTrialEnabled,
  onSuccess,
  onCancel,
  isVisible,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmSetupIntent } = useConfirmSetupIntent();
  const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      handlePaymentFlow();
    }
  }, [isVisible, planType, amount, freeTrialEnabled]);

  // Restore Supabase session if missing
  const restoreSupabaseSession = async () => {
    const { supabase } = require('@/lib/supabase');
    const sessionStr = await AsyncStorage.getItem('supabase.session');
    if (!sessionStr) {
      console.warn('No supabase.session found in AsyncStorage');
      return;
    }
    const session = JSON.parse(sessionStr);
    console.log('Restoring Supabase session:', session);
    if (!session.access_token || !session.refresh_token) {
      console.error('Session missing access_token or refresh_token:', session);
      return;
    }
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    // Immediately check user after restoring session
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user after session restore:', userError);
    } else {
      console.log('User after session restore:', userData);
    }
  };

  // Update user's profile with subscription info
  const updateUserSubscription = async (
    planType: 'weekly' | 'yearly',
    subscriptionId: string | null
  ): Promise<void> => {
    try {
      const { supabase } = require('@/lib/supabase');
      await restoreSupabaseSession();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
      }
      const userId = userData?.id || userData?.user?.id;
      if (!userId) {
        console.error('No authenticated user found. userData:', userData);
        return;
      }
      // Extra logging for subscriptionId
      console.log('Updating profile for userId:', userId, 'with plan:', planType, 'and subscriptionId:', subscriptionId);
      if (!subscriptionId) {
        console.error('No subscription_id returned from backend. Payment data may be missing subscription_id.');
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: planType,
          subscription_id: subscriptionId ?? null,
        })
        .eq('user_id', userId);
      if (error) {
        console.error('Supabase update error:', error);
      } else {
        console.log('Supabase update result:', data);
      }
    } catch (err) {
      console.error('Failed to update user subscription:', err);
    }
  };

  // Create subscription after payment confirmation
  const createAndStoreSubscription = async (planType: 'weekly' | 'yearly', trialEnabled: boolean) => {
    try {
      const { supabase } = require('@/lib/supabase');
      await restoreSupabaseSession();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        return null;
      }
      const userId = userData?.id || userData?.user?.id;
      if (!userId) {
        console.error('No authenticated user found. userData:', userData);
        return null;
      }
      // Call edge function to create subscription
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planType,
          trialEnabled,
          userId,
        },
      });
      if (error) {
        console.error('Error creating subscription:', error);
        return null;
      }
      console.log('Subscription creation response:', data);
      return data?.subscription_id ?? null;
    } catch (err) {
      console.error('Failed to create subscription:', err);
      return null;
    }
  };

  const handlePaymentFlow = async () => {
    try {
      setLoading(true);
  const paymentData = await StripeService.createPaymentIntent(planType, undefined, freeTrialEnabled);
  if (!paymentData.client_secret) throw new Error('No client secret received');
  // Log paymentData for debugging
  console.log('Payment data received from backend:', paymentData);

      // If NOT a free trial (i.e., PaymentIntent flow), try Apple Pay first
      if (!freeTrialEnabled) {
        const supported = await isPlatformPaySupported();
        if (supported) {
          // Apple Pay recurring cart item
          const cartItem = planType === 'weekly'
            ? {
                label: 'Weekly Plan',
                amount: amount.toFixed(2),
                paymentType: 2 as any,
                intervalUnit: 'week',
                intervalCount: 1,
              }
            : {
                label: 'Yearly Plan',
                amount: amount.toFixed(2),
                paymentType: 2 as any,
                intervalUnit: 'year',
                intervalCount: 1,
              };
          const params = {
            applePay: {
              merchantCountryCode: 'US',
              currencyCode: 'USD',
              cartItems: [cartItem],
            }
          };
          const result = await confirmPlatformPayPayment(paymentData.client_secret, params);
          if (!result.error) {
            // Update profile with subscription info
            // After payment, create subscription and update profile
            const subscriptionId = await createAndStoreSubscription(planType, freeTrialEnabled);
            await updateUserSubscription(planType, subscriptionId);
            setLoading(false);
            Alert.alert('Success!', 'Your subscription has been activated.', [{ text: 'Continue', onPress: onSuccess }]);
            return;
          }
          // If Apple Pay failed/cancelled, fall through to PaymentSheet as a fallback
        }
      }

      // --- Existing logic (unchanged), but include applePay option so sheet shows Apple Pay row ---
      const sheetInit = freeTrialEnabled
        ? await initPaymentSheet({
            merchantDisplayName: 'NotesSummarizer',
            setupIntentClientSecret: paymentData.client_secret,
            defaultBillingDetails: { name: 'NotesSummarizer User' },
            applePay: { merchantCountryCode: 'US' },
            appearance: { colors: { primary: '#007AFF' } },
          })
        : await initPaymentSheet({
            merchantDisplayName: 'NotesSummarizer',
            paymentIntentClientSecret: paymentData.client_secret,
            defaultBillingDetails: { name: 'NotesSummarizer User' },
            applePay: { merchantCountryCode: 'US' },
            allowsDelayedPaymentMethods: true,
            appearance: { colors: { primary: '#007AFF' } },
          });

      if (sheetInit.error) {
        console.error('Payment sheet initialization error:', sheetInit.error);
        Alert.alert('Error', sheetInit.error.message);
        setLoading(false);
        onCancel();
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        console.error('Payment sheet presentation error:', presentError);
        Alert.alert('Payment failed', presentError.message);
        setLoading(false);
        onCancel();
        return;
      }

  // Success: update profile with subscription info
  // After payment, create subscription and update profile
  const subscriptionId = await createAndStoreSubscription(planType as 'weekly' | 'yearly', freeTrialEnabled);
  await updateUserSubscription(planType as 'weekly' | 'yearly', subscriptionId);
      setLoading(false);
      const successMessage = freeTrialEnabled
        ? 'Your 3-day free trial has started! You won\'t be charged until the trial ends.'
        : 'Your subscription has been activated.';
      Alert.alert('Success!', successMessage, [{ text: 'Continue', onPress: onSuccess }]);
    } catch (error) {
      console.error('Payment flow error:', error);
      Alert.alert('Error', `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      onCancel();
    }
  };

  const createSubscriptionWithTrial = async (planType: 'weekly' | 'yearly', customerId: string) => {
    try {
      console.log('Creating subscription with trial for customer:', customerId);
      
      // Use the StripeService method
      const data = await StripeService.createFreeTrial(planType, customerId);

      console.log('Free trial subscription created:', data);
      return data;
    } catch (error) {
      console.error('Error creating free trial subscription:', error);
      throw error;
    }
  };

  // Show loading state while processing
  if (isVisible && loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {freeTrialEnabled ? 'Setting up your free trial...' : 'Preparing payment...'}
          </Text>
        </View>
      </View>
    );
  }

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // This should not be reached, but just in case
  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default PaymentSheetComponent;
