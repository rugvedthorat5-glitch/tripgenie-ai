import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, isNetworkError } from '../services/api';
import { Trip } from '../types';
import { userKey } from '../utils/storageKeys';
import { useAuth } from './AuthContext';

type TripsState = {
  trips: Trip[];
  loading: boolean;
  addTrip: (t: Trip) => Promise<Trip>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  getTrip: (id: string) => Trip | undefined;
  refresh: () => Promise<void>;
};

const Ctx = createContext<TripsState | null>(null);

function normalize(t: Trip): Trip {
  return {
    ...t,
    id: String(t.id),
    colors: (t.colors?.length === 2 ? t.colors : ['#14B8C4', '#0E7C86']) as [string, string],
  };
}

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const { user, demo, ready } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const storageKey = userKey(user?.id, 'trips');

  const persistLocal = useCallback(
    async (next: Trip[]) => {
      setTrips(next);
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // keep in memory
      }
    },
    [storageKey]
  );

  const refresh = useCallback(async () => {
    if (!user || demo) return;
    setLoading(true);
    try {
      const res = await api.get('/trips');
      const list = (res.data?.trips || []).map(normalize);
      await persistLocal(list);
    } catch (err) {
      if (!isNetworkError(err)) console.warn('trips refresh', err);
    } finally {
      setLoading(false);
    }
  }, [user, demo, persistLocal]);

  useEffect(() => {
    if (!ready || !user) {
      setTrips([]);
      return;
    }
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) setTrips(JSON.parse(raw).map(normalize));
        else setTrips([]);
      } catch {
        setTrips([]);
      }
      if (!demo) refresh();
    })();
  }, [ready, user?.id, demo, storageKey, refresh]);

  const addTrip = useCallback(
    async (t: Trip) => {
      let saved = normalize(t);
      if (!demo && user) {
        try {
          const res = await api.post('/trips', { ...saved, saved: true });
          if (res.data?.trip) saved = normalize({ ...saved, ...res.data.trip, saved: true });
        } catch {
          // offline: keep local
        }
      }
      await persistLocal([saved, ...trips.filter((x) => x.id !== saved.id)]);
      return saved;
    },
    [demo, user, trips, persistLocal]
  );

  const updateTrip = useCallback(
    async (id: string, patch: Partial<Trip>) => {
      const next = trips.map((t) => (t.id === id ? normalize({ ...t, ...patch }) : t));
      await persistLocal(next);
      if (!demo) api.put(`/trips/${id}`, patch).catch(() => undefined);
    },
    [trips, persistLocal, demo]
  );

  const toggleSaved = useCallback(
    async (id: string) => {
      const t = trips.find((x) => x.id === id);
      if (!t) return;
      const saved = !t.saved;
      await updateTrip(id, { saved });
      if (!demo && saved) {
        api.post('/trips', { ...t, saved: true }).catch(() => undefined);
      }
    },
    [trips, updateTrip, demo]
  );

  const removeTrip = useCallback(
    async (id: string) => {
      await persistLocal(trips.filter((t) => t.id !== id));
      if (!demo) api.delete(`/trips/${id}`).catch(() => undefined);
    },
    [persistLocal, trips, demo]
  );

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const value = useMemo(
    () => ({ trips, loading, addTrip, updateTrip, toggleSaved, removeTrip, getTrip, refresh }),
    [trips, loading, addTrip, updateTrip, toggleSaved, removeTrip, getTrip, refresh]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrips() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTrips must be used inside TripsProvider');
  return c;
}
