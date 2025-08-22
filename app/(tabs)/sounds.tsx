import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Animated, Dimensions, Easing, ImageBackground, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import campfire from '../../assets/sounds/fire/campfire.mp3';
import fireplace from '../../assets/sounds/fire/fireplace.mp3';
import birds from '../../assets/sounds/nature/birds.mp3';
import forest from '../../assets/sounds/nature/forest.mp3';
import leaves from '../../assets/sounds/nature/leaves.mp3';
import night from '../../assets/sounds/nature/night.mp3';
import snow from '../../assets/sounds/nature/snowstorm.mp3';
import wind from '../../assets/sounds/nature/wind.mp3';
import hz285 from '../../assets/sounds/noise/285-hz.mp3';
import hz432 from '../../assets/sounds/noise/432-hz.mp3';
import hz528 from '../../assets/sounds/noise/528-hz.mp3';
import alphaWaves from '../../assets/sounds/noise/alpha-waves.mp3';
import betaWaves from '../../assets/sounds/noise/beta-waves.mp3';
import blueNoise from '../../assets/sounds/noise/blue-noise.mp3';
import brownNoise from '../../assets/sounds/noise/brown-noise.mp3';
import thetaWaves from '../../assets/sounds/noise/theta-wave.mp3';
import whiteNoise from '../../assets/sounds/noise/white-noise.mp3';
import carRain from '../../assets/sounds/rain/car-rain.mp3';
import forrestRain from '../../assets/sounds/rain/forrest-rain.mp3';
import heavyRain from '../../assets/sounds/rain/heavy-rain.mp3';
import lightRain from '../../assets/sounds/rain/light-rain.mp3';
import roofRain from '../../assets/sounds/rain/roof-rain.mp3';
import thunderRain from '../../assets/sounds/rain/thunder-rain.mp3';
import lake from '../../assets/sounds/water/lake.mp3';
import ocean from '../../assets/sounds/water/ocean.mp3';
import river from '../../assets/sounds/water/river.mp3';
import shore from '../../assets/sounds/water/shore.mp3';
import underwater from '../../assets/sounds/water/underwater.mp3';
import waterfall from '../../assets/sounds/water/waterfall.mp3';
import { useAudioPlayer } from '../../components/AudioPlayerContext';
import { Header } from '../../components/Header';
import { IMAGE_MAP, SOUND_SECTIONS, SoundItem } from '../../constants/sounds';
const FIRE_AUDIO_MAP: Record<string, any> = {
  'campfire': campfire,
  'fireplace': fireplace,
};

const NATURE_AUDIO_MAP: Record<string, any> = {
  'birds': birds,
  'snow': snow,
  'night': night,
  'forest-night': forest,
  'wind': wind,
  'leaves': leaves,
};
const WATER_AUDIO_MAP: Record<string, any> = {
  'sea': ocean,
  'lake-shore': shore,
  'waves-3d': river,
  'waterfall': lake,
  'sea-shore': waterfall,
  'beach': underwater,
};

const H_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 3;

type SoundTileProps = {
  item: SoundItem;
  size: number;
  selected: boolean;
  onPress: (id: string) => void;
  locked?: boolean;
  style?: any;
};

const RAIN_AUDIO_MAP: Record<string, any> = {
  'heavy-rain': heavyRain,
  'light-rain': lightRain,
  'thunder-rain': thunderRain,
  'forrest-rain': forrestRain,
  'car-rain': carRain,
  'roof-rain': roofRain,
};

const NOISE_AUDIO_MAP: Record<string, any> = {
  'white-noise': whiteNoise,
  'brown-noise': brownNoise,
  'blue-noise': blueNoise,
  'alpha-waves': alphaWaves,
  'beta-waves': betaWaves,
  'theta-waves': thetaWaves,
  '285-hz': hz285,
  '432-hz': hz432,
  '528-hz': hz528,
};

