// Install: expo install expo-linear-gradient react-native-safe-area-context @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioPlayerProvider, useAudioPlayer } from '../../components/AudioPlayerContext';
import { MiniPlayerBar } from '../../components/MiniPlayerBar';


function TabLayoutInner() {
  const insets = useSafeAreaInsets();
  const audio = useAudioPlayer();
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
      <MiniPlayerBar
        visible={audio.selectedIds && audio.selectedIds.length > 0}
        playing={audio.isPlaying}
        onPlayPause={() => {
          if (audio.selectedIds.length > 0) {
            const id = audio.selectedIds[0];
            // Only rain sounds are supported for now
            const RAIN_AUDIO_MAP = {
              'heavy-rain': require('../../assets/sounds/rain/heavy-rain.mp3'),
              'light-rain': require('../../assets/sounds/rain/light-rain.mp3'),
              'thunder-rain': require('../../assets/sounds/rain/thunder-rain.mp3'),
              'forrest-rain': require('../../assets/sounds/rain/forrest-rain.mp3'),
              'car-rain': require('../../assets/sounds/rain/car-rain.mp3'),
              'roof-rain': require('../../assets/sounds/rain/roof-rain.mp3'),
            };
            audio.toggle(id, RAIN_AUDIO_MAP[id as keyof typeof RAIN_AUDIO_MAP]);
          }
        }}
        onOptions={() => {}}
        onTimer={() => {}}
        showBadge={true}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <AudioPlayerProvider>
      <TabLayoutInner />
    </AudioPlayerProvider>
  );
}
