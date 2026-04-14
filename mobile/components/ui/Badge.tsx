import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  default: {
    backgroundColor: Colors.surface,
  },
  success: {
    backgroundColor: `${Colors.success}20`,
  },
  warning: {
    backgroundColor: '#fbbf2420',
  },
  error: {
    backgroundColor: `${Colors.error}20`,
  },
  info: {
    backgroundColor: `${Colors.primary}20`,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  text_default: {
    color: Colors.textSecondary,
  },
  text_success: {
    color: Colors.success,
  },
  text_warning: {
    color: '#f59e0b',
  },
  text_error: {
    color: Colors.error,
  },
  text_info: {
    color: Colors.primary,
  },
});
