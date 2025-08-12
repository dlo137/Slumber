import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  { icon: 'infinite', color: '#007AFF', text: 'Unlimited audio transcriptions' },
  { icon: 'mic', color: '#34C759', text: 'Record meetings of any duration' },
  { icon: 'logo-youtube', color: '#FF0000', text: 'YouTube & file uploads of any size' },
  { icon: 'chatbubble', color: '#FF69B4', text: 'Chat about your notes instantly' },
];

export default function SubscriptionScreen() {
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
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

  return (
    <TextErrorBoundary>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* App Icon */}
          <View style={styles.appIconContainer}>
            <View style={styles.appIcon}>
              <Ionicons name="mic" size={32} color="white" />
            </View>
            {/* Feature Icons around the main icon */}
            <View style={styles.featureIcons}>
              <View style={[styles.featureIcon, { top: -20, right: -20 }]}> <Ionicons name="paper-plane" size={16} color="#007AFF" /> </View>
              <View style={[styles.featureIcon, { top: -10, right: -30 }]}> <Ionicons name="bulb" size={16} color="#34C759" /> </View>
              <View style={[styles.featureIcon, { top: 10, right: -30 }]}> <Ionicons name="document" size={16} color="#FF9500" /> </View>
              <View style={[styles.featureIcon, { top: 20, right: -20 }]}> <Ionicons name="pulse" size={16} color="#AF52DE" /> </View>
            </View>
          </View>
          {/* Title */}
          <Text style={styles.title}>GET PRO <Text style={styles.proText}>ACCESS</Text></Text>
          {/* Features List */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon as any} size={20} color={feature.color} />
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
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>BEST OFFER</Text></View>
              <Text style={styles.planTitle}>YEARLY PLAN</Text>
              <Text style={styles.planPrice}>Just $99.99 per year</Text>
              <Text style={styles.planSubtext}>$1.92 per week</Text>
            </TouchableOpacity>
            {/* Weekly Plan */}
            <TouchableOpacity style={[styles.planCard, selectedPlan === 'weekly' && styles.planCardSelected]} onPress={() => setSelectedPlan('weekly')}>
              <Text style={styles.planTitle}>{freeTrialEnabled ? '3-DAY FREE TRIAL' : 'WEEKLY PLAN'}</Text>
              <Text style={styles.planPrice}>{freeTrialEnabled ? 'then $5.99 per week' : '$5.99 per week'}</Text>
            </TouchableOpacity>
          </View>
          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>{freeTrialEnabled ? 'Start free trial' : 'Continue'}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Stripe Payment Sheet */}
          <PaymentSheetComponent
            planType={selectedPlan}
            amount={selectedPlan === 'yearly' ? 99.99 : 5.99}
            freeTrialEnabled={freeTrialEnabled}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            isVisible={showPaymentSheet}
          />
          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <View style={styles.checkbox}><Ionicons name="checkmark" size={12} color="white" /></View>
            <Text style={styles.disclaimerText}>{freeTrialEnabled ? 'NO PAYMENT NOW, CANCEL ANYTIME' : 'CANCEL ANYTIME'}</Text>
          </View>
        </View>
      </SafeAreaView>
    </TextErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, paddingHorizontal: 15, justifyContent: 'center' },
  appIconContainer: { alignItems: 'center', marginBottom: 16, position: 'relative' },
  appIcon: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  featureIcons: { position: 'absolute', width: 100, height: 100 },
  featureIcon: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 24, paddingHorizontal: 0 },
  proText: { color: '#007AFF' },
  featuresContainer: { marginBottom: 24, paddingHorizontal: 0 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 15, color: '#1a1a1a', marginLeft: 10, flex: 1 },
  trialContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 0 },
  trialText: { fontSize: 15, color: '#1a1a1a', fontWeight: '600' },
  toggle: { width: 44, height: 26, backgroundColor: '#e1e1e1', borderRadius: 13, padding: 2 },
  toggleActive: { backgroundColor: '#007AFF' },
  toggleThumb: { width: 22, height: 22, backgroundColor: 'white', borderRadius: 11 },
  toggleThumbActive: { transform: [{ translateX: 18 }] },
  plansContainer: { marginBottom: 24 },
  planCard: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  planCardSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  planBadge: { position: 'absolute', top: -6, right: 16, backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  planBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  planTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  planPrice: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  planSubtext: { fontSize: 13, color: '#666' },
  continueButton: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginHorizontal: 0 },
  continueButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 6 },
  disclaimerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 0 },
  checkbox: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  disclaimerText: { fontSize: 11, color: '#1a1a1a', fontWeight: '600', textAlign: 'center' },
});
