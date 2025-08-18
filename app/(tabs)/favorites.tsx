import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FavoriteMix = {
  id: string;
  title: string;
  emojis: string[];
  gradient: [string, string];
  soundIds?: string[];
  volumes?: Record<string, number>;
  tracks?: Array<{
    id: string;
    title: string;
    image: string;
    volume: number;
    category: string;
  }>;
};

const SEED_MIXES: FavoriteMix[] = [
  {
    id: 'rain',
    title: 'Rain Therapy',
    emojis: ['🌧️', '🌊', '🎧'],
    gradient: ['#1F2B6C', '#2E0F4F'],
    soundIds: ['ocean', 'thunder-rain'],
    volumes: { ocean: 0.5, 'thunder-rain': 0.5 },
    tracks: [
      { id: 'ocean', title: 'Ocean', image: require('../../assets/images/water/ocean.jpg'), volume: 0.5, category: 'Water' },
      // Use upslash image for thunder-rain to match constants/sounds.ts IMAGE_MAP
  // Use a safe placeholder image for thunder-rain
  { id: 'thunder-rain', title: 'Thunderstorm', image: require('../../assets/images/noise/white-noise.jpg'), volume: 0.5, category: 'Rain' },
    ],
  },
  {
    id: 'campfire',
    title: 'Campfire by the Sea',
    emojis: ['🔥', '🌊', '🎧'],
    gradient: ['#0F3755', '#1D224F'],
    soundIds: ['campfire', 'shore'],
    volumes: { campfire: 0.5, shore: 0.5 },
    tracks: [
  { id: 'campfire', title: 'Campfire', image: require('../../assets/images/fire/campfire.jpg'), volume: 0.5, category: 'Fire' },
  { id: 'shore', title: 'Shore', image: require('../../assets/images/water/shore.jpg'), volume: 0.5, category: 'Water' },
    ],
  },
  {
    id: 'peaceful',
    title: 'Peaceful Camp Night',
    emojis: ['🌙', '🌲', '🔥'],
    gradient: ['#2B5876', '#4E4376'],
    soundIds: ['night', 'campfire'],
    volumes: { night: 0.5, campfire: 0.5 },
    tracks: [
      { id: 'night', title: 'Night', image: require('../../assets/images/nature/night.webp'), volume: 0.5, category: 'Nature' },
      { id: 'campfire', title: 'Campfire', image: require('../../assets/images/fire/campfire.jpg'), volume: 0.5, category: 'Fire' },
    ],
  },
  {
    id: 'cozy',
    title: 'Cozy House Ambience',
    emojis: ['🔥', '☕', '🎧'],
    gradient: ['#1A2980', '#26D0CE'],
    soundIds: ['fireplace'],
    volumes: { fireplace: 1 },
    tracks: [
      { id: 'fireplace', title: 'Fireplace', image: require('../../assets/images/fire/fireplace.jpeg'), volume: 1, category: 'Fire' },
    ],
  },
];

