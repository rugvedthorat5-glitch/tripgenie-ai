import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Trip } from '../types';

const TRIPS_KEY = 'tg_trips';

type TripsState = {
  trips: Trip[];
  addTrip: (t: Trip) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  getTrip: (id: string) => Trip | undefined;
};

const Ctx = createContext<TripsState | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(TRIPS_KEY)
      .then((raw) => raw && setTrips(JSON.parse(raw)))
      .catch(() => undefined);
  }, []);

  const persist = useCallback(async (next: Trip[]) => {
    setTrips(next);
    try {
      await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(next));
    } catch {
      // storage full or unavailable: keep in-memory copy
    }
  }, []);

  const addTrip = useCallback(
    async (t: Trip) => {
      await persist([t, ...trips.filter((x) => x.id !== t.id)]);
    },
    [persist, trips]
  );

  const toggleSaved = useCallback(
    async (id: string) => {
      const next = trips.map((t) => (t.id === id ? { ...t, saved: !t.saved } : t));
      await persist(next);
      const t = next.find((x) => x.id === id);
      if (t?.saved) api.post('/trips', t).catch(() => undefined);
    },
    [persist, trips]
  );

  const removeTrip = useCallback(
    async (id: string) => {
      await persist(trips.filter((t) => t.id !== id));
      api.delete(`/trips/${id}`).catch(() => undefined);
    },
    [persist, trips]
  );

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const value = useMemo(
    () => ({ trips, addTrip, toggleSaved, removeTrip, getTrip }),
    [trips, addTrip, toggleSaved, removeTrip, getTrip]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrips() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTrips must be used inside TripsProvider');
  return c;
}
