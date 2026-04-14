import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useNotifications } from '../hooks/useNotifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30 seconds — data is fresh, avoid redundant refetches
      gcTime: 5 * 60 * 1000,      // 5 minutes — keep unused data in cache
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10_000),
      refetchOnWindowFocus: false, // mobile: no window focus concept
      refetchOnReconnect: true,    // re-fetch when network is restored
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppInner() {
  useNotifications(); // registers push token, sets up listeners
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="coach/[id]" />
      <Stack.Screen name="request-session/[id]" />
      <Stack.Screen name="edit-profile/athlete" />
      <Stack.Screen name="edit-profile/coach" />
      <Stack.Screen name="(athlete)" />
      <Stack.Screen name="(coach)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
