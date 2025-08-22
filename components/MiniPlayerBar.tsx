import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MiniPlayerBarProps {
  visible: boolean;
  playing: boolean;
  onPlayPause: () => void;
  onOptions: () => void;
  onTimer: () => void;
  showBadge?: boolean;
  accessibilityLabel?: string;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  visible,
  playing,
  onPlayPause,
  onOptions,
  onTimer,
  showBadge = false,
  accessibilityLabel,
}) => {
  console.log('MiniPlayerBar visible:', visible, 'playing:', playing);
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Height of the tab bar (64) + extra margin
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_OFFSET = TAB_BAR_HEIGHT + 44;
  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: BOTTOM_OFFSET,
          left: 24,
          right: 24,
          borderRadius: 40,
          paddingBottom: 0,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityLabel={accessibilityLabel || 'Mini player bar'}
      accessibilityRole="toolbar"
    >
      <Pressable
        style={styles.iconButton}
        onPress={onTimer}
        accessibilityLabel="Sleep timer"
        accessibilityRole="button"
      >
        <Ionicons name="time-outline" size={26} color="#fff" />
      </Pressable>
      <Pressable
        style={styles.iconButton}
        onPress={onPlayPause}
        accessibilityLabel={playing ? 'Pause audio' : 'Play audio'}
        accessibilityRole="button"
      >
        <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={38} color="#FFD600" />
      </Pressable>
      <View style={{ position: 'relative' }}>
        <Pressable
          style={styles.iconButton}
          onPress={onOptions}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
        </Pressable>
        {showBadge && (
          <View style={styles.badge} accessibilityLabel="New options available" />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#804b2cff',
    flexDirection: 'row',
    alignItems: 'center', // Ensures vertical centering
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 0, // Remove extra top padding
    minHeight: 56,
    zIndex: 100,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  iconButton: {
    paddingVertical: 0, // Remove vertical padding
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Fixed height for vertical alignment
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#18123A',
  },
});
