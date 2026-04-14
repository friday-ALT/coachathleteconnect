import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isLight = variant === 'outline' || variant === 'ghost' || variant === 'secondary';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isLight ? Colors.primary : Colors.white} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.statusRed,
  },
  sm: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  md: {
    height: 48,
    paddingHorizontal: Spacing.lg,
  },
  lg: {
    height: 54,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  text_primary: {
    color: Colors.white,
  },
  text_secondary: {
    color: Colors.primaryDark,
  },
  text_outline: {
    color: Colors.ink,
  },
  text_ghost: {
    color: Colors.primary,
  },
  text_danger: {
    color: Colors.white,
  },
  text_sm: {
    fontSize: FontSizes.sm,
  },
  text_md: {
    fontSize: FontSizes.base,
  },
  text_lg: {
    fontSize: FontSizes.md,
  },
});
