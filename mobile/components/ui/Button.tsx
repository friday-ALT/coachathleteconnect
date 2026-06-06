import { View, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes, GlossGradient } from '../../constants/theme';
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
  const isLight = variant === 'outline' || variant === 'ghost' || variant === 'secondary';
  const isGradient = variant === 'primary' || variant === 'accent' || variant === 'success';

  const loaderColor =
    variant === 'primary' || variant === 'accent' || variant === 'success'
      ? Colors.primaryOn
      : Colors.ink;

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

  const gradientColors =
    variant === 'accent' ? GlossGradient.buttonAccent
    : variant === 'success' ? GlossGradient.buttonSuccess
    : GlossGradient.button;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.94}
      style={[
        styles.button,
        !isGradient && styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        (variant === 'primary' || variant === 'accent' || variant === 'success') && styles.glowShadow,
        style,
      ]}
    >
      {isGradient && (
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradientFill]}
        />
      )}
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
  gradientFill: {
    borderRadius: BorderRadius.full,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    zIndex: 1,
  },
  inner_sm: { paddingHorizontal: Spacing.md, minHeight: 36 },
  inner_md: { paddingHorizontal: Spacing.lg, minHeight: 48 },
  inner_lg: { paddingHorizontal: Spacing.xl, minHeight: 54 },
  glowShadow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  secondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.statusRed },
  sm: {}, md: {}, lg: {},
  disabled: { opacity: 0.4 },
  text: { fontWeight: '700', letterSpacing: 0.1 },
  text_primary: { color: Colors.primaryOn },
  text_accent: { color: Colors.primaryOn },
  text_success: { color: Colors.primaryOn },
  text_secondary: { color: Colors.ink },
  text_outline: { color: Colors.ink },
  text_ghost: { color: Colors.accent },
  text_danger: { color: Colors.white },
  text_sm: { fontSize: FontSizes.sm },
  text_md: { fontSize: FontSizes.base },
  text_lg: { fontSize: FontSizes.md },
});
