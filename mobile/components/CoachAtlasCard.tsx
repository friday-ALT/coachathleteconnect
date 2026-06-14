import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './ui/Avatar';
import StatusPill from './ui/StatusPill';
import { Colors, FontSizes, Spacing, BorderRadius, NTCGradients } from '../constants/theme';
import { formatPrice } from '../utils/format';

const SKILL_COLORS: Record<string, string> = {
  Beginner: Colors.statusBlue,
  Intermediate: Colors.accent,
  Advanced: Colors.statusPurple,
};

type CoachAtlasCardProps = {
  coach: {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    locationCity?: string;
    locationState?: string;
    rating?: number;
    reviewCount?: number;
    pricePerHour: number;
    experience?: string;
    skillLevel?: string;
  };
  onPress: () => void;
  gradientIndex?: number;
  style?: ViewStyle;
};

const GRADIENTS = [
  NTCGradients.sunset,
  NTCGradients.ocean,
  NTCGradients.forest,
  NTCGradients.steel,
  NTCGradients.violet,
  NTCGradients.ember,
];

export default function CoachAtlasCard({ coach, onPress, gradientIndex = 0, style }: CoachAtlasCardProps) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const skillColor = coach.skillLevel ? SKILL_COLORS[coach.skillLevel] : undefined;

  return (
    <TouchableOpacity style={[styles.wrap, style]} onPress={onPress} activeOpacity={0.92}>
      <LinearGradient colors={[...gradient]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroTop}>
          {coach.skillLevel && skillColor ? (
            <StatusPill label={coach.skillLevel} color={skillColor} size="sm" />
          ) : null}
          <Text style={styles.price}>{formatPrice(coach.pricePerHour)}<Text style={styles.priceUnit}>/hr</Text></Text>
        </View>
        <View style={styles.heroBottom}>
          <Avatar name={coach.name} uri={coach.avatarUrl} size={52} />
          <View style={styles.heroText}>
            <Text style={styles.name} numberOfLines={1}>{coach.name}</Text>
            <Text style={styles.location} numberOfLines={1}>
              {coach.locationCity}, {coach.locationState}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {(coach.rating != null && coach.rating > 0) || coach.experience ? (
        <View style={styles.body}>
          {coach.rating != null && coach.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.ratingText}>
                {coach.rating.toFixed(1)} · {coach.reviewCount || 0} reviews
              </Text>
            </View>
          )}
          {coach.experience ? (
            <Text style={styles.bio} numberOfLines={2}>{coach.experience}</Text>
          ) : null}
          <View style={styles.footer}>
            <Text style={styles.cta}>View profile</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.ink} />
          </View>
        </View>
      ) : (
        <View style={[styles.body, styles.bodyCompact]}>
          <Text style={styles.cta}>View profile</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.ink} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  hero: {
    padding: Spacing.md,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  location: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bodyCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    fontWeight: '600',
  },
  bio: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    color: Colors.body,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cta: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.ink,
  },
});
