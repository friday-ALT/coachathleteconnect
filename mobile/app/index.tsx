import { useEffect, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, Easing,
  Dimensions, StatusBar,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';

const { width, height } = Dimensions.get('window');
const CIRCLE = width * 0.72;

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
    Animated.timing(screenOpacity, {
      toValue: 0, duration: 400,
      easing: Easing.in(Easing.cubic), useNativeDriver: true,
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

  // ── Animated values ─────────────────────────────────────────────────────────
  const screenOpacity  = useRef(new Animated.Value(1)).current;

  // Background glow pulse
  const glowScale   = useRef(new Animated.Value(0.3)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Pitch circle
  const circleScale   = useRef(new Animated.Value(0.0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  // Ball
  const ballScale    = useRef(new Animated.Value(0)).current;
  const ballY        = useRef(new Animated.Value(-30)).current;
  const ballOpacity  = useRef(new Animated.Value(0)).current;
  const ballRotate   = useRef(new Animated.Value(0)).current;

  // Logo text
  const logoY       = useRef(new Animated.Value(20)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Sub text
  const subY       = useRef(new Animated.Value(14)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  // Tagline
  const tagY       = useRef(new Animated.Value(10)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  // Dots (loading indicator)
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const ease     = Easing.out(Easing.cubic);
  const spring   = Easing.out(Easing.back(1.6));

  // ── Main splash animation ───────────────────────────────────────────────────
  useEffect(() => {
    const dotPulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true, easing: ease }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true, easing: ease }),
        ])
      );

    Animated.sequence([
      // 1. Background glow blooms in
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1,   duration: 600, easing: ease, useNativeDriver: true }),
        Animated.timing(glowScale,   { toValue: 1,   duration: 700, easing: ease, useNativeDriver: true }),
      ]),

      // 2. Pitch circle snaps in with spring
      Animated.parallel([
        Animated.timing(circleOpacity, { toValue: 1,   duration: 300, easing: ease,   useNativeDriver: true }),
        Animated.timing(circleScale,   { toValue: 1,   duration: 550, easing: spring,  useNativeDriver: true }),
      ]),

      // 3. Ball bounces down into center
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(ballOpacity, { toValue: 1,  duration: 200, useNativeDriver: true }),
        Animated.timing(ballY,       { toValue: 0,  duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(ballScale,   { toValue: 1,  duration: 500, easing: spring, useNativeDriver: true }),
        Animated.timing(ballRotate,  { toValue: 1,  duration: 500, easing: ease,   useNativeDriver: true }),
      ]),

      // 4. Logo title slides up
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 480, easing: ease, useNativeDriver: true }),
        Animated.timing(logoY,       { toValue: 0, duration: 480, easing: ease, useNativeDriver: true }),
      ]),

      // 5. Subtitle
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(subOpacity, { toValue: 1, duration: 420, easing: ease, useNativeDriver: true }),
        Animated.timing(subY,       { toValue: 0, duration: 420, easing: ease, useNativeDriver: true }),
      ]),

      // 6. Tagline + loading dots
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 380, easing: ease, useNativeDriver: true }),
        Animated.timing(tagY,       { toValue: 0, duration: 380, easing: ease, useNativeDriver: true }),
      ]),

      // 7. Hold while auth loads (min 1.8s total)
      Animated.delay(1600),
    ]).start(() => {
      splashDone.current = true;
      tryNavigate();
    });

    // Start pulsing dots
    dotPulse(dot1, 0).start();
    dotPulse(dot2, 160).start();
    dotPulse(dot3, 320).start();
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

  const ballSpin = ballRotate.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <StatusBar hidden />

      {/* Background radial glow */}
      <Animated.View style={[
        styles.glow,
        { opacity: glowOpacity, transform: [{ scale: glowScale }] },
      ]} />

      {/* Pitch centre circle */}
      <Animated.View style={[
        styles.pitchCircle,
        { opacity: circleOpacity, transform: [{ scale: circleScale }] },
      ]}>
        {/* Outer ring */}
        <View style={styles.ringOuter} />
        {/* Inner ring */}
        <View style={styles.ringInner} />
        {/* Cross hair lines */}
        <View style={styles.lineH} />
        <View style={styles.lineV} />
        {/* Centre dot */}
        <View style={styles.centreDot} />
      </Animated.View>

      {/* Football */}
      <Animated.Text style={[
        styles.ball,
        {
          opacity: ballOpacity,
          transform: [
            { translateY: ballY },
            { scale: ballScale },
            { rotate: ballSpin },
          ],
        },
      ]}>
        ⚽
      </Animated.Text>

      {/* Logo wordmark */}
      <Animated.View style={[styles.wordmark, { opacity: logoOpacity, transform: [{ translateY: logoY }] }]}>
        <Text style={styles.logoLetterC}>C</Text>
        <Text style={styles.logoRest}>oach</Text>
        <View style={styles.logoDot} />
        <Text style={styles.logoLetterA}>A</Text>
        <Text style={styles.logoRest}>thlete</Text>
      </Animated.View>

      {/* Connect line */}
      <Animated.Text style={[styles.connect, { opacity: subOpacity, transform: [{ translateY: subY }] }]}>
        C O N N E C T
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity, transform: [{ translateY: tagY }] }]}>
        Train  ·  Connect  ·  Achieve
      </Animated.Text>

      {/* Loading dots */}
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#062d14',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background radial bloom
  glow: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: width * 0.8,
    backgroundColor: '#00a84a',
    opacity: 0.18,
    top: height * 0.5 - width * 0.8,
    left: width * 0.5 - width * 0.8,
  },

  // Pitch centre circle
  pitchCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  ringOuter: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringInner: {
    position: 'absolute',
    width: CIRCLE * 0.46,
    height: CIRCLE * 0.46,
    borderRadius: CIRCLE * 0.23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  lineH: {
    position: 'absolute',
    width: CIRCLE,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lineV: {
    position: 'absolute',
    width: 1.5,
    height: CIRCLE,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centreDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Football
  ball: {
    fontSize: 54,
    marginBottom: 36,
  },

  // Wordmark
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  logoLetterC: {
    fontSize: 42, fontWeight: '900',
    color: '#00e87a', letterSpacing: -1,
  },
  logoLetterA: {
    fontSize: 42, fontWeight: '900',
    color: '#ffffff', letterSpacing: -1,
  },
  logoRest: {
    fontSize: 28, fontWeight: '300',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  logoDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#00e87a',
    marginHorizontal: 8,
    marginBottom: 10,
  },

  connect: {
    fontSize: 11, fontWeight: '700',
    color: '#00e87a',
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  tagline: {
    fontSize: 12, fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
    marginTop: 20,
  },

  // Loading dots
  dots: {
    position: 'absolute',
    bottom: 58,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
