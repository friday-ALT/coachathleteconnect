import { useEffect, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';

export default function Index() {
  const router       = useRouter();
  const rootNavState = useRootNavigationState();

  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { activeRole, hasAthleteProfile, hasCoachProfile, isLoading: roleLoading } = useRole();

  // ── Navigation gates ────────────────────────────────────────────────────────
  const splashDone = useRef(false);
  const navReady   = useRef(false);
  const pending    = useRef<string | null>(null);

  useEffect(() => {
    if (rootNavState?.key) {
      navReady.current = true;
      tryNavigate();
    }
  }, [rootNavState?.key]);

  const doNavigate = (path: string) => {
    Animated.timing(fadeOut, {
      toValue: 0, duration: 300, useNativeDriver: true,
    }).start(() => router.replace(path as any));
  };

  const tryNavigate = () => {
    if (!splashDone.current || !navReady.current || !pending.current) return;
    const path = pending.current;
    pending.current = null;
    doNavigate(path);
  };

  const navigate = (path: string) => {
    pending.current = path;
    tryNavigate();
  };

  // ── Single fade-in animation ─────────────────────────────────────────────────
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1200),
    ]).start(() => {
      splashDone.current = true;
      tryNavigate();
    });
  }, []);

  // ── Auth routing ────────────────────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || roleLoading) navigate('/welcome');
    }, 6000);

    if (!authLoading && !roleLoading) {
      clearTimeout(timeout);
      if (!isAuthenticated || authError)               navigate('/welcome');
      else if (!hasAthleteProfile && !hasCoachProfile) navigate('/auth/role-selection');
      else if (!activeRole)                            navigate('/role-select');
      else if (activeRole === 'athlete')               navigate('/(athlete)/home');
      else                                             navigate('/(coach)/home');
    }
    return () => clearTimeout(timeout);
  }, [isAuthenticated, activeRole, authLoading, roleLoading, hasAthleteProfile, hasCoachProfile, authError]);

  return (
    <Animated.View style={[styles.root, { opacity: fadeOut }]}>

      {/* White card — Economist-style */}
      <Animated.View style={[styles.card, { opacity: fadeIn }]}>
        <Text style={styles.coach}>Coach</Text>
        <Text style={styles.athlete}>Athlete</Text>
        <Text style={styles.connectWord}>Connect</Text>
      </Animated.View>

      {/* Spinner below the card */}
      <Animated.View style={[styles.spinnerWrap, { opacity: fadeIn }]}>
        <ActivityIndicator color="rgba(255,255,255,0.5)" size="small" />
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#26a641',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: 'center',
  },
  coach: {
    fontSize: 36,
    fontWeight: '800',
    color: '#26a641',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  athlete: {
    fontSize: 36,
    fontWeight: '800',
    color: '#26a641',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  connectWord: {
    fontSize: 13,
    fontWeight: '600',
    color: '#26a641',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  spinnerWrap: {
    marginTop: 48,
  },
});
