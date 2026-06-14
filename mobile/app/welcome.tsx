import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAuthToken } from '../lib/authStorage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authApi } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { navigateAfterAuth } from '../lib/navigateAfterAuth';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '../constants/config';
import PressableScale from '../components/ui/PressableScale';
import { Colors, Layout, Spacing } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

function GoogleMark() {
  return (
    <View style={logoStyles.googleMark}>
      <Text style={[logoStyles.gPart, { color: '#4285F4' }]}>G</Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  googleMark: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gPart: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Arial', android: 'sans-serif' }),
  },
});

export default function Welcome() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (!response) return;
    setGoogleSessionActive(false);
    if (response.type === 'success') {
      const auth = response.authentication;
      if (auth?.idToken) {
        googleMutation.mutate({
          idToken: auth.idToken,
          email: '',
          firstName: '',
          lastName: '',
          googleId: '',
        });
      } else if (auth?.accessToken) {
        handleGoogleAccessToken(auth.accessToken);
      }
    }
  }, [response]);

  const handleGoogleAccessToken = async (accessToken: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const u = await res.json();
      googleMutation.mutate({
        email: u.email,
        firstName: u.given_name || u.name?.split(' ')[0] || '',
        lastName: u.family_name || u.name?.split(' ').slice(1).join(' ') || '',
        googleId: u.id,
        photoUrl: u.picture,
      });
    } catch {
      Alert.alert('Error', 'Could not get your Google profile. Please try again.');
    }
  };

  const onAuthSuccess = async (data: { token?: string }) => {
    if (data.token) await saveAuthToken(data.token);
    await navigateAfterAuth(queryClient, router);
  };

  const googleMutation = useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: (data) => onAuthSuccess(data),
    onError: (e: unknown) =>
      Alert.alert('Sign-in failed', getApiErrorMessage(e, 'Google sign-in failed. Please try again.')),
  });

  const demoMutation = useMutation({
    mutationFn: authApi.demoLogin,
    onSuccess: (data) => onAuthSuccess(data),
    onError: (e: unknown) =>
      Alert.alert('Demo login', getApiErrorMessage(e, 'Demo login failed.')),
  });

  const appleMutation = useMutation({
    mutationFn: authApi.appleLogin,
    onSuccess: (data) => onAuthSuccess(data),
    onError: (e: unknown) =>
      Alert.alert('Sign-in failed', getApiErrorMessage(e, 'Apple sign-in failed. Please try again.')),
  });

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      appleMutation.mutate({
        identityToken: credential.identityToken!,
        user: {
          name: {
            firstName: credential.fullName?.givenName || undefined,
            lastName: credential.fullName?.familyName || undefined,
          },
          email: credential.email || undefined,
        },
      });
    } catch (e: unknown) {
      const code = typeof e === 'object' && e && 'code' in e ? String((e as { code?: string }).code) : undefined;
      if (code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign-in failed', 'Apple sign-in failed. Please try again.');
      }
    }
  };

  const [googleSessionActive, setGoogleSessionActive] = useState(false);
  const isLoading =
    googleMutation.isPending ||
    demoMutation.isPending ||
    appleMutation.isPending ||
    googleSessionActive;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const onGooglePress = () => {
    if (!GOOGLE_IOS_CLIENT_ID && !GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Coming Soon',
        'Google Sign-In is being configured. Please check back shortly.',
      );
      return;
    }
    setGoogleSessionActive(true);
    promptAsync();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#E8F0FE', '#F8F9FA', '#F8F9FA']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>CC</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>CoachConnect</Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            Find coaches, book sessions, track your progress
          </Text>
        </View>

        <View style={styles.spacer} />

        <Animated.View
          style={[
            styles.sheet,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <View style={styles.ctaBlock}>
            <PressableScale
              style={[styles.pill, styles.pillGoogle, isLoading && styles.disabled]}
              onPress={onGooglePress}
              disabled={isLoading}
              scaleTo={0.96}
            >
              {googleMutation.isPending || googleSessionActive ? (
                <ActivityIndicator color={Colors.ink} />
              ) : (
                <>
                  <GoogleMark />
                  <Text style={styles.pillGoogleText}>Continue with Google</Text>
                </>
              )}
            </PressableScale>

            {Platform.OS === 'ios' && (
              <PressableScale
                style={[styles.pill, styles.pillApple, isLoading && styles.disabled]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
                scaleTo={0.96}
              >
                {appleMutation.isPending ? (
                  <ActivityIndicator color={Colors.ink} />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={22} color={Colors.ink} style={styles.pillIcon} />
                    <Text style={styles.pillAppleText}>Continue with Apple</Text>
                  </>
                )}
              </PressableScale>
            )}

            <PressableScale
              style={[styles.pill, styles.pillEmail, isLoading && styles.disabled]}
              onPress={() => router.push('/auth/get-started')}
              disabled={isLoading}
              scaleTo={0.96}
            >
              <Ionicons name="mail-outline" size={20} color={Colors.ink} style={styles.pillIcon} />
              <Text style={styles.pillEmailText}>Continue with Email</Text>
            </PressableScale>

            <TouchableOpacity
              onPress={() => router.push('/auth/get-started')}
              disabled={isLoading}
              style={styles.signupRow}
            >
              <Text style={styles.signupText}>
                New here? <Text style={styles.signupBold}>Create an account</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing you agree to our Terms of Service and Privacy Policy
            </Text>

            <TouchableOpacity
              style={styles.demoRow}
              onPress={() => demoMutation.mutate()}
              disabled={isLoading}
              activeOpacity={0.6}
            >
              {demoMutation.isPending ? (
                <ActivityIndicator color="#8E8E93" size="small" />
              ) : (
                <Text style={styles.demoText}>Try demo account</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const PILL_HEIGHT = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  brandBlock: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 64,
    paddingHorizontal: Layout.screenPaddingX,
    width: '100%',
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryOn,
  },
  title: {
    fontSize: 32,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.8,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: Colors.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Layout.screenPaddingX,
    maxWidth: 320,
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginHorizontal: 12,
    paddingTop: 12,
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBlock: {
    paddingHorizontal: Layout.screenPaddingX,
    paddingBottom: 24,
    paddingTop: 20,
  },
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
    gap: 10,
  },
  pillGoogle: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillGoogleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  pillApple: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillAppleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  pillEmail: {
    backgroundColor: Colors.primary,
    marginBottom: 4,
  },
  pillEmailText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primaryOn,
    letterSpacing: -0.2,
  },
  pillIcon: {
    marginRight: 2,
  },
  signupRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  signupText: {
    fontSize: 14,
    color: Colors.body,
  },
  signupBold: {
    color: Colors.accent,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: Spacing.sm,
  },
  demoRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  demoText: {
    fontSize: 13,
    color: Colors.body,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.55,
  },
});