export default function FavoritesScreen() {
  const [editing, setEditing] = useState(false);
  const [mixes, setMixes] = useState(SEED_MIXES);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // For animation: keep refs for each card
  const animRefs = useRef<{ [id: string]: Animated.Value }>({});
  mixes.forEach(mix => {
    if (!animRefs.current[mix.id]) {
      animRefs.current[mix.id] = new Animated.Value(1);
    }
  });

  // Load user mixes from AsyncStorage whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const FAVORITES_KEY = 'user_favorite_mixes';
      const loadUserMixes = async () => {
        try {
          const stored = await AsyncStorage.getItem(FAVORITES_KEY);
          const userMixes = stored ? JSON.parse(stored) : [];
          if (userMixes.length > 0) {
            setMixes([...SEED_MIXES, ...userMixes]);
          } else {
            setMixes(SEED_MIXES);
          }
        } catch {
          setMixes(SEED_MIXES);
        }
      };
      loadUserMixes();
    }, [])
  );

  const CARD_HEIGHT = 104;
  const CARD_MARGIN = 10;
  const H_PADDING = 16;

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    // Remove from state immediately for instant UI feedback
    setMixes(m => {
      const updated = m.filter(mix => mix.id !== id);
      // Remove from AsyncStorage only if it's a user mix (not seed)
      const isSeed = SEED_MIXES.some(seed => seed.id === id);
      if (!isSeed) {
        const FAVORITES_KEY = 'user_favorite_mixes';
        AsyncStorage.getItem(FAVORITES_KEY).then(stored => {
          if (stored) {
            const userMixes = JSON.parse(stored);
            const newUserMixes = userMixes.filter((mix: any) => mix.id !== id);
            AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newUserMixes));
          }
        });
      }
      return updated;
    });
    // Animate for visual feedback
    Animated.parallel([
      Animated.timing(animRefs.current[id], {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    // Clear deletingId after animation duration
    setTimeout(() => setDeletingId(null), 250);
  }, []);

  const renderItem = useCallback(({ item }: { item: FavoriteMix }) => {
    const scale = animRefs.current[item.id] || new Animated.Value(1);
    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity: scale,
          marginVertical: CARD_MARGIN / 2,
        }}
      >
        <Pressable
          onPress={() => {
            if (editing) {
              handleDelete(item.id);
            } else if (item.soundIds && item.volumes) {
              router.push({
                pathname: '/mixer',
                params: {
                  mixId: item.id,
                  soundIds: JSON.stringify(item.soundIds),
                  volumes: JSON.stringify(item.volumes),
                  tracks: item.tracks ? JSON.stringify(item.tracks) : undefined,
                },
              });
            }
          }}
          style={({ pressed }) => [
            cardStyles.card,
            { height: CARD_HEIGHT },
            { backgroundColor: 'transparent' },
            pressed && !editing && { transform: [{ scale: 0.98 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Overlay shapes */}
          <View style={cardStyles.overlayShape1} />
          <View style={cardStyles.overlayShape2} />
          <View style={cardStyles.cardContent}>
            <View style={{ flex: 1 }}>
              <Text style={cardStyles.cardTitle}>{item.title}</Text>
              <View style={cardStyles.emojiRow}>
                {item.emojis.map((emoji, i) => (
                  <Text key={i} style={cardStyles.emoji}>{emoji}</Text>
                ))}
              </View>
            </View>
            <Pressable
              onPress={() => {
                if (editing) {
                  handleDelete(item.id);
                } else if (item.soundIds && item.volumes) {
                  router.push({
                    pathname: '/mixer',
                    params: {
                      mixId: item.id,
                      soundIds: JSON.stringify(item.soundIds),
                      volumes: JSON.stringify(item.volumes),
                      tracks: item.tracks ? JSON.stringify(item.tracks) : undefined,
                    },
                  });
                }
              }}
              style={({ pressed }) => [
                cardStyles.iconButton,
                editing && { backgroundColor: '#FF4C4C' },
                pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel={editing ? `Delete ${item.title}` : `Play ${item.title}`}
            >
              <Ionicons name={editing ? 'close' : 'play'} size={28} color={editing ? '#fff' : '#181A2A'} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  }, [editing, handleDelete, router]);

  const keyExtractor = useCallback((item: FavoriteMix) => item.id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_HEIGHT + CARD_MARGIN,
    offset: (CARD_HEIGHT + CARD_MARGIN) * index,
    index,
  }), []);

  const { top, bottom } = insets;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
  <View style={[cardStyles.headerContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}> 
    <Text style={[cardStyles.headerTitle, { flex: 1, textAlign: 'center' }]}>Favorites</Text>
    <Pressable
  style={{ paddingHorizontal: 8, paddingVertical: 8, marginRight: 8 }}
      onPress={() => setEditing(e => !e)}
      accessibilityRole="button"
      accessibilityLabel={editing ? "Done Editing" : "Edit Favorites"}
    >
      <Ionicons name={editing ? "checkmark" : "create-outline"} size={24} color="#E7E7F7" />
    </Pressable>
  </View>
  <View style={{ height: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={mixes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingTop: 24,
            paddingBottom: (bottom || 12) + 8,
          }}
          removeClippedSubviews
          getItemLayout={getItemLayout}
          extraData={editing}
          key={mixes.map(m => m.id).join('-')}
        />
      </SafeAreaView>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingTop: 57,
    marginBottom: 2,
    position: 'relative',
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.13)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingBottom: 8,
    marginHorizontal: 'auto',
    marginLeft: 45,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -16 }],
    paddingHorizontal: 18,
    paddingVertical: 8,
    zIndex: 2,
  },
  editButtonText: {
    color: '#E7E7F7',
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  emojiRow: {
    flexDirection: 'row',
    opacity: 0.9,
    gap: 6,
  },
  emoji: {
    fontSize: 22,
    marginRight: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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






