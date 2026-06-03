import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAuthToken } from '../../lib/authStorage';
import { authApi } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { navigateAfterAuth } from '../../lib/navigateAfterAuth';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useSafeTop } from '../../hooks/useSafeTop';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const safeTop = useSafeTop();
  const [showVerification, setShowVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      if (data.token) await saveAuthToken(data.token);
      await navigateAfterAuth(queryClient, router);
    },
    onError: (error: any) => {
      if (error?.response?.data?.requiresVerification) {
        setShowVerification(true);
        setUnverifiedEmail(getValues('email'));
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(unverifiedEmail),
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Use the same email and password as the Coach Athlete Connect website. Your coaches, sessions, and messages sync automatically.
        </Text>

        {showVerification && (
          <View style={styles.alert}>
            <Ionicons name="mail-outline" size={18} color={Colors.statusOrange} />
            <View style={styles.alertBody}>
              <Text style={styles.alertText}>Verify your email before signing in.</Text>
              <TouchableOpacity
                onPress={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                <Text style={styles.alertLink}>
                  {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={[styles.label, { marginTop: Spacing.md }]}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <TouchableOpacity
          onPress={() => router.push('/auth/forgot-password')}
          style={styles.forgotLink}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {loginMutation.isError && !showVerification && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>
              {getApiErrorMessage(loginMutation.error, 'Invalid email or password')}
            </Text>
            {(loginMutation.error as any)?.response?.data?.authProvider &&
              (loginMutation.error as any).response.data.authProvider !== 'email' && (
              <TouchableOpacity
                style={styles.oauthHintBtn}
                onPress={() => router.replace('/welcome')}
              >
                <Text style={styles.oauthHintText}>Back to sign-in options</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loginMutation.isPending && styles.disabled]}
          onPress={handleSubmit((data) => loginMutation.mutate(data))}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.switchRow}>
          <Text style={styles.switchText}>
            Don&apos;t have an account? <Text style={styles.switchLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink },
  headerSpacer: { width: 40 },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  errorBox: { marginTop: Spacing.sm },
  oauthHintBtn: { marginTop: Spacing.sm },
  oauthHintText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink, marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.ink,
    backgroundColor: Colors.surface,
  },
  error: { fontSize: FontSizes.sm, color: Colors.statusRed, marginTop: 4 },
  forgotLink: { alignSelf: 'flex-end', marginTop: Spacing.sm },
  forgotText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  submitBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  submitText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
  disabled: { opacity: 0.6 },
  switchRow: { marginTop: Spacing.xl, alignItems: 'center' },
  switchText: { fontSize: FontSizes.sm, color: Colors.muted },
  switchLink: { color: Colors.primary, fontWeight: '700' },
  alert: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: `${Colors.statusOrange}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.statusOrange}40`,
  },
  alertBody: { flex: 1 },
  alertText: { fontSize: FontSizes.sm, color: Colors.body, marginBottom: 4 },
  alertLink: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
});
