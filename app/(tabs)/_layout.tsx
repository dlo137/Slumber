// Install: expo install expo-linear-gradient react-native-safe-area-context @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0B0620', '#2D145D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#18123A',
            borderTopWidth: 0,
            height: 64 + insets.bottom,
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#E7E7F7',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="sounds"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes-outline" color={color} size={28} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" color={color} size={28} />
            ),
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={28} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