const BAR_COUNT = 5;
// ...existing code...
const SoundTile: React.FC<SoundTileProps> = ({ item, size, selected, onPress, locked, style }) => {
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

  // Robust local/remote image resolver
  // IMAGE_MAP must be imported from constants/sounds
  // If not imported, add: import { IMAGE_MAP } from '../../constants/sounds';
  const imgSource = typeof item.image !== 'string'
    ? item.image
    : item.image.startsWith('http')
      ? { uri: item.image }
      : IMAGE_MAP[item.id];

  return (
    <Pressable
      onPress={() => !locked && onPress(item.id)}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size },
        selected && { borderColor: '#FFD59E', borderWidth: 2 },
        locked && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      hitSlop={8}
      disabled={locked}
    >
      <ImageBackground
        source={imgSource}
        style={styles.tileBg}
        imageStyle={styles.tileBgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
          style={styles.tileOverlay}
        />
        {locked && (
          <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
            {/* Lock icon overlay */}
            <Text style={{ fontSize: 22, color: '#FFD59E', textShadowColor: '#804b2cff', textShadowRadius: 4 }}>🔒</Text>
          </View>
        )}
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
    const isNoise = Object.keys(NOISE_AUDIO_MAP).includes(id);
    const isWater = Object.keys(WATER_AUDIO_MAP).includes(id);
    const isFire = Object.keys(FIRE_AUDIO_MAP).includes(id);
    const isNature = Object.keys(NATURE_AUDIO_MAP).includes(id);
    if (audio.selectedIds.includes(id)) {
      audio.stop(id);
    } else {
      if (isRain) {
        audio.play(id, RAIN_AUDIO_MAP[id]);
      } else if (isNoise) {
        audio.play(id, NOISE_AUDIO_MAP[id]);
      } else if (isWater) {
        audio.play(id, WATER_AUDIO_MAP[id]);
      } else if (isFire) {
        audio.play(id, FIRE_AUDIO_MAP[id]);
      } else if (isNature) {
        audio.play(id, NATURE_AUDIO_MAP[id]);
      } else {
        // For non-audio tiles, toggle selection
        audio.setSelectedIds([...audio.selectedIds, id]);
      }
    }
    Haptics.selectionAsync();
  };

  // Get plan type from Supabase (fallback to AsyncStorage)
  const [planType, setPlanType] = React.useState('free');
  React.useEffect(() => {
    (async () => {
      let plan = 'free';
      try {
        const { data: userData, error: userError } = await import('../../lib/supabase').then(m => m.default.auth.getUser());
        if (!userError && userData?.user?.id) {
          const { data, error } = await import('../../lib/supabase').then(m => m.default
            .from('profiles')
            .select('subscription_plan')
            .eq('user_id', userData.user.id)
            .single());
          if (!error && data) {
            plan = (data.subscription_plan || 'free').trim().toLowerCase();
            await AsyncStorage.setItem('profile.subscription_plan', plan);
          }
        }
      } catch {}
      if (!plan) {
        plan = (await AsyncStorage.getItem('profile.subscription_plan')) || 'free';
      }
      setPlanType(plan.trim().toLowerCase());
    })();
  }, []);

  const sections = SOUND_SECTIONS.map(section => {
    // Split into rows
    const rows = Array.from({ length: Math.ceil(section.data.length / NUM_COLUMNS) }, (_, i) =>
      section.data.slice(i * NUM_COLUMNS, i * NUM_COLUMNS + NUM_COLUMNS)
    );
    // Show all rows
    return {
      ...section,
      data: rows,
    };
  });

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#804b2cff', '#FFD59E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
  <Header title="Sounds" />
  <View style={{ height: 0 }} />
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
          // Gate second and third row for free users
          const isSecondRow = index === 1;
          const isThirdRow = index === 2;
          const locked = planType === 'free' && (isSecondRow || isThirdRow);
          return (
            <View
              style={{
                flexDirection: 'row',
                gap: GAP,
                marginBottom: isLastRow ? GAP * 3 : GAP,
              }}
            >
              {item.map((sound: SoundItem, i) => (
                <SoundTile
                  key={sound.id}
                  item={sound}
                  size={TILE_SIZE}
                  selected={audio.selectedIds.includes(sound.id)}
                  onPress={handleTilePress}
                  locked={locked}
                  // Add extra bottom radius for last row
                  style={isLastRow ? { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 } : undefined}
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
          paddingTop: 25,
          paddingBottom: 32 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: TILE_SIZE + GAP,
          offset: (TILE_SIZE + GAP) * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingTop: 10,
    marginBottom: 2,
    position: 'relative',
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.13)',
    marginHorizontal: -16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
  sectionHeader: { backgroundColor: 'transparent', paddingVertical: 6 },
  sectionHeaderText: { color: '#fff', fontSize: 19, fontWeight: '700', paddingLeft: 2 },
  tile: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#804b2cff',
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
    backgroundColor: '#FFD59E',
  },
});
