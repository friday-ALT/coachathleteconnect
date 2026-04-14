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
  skillLevel:    z.enum(['Beginner', 'Intermediate', 'Advanced']),
  locationCity:  z.string().min(2, 'City is required'),
  locationState: z.string().min(2, 'Country / Region is required'),
});
type Form = z.infer<typeof schema>;

const SKILL_LEVELS = [
  { id: 'Beginner',     icon: 'fitness-outline',   label: 'Beginner',     sub: 'Just starting out' },
  { id: 'Intermediate', icon: 'trending-up-outline', label: 'Intermediate', sub: 'Some experience' },
  { id: 'Advanced',     icon: 'trophy-outline',    label: 'Advanced',     sub: 'Competitive level' },
] as const;

export default function AthleteStep2() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { skillLevel: 'Beginner', locationCity: '', locationState: '' },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: Form) => {
      const raw   = await SecureStore.getItemAsync('athleteStep1');
      const step1 = JSON.parse(raw || '{}');
      const payload = { ...step1, age: parseInt(step1.age, 10), ...data };
      await profileApi.createAthleteProfile(payload);
      await sessionApi.enterRole('athlete');
    },
    onSuccess: async () => {
      await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
      await SecureStore.deleteItemAsync('athleteStep1');
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.replace('/(athlete)/home');
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
          <Ionicons name="location-outline" size={52} color={Colors.primary} />
        </View>
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <Text style={styles.title}>Location & Level</Text>
        <Text style={styles.subtitle}>Help us match you with the right coaches</Text>

        {/* Skill Level selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Your Skill Level</Text>
          <Controller control={control} name="skillLevel" render={({ field: { onChange } }) => (
            <View style={styles.skillGrid}>
              {SKILL_LEVELS.map((s) => {
                const active = skillLevel === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.skillCard, active && styles.skillCardActive]}
                    onPress={() => { setSkillLevel(s.id); onChange(s.id); setValue('skillLevel', s.id); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={s.icon as any} size={22} color={active ? Colors.white : Colors.primary} />
                    <Text style={[styles.skillLabel, active && styles.skillLabelActive]}>{s.label}</Text>
                    <Text style={[styles.skillSub, active && styles.skillSubActive]}>{s.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )} />
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <View style={[styles.field, { flex: 1.5 }]}>
            <Text style={styles.label}>City</Text>
            <Controller control={control} name="locationCity" render={({ field: { onChange, value, onBlur } }) => (
              <View style={[styles.inputRow, errors.locationCity && styles.inputRowError]}>
                <Ionicons name="location-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="London"
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
              <Text style={styles.btnText}>Complete Setup</Text>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>You can update these details anytime from your profile.</Text>
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
  progressDotActive: { backgroundColor: Colors.primary, width: 22, borderRadius: 5 },
  progressLine: { width: 32, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  progressLineDone: { backgroundColor: Colors.primary },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  stepLabel: { textAlign: 'center', fontSize: FontSizes.xs, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: FontSizes.base, color: Colors.muted, textAlign: 'center', marginBottom: Spacing.xl },

  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink, marginBottom: 8 },

  skillGrid: { flexDirection: 'row', gap: Spacing.sm },
  skillCard: {
    flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.xs,
  },
  skillCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  skillLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink },
  skillLabelActive: { color: Colors.white },
  skillSub: { fontSize: 10, color: Colors.muted, textAlign: 'center' },
  skillSubActive: { color: 'rgba(255,255,255,0.75)' },

  locationRow: { flexDirection: 'row', gap: Spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 52, ...Shadow.xs,
  },
  inputRowError: { borderColor: Colors.error },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: FontSizes.base, color: Colors.ink },
  error: { fontSize: FontSizes.xs, color: Colors.error, marginTop: 4, marginLeft: 2 },

  btn: {
    height: 54, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginTop: Spacing.md, ...Shadow.sm,
  },
  btnText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
  disabled: { opacity: 0.5 },
  hint: { fontSize: FontSizes.xs, color: Colors.muted, textAlign: 'center', marginTop: Spacing.md },
});
