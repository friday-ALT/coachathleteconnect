import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../lib/api';
import { Colors, FontSizes, Spacing } from '../constants/theme';

/** Deep link: coachconnect://payment-success?session_id=... */
export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const queryClient = useQueryClient();

  useEffect(() => {
    const run = async () => {
      if (session_id) {
        try {
          await paymentApi.checkoutStatus(session_id);
        } catch {
          /* poll may fail if already fulfilled */
        }
      }
      queryClient.invalidateQueries({ queryKey: ['requests', 'athlete'] });
      router.replace('/(athlete)/sessions');
    };
    run();
  }, [session_id]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Confirming payment…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  text: {
    fontSize: FontSizes.base,
    color: Colors.muted,
  },
});
