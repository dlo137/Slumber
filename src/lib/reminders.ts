import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const IDS_KEY = 'bedtime.notificationIds';
const DAY_INDEX_TO_EXPO = [1, 2, 3, 4, 5, 6, 7]; // Sun..Sat (Expo/iOS use 1=Sun)
const DAY_LETTERS = ['S','M','T','W','T','F','S']; // your UI order

function parseHHmm(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h ?? 22, minute: m ?? 0 };
}

export async function cancelBedtimeReminders() {
  try {
    const raw = await AsyncStorage.getItem(IDS_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {}
  await AsyncStorage.removeItem(IDS_KEY);
}

export async function scheduleBedtimeReminders(timeHHmm: string, selectedDays: string[]) {
  await cancelBedtimeReminders();
  const { hour, minute } = parseHHmm(timeHHmm);
  const weekdays: number[] = selectedDays
    .map((letter, idx) => (letter ? DAY_INDEX_TO_EXPO[idx] : 0))
    .filter(Boolean) as number[];
  const ids: string[] = [];
  for (const weekday of weekdays) {
    if (Platform.OS === 'ios') {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Bedtime reminder',
          body: 'Wind down now so you sleep great tonight.',
          sound: 'default',
          data: { target: '/mixer' },
        },
        trigger: { weekday, hour, minute, repeats: true },
      });
      ids.push(id);
      continue;
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bedtime reminder',
        body: 'Wind down now so you sleep great tonight.',
        sound: 'default',
        data: { target: '/mixer' },
      },
      trigger: {
        channelId: 'bedtime-reminders',
        weekday,
        hour,
        minute,
        repeats: true,
      } as any,
    });
    ids.push(id);
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
}
