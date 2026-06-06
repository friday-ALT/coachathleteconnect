import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { coachApi, connectionApi, reviewApi, messagesApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../lib/apiError';
import Avatar from '../../components/ui/Avatar';
import AppCanvas from '../../components/ui/AppCanvas';
import GlossCard from '../../components/ui/GlossCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import StatusPill from '../../components/ui/StatusPill';
import { formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
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

  const connectMutation = useMutation({
    mutationFn: () => connectionApi.createConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-check', id] });
      Alert.alert('Request sent', 'The coach will review your connection request.');
    },
    onError: (e) => Alert.alert('Error', getApiErrorMessage(e, 'Could not send connection request')),
  });

  const messageMutation = useMutation({
    mutationFn: () => messagesApi.startConversation(id),
    onSuccess: (conv) => router.push(`/messages/${conv.id}`),
    onError: (e) => Alert.alert('Error', getApiErrorMessage(e, 'Could not start conversation')),
  });

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please log in to use this feature.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    action();
  };

  if (isLoading || !coach) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AppCanvas>
      <StatusBar style="light" />

      <PressableScale onPress={() => router.back()} style={[styles.backBtn, { top: safeTop }]} scaleTo={0.9}>
        <Ionicons name="arrow-back" size={22} color={Colors.ink} />
      </PressableScale>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: safeTop + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <Avatar name={coach.name} uri={coach.avatarUrl} size={90} />
          </View>
          <Text style={styles.heroName}>{coach.name}</Text>
          <Text style={styles.heroLocation}>
            <Ionicons name="location-outline" size={13} color={Colors.body} />
            {' '}{coach.locationCity}, {coach.locationState}
          </Text>

          <GlossCard style={styles.statsCard} padding={Spacing.md}>
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
          </GlossCard>

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
            <SectionHeader label="Session types" />
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
            <SectionHeader label="About" />
            <GlossCard>
              <Text style={styles.about}>{coach.experience}</Text>
            </GlossCard>
          </View>
        )}

        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Reviews" count={reviews.length} />
            {reviews.slice(0, 5).map((review: any) => (
              <GlossCard key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.athleteName}</Text>
                  <View style={styles.stars}>
                    {[1,2,3,4,5].map((i) => (
                      <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={13} color="#FDAB3D" />
                    ))}
                  </View>
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </GlossCard>
            ))}
          </View>
        )}

        {/* Spacer for sticky footer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          {!connection && (
            <Button
              title="Connect"
              variant="primary"
              loading={connectMutation.isPending}
              onPress={() => requireAuth(() => connectMutation.mutate())}
              leftIcon={<Ionicons name="person-add-outline" size={18} color={Colors.primaryOn} />}
              style={styles.footerBtnFlex}
            />
          )}
          {connection?.status === 'PENDING' && (
            <View style={[styles.footerBtn, styles.pendingBtn]}>
              <Ionicons name="time-outline" size={18} color={Colors.statusOrange} />
              <Text style={styles.pendingBtnText}>Connection Pending</Text>
            </View>
          )}
          {(connection?.status === 'ACCEPTED' || !connection) && (
            <Button
              title="Message"
              variant="outline"
              loading={messageMutation.isPending}
              onPress={() => requireAuth(() => messageMutation.mutate())}
              leftIcon={<Ionicons name="chatbubble-outline" size={18} color={Colors.accent} />}
              style={styles.footerBtnFlex}
            />
          )}
        </View>

        <Button
          title={`Book Session — ${formatPrice(coach.pricePerHour)}/hr`}
          variant="primary"
          onPress={() => requireAuth(() => router.push(`/request-session/${id}`))}
          leftIcon={<Ionicons name="calendar-outline" size={18} color={Colors.primaryOn} />}
        />
        {connection?.status === 'ACCEPTED' && (
          <View style={styles.connectedNote}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.statusGreen} />
            <Text style={styles.connectedNoteText}>Connected with this coach</Text>
          </View>
        )}
      </View>
    </AppCanvas>
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.lg },

  hero: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  heroName: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.ink,
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  heroLocation: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginTop: 4,
    fontWeight: '500',
  },
  statsCard: { width: '100%', marginTop: Spacing.lg },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.ink,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.body,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
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
  about: {
    fontSize: FontSizes.base,
    color: Colors.body,
    lineHeight: 22,
  },

  // Reviews
  reviewCard: { marginBottom: Spacing.sm },
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
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerBtnFlex: { flex: 1 },
  connectedNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 8,
  },
  connectedNoteText: {
    fontSize: FontSizes.xs, color: Colors.statusGreen, fontWeight: '600',
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
    color: Colors.accent,
  },
});
