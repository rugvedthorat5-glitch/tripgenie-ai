import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { destinations as base, setRegistry } from '../data/destinations';
import { Destination } from '../types';

const CUSTOM_KEY = 'tg_custom_dests';
const HIDDEN_KEY = 'tg_hidden_dests';

type State = {
  destinations: Destination[]; // visible catalog (base minus hidden, plus custom)
  customIds: string[];
  hiddenCount: number;
  addDestination: (d: Destination) => Promise<void>;
  removeDestination: (id: string) => Promise<void>;
  resetCatalog: () => Promise<void>;
};

const Ctx = createContext<State | null>(null);

export function DestinationsProvider({ children }: { children: React.ReactNode }) {
  const [custom, setCustom] = useState<Destination[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(CUSTOM_KEY), AsyncStorage.getItem(HIDDEN_KEY)])
      .then(([c, h]) => {
        if (c) setCustom(JSON.parse(c));
        if (h) setHidden(JSON.parse(h));
      })
      .catch(() => undefined);
  }, []);

  const destinations = useMemo(() => {
    // Lookup registry keeps hidden items so old trips still resolve.
    setRegistry([...base, ...custom]);
    return [...base.filter((d) => !hidden.includes(d.id)), ...custom];
  }, [custom, hidden]);

  const store = async (key: string, v: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(v));
    } catch {
      // ignore storage errors
    }
  };

  const addDestination = useCallback(
    async (d: Destination) => {
      const next = [...custom, d];
      setCustom(next);
      await store(CUSTOM_KEY, next);
    },
    [custom]
  );

  const removeDestination = useCallback(
    async (id: string) => {
      if (custom.some((d) => d.id === id)) {
        const next = custom.filter((d) => d.id !== id);
        setCustom(next);
        await store(CUSTOM_KEY, next);
      } else {
        const next = [...hidden, id];
        setHidden(next);
        await store(HIDDEN_KEY, next);
      }
    },
    [custom, hidden]
  );

  const resetCatalog = useCallback(async () => {
    setCustom([]);
    setHidden([]);
    await AsyncStorage.multiRemove([CUSTOM_KEY, HIDDEN_KEY]).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      destinations,
      customIds: custom.map((d) => d.id),
      hiddenCount: hidden.length,
      addDestination,
      removeDestination,
      resetCatalog,
    }),
    [destinations, custom, hidden, addDestination, removeDestination, resetCatalog]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDestinations() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDestinations must be used inside DestinationsProvider');
  return c;
}
