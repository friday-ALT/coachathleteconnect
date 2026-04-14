import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { profileApi, paymentApi, requestApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import { formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

export default function CoachProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const safeTop = useSafeTop();
  const { hasAthleteProfile, exitRole } = useRole();

  const { data: profile } = useQuery({
    queryKey: ['coach-profile'],
    queryFn: profileApi.getCoachProfile,
  });

  const { data: stripeStatus, isLoading: stripeLoading } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: paymentApi.getCoachStripeStatus,
    staleTime: 30_000,
  });

  const onboardMutation = useMutation({
    mutationFn: paymentApi.startCoachOnboarding,
    onSuccess: async (data) => {
      await WebBrowser.openAuthSessionAsync(data.url, 'coachconnect://stripe-return');
      // Refresh stripe status after returning
      queryClient.invalidateQueries({ queryKey: ['stripe-status'] });
    },
    onError: () => Alert.alert('Error', 'Failed to start Stripe setup. Make sure STRIPE_SECRET_KEY is configured.'),
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const completionFields = [!!profile?.experience, !!profile?.locationCity, !!profile?.phone, !!profile?.pricePerHour];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', 'coach'],
    queryFn: () => requestApi.getRequests('coach'),
    staleTime: 30_000,
  });
  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING');

  const approveMutation = useMutation({
    mutationFn: (id: string) => requestApi.updateRequest(id, 'APPROVED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests', 'coach'] }),
  });
  const declineMutation = useMutation({
    mutationFn: (id: string) => requestApi.updateRequest(id, 'DECLINED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests', 'coach'] }),
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero */}
      <View style={[styles.hero, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Avatar name={profile?.name || user?.firstName} uri={profile?.avatarUrl} size={84} />
        <Text style={styles.name}>{profile?.name || user?.firstName}</Text>
        {profile?.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FDAB3D" />
            <Text style={styles.ratingText}>{profile.rating.toFixed(1)} ({profile.reviewCount || 0} reviews)</Text>
          </View>
        ) : (
          <Text style={styles.noRating}>No reviews yet</Text>
        )}

        {/* Quick stats */}
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{formatPrice(profile?.pricePerHour || 0)}</Text>
            <Text style={styles.heroStatLabel}>Per Hour</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{profile?.locationCity || '—'}</Text>
            <Text style={styles.heroStatLabel}>Location</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Completion */}
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
            <Text style={styles.completionHint}>A complete profile gets 3x more connection requests</Text>
          </View>
        )}

        {/* Pending booking requests panel */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Action Needed</Text>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>{pendingRequests.length} pending</Text>
              </View>
            </View>
            <View style={styles.card}>
              {pendingRequests.slice(0, 3).map((r: any, i: number) => (
                <View
                  key={r.id}
                  style={[styles.pendingRow, i < Math.min(pendingRequests.length, 3) - 1 && styles.pendingRowBorder]}
                >
                  <View style={styles.pendingLeft}>
                    <View style={styles.pendingDot} />
                    <View style={styles.pendingInfo}>
                      <Text style={styles.pendingAthlete}>
                        {r.athleteName || r.athlete?.name || 'Athlete'}
                      </Text>
                      <Text style={styles.pendingMeta}>
                        {r.requestedDate}  ·  {r.requestedStartTime}
                        {r.durationMins ? `  ·  ${r.durationMins}min` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => approveMutation.mutate(r.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => declineMutation.mutate(r.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={16} color={Colors.statusRed} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            {pendingRequests.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(coach)/requests')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>See all {pendingRequests.length} requests</Text>
                <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Coach info */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Coach Information</Text>
            <View style={styles.card}>
              <DetailRow icon="location-outline"   label="Location"    value={`${profile.locationCity}, ${profile.locationState}`} />
              <DetailRow icon="cash-outline"        label="Hourly Rate" value={formatPrice(profile.pricePerHour)} />
              <DetailRow icon="call-outline"        label="Phone"       value={profile.phone} last={!profile.experience} />
              {profile.experience && (
                <View style={detailStyles.row}>
                  <View style={[detailStyles.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={detailStyles.label}>Experience</Text>
                    <Text style={detailStyles.exp}>{profile.experience}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Stripe Payments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payments & Earnings</Text>
          {stripeLoading ? (
            <View style={styles.card}>
              <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.md }} />
            </View>
          ) : stripeStatus?.onboardingComplete ? (
            <View style={[styles.card, styles.stripeConnected]}>
              <View style={styles.stripeRow}>
                <View style={[styles.stripeIconWrap, { backgroundColor: '#635BFF20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#635BFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stripeTitle}>Stripe Connected</Text>
                  <Text style={styles.stripeSub}>You can receive payments for bookings</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.card, styles.stripeCTA]}
              onPress={() => onboardMutation.mutate()}
              disabled={onboardMutation.isPending}
              activeOpacity={0.8}
            >
              {onboardMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <View style={styles.stripeCTALeft}>
                    <View style={[styles.stripeIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name="card-outline" size={20} color={Colors.white} />
                    </View>
                    <View>
                      <Text style={styles.stripeCTATitle}>Connect Stripe to Get Paid</Text>
                      <Text style={styles.stripeCTASub}>Takes 2 mins — required to accept payments</Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Account actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <ActionRow
              icon="create-outline"
              label="Edit Coach Profile"
              onPress={() => router.push('/edit-profile/coach')}
            />
            {hasAthleteProfile && (
              <ActionRow
                icon="swap-horizontal-outline"
                label="Switch to Athlete Mode"
                onPress={async () => { await exitRole(); router.replace('/role-select'); }}
              />
            )}
            {!hasAthleteProfile && (
              <ActionRow
                icon="person-outline"
                label="Create Athlete Profile"
                onPress={() => router.push('/auth/onboarding/athlete/step1')}
              />
            )}
            <ActionRow icon="log-out-outline" label="Logout" onPress={handleLogout} danger last />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={[detailStyles.row, !last && detailStyles.rowBorder]}>
      <View style={detailStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, danger, last }: { icon: any; label: string; onPress: () => void; danger?: boolean; last?: boolean }) {
  return (
    <TouchableOpacity style={[detailStyles.row, !last && detailStyles.rowBorder]} onPress={onPress} activeOpacity={0.7}>
      <View style={[detailStyles.iconWrap, danger && { backgroundColor: `${Colors.statusRed}15` }]}>
        <Ionicons name={icon} size={16} color={danger ? Colors.statusRed : Colors.primary} />
      </View>
      <Text style={[detailStyles.label, { flex: 1 }, danger && { color: Colors.statusRed }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.muted} />}
    </TouchableOpacity>
  );
}

const detailStyles = StyleSheet.create({
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
  exp: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    lineHeight: 19,
    marginTop: 3,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.ink,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  noRating: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatVal: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  heroStatLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '500',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
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
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm, marginLeft: 4,
  },
  urgentBadge: {
    backgroundColor: `${Colors.statusRed}18`,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: `${Colors.statusRed}40`,
  },
  urgentBadgeText: {
    fontSize: 10, fontWeight: '700', color: Colors.statusRed,
  },

  // Pending rows
  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  pendingRowBorder: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  pendingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.statusOrange,
  },
  pendingInfo: { flex: 1 },
  pendingAthlete: {
    fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink,
  },
  pendingMeta: {
    fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2,
  },
  pendingActions: { flexDirection: 'row', gap: 6 },
  approveBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  declineBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${Colors.statusRed}15`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${Colors.statusRed}40`,
  },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'flex-end', marginTop: 6,
  },
  viewAllText: {
    fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600',
  },

  sectionLabel: {
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

  // Stripe section
  stripeConnected: {
    paddingVertical: Spacing.md,
    borderColor: '#635BFF40',
    backgroundColor: '#635BFF08',
  },
  stripeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stripeIconWrap: {
    width: 36, height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripeTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink },
  stripeSub:   { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 1 },

  stripeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#635BFF',
    borderColor: '#635BFF',
    paddingVertical: Spacing.md,
  },
  stripeCTALeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  stripeCTATitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.white },
  stripeCTASub:   { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
});
