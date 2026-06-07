import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useSafeTop } from '../../hooks/useSafeTop';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { connectionApi, requestApi, reviewApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatTile from '../../components/ui/StatTile';
import AtlasActionCard from '../../components/AtlasActionCard';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusPill from '../../components/ui/StatusPill';
import AppCanvas from '../../components/ui/AppCanvas';
import PageHeader from '../../components/ui/PageHeader';
import ActionBanner from '../../components/ui/ActionBanner';
import GlossCard from '../../components/ui/GlossCard';
import PressableScale from '../../components/ui/PressableScale';
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

  const unreadMessages = useUnreadMessages();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const headerActions = (
    <>
      <PressableScale onPress={() => router.push('/messages')} style={styles.iconBtn} scaleTo={0.9}>
        <Ionicons name="chatbubbles-outline" size={20} color={Colors.ink} />
        {unreadMessages > 0 && (
          <View style={styles.msgBadge}>
            <Text style={styles.msgBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
          </View>
        )}
      </PressableScale>
      <PressableScale onPress={handleSwitchMode} style={styles.iconBtn} scaleTo={0.9}>
        <Ionicons name="swap-horizontal-outline" size={20} color={Colors.ink} />
      </PressableScale>
    </>
  );

  return (
    <AppCanvas>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: safeTop + Spacing.md }]}
        refreshControl={
          <RefreshControl
            refreshing={connectionsLoading || requestsLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.ink}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          label={greeting}
          title={user?.firstName || 'Athlete'}
          subtitle={
            upcomingRequests.length > 0
              ? `${upcomingRequests.length} upcoming session${upcomingRequests.length > 1 ? 's' : ''}`
              : 'Ready to train?'
          }
          actions={headerActions}
        />

        <View style={styles.statsRow}>
          <StatTile glossy value={acceptedConnections.length} label="Coaches" />
          <StatTile glossy value={upcomingRequests.length} label="Upcoming" color={Colors.success} />
          <StatTile glossy value={pendingRequests.length} label="Pending" />
        </View>

        {pendingReviews && pendingReviews.length > 0 && (
          <ActionBanner
            glossy
            title={`${pendingReviews.length} coach${pendingReviews.length > 1 ? 'es' : ''} to review`}
            description="Leave feedback to help other athletes find great coaches."
            actionLabel="Rate now"
            onPress={() => openReviewModal(pendingReviews[0])}
          />
        )}

        {(pendingConnections.length > 0 || pendingRequests.length > 0) && (
          <ActionBanner
            glossy
            title="Needs attention"
            description={[
              pendingConnections.length > 0 ? `${pendingConnections.length} connection request${pendingConnections.length > 1 ? 's' : ''} pending` : null,
              pendingRequests.length > 0 ? `${pendingRequests.length} session request${pendingRequests.length > 1 ? 's' : ''} awaiting reply` : null,
            ].filter(Boolean).join(' · ')}
            actionLabel="View"
            onPress={() => router.push('/(athlete)/sessions')}
          />
        )}

        <View style={styles.quickRow}>
          <AtlasActionCard
            eyebrow="Discover"
            title="Find coaches"
            icon="search-outline"
            variant={0}
            onPress={() => router.push('/(athlete)/browse')}
          />
          <AtlasActionCard
            eyebrow="Train"
            title="My sessions"
            icon="calendar-outline"
            variant={1}
            onPress={() => router.push('/(athlete)/sessions')}
          />
        </View>

        <SectionHeader label="Upcoming Sessions" count={upcomingRequests.length} />
        {upcomingRequests.length === 0 ? (
          <GlossCard glossy style={styles.emptyCard} padding={Spacing.xl}>
            <Ionicons name="calendar-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(athlete)/browse')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>Browse coaches →</Text>
            </TouchableOpacity>
          </GlossCard>
        ) : (
          <GlossCard glossy padding={0}>
            {upcomingRequests.slice(0, 3).map((r: any, i: number) => (
              <View key={r.id} style={[styles.dataRow, i < 2 && styles.dataRowBorder]}>
                <View style={styles.dataRowMain}>
                  <Text style={styles.dataRowTitle}>{r.coachName}</Text>
                  <Text style={styles.dataRowSub}>
                    {formatDate(r.requestedDate)} · {formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}
                  </Text>
                </View>
                <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
              </View>
            ))}
          </GlossCard>
        )}

        <SectionHeader label="My Coaches" count={acceptedConnections.length} />
        {acceptedConnections.length === 0 ? (
          <GlossCard glossy style={styles.emptyCard} padding={Spacing.xl}>
            <Ionicons name="people-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No coaches connected yet</Text>
            <TouchableOpacity onPress={() => router.push('/(athlete)/browse')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>Find a coach →</Text>
            </TouchableOpacity>
          </GlossCard>
        ) : (
          <GlossCard glossy padding={0}>
            {acceptedConnections.map((c: any, i: number) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.dataRow, i < acceptedConnections.length - 1 && styles.dataRowBorder]}
                onPress={() => router.push(`/coach/${c.coachId}`)}
                activeOpacity={0.7}
              >
                <Avatar name={c.coachName} uri={c.avatarUrl} size={40} />
                <View style={styles.dataRowMain}>
                  <Text style={styles.dataRowTitle}>{c.coachName}</Text>
                  <Text style={styles.dataRowSub}>{c.locationCity}, {c.locationState}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ))}
          </GlossCard>
        )}
      </ScrollView>

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
                    color={star <= rating ? Colors.statusOrange : Colors.muted}
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
                <ActivityIndicator color={Colors.black} />
              ) : (
                <>
                  <Ionicons name="star" size={16} color={Colors.black} />
                  <Text style={styles.reviewSubmitText}>Submit Review</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.statusRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  msgBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  dataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataRowMain: {
    flex: 1,
    minWidth: 0,
  },
  dataRowTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.ink,
  },
  dataRowSub: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
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
    color: Colors.accent,
    fontWeight: '600',
  },
  reviewModal: { flex: 1, backgroundColor: Colors.background },
  reviewModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  reviewModalTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.ink },
  reviewCloseBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHover, justifyContent: 'center', alignItems: 'center',
  },
  reviewModalBody: { padding: Spacing.lg, gap: Spacing.md },
  reviewLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink, marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  reviewTextArea: {
    minHeight: 120, borderWidth: 1, borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, fontSize: FontSizes.base, color: Colors.ink,
    backgroundColor: Colors.surface,
  },
  reviewFooter: {
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
  reviewSubmitBtn: {
    height: 52, backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  reviewSubmitText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.primaryOn },
});
