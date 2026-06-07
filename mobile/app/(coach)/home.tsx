import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { connectionApi, requestApi, profileApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatTile from '../../components/ui/StatTile';
import SectionHeader from '../../components/ui/SectionHeader';
import AtlasActionCard from '../../components/AtlasActionCard';
import StatusPill from '../../components/ui/StatusPill';
import AppCanvas from '../../components/ui/AppCanvas';
import PageHeader from '../../components/ui/PageHeader';
import ActionBanner from '../../components/ui/ActionBanner';
import GlossCard from '../../components/ui/GlossCard';
import PressableScale from '../../components/ui/PressableScale';
import { formatDate, formatTime, formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';
import { useCoachStripeStatus, usePaymentsConfig, useStripeConnect } from '../../hooks/useStripeConnect';

export default function CoachHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { exitRole } = useRole();
  const safeTop = useSafeTop();

  const { data: profile } = useQuery({
    queryKey: ['coach-profile'],
    queryFn: profileApi.getCoachProfile,
  });

  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } = useQuery({
    queryKey: ['connections', 'coach'],
    queryFn: () => connectionApi.getConnections('coach'),
  });

  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['requests', 'coach'],
    queryFn: () => requestApi.getRequests('coach'),
  });

  const pendingConnections = connections?.filter((c: any) => c.status === 'PENDING')  || [];
  const acceptedAthletes   = connections?.filter((c: any) => c.status === 'ACCEPTED') || [];
  const pendingRequests    = requests?.filter((r: any) => r.status === 'PENDING')  || [];
  const upcomingRequests   = requests?.filter((r: any) => r.status === 'ACCEPTED') || [];

  const needsAttention = pendingConnections.length + pendingRequests.length;

  const { data: payConfig } = usePaymentsConfig();
  const { data: stripeStatus } = useCoachStripeStatus(payConfig?.configured === true);
  const stripeConnect = useStripeConnect();

  const handleRefresh = () => Promise.all([refetchConnections(), refetchRequests()]);

  const headerActions = (
    <>
      <PressableScale onPress={() => router.push('/messages')} style={styles.iconBtn} scaleTo={0.9}>
        <Ionicons name="chatbubbles-outline" size={20} color={Colors.ink} />
      </PressableScale>
      <PressableScale
        onPress={async () => { await exitRole(); router.replace('/role-select'); }}
        style={styles.iconBtn}
        scaleTo={0.9}
      >
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
          label="Coach"
          title={profile?.name || user?.firstName || 'Dashboard'}
          subtitle={`${acceptedAthletes.length} athletes · ${formatPrice(profile?.pricePerHour || 0)}/hr`}
          actions={headerActions}
        />

        <View style={styles.statsRow}>
          <StatTile value={upcomingRequests.length} label="Upcoming" color={Colors.success} />
          <StatTile value={pendingRequests.length} label="Pending" />
          <StatTile value={profile?.rating?.toFixed(1) ?? '—'} label="Rating" />
        </View>

        {payConfig?.configured && stripeStatus && !stripeStatus.onboardingComplete && (
          <ActionBanner
            title="Connect Stripe to get paid"
            description="Set up payouts so athletes can book paid sessions."
            actionLabel={stripeConnect.isPending ? 'Opening…' : 'Connect Stripe'}
            onPress={() => stripeConnect.mutate()}
          />
        )}

        {needsAttention > 0 && (
          <ActionBanner
            title={`${needsAttention} item${needsAttention > 1 ? 's' : ''} need attention`}
            description={[
              pendingConnections.length > 0 ? `${pendingConnections.length} connection request${pendingConnections.length > 1 ? 's' : ''}` : null,
              pendingRequests.length > 0 ? `${pendingRequests.length} session request${pendingRequests.length > 1 ? 's' : ''}` : null,
            ].filter(Boolean).join(' · ')}
            actionLabel="Review"
            onPress={() => router.push('/(coach)/requests')}
          />
        )}

        <View style={styles.quickRow}>
          <AtlasActionCard
            eyebrow="Plan"
            title="Schedule"
            icon="calendar-outline"
            variant={2}
            onPress={() => router.push('/(coach)/schedule')}
          />
          <AtlasActionCard
            eyebrow="Inbox"
            title={needsAttention > 0 ? `${needsAttention} requests` : 'Requests'}
            icon="notifications-outline"
            variant={0}
            onPress={() => router.push('/(coach)/requests')}
          />
        </View>

        <SectionHeader
          label="Upcoming Sessions"
          count={upcomingRequests.length}
          linkLabel="View all"
          onPress={() => router.push('/(coach)/schedule')}
        />
        {upcomingRequests.length === 0 ? (
          <GlossCard style={styles.emptyCard} padding={Spacing.xl}>
            <Ionicons name="calendar-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
          </GlossCard>
        ) : (
          <GlossCard padding={0}>
            {upcomingRequests.slice(0, 4).map((r: any, i: number) => (
              <View key={r.id} style={[styles.dataRow, i < Math.min(upcomingRequests.length, 4) - 1 && styles.dataRowBorder]}>
                <Avatar name={r.athleteName} size={36} />
                <View style={styles.dataRowMain}>
                  <Text style={styles.dataRowTitle}>{r.athleteName}</Text>
                  <Text style={styles.dataRowSub}>
                    {formatDate(r.requestedDate)} · {formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}
                  </Text>
                </View>
                <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
              </View>
            ))}
          </GlossCard>
        )}

        {upcomingRequests.length > 4 && (
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(coach)/schedule')}>
            <Text style={styles.viewAllText}>View Full Schedule</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
});
