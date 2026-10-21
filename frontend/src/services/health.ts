import { api, getActiveApiUrl, errorMessage, isNetworkError } from './api';

/** Pings GET /health on the backend and returns a human-readable result. */
export async function checkBackend(): Promise<{ ok: boolean; message: string }> {
  const t0 = Date.now();
  const currentUrl = await getActiveApiUrl();
  try {
    const res = await api.get('/health', { timeout: 10000 });
    return { ok: true, message: `Backend online (${Date.now() - t0} ms) - Admin: ${res.data?.admin || 'Connected'}` };
  } catch (e) {
    if (isNetworkError(e)) {
      const detail = (e as any)?.message || 'Timeout / Network Error';
      return { ok: false, message: `Cannot reach ${currentUrl} (${detail}). Check mobile internet.` };
    }
    return { ok: true, message: `Server reached at ${currentUrl} (${errorMessage(e)})` };
  }
}
