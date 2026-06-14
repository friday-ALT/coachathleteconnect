import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, BorderRadius, FontSizes, Layout } from '../../constants/theme';
import AppCanvas from '../../components/ui/AppCanvas';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import GlossCard from '../../components/ui/GlossCard';
import { useSafeTop } from '../../hooks/useSafeTop';

export default function GetStartedScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const safeTop = useSafeTop();
  const selectedRole = role === 'athlete' || role === 'coach' ? role : null;

  if (selectedRole) {
    const isAthlete = selectedRole === 'athlete';
    return (
      <AppCanvas>
        <StatusBar style="light" />
        <View style={[styles.container, { paddingTop: safeTop + Spacing.md }]}>
          <PressableScale onPress={() => router.replace('/auth/get-started')} style={styles.backBtn} scaleTo={0.9}>
            <Ionicons name="arrow-back" size={22} color={Colors.ink} />
          </PressableScale>

          <Text style={styles.title}>{isAthlete ? 'Join as an athlete' : 'Join as a coach'}</Text>
          <Text style={styles.lead}>
            {isAthlete
              ? 'Create an account or sign in to find coaches and book sessions.'
              : 'Create an account or sign in to offer coaching and manage your schedule.'}
          </Text>

          <View style={styles.actions}>
            <Button
              title="Create account"
              onPress={() => router.push(`/auth/signup?role=${selectedRole}`)}
              variant="primary"
            />
            <Button
              title="I already have an account"
              onPress={() => router.push(`/auth/login?role=${selectedRole}`)}
              variant="outline"
            />
          </View>
        </View>
      </AppCanvas>
    );
  }

  return (
    <AppCanvas>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: safeTop + Spacing.md }]}>
        <PressableScale onPress={() => router.replace('/welcome')} style={styles.backBtn} scaleTo={0.9}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </PressableScale>

        <Text style={styles.title}>How will you use CoachConnect?</Text>
        <Text style={styles.lead}>Choose athlete or coach — you can add the other role later.</Text>

        <View style={styles.cards}>
          <PressableScale onPress={() => router.push('/auth/get-started?role=athlete')} scaleTo={0.98}>
            <GlossCard style={styles.roleCard} padding={Spacing.lg}>
              <View style={styles.roleRow}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                  <Ionicons name="person-outline" size={24} color={Colors.accent} />
                </View>
                <View style={styles.roleText}>
                  <Text style={styles.roleTitle}>I'm an athlete</Text>
                  <Text style={styles.roleDesc}>Find coaches and book training sessions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
              </View>
            </GlossCard>
          </PressableScale>

          <PressableScale onPress={() => router.push('/auth/get-started?role=coach')} scaleTo={0.98}>
            <GlossCard style={styles.roleCard} padding={Spacing.lg}>
              <View style={styles.roleRow}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                  <Ionicons name="trophy-outline" size={24} color={Colors.accent} />
                </View>
                <View style={styles.roleText}>
                  <Text style={styles.roleTitle}>I'm a coach</Text>
                  <Text style={styles.roleDesc}>Share your expertise and get discovered</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
              </View>
            </GlossCard>
          </PressableScale>
        </View>

        <PressableScale onPress={() => router.push('/auth/login')} style={styles.signInRow}>
          <Text style={styles.signInText}>
            Already registered? <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </PressableScale>
      </View>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingX,
    paddingBottom: Spacing.xl,
    width: '100%',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  lead: {
    fontSize: FontSizes.md,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cards: {
    gap: Spacing.md,
  },
  roleCard: {
    borderRadius: BorderRadius.lg,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
  },
  signInRow: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  signInText: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
  },
  signInLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
