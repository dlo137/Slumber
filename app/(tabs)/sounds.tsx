import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Animated, Dimensions, Easing, ImageBackground, Platform, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import carRain from '../../assets/sounds/rain/car-rain.mp3';
import forrestRain from '../../assets/sounds/rain/forrest-rain.mp3';
import heavyRain from '../../assets/sounds/rain/heavy-rain.mp3';
import lightRain from '../../assets/sounds/rain/light-rain.mp3';
import roofRain from '../../assets/sounds/rain/roof-rain.mp3';
import thunderRain from '../../assets/sounds/rain/thunder-rain.mp3';
import { useAudioPlayer } from '../../components/AudioPlayerContext';
import { SOUND_SECTIONS, SoundItem } from '../../constants/sounds';

const H_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 3;

type SoundTileProps = {
  item: SoundItem;
  size: number;
  selected: boolean;
  onPress: (id: string) => void;
};

const RAIN_AUDIO_MAP: Record<string, any> = {
  'heavy-rain': heavyRain,
  'light-rain': lightRain,
  'thunder-rain': thunderRain,
  'forrest-rain': forrestRain,
  'car-rain': carRain,
  'roof-rain': roofRain,
};

const BAR_COUNT = 5;
const SoundTile: React.FC<SoundTileProps> = ({ item, size, selected, onPress }) => {
  // Animated values for bars
  const barAnims = React.useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(1))
  ).current;

  React.useEffect(() => {
    let anims: Animated.CompositeAnimation[] = [];
    if (selected) {
      anims = barAnims.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 200 + i * 40,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 1,
              duration: 200 + i * 40,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.stagger(60, anims).start();
    } else {
      barAnims.forEach(bar => bar.setValue(1));
    }
    return () => {
      anims.forEach(anim => anim.stop && anim.stop());
    };
  }, [selected]);

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[styles.tile, { width: size, height: size }, selected && { borderColor: '#FFD600', borderWidth: 2 }]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      hitSlop={8}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.tileBg}
        imageStyle={styles.tileBgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
          style={styles.tileOverlay}
        />
        {selected && (
          <View style={styles.soundBarsContainer} pointerEvents="none">
            {barAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.soundBar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: '#FFD600',
                  },
                ]}
              />
            ))}
          </View>
        )}
        <Text style={styles.tileText} numberOfLines={2}>{item.title}</Text>
      </ImageBackground>
    </Pressable>
  );
};

export default function SoundsScreen() {
  const { width } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const audio = useAudioPlayer();
  const TILE_SIZE = useMemo(
    () => Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS),
    [width]
  );

  const handleTilePress = async (id: string) => {
    const isRain = Object.keys(RAIN_AUDIO_MAP).includes(id);
    if (isRain) {
      if (audio.selectedIds.includes(id)) {
        // Always unselect/stop if already selected
        audio.stop(id);
      } else {
        // If paused, resume all selected sounds and play the new one
        if (!audio.isPlaying && audio.selectedIds.length > 0) {
          audio.selectedIds.forEach((selectedId) => {
            audio.play(selectedId, RAIN_AUDIO_MAP[selectedId]);
          });
        }
        audio.play(id, RAIN_AUDIO_MAP[id]);
      }
      Haptics.selectionAsync();
    }
  };

  const sections = SOUND_SECTIONS.map(section => {
    // Split into rows
    const rows = Array.from({ length: Math.ceil(section.data.length / NUM_COLUMNS) }, (_, i) =>
      section.data.slice(i * NUM_COLUMNS, i * NUM_COLUMNS + NUM_COLUMNS)
    );
    // Only keep the first two rows
    return {
      ...section,
      data: rows.slice(0, 2),
    };
  });

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(_, idx) => String(idx)}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title} {section.emoji}</Text>
          </View>
        )}
        renderItem={({ item, section, index }) => {
          // For the last row in a section, add extra marginBottom for spacing between categories
          const isLastRow = index === section.data.length - 1;
          return (
            <View
              style={{
                flexDirection: 'row',
                gap: GAP,
                marginBottom: isLastRow ? GAP * 3 : GAP, // More space after last row of each section
              }}
            >
              {item.map((sound: SoundItem) => (
                <SoundTile
                  key={sound.id}
                  item={sound}
                  size={TILE_SIZE}
                  selected={audio.selectedIds.includes(sound.id)}
                  onPress={handleTilePress}
                />
              ))}
              {item.length < NUM_COLUMNS &&
                Array.from({ length: NUM_COLUMNS - item.length }).map((_, i) => (
                  <View key={i} style={{ width: TILE_SIZE, height: TILE_SIZE }} />
                ))}
            </View>
          );
        }}
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingHorizontal: H_PADDING,
          paddingTop: Platform.OS === 'android' ? 48 : 64,
          paddingBottom: 32 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: TILE_SIZE + GAP,
          offset: (TILE_SIZE + GAP) * index,
          index,
        })}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Sounds</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerContainer: { alignItems: 'center', marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 0.5 },
  sectionHeader: { backgroundColor: 'transparent', paddingVertical: 6 },
  sectionHeaderText: { color: '#fff', fontSize: 19, fontWeight: '700', paddingLeft: 2 },
  tile: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1A1733',
    marginBottom: 0,
    marginRight: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tileBg: { flex: 1, justifyContent: 'flex-end' },
  tileBgImage: { borderRadius: 18 },
  tileOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
  tileText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    padding: 8,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soundBarsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -11 }],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 22,
    zIndex: 2,
    pointerEvents: 'none',
  },
  soundBar: {
    width: 4,
    height: 18,
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: '#FFD600',
  },
});
