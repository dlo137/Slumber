import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SOUND_SECTIONS } from '../../constants/sounds';

export default function SoundDetailScreen() {
  const { id, title, image } = useLocalSearchParams<{ id: string; title?: string; image?: string }>();
  const router = useRouter();

  // Find the sound by id for fallback if needed
  const sound =
    SOUND_SECTIONS.flatMap((section) => section.data).find((s) => s.id === id) ||
    { title: title || 'Sound', image: image || '', id: id || '' };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{sound.title}</Text>
      </View>
      <View style={styles.content}>
        <ImageBackground
          source={{ uri: sound.image }}
          style={styles.image}
          imageStyle={styles.imageBg}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
        <Text style={styles.title}>{sound.title}</Text>
        {/* TODO: Audio playback hook here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 16, marginBottom: 8 },
  backBtn: { marginRight: 8, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center', marginRight: 36 },
  content: { alignItems: 'center', paddingHorizontal: 24, flex: 1 },
  image: { width: 220, height: 220, borderRadius: 24, overflow: 'hidden', marginTop: 24, marginBottom: 18 },
  imageBg: { borderRadius: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12, textAlign: 'center' },
});
