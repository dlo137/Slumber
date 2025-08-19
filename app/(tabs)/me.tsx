
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const storeUrl = 'https://example.com/app-store'; // TODO: Replace with real store URL

    // Log out handler
    const handleLogout = async () => {
      await AsyncStorage.clear();
      router.replace('/onboarding');
    };
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [planType, setPlanType] = React.useState('');

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        const name = await AsyncStorage.getItem('profile.name');
        const email = await AsyncStorage.getItem('profile.email');
        const plan = await AsyncStorage.getItem('profile.plan');
        if (isActive) {
          setUserName(name || 'Your Name');
          setUserEmail(email || 'your@email.com');
          setPlanType(plan || 'No Plan');
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header title="Profile" />
      <View style={{ height: 16 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 32 + insets.bottom,
          }}
          removeClippedSubviews
        >
          {/* Now Playing Card */}
          <View
            style={[styles.card, styles.nowPlayingCard]}
            accessibilityRole="none"
          >
            <LinearGradient
              colors={["#1B2340", "#2D145D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Overlay shapes */}
            <View style={styles.overlayShape1} />
            <View style={styles.overlayShape2} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.thumbIconWrap}>
                <Ionicons name="person-outline" size={32} color="#E7E7F7" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitle}>{userName}</Text>
                <Text style={styles.cardSubtitle}>{userEmail}</Text>
                <Text style={styles.cardCaption}>{planType}</Text>
              </View>
              {/* Arrow removed */}
            </View>
          </View>

          {/* Our Mission Card (moved under profile card) */}
          <View style={[styles.card, styles.missionCard]} accessibilityRole="none">
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              To help you relax, sleep better, and find peace through sound. We believe everyone deserves restful nights and mindful moments.
            </Text>
          </View>

          {/* Manage Subscription Button */}
          <Pressable
            style={({ pressed }) => [
              styles.manageButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Manage Subscription"
            onPress={() => router.push('/subscription')}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </Pressable>

          {/* Log Out Button */}
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Log Out"
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  manageButton: {
    backgroundColor: '#FFD59E',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  manageButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingTop: 10,
    marginBottom: 2,
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.13)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingBottom: 8,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backgroundColor: 'rgba(24,26,42,0.92)',
    overflow: 'hidden',
  },
  nowPlayingCard: {
    minHeight: 108,
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    backgroundColor: 'rgba(24,26,42,0.92)',
  },
  thumbIconWrap: {
  width: 56,
  height: 56,
  borderRadius: 28, // Restore circle
    backgroundColor: 'rgba(231,231,247,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    padding: 8, // Increased padding for more space around icon
  },
  heartIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(231,231,247,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    color: '#cfcfe6',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardCaption: {
    color: '#a8a8d0',
    fontSize: 13,
    fontWeight: '400',
  },
  rateTitle: {
    color: '#E7E7F7',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 2,
  },
  overlayShape1: {
    position: 'absolute',
    right: -30,
    top: 0,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    transform: [{ rotate: '18deg' }],
    zIndex: 1,
  },
  overlayShape2: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 30,
    transform: [{ rotate: '-12deg' }],
    zIndex: 1,
  },
  missionCard: {
    backgroundColor: 'rgba(24,26,42,0.92)',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
  },
  missionTitle: {
    color: '#E7E7F7',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  missionText: {
    color: '#cfcfe6',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#2D145D',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
