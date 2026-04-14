import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { connectionApi, requestApi, profileApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatTile from '../../components/ui/StatTile';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusPill from '../../components/ui/StatusPill';
import { formatDate, formatTime, formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

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

  const handleRefresh = () => Promise.all([refetchConnections(), refetchRequests()]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.greeting}>Coach Dashboard</Text>
            <Text style={styles.name}>{profile?.name || user?.firstName}</Text>
          </View>
          <TouchableOpacity onPress={async () => { await exitRole(); router.replace('/role-select'); }} style={styles.switchBtn}>
            <Ionicons name="swap-horizontal-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatTile icon="people-outline"   value={acceptedAthletes.length}           label="Athletes"  color={Colors.statusBlue}   />
          <StatTile icon="calendar-outline" value={upcomingRequests.length}            label="Upcoming"  color={Colors.primary}      />
          <StatTile icon="star-outline"     value={profile?.rating?.toFixed(1) ?? '—'} label="Rating"   color={Colors.statusOrange} />
          <StatTile icon="cash-outline"     value={formatPrice(profile?.pricePerHour || 0)} label="/hr"  color={Colors.statusGreen}  />
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
        {/* Needs attention */}
        {needsAttention > 0 && (
          <TouchableOpacity style={styles.alertBox} onPress={() => router.push('/(coach)/requests')} activeOpacity={0.85}>
            <View style={styles.alertLeft}>
              <View style={styles.alertDot} />
              <View>
                <Text style={styles.alertTitle}>⚡ Needs Attention</Text>
                {pendingConnections.length > 0 && (
                  <Text style={styles.alertItem}>• {pendingConnections.length} new connection request{pendingConnections.length > 1 ? 's' : ''}</Text>
                )}
                {pendingRequests.length > 0 && (
                  <Text style={styles.alertItem}>• {pendingRequests.length} session request{pendingRequests.length > 1 ? 's' : ''} to review</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.statusOrange} />
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(coach)/schedule')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: `${Colors.statusBlue}18` }]}>
              <Ionicons name="calendar-outline" size={22} color={Colors.statusBlue} />
            </View>
            <Text style={styles.quickLabel}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(coach)/requests')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: `${Colors.statusOrange}18` }]}>
              <Ionicons name="notifications-outline" size={22} color={Colors.statusOrange} />
            </View>
            <Text style={styles.quickLabel}>Requests</Text>
            {needsAttention > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{needsAttention}</Text></View>}
          </TouchableOpacity>
        </View>

        {/* Upcoming sessions */}
        <SectionHeader label="Upcoming Sessions" color={Colors.primary} count={upcomingRequests.length} />
        {upcomingRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
          </View>
        ) : (
          upcomingRequests.slice(0, 4).map((r: any) => (
            <View key={r.id} style={styles.sessionRow}>
              <View style={styles.sessionAccent} />
              <View style={styles.sessionBody}>
                <View style={styles.sessionTop}>
                  <View style={styles.athleteRow}>
                    <Avatar name={r.athleteName} size={32} />
                    <Text style={styles.athleteName}>{r.athleteName}</Text>
                  </View>
                  <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.muted} />
                  <Text style={styles.metaText}>{formatDate(r.requestedDate)}</Text>
                  <Ionicons name="time-outline" size={13} color={Colors.muted} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {upcomingRequests.length > 4 && (
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(coach)/schedule')}>
            <Text style={styles.viewAllText}>View Full Schedule</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.ink,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
  },
  switchBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Alert
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${Colors.statusOrange}12`,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.statusOrange,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusOrange,
    marginTop: 5,
  },
  alertTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  alertItem: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginBottom: 1,
  },

  // Quick
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
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.statusOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },

  // Sessions
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
    backgroundColor: Colors.primary,
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
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  athleteName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '500',
  },
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
