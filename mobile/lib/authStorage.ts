import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';

/** Persist JWT from login/signup/OAuth — same token the website session is tied to. */
export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
