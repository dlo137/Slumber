import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ImageBackground, Platform, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SOUND_SECTIONS, SoundItem } from '../../constants/sounds';

const H_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 3;

const SoundTile: React.FC<{ item: SoundItem; size: number }> = ({ item, size }) => (
  <View
    style={[styles.tile, { width: size, height: size }]}
    accessibilityRole="button"
    accessibilityLabel={item.title}
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
      <Text style={styles.tileText} numberOfLines={2}>{item.title}</Text>
    </ImageBackground>
  </View>
);

export default function SoundsScreen() {
  const { width } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const TILE_SIZE = useMemo(
    () => Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS),
    [width]
  );

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
                <SoundTile key={sound.id} item={sound} size={TILE_SIZE} />
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
});
