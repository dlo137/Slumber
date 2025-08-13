import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList, Image,
  KeyboardAvoidingView,
  Modal,
  Platform, Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from '../components/AudioPlayerContext';
import { SoundItem } from '../constants/sounds';

const PEACH = '#FFDAB9';
const DARK = '#18123A';
const SLIDER_HEIGHT = 12;
const SLIDER_RADIUS = 6;
const SLIDER_MIN = 0;
const SLIDER_MAX = 1;

const getThumb = (color: string) => ({
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: color,
  borderWidth: 2,
  borderColor: '#fff',
});

type TrackRowProps = {
  id: string;
  title: string;
  image: string;
  volume: number;
  onVolume: (v: number) => void;
  onRemove: (id: string) => Promise<void>; // No change here, keeping for context
};
const TrackRow: React.FC<TrackRowProps> = ({ id, title, image, volume, onVolume, onRemove }) => {
  const [removing, setRemoving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;

  const handleRemove = async () => {
    setRemoving(true);
    Haptics.selectionAsync();
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    Animated.timing(heightAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start(async () => {
      await onRemove(id);
    });
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, marginBottom: 12 }}>
      <Animated.View style={{
        height: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 72] }),
        overflow: 'hidden',
      }}>
        <View style={styles.trackRow}>
          <Pressable onPress={handleRemove} accessibilityLabel={`Remove ${title}`} style={styles.removeBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <Image source={{ uri: image }} style={styles.trackThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.trackTitle}>{title}</Text>
            <Slider
              value={volume}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              onValueChange={onVolume}
              style={{ width: '100%', height: 32 }}
              minimumTrackTintColor={PEACH}
              maximumTrackTintColor="#2D145D"
              thumbTintColor={PEACH}
            />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default function MixerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const audio = useAudioPlayer();
  const [saving, setSaving] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mixName, setMixName] = useState('');
  const FAVORITES_KEY = 'user_favorite_mixes';

  // Restore mix from navigation params if present
  useEffect(() => {
    // @ts-ignore
    const params = router?.params || {};
    // Parse params if they are JSON strings
    let soundIds: string[] | undefined;
    let volumes: Record<string, number> | undefined;
    if (typeof params.soundIds === 'string') {
      try {
        soundIds = JSON.parse(params.soundIds);
      } catch {}
    } else if (Array.isArray(params.soundIds)) {
      soundIds = params.soundIds;
    }
    if (typeof params.volumes === 'string') {
      try {
        volumes = JSON.parse(params.volumes);
      } catch {}
    } else if (params.volumes && typeof params.volumes === 'object') {
      volumes = params.volumes;
    }
    if (soundIds && Array.isArray(soundIds)) {
      if (audio.selectedIds.length === 0) {
        audio.setSelectedIds(soundIds);
        if (volumes) {
          setVolumes(volumes);
          Object.entries(volumes).forEach(([id, v]) => {
            audio.setVolume(id, v as number);
          });
        }
      }
    }
    if (typeof params.title === 'string') {
      setMixName(params.title);
    }
  }, []);

  // Auto-close if empty
  useEffect(() => {
    if (audio.selectedIds.length === 0) {
      setTimeout(() => router.back(), 200);
    }
  }, [audio.selectedIds]);

  useEffect(() => {
    setVolumes((prev) => {
      const newVolumes: Record<string, number> = {};
      audio.selectedIds.forEach((id) => {
        newVolumes[id] = prev[id] ?? 1;
      });
      return newVolumes;
    });
  }, [audio.selectedIds]);

  const handleVolume = (id: string, value: number) => {
    setVolumes((prev) => ({ ...prev, [id]: value }));
    audio.setVolume(id, value);
  };

  const handleRemove = async (id: string) => {
    await audio.remove(id);
  };

  const handleClearAll = () => {
    audio.clearAll();
    audio.stopAll();
    router.back();
    Haptics.selectionAsync();
  };

  const RAIN_AUDIO_MAP: Record<string, any> = {
    'heavy-rain': require('../assets/sounds/rain/heavy-rain.mp3'),
    'light-rain': require('../assets/sounds/rain/light-rain.mp3'),
    'thunder-rain': require('../assets/sounds/rain/thunder-rain.mp3'),
    'forrest-rain': require('../assets/sounds/rain/forrest-rain.mp3'),
    'car-rain': require('../assets/sounds/rain/car-rain.mp3'),
    'roof-rain': require('../assets/sounds/rain/roof-rain.mp3'),
  };

  const getAudioSource = (id: string) => {
    if (RAIN_AUDIO_MAP[id]) return RAIN_AUDIO_MAP[id];
    // Add more mappings for other categories as needed
    return null;
  };

  const handlePlayAll = () => {
    audio.selectedIds.forEach((id) => {
      const source = getAudioSource(id);
      if (source) audio.play(id, source);
    });
    Haptics.selectionAsync();
  };

  const handlePauseAll = () => {
    audio.pauseAll();
    Haptics.selectionAsync();
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  // Helper to get emojis for a mix (use sound categories)
  const getMixEmojis = (ids: string[]) => {
    const allSounds: SoundItem[] = [];
    for (const section of require('../constants/sounds').SOUND_SECTIONS) {
      allSounds.push(...section.data);
    }
    const categories = ids.map(id => {
      const sound = allSounds.find((s: SoundItem) => s.id === id);
      return sound ? sound.category : null;
    });
    // Map categories to emojis
    const emojiMap: Record<string, string> = {
      Rain: '🌧️', Water: '💧', Noise: '💥', Fire: '🔥', ASMR: '👂', Nature: '🌲',
    };
    return Array.from(new Set(categories.map(cat => cat ? emojiMap[cat] : '🎧')));
  };

  // Helper to get a gradient for a mix
  const getMixGradient = (ids: string[]) => {
    const allSounds: SoundItem[] = [];
    for (const section of require('../constants/sounds').SOUND_SECTIONS) {
      allSounds.push(...section.data);
    }
    const first = allSounds.find((s: SoundItem) => s.id === ids[0]);
    if (!first) return ['#1F2B6C', '#2E0F4F'];
    switch (first.category) {
      case 'Rain': return ['#1F2B6C', '#2E0F4F'];
      case 'Fire': return ['#2B5876', '#4E4376'];
      case 'Water': return ['#0F3755', '#1D224F'];
      case 'Noise': return ['#1A2980', '#26D0CE'];
      case 'ASMR': return ['#18123A', '#FFDAB9'];
      case 'Nature': return ['#2B5876', '#4E4376'];
      default: return ['#1F2B6C', '#2E0F4F'];
    }
  };

  // Save mix to AsyncStorage
  const handleSaveMix = async () => {
    if (!mixName.trim()) return;
    // Gather full sound data for each selected sound
    const allSounds: SoundItem[] = [];
    for (const section of require('../constants/sounds').SOUND_SECTIONS) {
      allSounds.push(...section.data);
    }
    const tracks = audio.selectedIds.map((id) => {
      const sound = allSounds.find((s) => s.id === id);
      return {
        id,
        title: sound ? sound.title : id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        image: sound ? sound.image : 'https://placehold.co/48x48',
        volume: volumes[id] ?? 1,
        category: sound ? sound.category : '',
      };
    });
    const newMix = {
      id: Date.now().toString(),
      title: mixName.trim(),
      emojis: getMixEmojis(audio.selectedIds),
      gradient: getMixGradient(audio.selectedIds),
      soundIds: [...audio.selectedIds],
      volumes: { ...volumes },
      tracks, // full track data for restoring
    };
    try {
      const existing = await AsyncStorage.getItem(FAVORITES_KEY);
      const mixes = existing ? JSON.parse(existing) : [];
      mixes.push(newMix);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(mixes));
    } catch {}
    setShowSaveModal(false);
    setMixName('');
    // Stop all sounds
    audio.stopAll();
    // Navigate to favorites screen instantly after saving
    setTimeout(() => {
      router.replace('/favorites');
    }, 100);
  };

  // Dummy data for images/titles; replace with your real sound data
  const getTrackMeta = (id: string) => {
    // Find the sound in SOUND_SECTIONS
    const allSounds = [];
    for (const section of require('../constants/sounds').SOUND_SECTIONS) {
      allSounds.push(...section.data);
    }
    const sound = allSounds.find((s) => s.id === id);
    return {
      title: sound ? sound.title : id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      image: sound ? sound.image : 'https://placehold.co/48x48',
    };
  };

  return (
    <LinearGradient colors={['#0B0620', '#2D145D']} style={styles.gradient}>
      <SafeAreaView style={[styles.safe, { paddingBottom: insets.bottom }]}> 
        <View style={styles.header}>
          {/* Removed handle */}
          <Text style={styles.headerTitle}>Your Mix</Text>
          <Pressable style={styles.headerClose} onPress={() => router.back()} accessibilityLabel="Close mixer">
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </View>
        {audio.selectedIds.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyText}>No sounds in your mix yet.</Text></View>
        ) : (
          <FlatList
            data={audio.selectedIds}
            keyExtractor={(id) => id}
            renderItem={({ item: id }) => {
              const { title, image } = getTrackMeta(id);
              return (
                <TrackRow
                  id={id}
                  title={title}
                  image={image}
                  volume={volumes[id] ?? 1}
                  onVolume={(v) => handleVolume(id, v)}
                  onRemove={handleRemove}
                />
              );
            }}
            contentContainerStyle={{ padding: 16, paddingBottom: 96 + insets.bottom }}
          />
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.toolbar, { paddingBottom: insets.bottom + 72 }]}
        >
          <View style={styles.toolbarRow}>
            <ToolbarButton icon="close-outline" label="Clear all" onPress={handleClearAll} accessibilityLabel="Clear all sounds" />
            {audio.isPlaying ? (
              <ToolbarButton icon="pause-outline" label="Pause" onPress={handlePauseAll} accessibilityLabel="Pause all" />
            ) : (
              <ToolbarButton icon="play-outline" label="Play" onPress={() => { handlePlayAll(); }} disabled={audio.selectedIds.length === 0} accessibilityLabel="Play all" />
            )}
            <ToolbarButton icon="heart-outline" label="Save" onPress={handleSave} accessibilityLabel="Save mix" />
            <ToolbarButton icon="time-outline" label="Timer" onPress={() => router.push('/timer')} accessibilityLabel="Open timer" />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name your mix</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Mix name"
              value={mixName}
              onChangeText={setMixName}
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveMix}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowSaveModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

