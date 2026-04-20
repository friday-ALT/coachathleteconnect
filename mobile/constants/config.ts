import Constants from 'expo-constants';

// ─── Screenshot mode ───────────────────────────────────────────────────────────
// Set to true to skip login and load directly into the app for screenshots.
// Set back to false before building for the App Store.
export const SCREENSHOT_MODE = false;
export const SCREENSHOT_ROLE: 'athlete' | 'coach' = 'athlete'; // which view to show

/**
 * Resolves API URL for local dev.
 * - If app.json `extra.webUrl` is a real LAN/production URL (not localhost), it wins.
 * - Otherwise, in __DEV__, use the same host Metro uses (hostUri / debuggerHost) on port 3000.
 *   That fixes Expo Go on a **physical phone**: 127.0.0.1 would point at the phone, not your Mac.
 */
function resolveApiUrl(): string {
  const configured =
    (Constants.expoConfig?.extra?.webUrl as string | undefined) || 'http://127.0.0.1:3000';

  const isLocalhost = (url: string) =>
    url.includes('127.0.0.1') || url.includes('localhost');

  // Explicit non-localhost URL in app.json → always use it
  if (!isLocalhost(configured)) {
    return configured;
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    const debuggerHost = Constants.expoGoConfig?.debuggerHost;
    const raw = hostUri || debuggerHost;
    if (raw) {
      const host = raw.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:3000`;
      }
    }
  }

  return configured;
}

// API base URL (must match where `npm run dev` is listening on your Mac).
export const API_URL = resolveApiUrl();

// ─── Google OAuth Client IDs ───────────────────────────────────────────────────
// To enable Google Sign-In:
//  1. Go to https://console.cloud.google.com/apis/credentials
//  2. Create OAuth 2.0 Client IDs for Web, iOS, and Android
//  3. For iOS bundle ID use: com.coachathleteconnect (or your app.json ios.bundleIdentifier)
//  4. Paste the client IDs below
export const GOOGLE_WEB_CLIENT_ID     = Constants.expoConfig?.extra?.googleWebClientId     || '';
export const GOOGLE_IOS_CLIENT_ID     = Constants.expoConfig?.extra?.googleIosClientId     || '';
export const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || '';

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/api/auth/login`,
  SIGNUP: `${API_URL}/api/auth/signup`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  USER: `${API_URL}/api/auth/user`,
  RESEND_VERIFICATION: `${API_URL}/api/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  ATHLETE_PROFILE: `${API_URL}/api/profiles/athlete`,
  COACH_PROFILE: `${API_URL}/api/profiles/coach`,
};
