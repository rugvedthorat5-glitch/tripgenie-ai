import { api, API_URL, errorMessage, isNetworkError } from './api';

/** Pings GET /health on the backend and returns a human-readable result. */
export async function checkBackend(): Promise<{ ok: boolean; message: string }> {
  const t0 = Date.now();
  try {
    await api.get('/health', { timeout: 5000 });
    return { ok: true, message: `Backend reachable (${Date.now() - t0} ms)` };
  } catch (e) {
    if (isNetworkError(e)) {
      return { ok: false, message: `Cannot reach ${API_URL}. Is the backend running and is EXPO_PUBLIC_API_URL correct?` };
    }
    // Server answered (e.g. 404 because there is no /health route): it is still reachable.
    return { ok: true, message: `Server reached at ${API_URL} (replied: ${errorMessage(e)})` };
  }
}
