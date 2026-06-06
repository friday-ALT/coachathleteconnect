import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './ui/Avatar';
import StatusPill from './ui/StatusPill';
import { AtlasGradients, AtlasColors } from '../constants/atlasTheme';
import { FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { formatPrice } from '../utils/format';

const SKILL_COLORS: Record<string, string> = {
  Beginner: '#0086C0',
  Intermediate: '#FDAB3D',
  Advanced: '#A25DDC',
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

const GRADIENTS = [AtlasGradients.blue, AtlasGradients.lavender, AtlasGradients.slate];

export default function CoachAtlasCard({ coach, onPress, gradientIndex = 0, style }: CoachAtlasCardProps) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const skillColor = coach.skillLevel ? SKILL_COLORS[coach.skillLevel] : undefined;

  return (
    <TouchableOpacity style={[styles.wrap, style]} onPress={onPress} activeOpacity={0.92}>
      <LinearGradient colors={[...gradient]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroTop}>
          {coach.skillLevel && skillColor ? (
            <StatusPill label={coach.skillLevel} color={skillColor} size="sm" />
          ) : (
            <View />
          )}
        </View>
        <View style={styles.chipWrap}>
          <LinearGradient
            colors={[...AtlasGradients.cardChip]}
            style={styles.chip}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.chipShine} />
            <Text style={styles.chipLabel}>COACH</Text>
            <View style={styles.chipRow}>
              <Avatar name={coach.name} uri={coach.avatarUrl} size={36} />
              <View style={styles.chipText}>
                <Text style={styles.chipName} numberOfLines={1}>
                  {coach.name.split(' ')[0]}
                </Text>
                <Text style={styles.chipSub} numberOfLines={1}>
                  {coach.locationCity || 'Coach'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {coach.name}
          </Text>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(coach.pricePerHour)}</Text>
            <Text style={styles.priceUnit}>/hr</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={AtlasColors.muted} />
          <Text style={styles.meta} numberOfLines={1}>
            {coach.locationCity}, {coach.locationState}
          </Text>
        </View>

        {coach.rating != null && coach.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FF9500" />
            <Text style={styles.ratingText}>
              {coach.rating.toFixed(1)} · {coach.reviewCount || 0} reviews
            </Text>
          </View>
        )}

        {coach.experience ? (
          <Text style={styles.bio} numberOfLines={2}>
            {coach.experience}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.cta}>View profile</Text>
          <Ionicons name="chevron-forward" size={16} color={AtlasColors.link} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.xl,
    backgroundColor: AtlasColors.surface,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AtlasColors.border,
    ...Shadow.md,
  },
  hero: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    minHeight: 148,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  chipWrap: {
    alignItems: 'center',
  },
  chip: {
    width: '88%',
    maxWidth: 280,
    borderRadius: 14,
    padding: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  chipShine: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipText: {
    flex: 1,
  },
  chipName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  chipSub: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: AtlasColors.ink,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: AtlasColors.ink,
  },
  priceUnit: {
    fontSize: FontSizes.xs,
    color: AtlasColors.muted,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  meta: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: AtlasColors.muted,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: AtlasColors.body,
    fontWeight: '600',
  },
  bio: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    color: AtlasColors.body,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  cta: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: AtlasColors.link,
  },
});
