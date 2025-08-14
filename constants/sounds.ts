import type { ImageSourcePropType } from 'react-native';

export type SoundItem = {
  id: string;
  title: string;
  image: string;
  category: 'Rain' | 'Water' | 'Noise' | 'Fire' | 'ASMR' | 'Nature';
};
export type SoundSection = { title: string; emoji: string; data: SoundItem[] };

export const SOUND_SECTIONS: SoundSection[] = [
  {
    title: 'Rain',
    emoji: '🌧️',
    data: [
      { id: 'heavy-rain', title: 'Heavy Rain', image: require('../assets/images/rain/heavy-rain.jpg'), category: 'Rain' },
      { id: 'light-rain', title: 'Light Rain', image: require('../assets/images/rain/light-rain.jpg'), category: 'Rain' },
      { id: 'thunder-rain', title: 'Thunder Rain', image: 'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=80&w=800', category: 'Rain' },
      { id: 'forrest-rain', title: 'Forest Rain', image: require('../assets/images/rain/forrest-rain.jpg'), category: 'Rain' },
      { id: 'car-rain', title: 'Car Rain', image: require('../assets/images/rain/carinrain.jpg'), category: 'Rain' },
      { id: 'roof-rain', title: 'Roof Rain', image: require('../assets/images/rain/roof-rain.jpg'), category: 'Rain' },
    ],
  },
  {
    title: 'Water',
    emoji: '💧',
    data: [
      { id: 'sea', title: 'Ocean', image: require('../assets/images/water/ocean.jpg'), category: 'Water' },
      { id: 'lake-shore', title: 'Shore', image: require('../assets/images/water/shore.jpg'), category: 'Water' },
      { id: 'waves-3d', title: 'River', image: require('../assets/images/water/river.jpg'), category: 'Water' },
      { id: 'waterfall', title: 'Lake', image: require('../assets/images/water/lake.jpg'), category: 'Water' },
      { id: 'sea-shore', title: 'Waterfall', image: require('../assets/images/water/waterfall.jpeg'), category: 'Water' },
      { id: 'beach', title: 'Under Water', image: require('../assets/images/water/under-water.jpg'), category: 'Water' },
    ],
  },
  {
    title: 'Nature',
    emoji: '🌲',
    data: [
      { id: 'birds', title: 'Birds', image: require('../assets/images/nature/birds.jpg'), category: 'Nature' },
      { id: 'snow', title: 'Snow Storm', image: require('../assets/images/nature/snow.jpg'), category: 'Nature' },
      { id: 'night', title: 'Night', image: require('../assets/images/nature/night.webp'), category: 'Nature' },
      { id: 'forest-night', title: 'Forest', image: require('../assets/images/nature/forrest.jpg'), category: 'Nature' },
      { id: 'wind', title: 'Wind', image: require('../assets/images/nature/wind.jpg'), category: 'Nature' },
      { id: 'leaves', title: 'Leaves', image: require('../assets/images/nature/leaves.jpeg'), category: 'Nature' },
    ],
  },
  {
    title: 'Fire',
    emoji: '🔥',
    data: [
      { id: 'campfire', title: 'Campfire', image: require('../assets/images/fire/campfire.jpg'), category: 'Fire' },
      { id: 'fireplace', title: 'Fireplace', image: require('../assets/images/fire/fireplace.jpeg'), category: 'Fire' },
    ],
  },
  {
    title: 'Noise',
    emoji: '💥',
    data: [
  { id: 'white-noise', title: 'White Noise', image: require('../assets/images/noise/white-noise.jpg'), category: 'Noise' },
  { id: 'brown-noise', title: 'Brown Noise', image: require('../assets/images/noise/brown-noise.webp'), category: 'Noise' },
  { id: 'blue-noise', title: 'Blue Noise', image: require('../assets/images/noise/blue-noise.png'), category: 'Noise' },
  { id: 'alpha-waves', title: 'Alpha Waves', image: require('../assets/images/noise/alpha-waves.jpg'), category: 'Noise' },
  { id: 'beta-waves', title: 'Beta Waves', image: require('../assets/images/noise/beta-waves.jpg'), category: 'Noise' },
  { id: 'theta-waves', title: 'Theta Waves', image: require('../assets/images/noise/theta-waves.jpg'), category: 'Noise' },
  { id: '285-hz', title: '285 Hz', image: require('../assets/images/noise/285-hz.jpg'), category: 'Noise' },
  { id: '432-hz', title: '432 Hz', image: require('../assets/images/noise/432-hz.webp'), category: 'Noise' },
  { id: '528-hz', title: '528 Hz', image: require('../assets/images/noise/528-hz.webp'), category: 'Noise' }
    ],
  },
];

export const IMAGE_MAP: Record<string, ImageSourcePropType> = {
  'car-rain': require('../assets/images/rain/carinrain.jpg'),
};
