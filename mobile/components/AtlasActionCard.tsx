import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { AtlasGradients, AtlasColors } from '../constants/atlasTheme';
import { FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type AtlasActionCardProps = {
  eyebrow: string;
  title: string;
  icon: IconName;
  iconColor: string;
  onPress: () => void;
  variant?: 0 | 1 | 2;
  style?: ViewStyle;
};

const GRADIENTS = [AtlasGradients.blue, AtlasGradients.lavender, AtlasGradients.slate];

export default function AtlasActionCard({
  eyebrow,
  title,
  icon,
  iconColor,
  onPress,
  variant = 0,
  style,
}: AtlasActionCardProps) {
  const gradient = GRADIENTS[variant % GRADIENTS.length];

  return (
    <TouchableOpacity style={[styles.wrap, style]} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={[...gradient]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      </LinearGradient>
      <View style={styles.footer}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color={AtlasColors.link} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: AtlasColors.surface,
    borderWidth: 1,
    borderColor: AtlasColors.border,
    ...Shadow.sm,
  },
  gradient: {
    padding: Spacing.md,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: AtlasColors.muted,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: AtlasColors.ink,
    letterSpacing: -0.2,
  },
});
