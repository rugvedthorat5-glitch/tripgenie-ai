import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, errorMessage, isNetworkError, TOKEN_KEY } from '../services/api';
import { Preferences, User } from '../types';

const USER_KEY = 'tg_user';
const PREFS_KEY = 'tg_prefs';
const AVATAR_KEY = 'tg_avatar';

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
};

const Ctx = createContext<AuthState | null>(null);

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
        await persist({ id: String(u.id ?? u._id), name: u.name, email: u.email ?? email, role: u.role }, d.token);
      } catch (err) {
        if (isNetworkError(err)) {
          // Backend not reachable: continue in demo mode so the UI can be tested.
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
        await persist({ id: String(u.id ?? u._id), name: u.name ?? name, email: u.email ?? email }, d.token);
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
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
    setUser(null);
    setDemo(false);
  }, []);

  const setAvatar = useCallback(async (uri: string | null) => {
    setAvatarState(uri);
    try {
      if (uri) await AsyncStorage.setItem(AVATAR_KEY, uri);
      else await AsyncStorage.removeItem(AVATAR_KEY);
    } catch {
      // too large or storage unavailable: keep in memory only
    }
  }, []);

  const savePrefs = useCallback(async (p: Preferences) => {
    setPrefs(p);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
    api.put('/users/preferences', p).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ ready, user, demo, prefs, avatar, setAvatar, login, register, logout, savePrefs }),
    [ready, user, demo, prefs, avatar, setAvatar, login, register, logout, savePrefs]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}
