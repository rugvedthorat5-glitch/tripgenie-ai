/** User-scoped AsyncStorage keys so each account keeps private local data. */
export function userKey(userId: string | null | undefined, base: string) {
  const id = userId || 'anon';
  return `tg_${base}_${id}`;
}

export const GLOBAL_KEYS = {
  token: 'tg_token',
  user: 'tg_user',
  prefs: 'tg_prefs',
  avatar: 'tg_avatar',
} as const;
