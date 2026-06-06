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
import { authApi } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { saveAuthToken } from '../../lib/authStorage';
import { navigateAfterAuth } from '../../lib/navigateAfterAuth';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import AppCanvas from '../../components/ui/AppCanvas';
import Button from '../../components/ui/Button';
import { useSafeTop } from '../../hooks/useSafeTop';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const safeTop = useSafeTop();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: FormData) => authApi.signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    }),
    onSuccess: async (data) => {
      if (data.requiresVerification) {
        setSubmittedEmail(getValues('email'));
        setEmailSent(true);
      } else if (data.token) {
        await saveAuthToken(data.token);
        await navigateAfterAuth(queryClient, router);
      } else {
        router.replace('/auth/login');
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(submittedEmail),
  });

  if (emailSent) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: safeTop }]}>
          <TouchableOpacity onPress={() => router.replace('/welcome')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to{'\n'}
            <Text style={styles.emailBold}>{submittedEmail}</Text>
          </Text>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            <Text style={styles.outlineBtnText}>
              {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace('/auth/login')}>
            <Text style={styles.submitText}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppCanvas>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Create your account here or on the website — same login works in both places.
        </Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>First name</Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="First" placeholderTextColor={Colors.muted} />
              )}
            />
            {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Last name</Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Last" placeholderTextColor={Colors.muted} />
              )}
            />
            {errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}
          </View>
        </View>

        {(['email', 'password', 'confirmPassword'] as const).map((field, idx) => (
          <View key={field} style={{ marginTop: idx === 0 ? Spacing.md : Spacing.md }}>
            <Text style={styles.label}>
              {field === 'email' ? 'Email' : field === 'password' ? 'Password' : 'Confirm password'}
            </Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={field === 'email' ? 'you@example.com' : '••••••••'}
                  placeholderTextColor={Colors.muted}
                  autoCapitalize={field === 'email' ? 'none' : 'none'}
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  secureTextEntry={field !== 'email'}
                />
              )}
            />
            {errors[field] && <Text style={styles.error}>{errors[field]?.message}</Text>}
          </View>
        ))}

        {signupMutation.isError && (
          <Text style={[styles.error, { marginTop: Spacing.sm }]}>
            {getApiErrorMessage(signupMutation.error, 'Sign up failed')}
          </Text>
        )}

        <Button
          title="Create Account"
          variant="primary"
          loading={signupMutation.isPending}
          onPress={handleSubmit((data) => signupMutation.mutate(data))}
          style={styles.submitBtn}
        />

        <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.switchRow}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </AppCanvas>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
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
  submitBtn: { marginTop: Spacing.xl, width: '100%' },
  submitText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.primaryOn },
  switchRow: { marginTop: Spacing.xl, alignItems: 'center' },
  switchText: { fontSize: FontSizes.sm, color: Colors.muted },
  switchLink: { color: Colors.accent, fontWeight: '700' },
  centered: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.base, color: Colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  emailBold: { fontWeight: '700', color: Colors.ink },
  outlineBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  outlineBtnText: { color: Colors.primary, fontWeight: '700' },
});
