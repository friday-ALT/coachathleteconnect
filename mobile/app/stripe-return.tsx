import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, FontSizes, Spacing } from '../constants/theme';

/** Deep link: coachconnect://stripe-return — after Stripe Connect onboarding */
export default function StripeReturn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['stripe-status'] });
    queryClient.invalidateQueries({ queryKey: ['payments-config'] });
    router.replace('/(coach)/profile');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Finishing Stripe setup…</Text>
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
