import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useSafeTop } from '../../hooks/useSafeTop';
import { connectionApi, requestApi, reviewApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatTile from '../../components/ui/StatTile';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusPill from '../../components/ui/StatusPill';
import { formatDate, formatTime } from '../../utils/format';

export default function AthleteHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { exitRole } = useRole();
  const safeTop = useSafeTop();
  const queryClient = useQueryClient();

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewCoach, setReviewCoach] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } = useQuery({
    queryKey: ['connections', 'athlete'],
    queryFn: () => connectionApi.getConnections('athlete'),
  });

  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['requests', 'athlete'],
    queryFn: () => requestApi.getRequests('athlete'),
  });

  const acceptedConnections = connections?.filter((c: any) => c.status === 'ACCEPTED') || [];
  const pendingConnections  = connections?.filter((c: any) => c.status === 'PENDING') || [];
  const upcomingRequests    = requests?.filter((r: any) => r.status === 'ACCEPTED') || [];
  const pendingRequests     = requests?.filter((r: any) => r.status === 'PENDING') || [];

  const { data: pendingReviews } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: reviewApi.getPendingReviews,
    staleTime: 60_000,
  });

  const submitReviewMutation = useMutation({
    mutationFn: ({ coachId, rating, comment }: { coachId: string; rating: number; comment: string }) =>
      reviewApi.createReview(coachId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      setReviewModal(false);
      setComment('');
      setRating(5);
      Alert.alert('Thanks!', 'Your review has been submitted.');
    },
    onError: () => Alert.alert('Error', 'Failed to submit review. Please try again.'),
  });

  const openReviewModal = (coach: any) => {
    setReviewCoach(coach);
    setRating(5);
    setComment('');
    setReviewModal(true);
  };

  const handleRefresh = () => Promise.all([refetchConnections(), refetchRequests()]);

  const handleSwitchMode = async () => {
    await exitRole();
    router.replace('/role-select');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.greeting}>{greeting}, {user?.firstName} 👋</Text>
            <Text style={styles.subGreeting}>Athlete Mode</Text>
          </View>
          <TouchableOpacity onPress={handleSwitchMode} style={styles.switchBtn}>
            <Ionicons name="swap-horizontal-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Stat tiles */}
        <View style={styles.statsRow}>
          <StatTile
            icon="people-outline"
            value={acceptedConnections.length}
            label="Coaches"
            color={Colors.statusBlue}
          />
          <StatTile
            icon="calendar-outline"
            value={upcomingRequests.length}
            label="Upcoming"
            color={Colors.primary}
          />
          <StatTile
            icon="time-outline"
            value={pendingRequests.length}
            label="Pending"
            color={Colors.statusOrange}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={connectionsLoading || requestsLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Pending reviews prompt */}
        {pendingReviews && pendingReviews.length > 0 && (
          <View style={styles.reviewBanner}>
            <View style={styles.reviewBannerLeft}>
              <Ionicons name="star" size={16} color="#FDAB3D" />
              <View>
                <Text style={styles.reviewBannerTitle}>Leave a Review</Text>
                <Text style={styles.reviewBannerSub}>
                  {pendingReviews.length} coach{pendingReviews.length > 1 ? 'es' : ''} waiting for your feedback
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.reviewBannerBtn}
              onPress={() => openReviewModal(pendingReviews[0])}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewBannerBtnText}>Rate Now</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Needs attention */}
        {(pendingConnections.length > 0 || pendingRequests.length > 0) && (
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <Ionicons name="flash" size={14} color={Colors.statusOrange} />
              <Text style={styles.alertTitle}>NEEDS ATTENTION</Text>
            </View>
            {pendingConnections.length > 0 && (
              <Text style={styles.alertItem}>
                • {pendingConnections.length} connection request{pendingConnections.length > 1 ? 's' : ''} pending
              </Text>
            )}
            {pendingRequests.length > 0 && (
              <Text style={styles.alertItem}>
                • {pendingRequests.length} session request{pendingRequests.length > 1 ? 's' : ''} awaiting reply
              </Text>
            )}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(athlete)/browse')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: `${Colors.statusBlue}18` }]}>
              <Ionicons name="search-outline" size={22} color={Colors.statusBlue} />
            </View>
            <Text style={styles.quickLabel}>Find Coaches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(athlete)/sessions')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: `${Colors.primary}18` }]}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.quickLabel}>My Sessions</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming sessions */}
        <SectionHeader label="Upcoming Sessions" color={Colors.primary} count={upcomingRequests.length} />
        {upcomingRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(athlete)/browse')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>Browse coaches →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          upcomingRequests.slice(0, 3).map((r: any) => (
            <View key={r.id} style={styles.sessionRow}>
              <View style={styles.sessionAccent} />
              <View style={styles.sessionBody}>
                <View style={styles.sessionTop}>
                  <Text style={styles.sessionCoach}>{r.coachName}</Text>
                  <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
                </View>
                <View style={styles.sessionMeta}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.muted} />
                  <Text style={styles.sessionMetaText}>{formatDate(r.requestedDate)}</Text>
                  <Ionicons name="time-outline" size={13} color={Colors.muted} style={{ marginLeft: 8 }} />
                  <Text style={styles.sessionMetaText}>
                    {formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* My Coaches */}
        <SectionHeader label="My Coaches" color={Colors.statusBlue} count={acceptedConnections.length} />
        {acceptedConnections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No coaches connected yet</Text>
            <TouchableOpacity onPress={() => router.push('/(athlete)/browse')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>Find a coach →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          acceptedConnections.map((c: any) => (
            <TouchableOpacity
              key={c.id}
              style={styles.coachRow}
              onPress={() => router.push(`/coach/${c.coachId}`)}
              activeOpacity={0.8}
            >
              <Avatar name={c.coachName} uri={c.avatarUrl} size={44} />
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{c.coachName}</Text>
                <Text style={styles.coachLocation}>{c.locationCity}, {c.locationState}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReviewModal(false)}>
        <View style={styles.reviewModal}>
          <View style={styles.reviewModalHeader}>
            <Text style={styles.reviewModalTitle}>Rate {reviewCoach?.coachName}</Text>
            <TouchableOpacity onPress={() => setReviewModal(false)} style={styles.reviewCloseBtn}>
              <Ionicons name="close" size={22} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.reviewModalBody}>
            <Text style={styles.reviewLabel}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? '#FDAB3D' : Colors.muted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.reviewLabel}>Comment (optional)</Text>
            <TextInput
              style={styles.reviewTextArea}
              placeholder="Share your experience with this coach..."
              placeholderTextColor={Colors.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              maxLength={400}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.reviewFooter}>
            <TouchableOpacity
              style={[styles.reviewSubmitBtn, submitReviewMutation.isPending && { opacity: 0.5 }]}
              onPress={() => reviewCoach && submitReviewMutation.mutate({ coachId: reviewCoach.coachId, rating, comment })}
              disabled={submitReviewMutation.isPending}
              activeOpacity={0.85}
            >
              {submitReviewMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="star" size={16} color={Colors.white} />
                  <Text style={styles.reviewSubmitText}>Submit Review</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  subGreeting: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 2,
  },
  switchBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Alert
  alertBox: {
    backgroundColor: `${Colors.statusOrange}15`,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.statusOrange,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: Colors.statusOrange,
    letterSpacing: 0.8,
  },
  alertItem: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginTop: 2,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.ink,
  },

  // Session rows
  sessionRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  sessionAccent: {
    width: 4,
    backgroundColor: Colors.statusGreen,
  },
  sessionBody: {
    flex: 1,
    padding: Spacing.md,
  },
  sessionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionCoach: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '500',
  },

  // Coach rows
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.xs,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  coachLocation: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    marginTop: 2,
  },

  // Empty states
  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
  emptyAction: {
    marginTop: 4,
  },
  emptyActionText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Review banner
  reviewBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF8EC', borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: '#FDAB3D40',
  },
  reviewBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  reviewBannerTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink },
  reviewBannerSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 1 },
  reviewBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FDAB3D', paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  reviewBannerBtnText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.white },

  // Review Modal
  reviewModal: { flex: 1, backgroundColor: Colors.background },
  reviewModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  reviewModalTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.ink },
  reviewCloseBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center',
  },
  reviewModalBody: { padding: Spacing.lg, gap: Spacing.md },
  reviewLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  reviewTextArea: {
    minHeight: 120, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, fontSize: FontSizes.base, color: Colors.ink,
    backgroundColor: Colors.surface,
  },
  reviewFooter: {
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
  reviewSubmitBtn: {
    height: 52, backgroundColor: '#FDAB3D', borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  reviewSubmitText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white },
});
