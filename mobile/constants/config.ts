import Constants from 'expo-constants';

// ─── Screenshot mode ───────────────────────────────────────────────────────────
export const SCREENSHOT_MODE = false;
export const SCREENSHOT_ROLE: 'athlete' | 'coach' = 'athlete';

const PRODUCTION_API = 'https://coachathleteconnect-production.up.railway.app';

const isLocalhost = (url: string) =>
  url.includes('127.0.0.1') || url.includes('localhost');

/**
 * API base URL for the mobile app.
 * - app.json `extra.webUrl` (production) is the default.
 * - Set WEB_URL / EXPO_PUBLIC_WEB_URL only when pointing at a local API.
 * - In __DEV__ with a localhost URL, resolve Metro host for physical devices.
 *   Note: macOS often uses port 5000 for AirPlay — use PORT=5001 npm run dev locally.
 */
function resolveApiUrl(): string {
  const configured =
    (Constants.expoConfig?.extra?.webUrl as string | undefined) || PRODUCTION_API;

  if (!isLocalhost(configured)) {
    return configured.replace(/\/$/, '');
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    const debuggerHost = Constants.expoGoConfig?.debuggerHost;
    const raw = hostUri || debuggerHost;
    if (raw) {
      const host = raw.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        const port = configured.match(/:(\d+)/)?.[1] || '5001';
        return `http://${host}:${port}`;
      }
    }
  }

  return configured.replace(/\/$/, '');
}

export const API_URL = resolveApiUrl();

export const GOOGLE_WEB_CLIENT_ID     = Constants.expoConfig?.extra?.googleWebClientId     || '';
export const GOOGLE_IOS_CLIENT_ID     = Constants.expoConfig?.extra?.googleIosClientId     || '';
export const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || '';

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/api/auth/login`,
  SIGNUP: `${API_URL}/api/auth/signup`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  USER: `${API_URL}/api/auth/me`,
  RESEND_VERIFICATION: `${API_URL}/api/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  ATHLETE_PROFILE: `${API_URL}/api/profiles/athlete`,
  COACH_PROFILE: `${API_URL}/api/profiles/coach`,
};
