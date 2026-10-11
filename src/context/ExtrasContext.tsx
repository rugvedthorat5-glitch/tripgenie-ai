import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Review = { id: string; destId: string; author: string; rating: number; text: string; date: string };
export type Notif = { id: string; title: string; body: string; date: string; read: boolean };

const KEYS = { favs: 'tg_favs', reviews: 'tg_reviews', notifs: 'tg_notifs', checks: 'tg_checks' };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function save(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: state still works in memory
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
  clearNotifications: () => void;
  checks: Record<string, string[]>;
  toggleCheck: (tripId: string, item: string) => void;
};

const Ctx = createContext<State | null>(null);

export function ExtrasProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [checks, setChecks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const [f, r, n, c] = await Promise.all([
          AsyncStorage.getItem(KEYS.favs),
          AsyncStorage.getItem(KEYS.reviews),
          AsyncStorage.getItem(KEYS.notifs),
          AsyncStorage.getItem(KEYS.checks),
        ]);
        if (f) setFavorites(JSON.parse(f));
        if (r) setReviews(JSON.parse(r));
        if (c) setChecks(JSON.parse(c));
        if (n) {
          setNotifications(JSON.parse(n));
        } else {
          const now = new Date().toISOString();
          const seed: Notif[] = [
            { id: 'n1', title: 'Welcome to TripGenie AI 🎉', body: 'Set your travel preferences to get personalised recommendations.', date: now, read: false },
            { id: 'n2', title: 'Tip: try the AI planner', body: 'Pick a destination, days and budget to get a full itinerary in seconds.', date: now, read: false },
          ];
          setNotifications(seed);
          save(KEYS.notifs, seed);
        }
      } catch {
        // ignore corrupted storage
      }
    })();
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      save(KEYS.favs, next);
      return next;
    });
  }, []);

  const addReview = useCallback((destId: string, author: string, rating: number, text: string) => {
    setReviews((cur) => {
      const next = [{ id: uid(), destId, author, rating, text, date: new Date().toISOString() }, ...cur];
      save(KEYS.reviews, next);
      return next;
    });
  }, []);

  const reviewsFor = useCallback((destId: string) => reviews.filter((r) => r.destId === destId), [reviews]);

  const addNotification = useCallback((title: string, body: string) => {
    setNotifications((cur) => {
      const next = [{ id: uid(), title, body, date: new Date().toISOString(), read: false }, ...cur].slice(0, 50);
      save(KEYS.notifs, next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((cur) => {
      const next = cur.map((n) => ({ ...n, read: true }));
      save(KEYS.notifs, next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    save(KEYS.notifs, []);
  }, []);

  const toggleCheck = useCallback((tripId: string, item: string) => {
    setChecks((cur) => {
      const list = cur[tripId] ?? [];
      const nextList = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      const next = { ...cur, [tripId]: nextList };
      save(KEYS.checks, next);
      return next;
    });
  }, []);

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
      clearNotifications,
      checks,
      toggleCheck,
    }),
    [favorites, toggleFavorite, reviews, reviewsFor, addReview, notifications, unread, addNotification, markAllRead, clearNotifications, checks, toggleCheck]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExtras() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useExtras must be used inside ExtrasProvider');
  return c;
}
