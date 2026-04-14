import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { coachApi, connectionApi, reviewApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import { formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const safeTop = useSafeTop();

  const { data: coach, isLoading } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getCoach(id),
  });

  const { data: connectionCheck } = useQuery({
    queryKey: ['connection-check', id],
    queryFn: () => connectionApi.checkConnection(id),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getCoachReviews(id),
  });

  const connection = connectionCheck?.connection;

  if (isLoading || !coach) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Sticky back button overlaying hero */}
      <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: safeTop }]}>
        <Ionicons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero band */}
        <View style={styles.hero}>
          <Avatar name={coach.name} uri={coach.avatarUrl} size={90} />
          <Text style={styles.heroName}>{coach.name}</Text>
          <Text style={styles.heroLocation}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
            {' '}{coach.locationCity}, {coach.locationState}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{formatPrice(coach.pricePerHour)}</Text>
              <Text style={styles.statLabel}>Per Hour</Text>
            </View>
            <View style={styles.statDivider} />
            {coach.rating ? (
              <>
                <View style={styles.stat}>
                  <View style={styles.ratingInline}>
                    <Ionicons name="star" size={14} color="#FDAB3D" />
                    <Text style={styles.statVal}>{coach.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.statLabel}>{coach.reviewCount || 0} Reviews</Text>
                </View>
                <View style={styles.statDivider} />
              </>
            ) : null}
            <View style={styles.stat}>
              <Text style={styles.statVal}>{reviews?.length || 0}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>

          {/* Connection status pill */}
          {connection && (
            <View style={{ marginTop: Spacing.sm }}>
              {connection.status === 'ACCEPTED' && <StatusPill label="✓ Connected" color={Colors.statusGreen} />}
              {connection.status === 'PENDING'  && <StatusPill label="Request Pending" color={Colors.statusOrange} />}
              {connection.status === 'DECLINED' && <StatusPill label="Declined" color={Colors.statusRed} />}
            </View>
          )}
        </View>

        {/* Session Types */}
        {coach.sessionTypes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Types</Text>
            <View style={styles.chipRow}>
              {(Array.isArray(coach.sessionTypes)
                ? coach.sessionTypes
                : typeof coach.sessionTypes === 'string'
                  ? coach.sessionTypes.split(',')
                  : []
              ).filter((t: string) => t?.trim()).map((t: string) => (
                <View key={t.trim()} style={styles.sessionTypeChip}>
                  <Ionicons name="football-outline" size={13} color={Colors.primary} />
                  <Text style={styles.sessionTypeText}>{t.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* About */}
        {coach.experience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <Text style={styles.about}>{coach.experience}</Text>
            </View>
          </View>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.slice(0, 5).map((review: any) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.athleteName}</Text>
                  <View style={styles.stars}>
                    {[1,2,3,4,5].map((i) => (
                      <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={13} color="#FDAB3D" />
                    ))}
                  </View>
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Spacer for sticky footer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        {/* Direct booking — no connection required */}
        <TouchableOpacity
          style={[styles.footerBtn, styles.sessionBtn]}
          onPress={() => router.push(`/request-session/${id}`)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={18} color={Colors.white} />
          <Text style={styles.sessionBtnText}>
            Book Session — {formatPrice(coach.pricePerHour)}/hr
          </Text>
        </TouchableOpacity>
        {connection?.status === 'ACCEPTED' && (
          <View style={styles.connectedNote}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.statusGreen} />
            <Text style={styles.connectedNoteText}>Connected with this coach</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.muted,
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.lg },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 76,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    marginBottom: Spacing.lg,
  },
  heroName: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  heroLocation: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  about: {
    fontSize: FontSizes.base,
    color: Colors.body,
    lineHeight: 22,
  },

  // Reviews
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    lineHeight: 19,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },
  footerBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connectedNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 8,
  },
  connectedNoteText: {
    fontSize: FontSizes.xs, color: Colors.statusGreen, fontWeight: '600',
  },
  connectBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
  },
  sessionBtn: {
    backgroundColor: Colors.ink,
  },
  sessionBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
  },
  pendingBtn: {
    backgroundColor: `${Colors.statusOrange}15`,
    borderWidth: 1.5,
    borderColor: Colors.statusOrange,
  },
  pendingBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.statusOrange,
  },
  declinedBtn: {
    backgroundColor: Colors.surfaceSection,
  },
  declinedBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.muted,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sessionTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  sessionTypeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
});
