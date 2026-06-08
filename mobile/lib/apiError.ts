import type { AxiosError } from 'axios';
import { API_URL } from '../constants/config';

/**
 * Turns axios/network errors into a message the user (and you) can act on.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const e = error as AxiosError<{ error?: string; message?: string }>;
  const d = e.response?.data;
  if (d && typeof d === 'object') {
    if (typeof d.error === 'string' && d.error.trim()) return d.error;
    if (typeof d.message === 'string' && d.message.trim()) return d.message;
  }

  const status = e.response?.status;
  if (status === 403) {
    const detail =
      (typeof d?.message === 'string' && d.message) ||
      (typeof d?.error === 'string' && d.error);
    if (detail && detail !== 'Forbidden') return detail;
    return `Access denied (${API_URL}). Reload the app — if this persists, the API URL may be wrong.`;
  }
  if (status === 400 && typeof d?.error === 'string') {
    return d.error;
  }

  const msg = e.message || '';
  if (
    e.code === 'ERR_NETWORK' ||
    e.code === 'ECONNABORTED' ||
    msg === 'Network Error' ||
    msg.includes('Network Error')
  ) {
    return (
      `Cannot reach the server at:\n${API_URL}\n\n` +
      `• Start the API: npm run dev (in DesignSyncMobile-2)\n` +
      `• iOS Simulator: use http://127.0.0.1:5000 in app.json → extra.webUrl\n` +
      `• Real iPhone (Expo Go): use your Mac’s Wi‑Fi IP, not localhost`
    );
  }

  if (msg) return msg;
  return fallback;
}
