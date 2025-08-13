import AsyncStorage from '@react-native-async-storage/async-storage';
const FAVORITES_KEY = 'user_favorite_mixes';

export type FavoriteMix = {
  id: string;
  title: string;
  emojis: string[];
  gradient: [string, string];
  soundIds: string[];
  volumes: Record<string, number>;
  tracks: Array<{ id: string; title: string; image: string; volume: number; category: string }>;
};

export async function getUserMixes(): Promise<FavoriteMix[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try { 
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveMix(mix: FavoriteMix) {
  const mixes = await getUserMixes();
  // Dedup by id
  const next = [...mixes.filter(m => m.id !== mix.id), mix];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

export async function deleteMix(id: string) {
  const mixes = await getUserMixes();
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(mixes.filter(m => m.id !== id)));
}
