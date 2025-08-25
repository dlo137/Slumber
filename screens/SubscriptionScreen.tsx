import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import supabase from '../lib/supabase';
let IAP: typeof import('expo-in-app-purchases') | null = null;
if (!__DEV__ && Platform.OS === 'ios') {
  try {
    IAP = require('expo-in-app-purchases');
  } catch (e) {
    console.warn('IAP not available', e);
  }
}

export async function initIAP() {
  if (!IAP) return;
  await IAP.connectAsync();
}

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

const SubscriptionScreen = () => {
  console.log('SubscriptionScreen mounted');

  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showIAPSheet, setShowIAPSheet] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    let didConnect = false;
    (async () => {
      await initIAP();
      didConnect = true;
    })();
    return () => {
      if (IAP && didConnect) {
        IAP.disconnectAsync();
      }
    };
  }, []);

  const IAP_PRODUCT_IDS = ['slumber.pro.monthly', 'slumber.pro.yearly'];

  const fetchProducts = async () => {
    if (!IAP) return;
    const { responseCode, results } = await IAP.getProductsAsync(IAP_PRODUCT_IDS);
    if (responseCode === IAP.IAPResponseCode.OK) {
      setProducts(results ?? []);
    }
  };

  const handleContinue = async () => {
    if (!IAP) return;
    await fetchProducts();
    setShowIAPSheet(true);
  };

  const handlePurchase = async (productId: string) => {
    if (!IAP) return;
    await IAP.purchaseItemAsync(productId);
  };

  useEffect(() => {
    if (!IAP) return;
    IAP.setPurchaseListener(async (result: any) => {
      const { responseCode, results } = result;
      if (responseCode === IAP.IAPResponseCode.OK && results) {
        for (const purchase of results) {
          if (!purchase.acknowledged) {
            await AsyncStorage.setItem('profile.subscription_plan', selectedPlan);
            await AsyncStorage.setItem('profile.subscription_id', purchase.productId);
            await IAP.finishTransactionAsync(purchase, false);
            Alert.alert('Success!', 'Your subscription has been activated.', [{ text: 'Continue', onPress: () => router.replace('/(tabs)/sounds') }]);
          }
        }
      } else if (responseCode === IAP.IAPResponseCode.USER_CANCELED) {
        Alert.alert('Purchase canceled');
        setShowIAPSheet(false);
      } else {
        Alert.alert('Error', 'Purchase failed.');
        setShowIAPSheet(false);
      }
    });
  }, [selectedPlan]);

  // Free version handler
  const handleFreeVersion = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userError && userId) {
        const subscriptionId = `free_trial_${userId}`;
        await supabase
          .from('profiles')
          .update({ subscription_plan: 'free', subscription_id: subscriptionId })
          .eq('user_id', userId);
        await AsyncStorage.setItem('profile.subscription_plan', 'free');
        await AsyncStorage.setItem('profile.subscription_id', subscriptionId);
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
      <View style={{flex: 1, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'lime', fontSize: 20, margin: 20}}>Minimal Test: Screen Mounted</Text>
      </View>
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

export default SubscriptionScreen;