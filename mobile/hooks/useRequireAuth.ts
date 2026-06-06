import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';

/** Redirect unauthenticated users to welcome. */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isLoading, isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}
