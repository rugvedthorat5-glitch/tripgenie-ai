import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { destinations as base, setRegistry } from '../data/destinations';
import { api } from '../services/api';
import { Destination } from '../types';
import { useAuth } from './AuthContext';
import { isAdmin } from '../utils/roles';

const CUSTOM_KEY = 'tg_custom_dests';
const HIDDEN_KEY = 'tg_hidden_dests';

type State = {
  destinations: Destination[];
  allDestinations: Destination[];
  customIds: string[];
  hiddenIds: string[];
  hiddenCount: number;
  addDestination: (d: Destination) => Promise<void>;
  updateDestination: (id: string, patch: Partial<Destination>) => Promise<void>;
  removeDestination: (id: string) => Promise<void>;
  unhideDestination: (id: string) => Promise<void>;
  resetCatalog: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<State | null>(null);

function normalize(d: Destination & { id?: string; slug?: string }): Destination {
  const id = d.id || (d as { slug?: string }).slug || '';
  return {
    ...d,
    id,
    colors: (d.colors?.length === 2 ? d.colors : ['#14B8C4', '#0E7C86']) as [string, string],
  };
}

export function DestinationsProvider({ children }: { children: React.ReactNode }) {
  const { demo, user } = useAuth();
  const admin = isAdmin(user?.email, user?.role);
  const [remote, setRemote] = useState<Destination[] | null>(null);
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

  const refresh = useCallback(async () => {
    try {
      const res = await api.get(admin ? '/destinations?all=1' : '/destinations', { timeout: 8000 });
      const list = (res.data?.destinations || []).map(normalize);
      if (list.length) setRemote(list);
    } catch {
      // keep local catalog
    }
  }, [admin]);

  useEffect(() => {
    refresh();
  }, [refresh, user?.id]);

  const allDestinations = useMemo(() => {
    const catalog = remote ?? base;
    const byId = new Map<string, Destination>();
    [...catalog, ...custom].forEach((d) => byId.set(d.id, d));
    const list = Array.from(byId.values());
    setRegistry(list);
    return list;
  }, [remote, custom]);

  const destinations = useMemo(
    () => allDestinations.filter((d) => !hidden.includes(d.id) && !d.hidden),
    [allDestinations, hidden]
  );

  const store = async (key: string, v: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(v));
    } catch {
      // ignore
    }
  };

  const addDestination = useCallback(
    async (d: Destination) => {
      const next = [...custom, d];
      setCustom(next);
      await store(CUSTOM_KEY, next);

      if (!demo && admin) {
        try {
          await api.post('/destinations', {
            name: d.name,
            region: d.region,
            country: d.country,
            lat: d.lat,
            lon: d.lon,
            emoji: d.emoji,
            imageUrl: d.imageUrl,
            colors: d.colors,
            tags: d.tags,
            bestSeason: d.bestSeason,
            avgDailyCost: d.avgDailyCost,
            description: d.description,
            highlights: d.highlights,
            climate: d.climate,
            slug: d.id,
          });
          await refresh();
        } catch {
          // keep local custom
        }
      }
    },
    [custom, demo, admin, refresh]
  );

  const updateDestination = useCallback(
    async (id: string, patch: Partial<Destination>) => {
      if (custom.some((d) => d.id === id)) {
        const next = custom.map((d) => (d.id === id ? { ...d, ...patch } : d));
        setCustom(next);
        await store(CUSTOM_KEY, next);
      } else if (remote) {
        setRemote(remote.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      }
      if (!demo && admin) {
        try {
          await api.put(`/destinations/${id}`, patch);
          await refresh();
        } catch {
          // local already updated
        }
      }
    },
    [custom, remote, demo, admin, refresh]
  );

  const removeDestination = useCallback(
    async (id: string) => {
      if (custom.some((d) => d.id === id)) {
        const next = custom.filter((d) => d.id !== id);
        setCustom(next);
        await store(CUSTOM_KEY, next);
      } else {
        const next = [...new Set([...hidden, id])];
        setHidden(next);
        await store(HIDDEN_KEY, next);
      }
      if (!demo && admin) {
        api.patch(`/destinations/${id}/visibility`, { hidden: true }).catch(() => undefined);
      }
    },
    [custom, hidden, demo, admin]
  );

  const unhideDestination = useCallback(
    async (id: string) => {
      const next = hidden.filter((x) => x !== id);
      setHidden(next);
      await store(HIDDEN_KEY, next);
      if (remote) {
        setRemote(remote.map((d) => (d.id === id ? { ...d, hidden: false } : d)));
      }
      if (!demo && admin) {
        try {
          await api.patch(`/destinations/${id}/visibility`, { hidden: false });
          await refresh();
        } catch {
          // local already updated
        }
      }
    },
    [hidden, remote, demo, admin, refresh]
  );

  const resetCatalog = useCallback(async () => {
    setCustom([]);
    setHidden([]);
    await AsyncStorage.multiRemove([CUSTOM_KEY, HIDDEN_KEY]).catch(() => undefined);
    if (!demo && admin) {
      // unhide all remote destinations
      const all = remote || [];
      await Promise.all(
        all
          .filter((d) => d.hidden)
          .map((d) => api.patch(`/destinations/${d.id}/visibility`, { hidden: false }).catch(() => undefined))
      );
    }
    await refresh();
  }, [refresh, demo, admin, remote]);

  const value = useMemo(
    () => ({
      destinations,
      allDestinations,
      customIds: custom.map((d) => d.id),
      hiddenIds: [
        ...hidden,
        ...allDestinations.filter((d) => d.hidden).map((d) => d.id),
      ].filter((v, i, a) => a.indexOf(v) === i),
      hiddenCount: hidden.length + allDestinations.filter((d) => d.hidden && !hidden.includes(d.id)).length,
      addDestination,
      updateDestination,
      removeDestination,
      unhideDestination,
      resetCatalog,
      refresh,
    }),
    [
      destinations,
      allDestinations,
      custom,
      hidden,
      addDestination,
      updateDestination,
      removeDestination,
      unhideDestination,
      resetCatalog,
      refresh,
    ]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDestinations() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDestinations must be used inside DestinationsProvider');
  return c;
}
