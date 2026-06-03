import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useSafeTop } from '../../hooks/useSafeTop';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const safeTop = useSafeTop();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const resetMutation = useMutation({
    mutationFn: (data: FormData) => authApi.forgotPassword(data.email),
    onSuccess: () => {
      setSubmittedEmail(getValues('email'));
      setEmailSent(true);
    },
  });

  if (emailSent) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: safeTop }]}>
          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Link Sent</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a password reset link to{'\n'}
            <Text style={styles.emailBold}>{submittedEmail}</Text>
          </Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace('/auth/login')}>
            <Text style={styles.submitText}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.intro}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </Text>

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

        {resetMutation.isError && (
          <Text style={[styles.error, { marginTop: Spacing.sm }]}>
            {getApiErrorMessage(resetMutation.error, 'Could not send reset email')}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, resetMutation.isPending && styles.disabled]}
          onPress={handleSubmit((data) => resetMutation.mutate(data))}
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: { padding: Spacing.xl },
  intro: { fontSize: FontSizes.base, color: Colors.muted, lineHeight: 22, marginBottom: Spacing.xl },
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
});
