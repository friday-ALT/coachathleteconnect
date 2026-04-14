import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'flat';
}

export default function Card({ children, variant = 'default', style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.xs,
  },
  elevated: {
    ...Shadow.md,
    borderWidth: 0,
  },
  flat: {
    backgroundColor: Colors.surfaceSection,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
