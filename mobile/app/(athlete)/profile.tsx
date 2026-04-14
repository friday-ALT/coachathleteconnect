import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { profileApi, requestApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
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

  // Profile completion
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
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero header */}
      <View style={[styles.hero, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size={80} />
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badgesRow}>
          {user?.emailVerified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.statusGreen} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {profile?.skillLevel && (
            <StatusPill label={profile.skillLevel} color={SKILL_COLORS[profile.skillLevel] ?? Colors.primary} size="sm" />
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Completion bar */}
        {completionPct < 100 && (
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Strength</Text>
              <Text style={[styles.completionPct, { color: completionPct >= 80 ? Colors.statusGreen : Colors.statusOrange }]}>
                {completionPct}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${completionPct}%`,
                backgroundColor: completionPct >= 80 ? Colors.statusGreen : Colors.statusOrange,
              }]} />
            </View>
            {completionPct < 100 && (
              <Text style={styles.completionHint}>Complete your profile to improve discoverability</Text>
            )}
          </View>
        )}

        {/* Pending requests panel */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            </View>
            <View style={styles.card}>
              {pendingRequests.map((r: any, i: number) => (
                <View
                  key={r.id}
                  style={[styles.pendingRow, i < pendingRequests.length - 1 && styles.pendingRowBorder]}
                >
                  <View style={styles.pendingDot} />
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingCoach}>
                      {r.coachName || r.coach?.name || 'Coach'}
                    </Text>
                    <Text style={styles.pendingMeta}>
                      {r.requestedDate}  ·  {r.requestedStartTime}
                      {r.durationMins ? `  ·  ${r.durationMins}min` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() =>
                      Alert.alert('Cancel Request', 'Remove this pending request?', [
                        { text: 'Keep', style: 'cancel' },
                        { text: 'Cancel Request', style: 'destructive', onPress: () => cancelMutation.mutate(r.id) },
                      ])
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.statusRed} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/(athlete)/sessions')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all sessions</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Profile details */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Athlete Information</Text>
            <View style={styles.card}>
              <DetailRow icon="person-outline"    label="Age"       value={`${profile.age} years old`} />
              <DetailRow icon="trending-up-outline" label="Skill"   value={profile.skillLevel} />
              <DetailRow icon="location-outline"  label="Location"  value={`${profile.locationCity}, ${profile.locationState}`} />
              <DetailRow icon="call-outline"      label="Phone"     value={profile.phone} last />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <ActionRow
              icon="create-outline"
              label="Edit Profile"
              onPress={() => router.push('/edit-profile/athlete')}
            />
            {hasCoachProfile && (
              <ActionRow
                icon="swap-horizontal-outline"
                label="Switch to Coach Mode"
                onPress={async () => { await exitRole(); router.replace('/role-select'); }}
              />
            )}
            {!hasCoachProfile && (
              <ActionRow
                icon="trophy-outline"
                label="Become a Coach"
                onPress={() => router.push('/auth/onboarding/coach/step1')}
              />
            )}
            <ActionRow
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              danger
              last
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, last }: {
  icon: any; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[rowStyles.row, !last && rowStyles.rowBorder]}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, danger, last }: {
  icon: any; label: string; onPress: () => void; danger?: boolean; last?: boolean;
}) {
  return (
    <TouchableOpacity style={[rowStyles.row, !last && rowStyles.rowBorder]} onPress={onPress} activeOpacity={0.7}>
      <View style={[rowStyles.iconWrap, danger && { backgroundColor: `${Colors.statusRed}15` }]}>
        <Ionicons name={icon} size={16} color={danger ? Colors.statusRed : Colors.primary} />
      </View>
      <Text style={[rowStyles.label, { flex: 1 }, danger && { color: Colors.statusRed }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.muted} />}
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
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
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.ink,
  },
  value: {
    fontSize: FontSizes.base,
    color: Colors.body,
    marginLeft: 'auto',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  logoutBtn: {
    position: 'absolute',
    top: Spacing.xxl + Spacing.md,
    right: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  email: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Completion
  completionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
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
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: BorderRadius.full,
  },
  completionHint: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '500',
  },

  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm, marginLeft: 4,
  },
  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.statusRed,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Pending rows
  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  pendingRowBorder: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pendingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.statusOrange,
  },
  pendingInfo: { flex: 1 },
  pendingCoach: {
    fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink,
  },
  pendingMeta: {
    fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2,
  },
  cancelBtn: { padding: 4 },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'flex-end', marginTop: 6,
  },
  viewAllText: {
    fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600',
  },

  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
});
