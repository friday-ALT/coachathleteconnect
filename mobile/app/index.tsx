import { useEffect, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { Colors, FontSizes } from '../constants/theme';

export default function Index() {
  const router       = useRouter();
  const rootNavState = useRootNavigationState();

  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { activeRole, hasAthleteProfile, hasCoachProfile, isLoading: roleLoading } = useRole();

  const splashDone = useRef(false);
  const navReady   = useRef(false);
  const pending    = useRef<string | null>(null);

  useEffect(() => {
    if (rootNavState?.key) {
      navReady.current = true;
      tryNavigate();
    }
  }, [rootNavState?.key]);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1200),
    ]).start(() => {
      splashDone.current = true;
      tryNavigate();
    });
  }, []);

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
      <Animated.View style={[styles.logoWrap, { opacity: fadeIn }]}>
        <View style={styles.logoMark} />
        <Text style={styles.brandName}>CoachConnect</Text>
        <Text style={styles.tagline}>Train smarter. Connect faster.</Text>
      </Animated.View>

      <Animated.View style={[styles.spinnerWrap, { opacity: fadeIn }]}>
        <ActivityIndicator color={Colors.ink} size="small" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoMark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.ink,
    marginBottom: 20,
  },
  brandName: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 8,
    fontSize: FontSizes.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
  spinnerWrap: {
    marginTop: 48,
  },
});
