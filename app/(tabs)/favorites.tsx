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
  },
  {
    id: 'campfire',
    title: 'Campfire by the Sea',
    emojis: ['🔥', '🌊', '🎧'],
    gradient: ['#0F3755', '#1D224F'],
  },
  {
    id: 'peaceful',
    title: 'Peaceful Camp Night',
    emojis: ['🌙', '🌲', '🔥'],
    gradient: ['#2B5876', '#4E4376'],
  },
  {
    id: 'cozy',
    title: 'Cozy House Ambience',
    emojis: ['🔥', '☕', '🎧'],
    gradient: ['#1A2980', '#26D0CE'],
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
            {editing ? (
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={({ pressed }) => [cardStyles.iconButton, { backgroundColor: '#FF4C4C' }, pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] }]}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            ) : (
              <View style={cardStyles.iconButton}>
                <Ionicons name="play" size={28} color="#181A2A" />
              </View>
            )}
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
      <SafeAreaView style={{ flex: 1, paddingTop: top + 8 }}>
        {/* Header */}
        <View style={cardStyles.headerContainer}>
          <Text style={cardStyles.headerTitle}>My Favorites</Text>
          <Pressable
            onPress={() => setEditing(e => !e)}
            style={({ pressed }) => [cardStyles.editButton, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
            accessibilityRole="button"
            accessibilityLabel={editing ? 'Done editing' : 'Edit favorites'}
          >
            <Text style={cardStyles.editButtonText}>{editing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>
        {/* List */}
        <FlatList
          data={mixes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingTop: 24,
            paddingBottom: (bottom || 24) + 24,
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
    marginBottom: 8,
    position: 'relative',
    minHeight: 48,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.5,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    top: 0,
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






