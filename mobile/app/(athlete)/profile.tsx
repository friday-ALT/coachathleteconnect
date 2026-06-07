import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { profileApi, requestApi } from '../../lib/api';
import { useDeleteAccount } from '../../lib/useDeleteAccount';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import AppCanvas from '../../components/ui/AppCanvas';
import GlossCard from '../../components/ui/GlossCard';
import SectionHeader from '../../components/ui/SectionHeader';
import PressableScale from '../../components/ui/PressableScale';
import { useSafeTop } from '../../hooks/useSafeTop';

const SKILL_COLORS: Record<string, string> = {
  Beginner:     Colors.statusBlue,
  Intermediate: Colors.statusOrange,
  Advanced:     Colors.statusPurple,
};

export default function AthleteProfile() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const { hasCoachProfile, exitRole } = useRole();
  const safeTop = useSafeTop();
  const { confirmDelete } = useDeleteAccount((user as { authProvider?: string })?.authProvider);

  const { data: profile } = useQuery({
    queryKey: ['athlete-profile'],
    queryFn: profileApi.getAthleteProfile,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', 'athlete'],
    queryFn: () => requestApi.getRequests('athlete'),
    staleTime: 30_000,
  });

  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING');

  const cancelMutation = useMutation({
    mutationFn: (id: string) => requestApi.cancelRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests', 'athlete'] }),
    onError: () => Alert.alert('Error', 'Could not cancel request.'),
  });

  const fields = [
    !!profile?.age,
    !!profile?.skillLevel,
    !!profile?.locationCity,
    !!profile?.phone,
    !!user?.emailVerified,
  ];
  const completedCount = fields.filter(Boolean).length;
  const completionPct  = Math.round((completedCount / fields.length) * 100);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <AppCanvas>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: safeTop + Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header — blended into dark canvas */}
        <View style={styles.profileHeader}>
          <PressableScale onPress={handleLogout} style={styles.logoutBtn} scaleTo={0.9}>
            <Ionicons name="log-out-outline" size={20} color={Colors.body} />
          </PressableScale>

          <View style={styles.avatarRing}>
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size={80} />
          </View>

          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgesRow}>
            {user?.emailVerified && (
              <View style={styles.verifiedChip}>
                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            {profile?.skillLevel && (
              <StatusPill
                label={profile.skillLevel}
                color={SKILL_COLORS[profile.skillLevel] ?? Colors.accent}
                size="sm"
              />
            )}
          </View>
        </View>

        {completionPct < 100 && (
          <GlossCard glossy style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile strength</Text>
              <Text style={[styles.completionPct, {
                color: completionPct >= 80 ? Colors.success : Colors.accent,
              }]}>
                {completionPct}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${completionPct}%`,
                backgroundColor: completionPct >= 80 ? Colors.success : Colors.accent,
              }]} />
            </View>
            <Text style={styles.completionHint}>
              Complete your profile to improve discoverability
            </Text>
          </GlossCard>
        )}

        {pendingRequests.length > 0 && (
          <>
            <SectionHeader label="Pending requests" count={pendingRequests.length} />
            <GlossCard glossy padding={0}>
              {pendingRequests.map((r: any, i: number) => (
                <View
                  key={r.id}
                  style={[styles.pendingRow, i < pendingRequests.length - 1 && rowStyles.rowBorder]}
                >
                  <View style={styles.pendingDot} />
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingCoach}>
                      {r.coachName || r.coach?.name || 'Coach'}
                    </Text>
                    <Text style={styles.pendingMeta}>
                      {r.requestedDate} · {r.requestedStartTime}
                    </Text>
                  </View>
                  <PressableScale
                    scaleTo={0.9}
                    onPress={() =>
                      Alert.alert('Cancel Request', 'Remove this pending request?', [
                        { text: 'Keep', style: 'cancel' },
                        { text: 'Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(r.id) },
                      ])
                    }
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.statusRed} />
                  </PressableScale>
                </View>
              ))}
            </GlossCard>
            <PressableScale
              onPress={() => router.push('/(athlete)/sessions')}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>View all sessions</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.accent} />
            </PressableScale>
          </>
        )}

        {profile && (
          <>
            <SectionHeader label="Athlete information" />
            <GlossCard glossy padding={0}>
              <DetailRow icon="person-outline" label="Age" value={`${profile.age} years old`} />
              <DetailRow icon="trending-up-outline" label="Skill" value={profile.skillLevel} />
              <DetailRow icon="location-outline" label="Location" value={`${profile.locationCity}, ${profile.locationState}`} />
              <DetailRow icon="call-outline" label="Phone" value={profile.phone || '—'} last />
            </GlossCard>
          </>
        )}

        <SectionHeader label="Account" />
        <GlossCard glossy padding={0}>
          <ActionRow icon="create-outline" label="Edit profile" onPress={() => router.push('/edit-profile/athlete')} />
          <ActionRow icon="chatbubbles-outline" label="Messages" onPress={() => router.push('/messages')} />
          {hasCoachProfile && (
            <ActionRow
              icon="swap-horizontal-outline"
              label="Switch to coach mode"
              onPress={async () => { await exitRole(); router.replace('/role-select'); }}
            />
          )}
          {!hasCoachProfile && (
            <ActionRow
              icon="trophy-outline"
              label="Become a coach"
              onPress={() => router.push('/auth/onboarding/coach/step1')}
            />
          )}
          <ActionRow icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
          <ActionRow icon="trash-outline" label="Delete account" onPress={confirmDelete} danger last />
        </GlossCard>
      </ScrollView>
    </AppCanvas>
  );
}

function DetailRow({ icon, label, value, last }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[rowStyles.row, !last && rowStyles.rowBorder]}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, danger, last }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean; last?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98}>
      <View style={[rowStyles.row, !last && rowStyles.rowBorder]}>
        <View style={[rowStyles.iconWrap, danger && rowStyles.iconWrapDanger]}>
          <Ionicons name={icon} size={16} color={danger ? Colors.statusRed : Colors.accent} />
        </View>
        <Text style={[rowStyles.label, { flex: 1 }, danger && { color: Colors.statusRed }]}>{label}</Text>
        {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.muted} />}
      </View>
    </PressableScale>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(255, 69, 106, 0.15)',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.ink,
  },
  value: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginLeft: 'auto',
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  logoutBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.accent,
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginTop: 4,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  completionCard: {
    marginBottom: Spacing.lg,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  completionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  completionPct: {
    fontSize: FontSizes.base,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.ringTrack,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: BorderRadius.full,
  },
  completionHint: {
    fontSize: FontSizes.xs,
    color: Colors.body,
    fontWeight: '500',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  pendingInfo: { flex: 1 },
  pendingCoach: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.ink,
  },
  pendingMeta: {
    fontSize: FontSizes.xs,
    color: Colors.body,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    fontWeight: '600',
  },
});
