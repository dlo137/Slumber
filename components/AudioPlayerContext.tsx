import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type AudioPlayerState = {
  selectedIds: string[];
  isPlaying: boolean;
  play: (id: string, source: any) => void;
  pause: (id: string) => void;
  stop: (id: string) => void;
  stopAll: () => void;
  forceStopAll: () => Promise<void>;
  setVolume: (id: string, volume: number) => Promise<void>;
  toggle: (id: string, source: any) => void;
  setSleepTimer: (ms: number) => void;
};
  // ...



const AudioPlayerContext = createContext<AudioPlayerState | undefined>(undefined);

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRefs = useRef<Record<string, Audio.Sound>>({});
  const sleepTimerRef = useRef<any>(null);

  // Force stop all: guarantees all sounds are stopped, selectedIds is cleared, and isPlaying is false
  const setVolume = async (id: string, volume: number) => {
    if (soundRefs.current && soundRefs.current[id]) {
      try {
        await soundRefs.current[id].setVolumeAsync(volume);
      } catch (e) {
        // ignore
      }
    }
  };
  const forceStopAll = useCallback(async () => {
    console.log('[AudioPlayerContext] forceStopAll called');
    await Promise.all(Object.keys(soundRefs.current).map(async (id) => {
      try {
        await soundRefs.current[id].stopAsync();
        await soundRefs.current[id].unloadAsync();
      } catch {}
    }));
    soundRefs.current = {};
    setSelectedIds([]);
    setIsPlaying(false);
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    console.log('[AudioPlayerContext] forceStopAll finished. selectedIds:', [], 'isPlaying:', false);
  }, []);

  const play = useCallback(async (id: string, source: any) => {
    if (soundRefs.current[id]) {
      await soundRefs.current[id].playAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, shouldPlay: true });
      soundRefs.current[id] = sound;
      await sound.playAsync();
    }
    setSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id]);
    setIsPlaying(true);
    Haptics.selectionAsync();
  }, []);

  const pause = useCallback(async (id: string) => {
    if (soundRefs.current[id]) {
      await soundRefs.current[id].pauseAsync();
    }
    // Do NOT remove from selectedIds, just pause
    setIsPlaying(false);
    Haptics.selectionAsync();
  }, []);

  const stop = useCallback(async (id: string) => {
    if (soundRefs.current[id]) {
      await soundRefs.current[id].stopAsync();
      await soundRefs.current[id].unloadAsync();
      delete soundRefs.current[id];
    }
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    Haptics.selectionAsync();
  }, []);

  const stopAll = useCallback(async () => {
    await Promise.all(Object.keys(soundRefs.current).map(async (id) => {
      await soundRefs.current[id].stopAsync();
      await soundRefs.current[id].unloadAsync();
    }));
    soundRefs.current = {};
    setSelectedIds([]);
    setIsPlaying(false);
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    Haptics.selectionAsync();
  }, []);

  // Toggle: if playing, pause; if paused or not started, play
  const toggle = useCallback((id: string, source: any) => {
    if (selectedIds.includes(id)) {
      // If already playing, pause instead of stop
      pause(id);
    } else {
      play(id, source);
    }
  }, [selectedIds, play, pause]);

  const setSleepTimer = useCallback((ms: number) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => {
      stopAll();
    }, ms);
  }, [stopAll]);

  // Cleanup all sounds on unmount
  React.useEffect(() => {
    return () => {
      Object.values(soundRefs.current).forEach(async (sound) => {
        await sound.stopAsync();
        await sound.unloadAsync();
      });
      soundRefs.current = {};
    };
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ selectedIds, isPlaying, play, pause, stop, stopAll, forceStopAll, setVolume, toggle, setSleepTimer }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
