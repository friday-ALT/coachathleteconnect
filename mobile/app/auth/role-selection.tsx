import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';

export default function RoleSelection() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top logo */}
      <View style={styles.topSection}>
        <View style={styles.logoRing}>
          <Ionicons name="football" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>What brings{'\n'}you here?</Text>
        <Text style={styles.subtitle}>Choose your role — you can add the other later</Text>
      </View>

      {/* Role cards */}
      <View style={styles.cards}>

        {/* Athlete card */}
        <TouchableOpacity
          style={[styles.card, styles.cardAthlete]}
          onPress={() => router.push('/auth/onboarding/athlete/step1')}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBubble, styles.iconBubbleAthlete]}>
              <Ionicons name="person" size={26} color={Colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>I'm an Athlete</Text>
              <Text style={styles.cardDesc}>Find coaches, book sessions, track progress</Text>
            </View>
          </View>
          <View style={[styles.arrowWrap, styles.arrowWrapAthlete]}>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Coach card */}
        <TouchableOpacity
          style={[styles.card, styles.cardCoach]}
          onPress={() => router.push('/auth/onboarding/coach/step1')}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBubble, styles.iconBubbleCoach]}>
              <Ionicons name="trophy" size={26} color={Colors.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>I'm a Coach</Text>
              <Text style={styles.cardDesc}>Get discovered, set your price, grow your roster</Text>
            </View>
          </View>
          <View style={[styles.arrowWrap, styles.arrowWrapCoach]}>
            <Ionicons name="arrow-forward" size={18} color={Colors.accent} />
          </View>
        </TouchableOpacity>

        {/* Both card */}
        <TouchableOpacity
          style={[styles.card, styles.cardBoth]}
          onPress={() => router.push('/auth/onboarding/athlete/step1')}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBubble, styles.iconBubbleBoth]}>
              <Ionicons name="people" size={24} color={Colors.statusPurple} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Both</Text>
              <Text style={styles.cardDesc}>Start as an athlete — add coaching later from your profile</Text>
            </View>
          </View>
          <View style={[styles.arrowWrap, styles.arrowWrapBoth]}>
            <Ionicons name="arrow-forward" size={18} color={Colors.statusPurple} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Trust note */}
      <View style={styles.trustRow}>
        <Ionicons name="shield-checkmark-outline" size={14} color={Colors.muted} />
        <Text style={styles.trustText}>Your data is encrypted and never shared</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  topSection: {
    paddingTop: 72,
    marginBottom: Spacing.xl,
  },
  logoRing: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['3xl'], fontWeight: '900',
    color: Colors.ink, lineHeight: 40, marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.base, color: Colors.muted, lineHeight: 22,
  },

  cards: { gap: Spacing.md },

  card: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    ...Shadow.sm,
  },
  cardAthlete: { borderColor: `${Colors.primary}40` },
  cardCoach:   { borderColor: `${Colors.accent}40` },
  cardBoth:    { borderColor: `${Colors.statusPurple}30` },

  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.md },
  iconBubble: {
    width: 54, height: 54, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBubbleAthlete: { backgroundColor: Colors.primaryLight },
  iconBubbleCoach:   { backgroundColor: `${Colors.accent}18` },
  iconBubbleBoth:    { backgroundColor: `${Colors.statusPurple}15` },

  cardText: { flex: 1 },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  cardDesc:  { fontSize: FontSizes.sm, color: Colors.body, lineHeight: 19 },

  arrowWrap: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  arrowWrapAthlete: { backgroundColor: Colors.primaryLight },
  arrowWrapCoach:   { backgroundColor: `${Colors.accent}18` },
  arrowWrapBoth:    { backgroundColor: `${Colors.statusPurple}15` },

  trustRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: Spacing.xl,
  },
  trustText: { fontSize: FontSizes.xs, color: Colors.muted },
});
