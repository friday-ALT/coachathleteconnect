import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../constants/theme';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../hooks/useAuth';

const ROLE_OPTIONS = [
  {
    role: 'athlete' as const,
    title: 'Athlete Mode',
    description: 'Browse coaches and book sessions',
    icon: 'person-outline' as const,
    color: Colors.statusBlue,
  },
  {
    role: 'coach' as const,
    title: 'Coach Mode',
    description: 'Manage requests and your schedule',
    icon: 'trophy-outline' as const,
    color: Colors.statusPurple,
  },
];

export default function RoleSelect() {
  const router = useRouter();
  const { hasAthleteProfile, hasCoachProfile, enterRole, isLoading } = useRole();
  const { logout } = useAuth();

  const handleSelect = async (role: 'athlete' | 'coach') => {
    try {
      await enterRole(role);
      router.replace(role === 'athlete' ? '/(athlete)/home' : '/(coach)/home');
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const available = ROLE_OPTIONS.filter((o) =>
    (o.role === 'athlete' && hasAthleteProfile) ||
    (o.role === 'coach' && hasCoachProfile)
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color={Colors.muted} />
      </TouchableOpacity>

      <View style={styles.inner}>
        <View style={styles.icon}>
          <Ionicons name="football-outline" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>How do you want to use the app today?</Text>

        <View style={styles.cards}>
          {available.map((opt) => (
            <TouchableOpacity
              key={opt.role}
              style={styles.card}
              onPress={() => handleSelect(opt.role)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${opt.color}18` }]}>
                <Ionicons name={opt.icon} size={28} color={opt.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{opt.title}</Text>
                <Text style={styles.cardDesc}>{opt.description}</Text>
              </View>
              <View style={[styles.arrow, { backgroundColor: `${opt.color}18` }]}>
                <Ionicons name="arrow-forward" size={18} color={opt.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {(hasAthleteProfile || hasCoachProfile) && (
          <TouchableOpacity style={styles.addRole} onPress={() => router.push('/auth/role-selection')}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.addRoleText}>Add another role</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logoutBtn: {
    position: 'absolute',
    top: Spacing.xxl + Spacing.md,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.muted,
    fontWeight: '500',
    marginBottom: Spacing.xl,
  },
  cards: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: FontSizes.sm,
    color: Colors.body,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRole: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  addRoleText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
