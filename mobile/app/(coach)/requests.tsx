import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { connectionApi, requestApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import SectionHeader from '../../components/ui/SectionHeader';
import { formatDate, formatTime } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

type Tab = 'connections' | 'sessions';

export default function CoachRequests() {
  const [tab, setTab] = useState<Tab>('connections');
  const queryClient = useQueryClient();
  const safeTop = useSafeTop();

  const { data: connections, isLoading: cLoading, refetch: refetchC } = useQuery({
    queryKey: ['connections', 'coach'],
    queryFn: () => connectionApi.getConnections('coach'),
  });

  const { data: requests, isLoading: rLoading, refetch: refetchR } = useQuery({
    queryKey: ['requests', 'coach'],
    queryFn: () => requestApi.getRequests('coach'),
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      connectionApi.updateConnection(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections', 'coach'] }),
    onError: () => Alert.alert('Error', 'Failed to update connection'),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      requestApi.updateRequest(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests', 'coach'] }),
    onError: () => Alert.alert('Error', 'Failed to update request'),
  });

  const pendingConns   = connections?.filter((c: any) => c.status === 'PENDING')  || [];
  const acceptedConns  = connections?.filter((c: any) => c.status === 'ACCEPTED') || [];
  const declinedConns  = connections?.filter((c: any) => c.status === 'DECLINED') || [];

  const pendingReqs    = requests?.filter((r: any) => r.status === 'PENDING')  || [];
  const acceptedReqs   = requests?.filter((r: any) => r.status === 'ACCEPTED') || [];
  const declinedReqs   = requests?.filter((r: any) => r.status === 'DECLINED') || [];

  const pendingTotal = pendingConns.length + pendingReqs.length;

  const handleRefresh = () => Promise.all([refetchC(), refetchR()]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <Text style={styles.title}>Requests</Text>
        {pendingTotal > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingTotal} pending</Text>
          </View>
        )}
      </View>

      {/* Tab toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'connections' && styles.tabActive]}
          onPress={() => setTab('connections')}
          activeOpacity={0.8}
        >
          <Ionicons name="people-outline" size={16} color={tab === 'connections' ? Colors.primary : Colors.muted} />
          <Text style={[styles.tabText, tab === 'connections' && styles.tabTextActive]}>
            Connections
            {pendingConns.length > 0 && ` (${pendingConns.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sessions' && styles.tabActive]}
          onPress={() => setTab('sessions')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={tab === 'sessions' ? Colors.primary : Colors.muted} />
          <Text style={[styles.tabText, tab === 'sessions' && styles.tabTextActive]}>
            Sessions
            {pendingReqs.length > 0 && ` (${pendingReqs.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={cLoading || rLoading} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {tab === 'connections' ? (
          <>
            {/* Pending connections */}
            {pendingConns.length > 0 && (
              <>
                <SectionHeader label="Pending" color={Colors.statusOrange} count={pendingConns.length} />
                {pendingConns.map((c: any) => (
                  <View key={c.id} style={styles.card}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusOrange }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={c.athleteName} size={40} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{c.athleteName}</Text>
                          <Text style={styles.cardSub}>{c.skillLevel ? `${c.skillLevel} · ` : ''}{c.locationCity}</Text>
                        </View>
                        <StatusPill label="Pending" color={Colors.statusOrange} size="sm" />
                      </View>
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.declineBtn]}
                          onPress={() => updateConnectionMutation.mutate({ id: c.id, status: 'DECLINED' })}
                          disabled={updateConnectionMutation.isPending}
                        >
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => updateConnectionMutation.mutate({ id: c.id, status: 'ACCEPTED' })}
                          disabled={updateConnectionMutation.isPending}
                        >
                          {updateConnectionMutation.isPending ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                          ) : (
                            <Text style={styles.acceptBtnText}>Accept ✓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Accepted */}
            {acceptedConns.length > 0 && (
              <>
                <SectionHeader label="Accepted" color={Colors.statusGreen} count={acceptedConns.length} />
                {acceptedConns.map((c: any) => (
                  <View key={c.id} style={[styles.card, styles.cardCompact]}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusGreen }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={c.athleteName} size={36} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{c.athleteName}</Text>
                          <Text style={styles.cardSub}>{c.locationCity}</Text>
                        </View>
                        <StatusPill label="Connected" color={Colors.statusGreen} size="sm" />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Declined */}
            {declinedConns.length > 0 && (
              <>
                <SectionHeader label="Declined" color={Colors.statusRed} count={declinedConns.length} />
                {declinedConns.map((c: any) => (
                  <View key={c.id} style={[styles.card, styles.cardCompact, styles.cardFaded]}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusRed }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={c.athleteName} size={36} />
                        <View style={styles.cardInfo}>
                          <Text style={[styles.cardName, styles.fadedText]}>{c.athleteName}</Text>
                        </View>
                        <StatusPill label="Declined" color={Colors.statusRed} size="sm" />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {!pendingConns.length && !acceptedConns.length && !declinedConns.length && (
              <EmptyState icon="people-outline" title="No connection requests" sub="Athletes will appear here when they request to connect with you" />
            )}
          </>
        ) : (
          <>
            {/* Pending sessions */}
            {pendingReqs.length > 0 && (
              <>
                <SectionHeader label="Pending" color={Colors.statusOrange} count={pendingReqs.length} />
                {pendingReqs.map((r: any) => (
                  <View key={r.id} style={styles.card}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusOrange }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={r.athleteName} size={40} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{r.athleteName}</Text>
                          <View style={styles.sessionMeta}>
                            <Ionicons name="calendar-outline" size={12} color={Colors.muted} />
                            <Text style={styles.cardSub}>{formatDate(r.requestedDate)}</Text>
                            <Ionicons name="time-outline" size={12} color={Colors.muted} />
                            <Text style={styles.cardSub}>{formatTime(r.requestedStartTime)}–{formatTime(r.requestedEndTime)}</Text>
                          </View>
                        </View>
                        <StatusPill label="Pending" color={Colors.statusOrange} size="sm" />
                      </View>
                      {r.message && (
                        <View style={styles.messageBox}>
                          <Ionicons name="chatbox-outline" size={13} color={Colors.muted} />
                          <Text style={styles.messageText} numberOfLines={2}>"{r.message}"</Text>
                        </View>
                      )}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.declineBtn]}
                          onPress={() => updateRequestMutation.mutate({ id: r.id, status: 'DECLINED' })}
                          disabled={updateRequestMutation.isPending}
                        >
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => updateRequestMutation.mutate({ id: r.id, status: 'ACCEPTED' })}
                          disabled={updateRequestMutation.isPending}
                        >
                          {updateRequestMutation.isPending ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                          ) : (
                            <Text style={styles.acceptBtnText}>Accept ✓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {acceptedReqs.length > 0 && (
              <>
                <SectionHeader label="Accepted" color={Colors.statusGreen} count={acceptedReqs.length} />
                {acceptedReqs.map((r: any) => (
                  <View key={r.id} style={[styles.card, styles.cardCompact]}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusGreen }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={r.athleteName} size={36} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{r.athleteName}</Text>
                          <Text style={styles.cardSub}>{formatDate(r.requestedDate)} · {formatTime(r.requestedStartTime)}</Text>
                        </View>
                        <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {declinedReqs.length > 0 && (
              <>
                <SectionHeader label="Declined" color={Colors.statusRed} count={declinedReqs.length} />
                {declinedReqs.map((r: any) => (
                  <View key={r.id} style={[styles.card, styles.cardCompact, styles.cardFaded]}>
                    <View style={[styles.cardAccent, { backgroundColor: Colors.statusRed }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Avatar name={r.athleteName} size={36} />
                        <View style={styles.cardInfo}>
                          <Text style={[styles.cardName, styles.fadedText]}>{r.athleteName}</Text>
                          <Text style={styles.cardSub}>{formatDate(r.requestedDate)}</Text>
                        </View>
                        <StatusPill label="Declined" color={Colors.statusRed} size="sm" />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {!pendingReqs.length && !acceptedReqs.length && !declinedReqs.length && (
              <EmptyState icon="calendar-outline" title="No session requests" sub="Athletes who are connected with you can request sessions" />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <View style={emptyStyles.wrap}>
      <Ionicons name={icon} size={48} color={Colors.muted} />
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.sub}>{sub}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink },
  sub: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center', maxWidth: 260 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.ink,
  },
  pendingBadge: {
    backgroundColor: Colors.statusOrange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pendingBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: Colors.white,
  },

  // Tab
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
    backgroundColor: Colors.background,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.muted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Cards
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  cardCompact: {},
  cardFaded: {
    opacity: 0.6,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '500',
  },
  fadedText: {
    color: Colors.muted,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  messageText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.body,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  declineBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.body,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
});
