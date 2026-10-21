import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Set EXPO_PUBLIC_API_URL in .env (see .env.example).
// Android emulator -> http://10.0.2.2:5050/api
// Real phone       -> http://<your-laptop-LAN-IP>:5050/api
const defaultUrl = 'https://blanchedalmond-wildcat-125853.hostingersite.com/api';

export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || defaultUrl;
export const CUSTOM_API_URL_KEY = 'tg_custom_api_url';
export const TOKEN_KEY = 'tg_token';

export function normalizeApiUrl(raw: string): string {
  if (!raw || !raw.trim()) return API_URL;
  let clean = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(clean)) {
    const isIpOrLocal = /^(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:|$|\/)/i.test(clean);
    clean = (isIpOrLocal ? 'http://' : 'https://') + clean;
  }
  const hostPart = clean.replace(/^https?:\/\//i, '');
  const isIpOrLocal = /^(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:|$|\/)/i.test(hostPart);
  if (isIpOrLocal && !hostPart.includes(':') && !hostPart.includes('/')) {
    clean = clean + ':5050';
  }
  if (!clean.endsWith('/api')) {
    clean = clean + '/api';
  }
  return clean;
}

export async function getActiveApiUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (saved && saved.trim()) return normalizeApiUrl(saved.trim());
  } catch {}
  return normalizeApiUrl(API_URL);
}

export async function setCustomApiUrl(url: string): Promise<string> {
  try {
    if (!url || !url.trim()) {
      await AsyncStorage.removeItem(CUSTOM_API_URL_KEY);
      api.defaults.baseURL = API_URL;
      return API_URL;
    } else {
      const clean = normalizeApiUrl(url);
      await AsyncStorage.setItem(CUSTOM_API_URL_KEY, clean);
      api.defaults.baseURL = clean;
      return clean;
    }
  } catch {
    return API_URL;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Load custom API URL on startup if previously saved
AsyncStorage.getItem(CUSTOM_API_URL_KEY).then((saved) => {
  if (saved && saved.trim()) {
    if (/^https?:\/\/(192\.|10\.|172\.|localhost)/i.test(saved) && API_URL.includes('hostingersite.com')) {
      AsyncStorage.removeItem(CUSTOM_API_URL_KEY);
      api.defaults.baseURL = API_URL;
      return;
    }
    api.defaults.baseURL = normalizeApiUrl(saved.trim());
  }
}).catch(() => {});

api.interceptors.request.use(async (config) => {
  try {
    const customUrl = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (customUrl) {
      if (/^https?:\/\/(192\.|10\.|172\.|localhost)/i.test(customUrl) && API_URL.includes('hostingersite.com')) {
        await AsyncStorage.removeItem(CUSTOM_API_URL_KEY);
        config.baseURL = API_URL;
      } else {
        config.baseURL = normalizeApiUrl(customUrl);
      }
    }
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // storage unavailable, continue without a token
  }
  return config;
});


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    // Clear stale memory-mode / expired sessions so the app can log in again cleanly
    if (status === 401 && (code === 'STALE_TOKEN' || code === undefined)) {
      try {
        const url = String(err?.config?.url || '');
        if (url.includes('/auth/me') || code === 'STALE_TOKEN') {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);

/** True when the request never reached a server (backend off, wrong URL, timeout). */
export const isNetworkError = (err: unknown): boolean => {
  return axios.isAxiosError(err) && !err.response;
};

export const errorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};
