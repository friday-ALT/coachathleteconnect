import { View, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import PressableScale from './PressableScale';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'accent' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const isFilled = variant === 'primary' || variant === 'accent' || variant === 'success';

  const loaderColor =
    isFilled ? Colors.primaryOn : Colors.primary;

  const content = loading ? (
    <ActivityIndicator color={loaderColor} />
  ) : (
    <>
      {leftIcon}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {title}
      </Text>
      {rightIcon}
    </>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        isFilled && styles.filledShadow,
        style,
      ]}
    >
      <View style={[styles.inner, styles[`inner_${size}`]]}>{content}</View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  primary: { backgroundColor: Colors.primary },
  accent: { backgroundColor: Colors.primary },
  success: { backgroundColor: Colors.success },
  secondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.statusRed },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  inner_sm: { paddingHorizontal: Spacing.md, minHeight: 36 },
  inner_md: { paddingHorizontal: Spacing.lg, minHeight: 48 },
  inner_lg: { paddingHorizontal: Spacing.xl, minHeight: 54 },
  filledShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sm: {}, md: {}, lg: {},
  disabled: { opacity: 0.45 },
  text: { fontWeight: '500' },
  text_primary: { color: Colors.primaryOn },
  text_accent: { color: Colors.primaryOn },
  text_success: { color: Colors.primaryOn },
  text_secondary: { color: Colors.ink },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.white },
  text_sm: { fontSize: FontSizes.sm },
  text_md: { fontSize: FontSizes.base },
  text_lg: { fontSize: FontSizes.md },
});
