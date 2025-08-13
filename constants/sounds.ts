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
  { id: 'heavy-rain', title: 'Heavy Rain', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=800', category: 'Rain' },
  { id: 'light-rain', title: 'Light Rain', image: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?q=80&w=800', category: 'Rain' },
  { id: 'thunder-rain', title: 'Thunder Rain', image: 'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=80&w=800', category: 'Rain' },
  { id: 'forrest-rain', title: 'Forest Rain', image: 'https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?q=80&w=800', category: 'Rain' },
  { id: 'car-rain', title: 'Car Rain', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', category: 'Rain' },
  { id: 'roof-rain', title: 'Roof Rain', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800', category: 'Rain' },
    ],
  },
  {
    title: 'Water',
    emoji: '💧',
    data: [
  { id: 'sea', title: 'Sea', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'waves-3d', title: 'Waves 3D', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'ocean-waves', title: 'Ocean Waves', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'sea-shore', title: 'Sea Shore', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'lake-shore', title: 'Lake Shore', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'waterfall', title: 'Waterfall', image: 'https://images.unsplash.com/photo-1505461791122-2b1b7b3a60b0?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'beach', title: 'Beach', image: 'https://images.unsplash.com/photo-1501959915551-4e8a04a3d0c5?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'river-flow', title: 'River Flow', image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80', category: 'Water' },
  { id: 'sprinklers', title: 'Sprinklers', image: 'https://images.unsplash.com/photo-1532634896-26909d0d4b6a?auto=format&fit=crop&w=800&q=80', category: 'Water' },
    ],
  },
  {
    title: 'Noise',
    emoji: '💥',
    data: [
      { id: 'fan-noise', title: 'Fan Noise', image: 'https://images.unsplash.com/photo-1595436252086-2349e0fbc972?q=80&w=800', category: 'Noise' },
      { id: 'airplane-cabin', title: 'Airplane Cabin', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800', category: 'Noise' },
      { id: 'pedestal-fan', title: 'Pedestal Fan', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Noise' },
      { id: 'ac', title: 'Air Conditioner', image: 'https://images.unsplash.com/photo-1627398242454-45e6f04aaa02?q=80&w=800', category: 'Noise' },
      { id: 'white-noise', title: 'White Noise', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800', category: 'Noise' },
      { id: 'pink-noise', title: 'Pink Noise', image: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=800', category: 'Noise' },
      { id: 'violet-noise', title: 'Violet Noise', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5c?q=80&w=800', category: 'Noise' },
      { id: 'brown-noise', title: 'Brown Noise', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800', category: 'Noise' },
      { id: 'blue-noise', title: 'Blue Noise', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5c?q=80&w=800', category: 'Noise' },
      { id: 'binaural-beats', title: 'Binaural Beats', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800', category: 'Noise' },
      { id: 'delta-waves', title: 'Delta Waves', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Noise' },
      { id: 'beta-waves', title: 'Beta Waves', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Noise' },
    ],
  },
  {
    title: 'Fire',
    emoji: '🔥',
    data: [
      { id: 'campfire', title: 'Campfire', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800', category: 'Fire' },
      { id: 'fireside', title: 'Fireside', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800', category: 'Fire' },
      { id: 'fireplace', title: 'Fireplace', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5c?q=80&w=800', category: 'Fire' },
    ],
  },
  {
    title: 'ASMR',
    emoji: '👂',
    data: [
      { id: 'whisper-asmr', title: 'Whisper ASMR', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'ASMR' },
      { id: 'keyboard', title: 'Keyboard', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'ASMR' },
      { id: 'partner-asmr', title: 'Partner ASMR', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'ASMR' },
      { id: 'clock-ticking', title: 'Clock Ticking', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'ASMR' },
      { id: 'heartbeat', title: 'Heartbeat', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'ASMR' },
    ],
  },
  {
    title: 'Nature',
    emoji: '🌲',
    data: [
      { id: 'forest-night', title: 'Forest Night', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=800', category: 'Nature' },
      { id: 'birds', title: 'Birds', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Nature' },
      { id: 'wind-in-trees', title: 'Wind in Trees', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Nature' },
      { id: 'crickets', title: 'Crickets', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=800', category: 'Nature' },
    ],
  },
];
