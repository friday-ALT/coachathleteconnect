import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { SCREENSHOT_MODE } from '../constants/config';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  if (SCREENSHOT_MODE) {
    return {
      user: { id: 1, email: 'demo@example.com', firstName: 'Demo', lastName: 'User' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      logout: () => {},
    };
  }

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    retry: false,
    retryOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('hasCompletedOnboarding');
      queryClient.clear();
      router.replace('/welcome');
    },
  });

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading,
    error,
    logout: () => logoutMutation.mutate(),
  };
}
