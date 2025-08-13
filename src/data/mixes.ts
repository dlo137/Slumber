export type FavoriteMix = {
  id: string;
  title: string;
  emojis: string[];
  gradient: string[];
};

export const SEED_MIXES: FavoriteMix[] = [
  { id: 'rain',     title: 'Rain Therapy',         emojis: ['🌧️','🌊','🎧'], gradient: ['#1F2B6C','#2E0F4F'] },
  { id: 'campfire', title: 'Campfire by the Sea',  emojis: ['🔥','🌊','🎧'], gradient: ['#0F3755','#1D224F'] },
  { id: 'peaceful', title: 'Peaceful Camp Night',  emojis: ['🌙','�','🔥'], gradient: ['#2B5876','#4E4376'] },
  { id: 'cozy',     title: 'Cozy House Ambience',  emojis: ['🔥','☕','🎧'], gradient: ['#1A2980','#26D0CE'] },
];

export const FAVORITES_KEY = 'user_favorite_mixes';
