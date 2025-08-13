import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type MixItem = {
  id: string;
  title: string;
  soundIds: string[];
  volumes: Record<string, number>;
  tracks: Array<{
    id: string;
    title: string;
    image: string;
    volume: number;
    category: string;
  }>;
};

interface DataStoreContextType {
  items: MixItem[];
  addItem: (item: MixItem) => void;
  removeItem: (id: string) => void;
  hydrated: boolean;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

const FAVORITES_KEY = 'user_favorite_mixes';

export const DataStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MixItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        setItems(stored ? JSON.parse(stored) : []);
      } catch {
        setItems([]);
      }
      setHydrated(true);
    };
    load();
  }, []);

  const addItem = async (item: MixItem) => {
    const newItems = [...items, item];
    setItems(newItems);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newItems));
  };

  const removeItem = async (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newItems));
  };

  return (
    <DataStoreContext.Provider value={{ items, addItem, removeItem, hydrated }}>
      {children}
    </DataStoreContext.Provider>
  );
};

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within a DataStoreProvider');
  return ctx;
}
