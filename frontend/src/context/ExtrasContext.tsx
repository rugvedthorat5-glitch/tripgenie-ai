import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { userKey } from '../utils/storageKeys';
import { useAuth } from './AuthContext';

export type Review = { id: string; destId: string; author: string; rating: number; text: string; date: string };
export type Notif = { id: string; title: string; body: string; date: string; read: boolean };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function save(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

type State = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  reviews: Review[];
  reviewsFor: (destId: string) => Review[];
  addReview: (destId: string, author: string, rating: number, text: string) => void;
  notifications: Notif[];
  unread: number;
  addNotification: (title: string, body: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
  checks: Record<string, string[]>;
  toggleCheck: (tripId: string, item: string) => void;
};

const Ctx = createContext<State | null>(null);

export function ExtrasProvider({ children }: { children: React.ReactNode }) {
  const { user, demo, ready } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [checks, setChecks] = useState<Record<string, string[]>>({});

  const keys = useMemo(
    () => ({
      favs: userKey(user?.id, 'favs'),
      reviews: userKey(user?.id, 'reviews'),
      notifs: userKey(user?.id, 'notifs'),
      checks: userKey(user?.id, 'checks'),
    }),
    [user?.id]
  );

  useEffect(() => {
    if (!ready || !user) {
      setFavorites([]);
      setReviews([]);
      setNotifications([]);
      setChecks({});
      return;
    }

    (async () => {
      try {
        const [f, r, n, c] = await Promise.all([
          AsyncStorage.getItem(keys.favs),
          AsyncStorage.getItem(keys.reviews),
          AsyncStorage.getItem(keys.notifs),
          AsyncStorage.getItem(keys.checks),
        ]);
        if (f) setFavorites(JSON.parse(f));
        else setFavorites([]);
        if (r) setReviews(JSON.parse(r));
        else setReviews([]);
        if (c) setChecks(JSON.parse(c));
        else setChecks({});
        if (n) {
          setNotifications(JSON.parse(n));
        } else {
          const now = new Date().toISOString();
          const seed: Notif[] = [
            {
              id: 'n1',
              title: 'Welcome to TripGenie AI',
              body: 'Set your travel preferences to get personalised recommendations.',
              date: now,
              read: false,
            },
            {
              id: 'n2',
              title: 'Tip: try the AI planner',
              body: 'Pick a destination, days and budget to get a full itinerary in seconds.',
              date: now,
              read: false,
            },
          ];
          setNotifications(seed);
          save(keys.notifs, seed);
        }

        if (!demo) {
          try {
            const [favRes, notifRes] = await Promise.all([
              api.get('/favorites'),
              api.get('/notifications'),
            ]);
            if (Array.isArray(favRes.data?.favorites)) {
              setFavorites(favRes.data.favorites);
              save(keys.favs, favRes.data.favorites);
            }
            if (Array.isArray(notifRes.data?.notifications)) {
              setNotifications(notifRes.data.notifications);
              save(keys.notifs, notifRes.data.notifications);
            }
          } catch {
            // offline
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [ready, user?.id, demo, keys]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((cur) => {
        const adding = !cur.includes(id);
        const next = adding ? [...cur, id] : cur.filter((x) => x !== id);
        save(keys.favs, next);
        if (!demo) {
          if (adding) api.post(`/favorites/${id}`).catch(() => undefined);
          else api.delete(`/favorites/${id}`).catch(() => undefined);
        }
        return next;
      });
    },
    [keys.favs, demo]
  );

  const addReview = useCallback(
    (destId: string, author: string, rating: number, text: string) => {
      const local: Review = { id: uid(), destId, author, rating, text, date: new Date().toISOString() };
      setReviews((cur) => {
        const next = [local, ...cur];
        save(keys.reviews, next);
        return next;
      });
      if (!demo) {
        api.post(`/reviews/${destId}`, { rating, text }).catch(() => undefined);
      }
    },
    [keys.reviews, demo]
  );

  const reviewsFor = useCallback((destId: string) => reviews.filter((r) => r.destId === destId), [reviews]);

  const addNotification = useCallback(
    (title: string, body: string) => {
      setNotifications((cur) => {
        const next = [{ id: uid(), title, body, date: new Date().toISOString(), read: false }, ...cur].slice(0, 50);
        save(keys.notifs, next);
        return next;
      });
      if (!demo) api.post('/notifications', { title, body }).catch(() => undefined);
    },
    [keys.notifs, demo]
  );

  const markAllRead = useCallback(() => {
    setNotifications((cur) => {
      const next = cur.map((n) => ({ ...n, read: true }));
      save(keys.notifs, next);
      return next;
    });
    if (!demo) api.post('/notifications/read-all').catch(() => undefined);
  }, [keys.notifs, demo]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((cur) => {
        const next = cur.map((n) => (n.id === id ? { ...n, read: true } : n));
        save(keys.notifs, next);
        return next;
      });
      if (!demo) api.patch(`/notifications/${id}/read`).catch(() => undefined);
    },
    [keys.notifs, demo]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    save(keys.notifs, []);
    if (!demo) api.delete('/notifications').catch(() => undefined);
  }, [keys.notifs, demo]);

  const toggleCheck = useCallback(
    (tripId: string, item: string) => {
      setChecks((cur) => {
        const list = cur[tripId] ?? [];
        const nextList = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
        const next = { ...cur, [tripId]: nextList };
        save(keys.checks, next);
        if (!demo) {
          api.put(`/trips/${tripId}`, { packingChecks: nextList }).catch(() => undefined);
        }
        return next;
      });
    },
    [keys.checks, demo]
  );

  const unread = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      reviews,
      reviewsFor,
      addReview,
      notifications,
      unread,
      addNotification,
      markAllRead,
      markRead,
      clearNotifications,
      checks,
      toggleCheck,
    }),
    [
      favorites,
      toggleFavorite,
      reviews,
      reviewsFor,
      addReview,
      notifications,
      unread,
      addNotification,
      markAllRead,
      markRead,
      clearNotifications,
      checks,
      toggleCheck,
    ]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExtras() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useExtras must be used inside ExtrasProvider');
  return c;
}
