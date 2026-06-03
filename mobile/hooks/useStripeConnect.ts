import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { paymentApi } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { API_URL } from '../constants/config';

const STRIPE_RETURN_URL = Linking.createURL('stripe-return');

export function usePaymentsConfig() {
  return useQuery({
    queryKey: ['payments-config'],
    queryFn: paymentApi.getConfig,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCoachStripeStatus(enabled = true) {
  return useQuery({
    queryKey: ['stripe-status'],
    queryFn: paymentApi.getCoachStripeStatus,
    staleTime: 30_000,
    enabled,
    retry: false,
  });
}

export function useStripeConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.startCoachOnboarding,
    onSuccess: async (data: { url?: string }) => {
      if (!data?.url) {
        Alert.alert('Error', 'No onboarding URL returned from server.');
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, STRIPE_RETURN_URL);
      await queryClient.invalidateQueries({ queryKey: ['stripe-status'] });
      await queryClient.invalidateQueries({ queryKey: ['payments-config'] });

      if (result.type === 'success' || result.type === 'dismiss') {
        Alert.alert(
          'Stripe',
          'If you finished setup, your status will update shortly. Tap Connect again if needed.',
        );
      }
    },
    onError: (e) => {
      const msg = getApiErrorMessage(e, 'Failed to start Stripe setup.');
      const is503 = (e as any)?.response?.status === 503;
      const isStripeMsg = msg.includes('STRIPE_SECRET_KEY') || is503;
      Alert.alert(
        isStripeMsg ? 'Payments not configured on server' : 'Stripe setup failed',
        isStripeMsg
          ? `The API at ${API_URL} needs STRIPE_SECRET_KEY in Railway Variables, then redeploy.`
          : msg,
      );
    },
  });
}
