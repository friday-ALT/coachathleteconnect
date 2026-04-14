import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { profileApi, sessionApi } from '../../../../lib/api';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../../../constants/theme';

const schema = z.object({
  locationCity:  z.string().min(2, 'City is required'),
  locationState: z.string().min(2, 'Country / Region is required'),
  experience:    z.string().min(10, 'Add at least a sentence about your experience').max(160, 'Keep it under 160 characters'),
  pricePerHour:  z.string().refine(v => { const n = parseFloat(v); return !isNaN(n) && n >= 1; }, 'Enter a valid hourly rate'),
});
type Form = z.infer<typeof schema>;

export default function CoachStep2() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [charCount, setCharCount] = useState(0);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { locationCity: '', locationState: '', experience: '', pricePerHour: '' },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: Form) => {
      const raw   = await SecureStore.getItemAsync('coachStep1');
      const step1 = JSON.parse(raw || '{}');
      const payload = {
        ...step1,
        ...data,
        pricePerHour: Math.round(parseFloat(data.pricePerHour) * 100),
      };
      await profileApi.createCoachProfile(payload);
      await sessionApi.enterRole('coach');
    },
    onSuccess: async () => {
      await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
      await SecureStore.deleteItemAsync('coachStep1');
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.replace('/(coach)/home');
    },
    onError: (e: any) => {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create profile. Please try again.');
    },
  });

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.iconWrap}>
          <Ionicons name="star-outline" size={52} color={Colors.accent} />
        </View>
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <Text style={styles.title}>Your Expertise</Text>
        <Text style={styles.subtitle}>Tell athletes what makes you the right coach</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <View style={[styles.field, { flex: 1.5 }]}>
            <Text style={styles.label}>City</Text>
            <Controller control={control} name="locationCity" render={({ field: { onChange, value, onBlur } }) => (
              <View style={[styles.inputRow, errors.locationCity && styles.inputRowError]}>
                <Ionicons name="location-outline" size={16} color={Colors.muted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Manchester"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  autoCapitalize="words" placeholderTextColor={Colors.muted}
                />
              </View>
            )} />
            {errors.locationCity && <Text style={styles.error}>{errors.locationCity.message}</Text>}
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Country</Text>
            <Controller control={control} name="locationState" render={({ field: { onChange, value, onBlur } }) => (
              <View style={[styles.inputRow, errors.locationState && styles.inputRowError]}>
                <TextInput
                  style={styles.input}
                  placeholder="UK"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  autoCapitalize="characters" maxLength={3}
                  placeholderTextColor={Colors.muted}
                />
              </View>
            )} />
            {errors.locationState && <Text style={styles.error}>{errors.locationState.message}</Text>}
          </View>
        </View>

        {/* Bio / Experience */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>About You</Text>
            <Text style={[styles.charCount, charCount > 140 && styles.charCountWarn]}>{charCount}/160</Text>
          </View>
          <Controller control={control} name="experience" render={({ field: { onChange, value, onBlur } }) => (
            <View style={[styles.textAreaWrap, errors.experience && styles.inputRowError]}>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Former college striker with 8 years coaching youth and semi-pro players. UEFA B licensed."
                value={value}
                onChangeText={(t) => { onChange(t); setCharCount(t.length); }}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                maxLength={160}
                textAlignVertical="top"
                placeholderTextColor={Colors.muted}
              />
            </View>
          )} />
          {errors.experience && <Text style={styles.error}>{errors.experience.message}</Text>}
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Hourly Rate (£)</Text>
          <Controller control={control} name="pricePerHour" render={({ field: { onChange, value, onBlur } }) => (
            <View style={[styles.inputRow, errors.pricePerHour && styles.inputRowError]}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                value={value} onChangeText={onChange} onBlur={onBlur}
                keyboardType="decimal-pad" placeholderTextColor={Colors.muted}
              />
              <Text style={styles.perHour}>/ hour</Text>
            </View>
          )} />
          {errors.pricePerHour && <Text style={styles.error}>{errors.pricePerHour.message}</Text>}
          <Text style={styles.hint}>Platform takes 15% — you keep 85%</Text>
        </View>

        {/* Earnings preview */}
        <View style={styles.earningsCard}>
          <Ionicons name="cash-outline" size={20} color={Colors.primary} />
          <Text style={styles.earningsText}>You can update your rate anytime from your profile.</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, createProfileMutation.isPending && styles.disabled]}
          onPress={handleSubmit(d => createProfileMutation.mutate(d))}
          disabled={createProfileMutation.isPending}
          activeOpacity={0.85}
        >
          {createProfileMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.btnText}>Launch My Profile</Text>
              <Ionicons name="rocket-outline" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.xs },
  progressWrap: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.accent, width: 22, borderRadius: 5 },
  progressLine: { width: 32, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  progressLineDone: { backgroundColor: Colors.accent },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  stepLabel: { textAlign: 'center', fontSize: FontSizes.xs, fontWeight: '600', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: FontSizes.base, color: Colors.muted, textAlign: 'center', marginBottom: Spacing.xl },

  field: { marginBottom: Spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink },
  hint: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 4 },
  charCount: { fontSize: FontSizes.xs, color: Colors.muted },
  charCountWarn: { color: Colors.accent },

  locationRow: { flexDirection: 'row', gap: Spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 52, ...Shadow.xs,
  },
  inputRowError: { borderColor: Colors.error },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: FontSizes.base, color: Colors.ink },
  currencySymbol: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink, marginRight: 6 },
  perHour: { fontSize: FontSizes.sm, color: Colors.muted },

  textAreaWrap: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md,
    minHeight: 100, ...Shadow.xs,
  },
  textArea: { fontSize: FontSizes.base, color: Colors.ink, minHeight: 80 },
  error: { fontSize: FontSizes.xs, color: Colors.error, marginTop: 4, marginLeft: 2 },

  earningsCard: {
    flexDirection: 'row', gap: 10, backgroundColor: `${Colors.primary}10`,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: `${Colors.primary}20`,
    marginBottom: Spacing.lg,
  },
  earningsText: { flex: 1, fontSize: FontSizes.sm, color: Colors.body, lineHeight: 20 },

  btn: {
    height: 54, backgroundColor: Colors.accent, borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, ...Shadow.sm,
  },
  btnText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
  disabled: { opacity: 0.5 },
});
