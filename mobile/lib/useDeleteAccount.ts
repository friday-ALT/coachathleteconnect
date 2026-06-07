import { Alert, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from './api';
import { clearAuthToken } from './authStorage';
import { getApiErrorMessage } from './apiError';

export function useDeleteAccount(authProvider?: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: async () => {
      await clearAuthToken();
      queryClient.clear();
      router.replace('/welcome');
    },
    onError: (e: unknown) => {
      Alert.alert('Could not delete account', getApiErrorMessage(e, 'Please try again.'));
    },
  });

  const confirmDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently removes your profile, messages, and session history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            if (authProvider === 'email') {
              if (Platform.OS === 'ios') {
                Alert.prompt(
                  'Confirm password',
                  'Enter your password to delete your account.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete account',
                      style: 'destructive',
                      onPress: (password) => {
                        if (password?.trim()) {
                          mutation.mutate({ confirm: true, password: password.trim() });
                        }
                      },
                    },
                  ],
                  'secure-text',
                );
              } else {
                Alert.alert(
                  'Password required',
                  'To delete an email account, use the website profile page or contact support.',
                );
              }
            } else {
              Alert.alert(
                'Delete permanently?',
                'Your account and all data will be removed.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete account',
                    style: 'destructive',
                    onPress: () => mutation.mutate({ confirm: true }),
                  },
                ],
              );
            }
          },
        },
      ],
    );
  };

  return { confirmDelete, isDeleting: mutation.isPending };
}
