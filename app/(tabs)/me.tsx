import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={[styles.center, { paddingBottom: 32 + insets.bottom }]}>
        <Text style={styles.text}>Profile & Settings coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 18, fontWeight: '500', opacity: 0.8 },
});
