import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';

const NOW_PLAYING = {
  id: 'sound-of-the-night',
  title: 'Sound Of The Night',
  subtitle: 'Alex Mons – Legacy',
  caption: '1,008 people listening now',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const storeUrl = 'https://example.com/app-store'; // TODO: Replace with real store URL

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
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.nowPlayingCard,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.93 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="View details for Sound Of The Night"
            onPress={() => router.push({ pathname: '/sound/[id]', params: { id: NOW_PLAYING.id } })}
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
                <Ionicons name="musical-notes" size={44} color="#E7E7F7" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitle}>{NOW_PLAYING.title}</Text>
                <Text style={styles.cardSubtitle}>{NOW_PLAYING.subtitle}</Text>
                <Text style={styles.cardCaption}>{NOW_PLAYING.caption}</Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#E7E7F7" style={{ marginLeft: 8 }} />
            </View>
          </Pressable>

          {/* Rate App Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.rateCard,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.93 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Rate our App"
            onPress={() => {
              // TODO: Replace with real store URL
              Linking.openURL(storeUrl);
              // or: router.push('/rate');
            }}
          >
            <View style={styles.heartIconWrap}>
              <Ionicons name="heart" size={28} color="#E7E7F7" />
            </View>
            <Text style={styles.rateTitle}>Rate our App</Text>
            <Ionicons name="chevron-forward" size={24} color="#E7E7F7" style={{ marginLeft: 'auto' }} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 28,
    backgroundColor: 'rgba(231,231,247,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
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
});
