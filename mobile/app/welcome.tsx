import { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authApi } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../constants/theme';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID     || undefined,
    iosClientId:     GOOGLE_IOS_CLIENT_ID     || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (!response) return;
    setGoogleSessionActive(false);
    if (response.type === 'success') {
      handleGoogleResponse(response.authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleResponse = async (accessToken?: string | null) => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const u = await res.json();
      googleMutation.mutate({
        email:     u.email,
        firstName: u.given_name  || u.name?.split(' ')[0]             || '',
        lastName:  u.family_name || u.name?.split(' ').slice(1).join(' ') || '',
        googleId:  u.id,
        photoUrl:  u.picture,
      });
    } catch {
      Alert.alert('Error', 'Could not get your Google profile. Please try again.');
    }
  };

  // ── Auth success ─────────────────────────────────────────────────────────────
  const onAuthSuccess = async (data: any, isNewUser = false) => {
    if (data.token) await SecureStore.setItemAsync('authToken', data.token);
    queryClient.invalidateQueries({ queryKey: ['user'] });
    router.replace('/auth/role-selection');
  };

  // ── Mutations ────────────────────────────────────────────────────────────────
  const googleMutation = useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess:  (data) => onAuthSuccess(data, !data.existingUser),
    onError:    (e: any) =>
      Alert.alert('Sign-in failed', getApiErrorMessage(e, 'Google sign-in failed. Please try again.')),
  });

  const demoMutation = useMutation({
    mutationFn: authApi.demoLogin,
    onSuccess:  (data) => onAuthSuccess(data, false),
    onError:    (e: any) =>
      Alert.alert('Demo login', getApiErrorMessage(e, 'Demo login failed.')),
  });

  const [googleSessionActive, setGoogleSessionActive] = useState(false);
  const isLoading = googleMutation.isPending || demoMutation.isPending || googleSessionActive;

  // ── Entrance animation ───────────────────────────────────────────────────────
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Brand header ── */}
      <View style={styles.hero}>
        <View style={styles.logoRing}>
          <Ionicons name="football" size={34} color={Colors.white} />
        </View>
        <Text style={styles.appName}>Coach Athlete{'\n'}Connect</Text>
        <Text style={styles.tagline}>Find your coach. Elevate your game.</Text>
      </View>

      {/* ── Auth card ── */}
      <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        <Text style={styles.cardTitle}>Get started</Text>
        <Text style={styles.cardSubtitle}>Sign in with your Google account to continue</Text>

        {/* Google CTA */}
        <TouchableOpacity
          style={[styles.googleBtn, isLoading && styles.disabled]}
          onPress={() => {
            if (!GOOGLE_IOS_CLIENT_ID && !GOOGLE_WEB_CLIENT_ID) {
              Alert.alert(
                'Coming Soon',
                'Google Sign-In is being configured. Please check back shortly.',
              );
              return;
            }
              setGoogleSessionActive(true);
              promptAsync();
          }}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {googleMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <View style={styles.gBadge}>
                <Text style={styles.gLetter}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        {/* Demo (dev-only convenience — hidden in production) */}
        <TouchableOpacity
          style={[styles.demoBtn, isLoading && styles.disabled]}
          onPress={() => demoMutation.mutate()}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {demoMutation.isPending ? (
            <ActivityIndicator color={Colors.primary} size="small" />
          ) : (
            <>
              <Ionicons name="flash-outline" size={14} color={Colors.muted} />
              <Text style={styles.demoBtnText}>Try Demo Account</Text>
            </>
          )}
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
  },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 32, fontWeight: '900',
    color: Colors.white, textAlign: 'center',
    letterSpacing: -0.5, lineHeight: 38,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSizes.base, fontWeight: '400',
    color: 'rgba(255,255,255,0.75)', textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 48,
  },
  cardTitle: {
    fontSize: FontSizes['2xl'], fontWeight: '800',
    color: Colors.ink, textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: FontSizes.base, color: Colors.muted,
    textAlign: 'center', marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  // Google button
  googleBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  gBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  gLetter: {
    fontSize: 16, fontWeight: '900', color: Colors.primary,
  },
  googleBtnText: {
    fontSize: FontSizes.base, fontWeight: '700',
    color: Colors.white, letterSpacing: 0.2,
  },

  terms: {
    fontSize: 12, color: Colors.muted,
    textAlign: 'center', lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  termsLink: {
    color: Colors.primary, fontWeight: '600',
  },

  // Demo
  demoBtn: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6,
    paddingVertical: Spacing.sm,
  },
  demoBtnText: {
    fontSize: FontSizes.sm, fontWeight: '500', color: Colors.muted,
  },

  disabled: { opacity: 0.5 },
});
