import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, errorMessage, isNetworkError, TOKEN_KEY } from '../services/api';
import { Preferences, User } from '../types';
import { GLOBAL_KEYS } from '../utils/storageKeys';

const USER_KEY = GLOBAL_KEYS.user;
const PREFS_KEY = GLOBAL_KEYS.prefs;
const AVATAR_KEY = GLOBAL_KEYS.avatar;

export const defaultPrefs: Preferences = {
  interests: ['Beaches', 'Food'],
  travelStyle: 'Comfort',
  companions: 'Friends',
  climate: 'Any',
};

type AuthState = {
  ready: boolean;
  user: User | null;
  demo: boolean;
  prefs: Preferences;
  avatar: string | null;
  setAvatar: (uri: string | null) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  savePrefs: (p: Preferences) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

/** Clears user-scoped local caches so the next account never sees prior data. */
async function clearUserScopedData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const scoped = keys.filter(
      (k) =>
        k.startsWith('tg_trips_') ||
        k.startsWith('tg_favs_') ||
        k.startsWith('tg_reviews_') ||
        k.startsWith('tg_notifs_') ||
        k.startsWith('tg_checks_') ||
        k === 'tg_trips' ||
        k === 'tg_favs' ||
        k === 'tg_reviews' ||
        k === 'tg_notifs' ||
        k === 'tg_checks'
    );
    if (scoped.length) await AsyncStorage.multiRemove(scoped);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [demo, setDemo] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [avatar, setAvatarState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [u, p, t, av] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(AVATAR_KEY),
        ]);
        if (av) setAvatarState(av);
        if (u) setUser(JSON.parse(u));
        if (p) setPrefs({ ...defaultPrefs, ...JSON.parse(p) });
        if (t === 'demo-token') setDemo(true);

        // Background session verification (does NOT block app startup or dashboard launch)
        if (t && t !== 'demo-token') {
          api.get('/auth/me', { timeout: 8000 })
            .then(async (res) => {
              if (res.data?.user) {
                const me = res.data.user;
                const next: User = {
                  id: String(me.id ?? me._id),
                  name: me.name,
                  email: me.email,
                  role: me.role,
                  avatar: me.avatar,
                };
                setUser(next);
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
                if (me.preferences) {
                  const pr = { ...defaultPrefs, ...me.preferences };
                  setPrefs(pr);
                  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(pr));
                }
                if (me.avatar) {
                  setAvatarState(me.avatar);
                  await AsyncStorage.setItem(AVATAR_KEY, me.avatar);
                }
              }
            })
            .catch(async (e: unknown) => {
              const status = (e as { response?: { status?: number; data?: { code?: string } } })?.response?.status;
              const code = (e as { response?: { data?: { code?: string } } })?.response?.data?.code;
              if (status === 401 || code === 'STALE_TOKEN') {
                await clearUserScopedData();
                await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
                setUser(null);
                setDemo(false);
              }
            });
        }
      } catch {
        // ignore corrupted storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (u: User, token: string) => {
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(u)],
      [TOKEN_KEY, token],
    ]);
    setUser(u);
    setDemo(token === 'demo-token');
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.post('/auth/login', { email, password });
        const d = res.data;
        const u = d.user ?? { id: d._id ?? 'u1', name: d.name ?? email.split('@')[0], email };
        const userObj: User = {
          id: String(u.id ?? u._id),
          name: u.name,
          email: u.email ?? email,
          role: u.role,
          avatar: u.avatar,
        };
        await persist(userObj, d.token);
        if (u.preferences) {
          const pr = { ...defaultPrefs, ...u.preferences };
          setPrefs(pr);
          await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(pr));
        }
        if (u.avatar) {
          setAvatarState(u.avatar);
          await AsyncStorage.setItem(AVATAR_KEY, u.avatar);
        }
      } catch (err) {
        if (isNetworkError(err)) {
          await persist({ id: 'demo', name: email.split('@')[0] || 'Traveller', email }, 'demo-token');
          return;
        }
        throw new Error(errorMessage(err, 'Login failed'));
      }
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await api.post('/auth/register', { name, email, password });
        const d = res.data;
        const u = d.user ?? { id: d._id ?? 'u1', name, email };
        await persist(
          { id: String(u.id ?? u._id), name: u.name ?? name, email: u.email ?? email, role: u.role },
          d.token
        );
      } catch (err) {
        if (isNetworkError(err)) {
          await persist({ id: 'demo', name, email }, 'demo-token');
          return;
        }
        throw new Error(errorMessage(err, 'Registration failed'));
      }
    },
    [persist]
  );

  const logout = useCallback(async () => {
    await clearUserScopedData();
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, PREFS_KEY, AVATAR_KEY]);
    setUser(null);
    setDemo(false);
    setPrefs(defaultPrefs);
    setAvatarState(null);
  }, []);

  const setAvatar = useCallback(
    async (uri: string | null) => {
      setAvatarState(uri);
      try {
        if (uri) await AsyncStorage.setItem(AVATAR_KEY, uri);
        else await AsyncStorage.removeItem(AVATAR_KEY);
      } catch {
        // too large: keep in memory
      }
      if (!demo) {
        api.put('/users/profile', { avatar: uri }).catch(() => undefined);
      }
    },
    [demo]
  );

  const savePrefs = useCallback(
    async (p: Preferences) => {
      setPrefs(p);
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
      if (!demo) api.put('/users/preferences', p).catch(() => undefined);
    },
    [demo]
  );

  const updateProfile = useCallback(
    async (name: string) => {
      if (!user) return;
      const next = { ...user, name };
      setUser(next);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
      if (!demo) api.put('/users/profile', { name }).catch(() => undefined);
    },
    [user, demo]
  );

  const value = useMemo(
    () => ({
      ready,
      user,
      demo,
      prefs,
      avatar,
      setAvatar,
      login,
      register,
      logout,
      savePrefs,
      updateProfile,
    }),
    [ready, user, demo, prefs, avatar, setAvatar, login, register, logout, savePrefs, updateProfile]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}
