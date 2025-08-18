import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderProps = {
  title: string;
  style?: object;
};

export const Header: React.FC<HeaderProps> = ({ title, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top + 10 }, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.border} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingBottom: 8,
  },
  border: {
    width: '100%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
});
