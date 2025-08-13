import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FavoriteMix } from '../data/mixes';

type Props = {
  mix: FavoriteMix;
  onPress?: () => void;
};

const MixCard: React.FC<Props> = ({ mix, onPress }) => (
  <View style={styles.card}>
    <LinearGradient
  colors={mix.gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.overlayShape1} />
    <View style={styles.overlayShape2} />
    <View style={styles.cardContent}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{mix.title}</Text>
        <View style={styles.emojiRow}>
          {mix.emojis.map((emoji, i) => (
            <Text key={i} style={styles.emoji}>{emoji}</Text>
          ))}
        </View>
      </View>
      <View style={styles.iconButton}>
        <Ionicons name="play" size={28} color="#181A2A" />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
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

export default MixCard;
