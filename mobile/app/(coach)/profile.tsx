import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { profileApi, requestApi } from '../../lib/api';
import { usePaymentsConfig, useCoachStripeStatus, useStripeConnect } from '../../hooks/useStripeConnect';
import Avatar from '../../components/ui/Avatar';
import AppCanvas from '../../components/ui/AppCanvas';
import GlossCard from '../../components/ui/GlossCard';
import SectionHeader from '../../components/ui/SectionHeader';
import PressableScale from '../../components/ui/PressableScale';
import { formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';
import { useDeleteAccount } from '../../lib/useDeleteAccount';

export default function CoachProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const safeTop = useSafeTop();
  const { hasAthleteProfile, exitRole } = useRole();
  const { confirmDelete } = useDeleteAccount((user as { authProvider?: string })?.authProvider);

  const { data: profile } = useQuery({
    queryKey: ['coach-profile'],
    queryFn: profileApi.getCoachProfile,
  });

  const { data: payConfig, isError: payConfigUnavailable } = usePaymentsConfig();
  const showServerStripeWarning = payConfig?.configured === false;

  const { data: stripeStatus, isLoading: stripeLoading } = useCoachStripeStatus(true);
  const onboardMutation = useStripeConnect();

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
    <AppCanvas>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: safeTop + Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <PressableScale onPress={handleLogout} style={styles.logoutBtn} scaleTo={0.9}>
            <Ionicons name="log-out-outline" size={20} color={Colors.body} />
          </PressableScale>

          <View style={styles.avatarRing}>
            <Avatar name={profile?.name || user?.firstName} uri={profile?.avatarUrl} size={84} />
          </View>

          <Text style={styles.name}>{profile?.name || user?.firstName}</Text>
          {profile?.rating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={Colors.accent} />
              <Text style={styles.ratingText}>
                {profile.rating.toFixed(1)} ({profile.reviewCount || 0} reviews)
              </Text>
            </View>
          ) : (
            <Text style={styles.noRating}>No reviews yet</Text>
          )}

          <GlossCard style={styles.heroStats} padding={Spacing.md}>
            <View style={styles.heroStatsInner}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{formatPrice(profile?.pricePerHour || 0)}</Text>
                <Text style={styles.heroStatLabel}>Per hour</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{profile?.locationCity || '—'}</Text>
                <Text style={styles.heroStatLabel}>Location</Text>
              </View>
            </View>
          </GlossCard>
        </View>

        {/* Completion */}
        {completionPct < 100 && (
          <GlossCard style={styles.completionCard}>
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
          </GlossCard>
        )}

        {/* Pending booking requests panel */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Action needed" count={pendingRequests.length} />
            <GlossCard padding={0}>
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
            </GlossCard>
            {pendingRequests.length > 3 && (
              <PressableScale
                style={styles.viewAllBtn}
                onPress={() => router.push('/(coach)/requests')}
              >
                <Text style={styles.viewAllText}>See all {pendingRequests.length} requests</Text>
                <Ionicons name="arrow-forward" size={13} color={Colors.accent} />
              </PressableScale>
            )}
          </View>
        )}

        {/* Coach info */}
        {profile && (
          <View style={styles.section}>
            <SectionHeader label="Coach information" />
            <GlossCard padding={0}>
              <DetailRow icon="location-outline"   label="Location"    value={`${profile.locationCity}, ${profile.locationState}`} />
              <DetailRow icon="cash-outline"        label="Hourly Rate" value={formatPrice(profile.pricePerHour)} />
              <DetailRow icon="call-outline"        label="Phone"       value={profile.phone} last={!profile.experience} />
              {profile.experience && (
                <View style={detailStyles.row}>
                  <View style={detailStyles.iconWrap}>
                    <Ionicons name="document-text-outline" size={16} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={detailStyles.label}>Experience</Text>
                    <Text style={detailStyles.exp}>{profile.experience}</Text>
                  </View>
                </View>
              )}
            </GlossCard>
          </View>
        )}

        {/* Stripe Payments Section */}
        <View style={styles.section}>
          <SectionHeader label="Payments & earnings" />
          {showServerStripeWarning ? (
            <GlossCard style={styles.stripeDisabled}>
              <Ionicons name="alert-circle-outline" size={22} color={Colors.statusOrange} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stripeDisabledTitle}>Payments not configured on server</Text>
                <Text style={styles.stripeDisabledSub}>
                  Add STRIPE_SECRET_KEY in Railway Variables and redeploy. Same keys as your website.
                </Text>
              </View>
            </GlossCard>
          ) : payConfigUnavailable ? (
            <Text style={styles.stripeHint}>
              Using production API — tap Connect Stripe below (same as website).
            </Text>
          ) : null}
          {stripeLoading ? (
            <GlossCard>
              <ActivityIndicator color={Colors.accent} style={{ padding: Spacing.md }} />
            </GlossCard>
          ) : stripeStatus?.onboardingComplete ? (
            <GlossCard style={styles.stripeConnected}>
              <View style={styles.stripeRow}>
                <View style={[styles.stripeIconWrap, { backgroundColor: '#635BFF20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#635BFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stripeTitle}>Stripe Connected</Text>
                  <Text style={styles.stripeSub}>You can receive payments for bookings</Text>
                </View>
              </View>
            </GlossCard>
          ) : (
            <TouchableOpacity
              style={styles.stripeCTA}
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
          <SectionHeader label="Account" />
          <GlossCard padding={0}>
            <ActionRow
              icon="create-outline"
              label="Edit Coach Profile"
              onPress={() => router.push('/edit-profile/coach')}
            />
            <ActionRow
              icon="chatbubbles-outline"
              label="Messages"
              onPress={() => router.push('/messages')}
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
            <ActionRow icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
            <ActionRow icon="trash-outline" label="Delete account" onPress={confirmDelete} danger last />
          </GlossCard>
        </View>
      </ScrollView>
    </AppCanvas>
  );
}

function DetailRow({ icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={[detailStyles.row, !last && detailStyles.rowBorder]}>
      <View style={detailStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
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
        <Ionicons name={icon} size={16} color={danger ? Colors.statusRed : Colors.accent} />
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
    backgroundColor: Colors.accentLight,
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    borderRadius: 46,
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    fontWeight: '600',
  },
  noRating: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    marginTop: 6,
  },
  heroStats: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  heroStatsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatVal: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.ink,
  },
  heroStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.body,
    marginTop: 2,
    fontWeight: '500',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.success,
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
    fontSize: FontSizes.xs, color: Colors.accent, fontWeight: '600',
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#635BFF',
    padding: Spacing.md,
  },
  stripeCTALeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  stripeCTATitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.white },
  stripeCTASub:   { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  stripeDisabled: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: `${Colors.statusOrange}12`,
    borderColor: `${Colors.statusOrange}40`,
  },
  stripeDisabledTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.ink,
  },
  stripeDisabledSub: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  stripeHint: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
});
