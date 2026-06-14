import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors, FontSizes, Spacing, BorderRadius, NTCGradients } from '../constants/theme';
import PressableScale from './ui/PressableScale';

type IconName = ComponentProps<typeof Ionicons>['name'];

type AtlasActionCardProps = {
  eyebrow: string;
  title: string;
  icon: IconName;
  iconColor?: string;
  onPress: () => void;
  variant?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  style?: ViewStyle;
};

const GRADIENTS = [
  NTCGradients.sunset,
  NTCGradients.ocean,
  NTCGradients.forest,
  NTCGradients.steel,
  NTCGradients.violet,
  NTCGradients.ember,
  NTCGradients.slate,
  NTCGradients.charcoal,
];

export default function AtlasActionCard({
  eyebrow,
  title,
  onPress,
  variant = 0,
  style,
}: AtlasActionCardProps) {
  const gradient = GRADIENTS[variant % GRADIENTS.length];
  const displayEyebrow = eyebrow || 'Explore';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      style={[styles.wrap, style]}
    >
      <LinearGradient
        colors={[...gradient]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={styles.glowOrb} />
        <Text style={styles.eyebrow} numberOfLines={1}>{displayEyebrow}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.footer}>
          <Text style={styles.cta}>Start</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.ink} />
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 152,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'flex-end',
    minHeight: 152,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  eyebrow: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cta: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.ink,
  },
});