type ToolbarButtonProps = {
  icon: any;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onPress, active, disabled, accessibilityLabel }) => (
  <Pressable
    style={({ pressed }) => [
      styles.toolbarBtn,
      active && styles.toolbarBtnActive,
      disabled && { opacity: 0.4 },
      pressed && { opacity: 0.7 },
    ]}
    onPress={disabled ? undefined : onPress}
    accessibilityLabel={accessibilityLabel || label}
    accessibilityRole="button"
  >
    <Ionicons name={icon} size={26} color="#fff" />
    <Text style={styles.toolbarLabel}>{label}</Text>
    {active && <View style={styles.toolbarUnderline} />}
  </Pressable>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16, position: 'relative' },
  handle: { position: 'absolute', top: 8, left: '50%', marginLeft: -24, width: 48, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity: 0.3 },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: '600', letterSpacing: 0.5 },
  headerClose: { position: 'absolute', right: 16, top: 8, padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#fff', opacity: 0.7, fontSize: 17, fontWeight: '500' },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(24,18,58,0.7)', borderRadius: 16, padding: 12, marginBottom: 0 },
  removeBtn: { marginRight: 8, padding: 4 },
  trackThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#222', marginRight: 0 },
  trackTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sliderContainer: { height: 14, justifyContent: 'center', marginTop: 2 },
  sliderTrack: { height: SLIDER_HEIGHT, borderRadius: SLIDER_RADIUS, backgroundColor: '#2D145D', overflow: 'hidden', width: '100%', position: 'relative' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: PEACH, borderRadius: SLIDER_RADIUS, height: SLIDER_HEIGHT },
  sliderThumb: { position: 'absolute', top: -3, width: 18, height: 18, borderRadius: 9, backgroundColor: PEACH, borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24,18,58,0.85)',
    paddingHorizontal: 16,
    paddingTop: 3, // Increased top padding to raise icons

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    marginTop: 0, // Remove top margin so icons stay at the top of the toolbar
    marginBottom: 25, // Add bottom margin to visually raise the icons above the bottom edge
  },
  toolbarBtn: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 4 },
  toolbarBtnActive: { opacity: 1 },
  toolbarLabel: { color: '#fff', fontSize: 11, marginTop: 2, opacity: 0.85 },
  toolbarUnderline: { height: 3, borderRadius: 2, backgroundColor: PEACH, marginTop: 2, width: 24, alignSelf: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#18123A',
    borderRadius: 18,
    padding: 28,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 18,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 17,
    width: '100%',
    marginBottom: 18,
    color: '#18123A',
  },
  modalButton: {
    backgroundColor: PEACH,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#18123A',
    fontSize: 17,
    fontWeight: '600',
  },
  modalCancel: {
    paddingVertical: 6,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 15,
    opacity: 0.7,
  },
});
