import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { requestApi } from '../../lib/api';
import StatusPill from '../../components/ui/StatusPill';
import SectionHeader from '../../components/ui/SectionHeader';
import { formatDate, formatTime } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ dateStr }: { dateStr: string }) {
  const days = getDaysUntil(dateStr);
  if (days < 0) return null;
  const label = days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`;
  const color = days === 0 ? Colors.statusRed : days <= 2 ? Colors.statusOrange : Colors.statusBlue;
  return (
    <View style={[countdownStyles.badge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
      <Ionicons name="time-outline" size={11} color={color} />
      <Text style={[countdownStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const countdownStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  text: { fontSize: 10, fontWeight: '700' },
});

export default function Sessions() {
  const router = useRouter();
  const safeTop = useSafeTop();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['requests', 'athlete'],
    queryFn: () => requestApi.getRequests('athlete'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => requestApi.cancelRequest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['requests', 'athlete'] });
      const prev = queryClient.getQueryData(['requests', 'athlete']);
      queryClient.setQueryData(['requests', 'athlete'], (old: any[]) =>
        old?.filter((r) => r.id !== id) ?? []
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['requests', 'athlete'], ctx?.prev);
      Alert.alert('Error', 'Failed to cancel request. Please try again.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['requests', 'athlete'] }),
  });

  const handleCancel = (id: string, coachName: string) => {
    Alert.alert(
      'Cancel Request',
      `Cancel your session request with ${coachName}?`,
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Cancel Request', style: 'destructive', onPress: () => cancelMutation.mutate(id) },
      ]
    );
  };

  const confirmed = requests?.filter((r: any) => r.status === 'ACCEPTED')  || [];
  const pending   = requests?.filter((r: any) => r.status === 'PENDING')   || [];
  const declined  = requests?.filter((r: any) => r.status === 'DECLINED')  || [];

  const renderConfirmedCard = (r: any) => (
    <View key={r.id} style={styles.sessionRow}>
      <View style={[styles.accent, { backgroundColor: Colors.statusGreen }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.coachName}>{r.coachName}</Text>
          <StatusPill label="Confirmed" color={Colors.statusGreen} size="sm" />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.muted} />
          <Text style={styles.metaText}>{formatDate(r.requestedDate)}</Text>
          <Ionicons name="time-outline" size={13} color={Colors.muted} style={{ marginLeft: 8 }} />
          <Text style={styles.metaText}>{formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <CountdownBadge dateStr={r.requestedDate} />
          {r.message && (
            <Text style={styles.message} numberOfLines={1}>"{r.message}"</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderPendingCard = (r: any) => (
    <View key={r.id} style={styles.sessionRow}>
      <View style={[styles.accent, { backgroundColor: Colors.statusOrange }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.coachName}>{r.coachName}</Text>
          <StatusPill label="Pending" color={Colors.statusOrange} size="sm" />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.muted} />
          <Text style={styles.metaText}>{formatDate(r.requestedDate)}</Text>
          <Ionicons name="time-outline" size={13} color={Colors.muted} style={{ marginLeft: 8 }} />
          <Text style={styles.metaText}>{formatTime(r.requestedStartTime)} – {formatTime(r.requestedEndTime)}</Text>
        </View>
        {r.message && (
          <Text style={styles.message} numberOfLines={1}>"{r.message}"</Text>
        )}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancel(r.id, r.coachName)}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={14} color={Colors.statusRed} />
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDeclinedCard = (r: any) => (
    <View key={r.id} style={[styles.sessionRow, styles.declinedRow]}>
      <View style={[styles.accent, { backgroundColor: Colors.statusRed }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.coachName, { opacity: 0.5 }]}>{r.coachName}</Text>
          <StatusPill label="Declined" color={Colors.statusRed} size="sm" />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.muted} />
          <Text style={styles.metaText}>{formatDate(r.requestedDate)}</Text>
        </View>
      </View>
    </View>
  );

  const isEmpty = !requests || requests.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <Text style={styles.title}>My Sessions</Text>
        <Text style={styles.sub}>
          {requests ? `${requests.length} total` : 'Loading...'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={52} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySub}>Browse coaches and book your first session</Text>
            <TouchableOpacity onPress={() => router.push('/(athlete)/browse')} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Browse Coaches</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {confirmed.length > 0 && (
              <>
                <SectionHeader label="Confirmed" color={Colors.statusGreen} count={confirmed.length} />
                {confirmed.map(renderConfirmedCard)}
              </>
            )}
            {pending.length > 0 && (
              <>
                <SectionHeader label="Awaiting Response" color={Colors.statusOrange} count={pending.length} />
                {pending.map(renderPendingCard)}
              </>
            )}
            {declined.length > 0 && (
              <>
                <SectionHeader label="Declined" color={Colors.statusRed} count={declined.length} />
                {declined.map(renderDeclinedCard)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink },
  sub: { fontSize: FontSizes.sm, color: Colors.muted, fontWeight: '500', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  sessionRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.xs,
  },
  declinedRow: { opacity: 0.6 },
  accent: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.md },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  coachName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink, flex: 1, marginRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSizes.xs, color: Colors.muted, fontWeight: '500' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 6, flexWrap: 'wrap' },
  message: { fontSize: FontSizes.xs, color: Colors.body, fontStyle: 'italic', flex: 1 },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: Spacing.sm, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: `${Colors.statusRed}40`,
    backgroundColor: `${Colors.statusRed}08`,
  },
  cancelBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.statusRed },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink, marginTop: Spacing.sm },
  emptySub: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, marginTop: Spacing.md,
  },
  emptyBtnText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
});
