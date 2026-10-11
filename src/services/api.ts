import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Set EXPO_PUBLIC_API_URL in .env (see .env.example).
// Android emulator -> http://10.0.2.2:5000/api
// Real phone       -> http://<your-laptop-LAN-IP>:5000/api
const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || defaultUrl;

export const TOKEN_KEY = 'tg_token';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // storage unavailable, continue without a token
  }
  return config;
});

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
