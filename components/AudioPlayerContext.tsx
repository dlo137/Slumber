import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type AudioPlayerState = {
  selectedIds: string[];
  isPlaying: boolean;
  play: (id: string, source: any, volume?: number) => void;
  pause: (id: string) => void;
  stop: (id: string) => void;
  stopAll: () => void;
  forceStopAll: () => Promise<void>;
  setVolume: (id: string, volume: number) => Promise<void>;
  toggle: (id: string, source: any) => void;
  setSleepTimer: (ms: number) => void;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  playAll: () => Promise<void>;
  pauseAll: () => Promise<void>;
  setSelectedIds: (ids: string[]) => void;
};
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // ...existing code...




  // ...



const AudioPlayerContext = createContext<AudioPlayerState | undefined>(undefined);

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Allow external restoration of selected sound IDs
  const setSelectedIdsExternal = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);
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

  const play = useCallback(
    async (id: string, source: any, volume?: number) => {
      if (soundRefs.current[id]) {
        if (typeof volume === 'number') {
          await soundRefs.current[id].setVolumeAsync(volume);
        }
        await soundRefs.current[id].playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, shouldPlay: false });
        soundRefs.current[id] = sound;
        if (typeof volume === 'number') {
          await sound.setVolumeAsync(volume);
        }
        await sound.playAsync();
      }
      setSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id]);
      setIsPlaying(true);
      Haptics.selectionAsync();
    }, []);

  const pauseSound = useCallback(async (id: string) => {
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
      pauseSound(id);
    } else {
      play(id, source);
    }
  }, [selectedIds, play, pauseSound]);

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

  // --- Helpers for Mixer ---
  // Define as plain functions in the correct closure, just before return
  const remove = useCallback(async (id: string) => {
    try {
      await stop(id);
    } catch {
      // fallback: forcibly remove from refs and selectedIds
      if (soundRefs.current[id]) {
        try {
          await soundRefs.current[id].stopAsync();
          await soundRefs.current[id].unloadAsync();
        } catch {}
        delete soundRefs.current[id];
      }
      setSelectedIds((prev: string[]) => prev.filter((x) => x !== id));
    }
  }, [stop]);

  const clearAll = useCallback(() => {
    return stopAll();
  }, [stopAll]);

  // Play all selected sounds, requires a mapping of id to source
  const playAll = useCallback(async (sourceMap?: Record<string, any>) => {
    for (const id of selectedIds) {
      const source = sourceMap?.[id];
      if (soundRefs.current[id]) {
        await soundRefs.current[id].playAsync();
      } else if (source) {
        const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, shouldPlay: false });
        soundRefs.current[id] = sound;
        await sound.playAsync();
      }
    }
    setIsPlaying(true);
    Haptics.selectionAsync();
  }, [selectedIds]);

  // Pause all selected sounds
  const pauseAll = useCallback(async () => {
    for (const id of selectedIds) {
      if (soundRefs.current[id]) {
        await soundRefs.current[id].pauseAsync();
      }
    }
    setIsPlaying(false);
    Haptics.selectionAsync();
  }, [selectedIds]);

  return (
  <AudioPlayerContext.Provider value={{ selectedIds, isPlaying, play, pause: pauseSound, stop, stopAll, forceStopAll, setVolume, toggle, setSleepTimer, remove, clearAll, playAll, pauseAll, setSelectedIds: setSelectedIdsExternal }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
