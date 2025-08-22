import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from '../components/AudioPlayerContext';

const FADE_OUT_SECS = 6;
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const audio = useAudioPlayer();
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(30);
  const [running, setRunning] = useState(false);
  const [remain, setRemain] = useState(30);
  const timerRef = useRef<number | null>(null);

  // For animated fade-out (optional, not required for logic)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startTimer = async () => {
    Haptics.selectionAsync();
    const total = minute * 60 + second;
    setRemain(total);
    setRunning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    // Cache selectedIds at timer start
    const idsToStop = [...audio.selectedIds];
    let countdown = total;
    timerRef.current = setInterval(async () => {
      countdown -= 1;
      setRemain(countdown);
      if (countdown <= FADE_OUT_SECS && countdown > 0) {
        const vol = Math.max(0, countdown / FADE_OUT_SECS);
        for (const id of idsToStop) {
          await audio.setVolume(id, vol);
        }
      }
      if (countdown <= 0) {
        // Fade out and force stop all
        for (const id of idsToStop) {
          await audio.setVolume(id, 0);
        }
  await audio.forceStopAll(); // this already clears selectedIds + isPlaying
  if (timerRef.current) clearInterval(timerRef.current);
  setRunning(false);
  router.back();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setRemain(minute * 60 + second); // Optionally reset to original value
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // UI
  return (
    <LinearGradient
      colors={['#804b2cff', '#FFD59E']}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={[styles.safe, { paddingBottom: insets.bottom }]}> 
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <View style={styles.headerCenter}>
            <Ionicons name="time-outline" size={32} color="#fff" style={{ opacity: 0.8 }} />
            <Text style={styles.title}>Timer</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </View>
        {!running ? (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              <Picker
                selectedValue={minute}
                onValueChange={setMinute}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {MINUTES.map(m => (
                  <Picker.Item key={m} label={m.toString().padStart(2, '0')} value={m} />
                ))}
              </Picker>
              <Text style={styles.colon}>:</Text>
              <Picker
                selectedValue={second}
                onValueChange={setSecond}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {SECONDS.map(s => (
                  <Picker.Item key={s} label={s.toString().padStart(2, '0')} value={s} />
                ))}
              </Picker>
            </View>
          </View>
        ) : (
          <View style={styles.clockContainer}>
            <Text style={styles.clockText}>
              {`${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`}
            </Text>
          </View>
        )}
        <Text style={styles.helper}>Sounds will gently fade out when the time is up</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            running && styles.stopBtn,
            pressed && { opacity: 0.7 }
          ]}
          onPress={running ? stopTimer : startTimer}
        >
          <Text style={[styles.startBtnText, running && styles.stopBtnText]}>
            {running ? 'Stop' : 'Start'}
          </Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16, paddingHorizontal: 16 },
  headerCenter: { flex: 2, alignItems: 'center', opacity: 0.8 },
  closeBtn: { flex: 1, alignItems: 'flex-end' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 },
  pickerContainer: { marginTop: 32, marginBottom: 16, alignItems: 'center', justifyContent: 'center', height: 180 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  picker: {
    width: 90,
    height: 180,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: '#fff',
    fontSize: 22, // Reduce font size to fit
    fontWeight: '600',
    // Remove height to let picker auto-size
  },
  colon: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginHorizontal: 8, opacity: 0.7 },
  helper: { color: '#fff', opacity: 0.7, textAlign: 'center', marginTop: 12, fontSize: 15 },
  startBtn: {
    backgroundColor: '#FFDAB9',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  startBtnText: {
    color: '#18123A',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  stopBtn: {
    backgroundColor: '#FF3B30',
  },
  stopBtnText: {
    color: '#fff',
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  clockText: {
    color: '#fff',
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
