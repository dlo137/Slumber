import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const MIXES = {
  rain: {
    title: 'Rain Therapy',
    emojis: ['🌧️', '🌊', '🎧'],
    gradient: ['#1F2B6C', '#2E0F4F'],
  },
  campfire: {
    title: 'Campfire by the Sea',
    emojis: ['🔥', '🌊', '🎧'],
    gradient: ['#0F3755', '#1D224F'],
  },
  peaceful: {
    title: 'Peaceful Camp Night',
    emojis: ['🌙', '🌲', '🔥'],
    gradient: ['#2B5876', '#4E4376'],
  },
  cozy: {
    title: 'Cozy House Ambience',
    emojis: ['🔥', '☕', '🎧'],
    gradient: ['#1A2980', '#26D0CE'],
  },
};

export default function MixDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const mix = id && MIXES[id as keyof typeof MIXES];

  if (!mix) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#181A2A' }}>
        <Text style={{ color: '#fff', fontSize: 22 }}>Mix not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: '#E7E7F7', fontSize: 16 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={mix.gradient}
      style={StyleSheet.absoluteFill}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
        </View>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{mix.title}</Text>
          <View style={styles.emojiRow}>
            {mix.emojis.map((emoji, i) => (
              <Text key={i} style={styles.emoji}>{emoji}</Text>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
            accessibilityRole="button"
            accessibilityLabel="Play mix"
            onPress={() => {}}
          >
            <Ionicons name="play" size={44} color="#181A2A" />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  emojiRow: {
    flexDirection: 'row',
    opacity: 0.9,
    gap: 8,
    marginBottom: 32,
  },
  emoji: {
    fontSize: 32,
    marginRight: 6,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
