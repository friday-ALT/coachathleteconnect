import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing } from '../constants/theme';

/** Deep link: coachconnect://payment-cancel */
export default function PaymentCancel() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payment cancelled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  text: {
    fontSize: FontSizes.base,
    color: Colors.muted,
  },
});
