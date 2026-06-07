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
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
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
import { Colors } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const HERO = require('../assets/welcome-hero.png');

function WingLogo() {
  return <View style={logoStyles.circle} />;
}

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
    } catch (e: { code?: string }) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
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
      <StatusBar style="light" />
      <ImageBackground
        source={HERO}
        style={styles.heroImage}
        resizeMode="cover"
        imageStyle={styles.heroImageCrop}
      >
        <LinearGradient
          colors={['transparent', 'rgba(12,12,14,0.15)', 'rgba(12,12,14,0.9)', Colors.background]}
          locations={[0, 0.45, 0.68, 0.82]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.brandBlock}>
            <WingLogo />
            <Text style={styles.title}>Coach Athlete Connect</Text>
          </View>

          <View style={styles.spacer} />

          <Animated.View
            style={[
              styles.ctaBlock,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            <PressableScale
              style={[styles.pill, styles.pillGoogle, isLoading && styles.disabled]}
              onPress={onGooglePress}
              disabled={isLoading}
              scaleTo={0.96}
            >
              {googleMutation.isPending || googleSessionActive ? (
                <ActivityIndicator color={Colors.primaryOn} />
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
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const PILL_HEIGHT = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  heroImageCrop: {
    width: SCREEN_W,
    height: SCREEN_H * 1.12,
    marginTop: -56,
  },
  safe: {
    flex: 1,
  },
  brandBlock: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 8 : 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.8,
    fontWeight: '800',
  },
  spacer: {
    flex: 1,
  },
  ctaBlock: {
    paddingHorizontal: 28,
    paddingBottom: 8,
    paddingTop: 12,
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
    backgroundColor: '#FFFFFF',
  },
  pillGoogleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.2,
  },
  pillApple: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  pillAppleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f4f4f5',
    letterSpacing: -0.2,
  },
  pillEmail: {
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  pillEmailText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f4f4f5',
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
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 8,
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
