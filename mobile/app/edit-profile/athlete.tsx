import { useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../lib/api';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { useSafeTop } from '../../hooks/useSafeTop';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'];

const schema = z.object({
  age:           z.string().regex(/^\d+$/, 'Enter a valid age').optional(),
  skillLevel:    z.string().optional(),
  position:      z.string().optional(),
  locationCity:  z.string().min(1, 'City is required'),
  locationState: z.string().min(1, 'State is required'),
  phone:         z.string().optional(),
  bio:           z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditAthleteProfile() {
  const router = useRouter();
  const safeTop = useSafeTop();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['athlete-profile'],
    queryFn: profileApi.getAthleteProfile,
  });

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: '', skillLevel: '', position: '', locationCity: '',
      locationState: '', phone: '', bio: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        age:           profile.age?.toString() || '',
        skillLevel:    profile.skillLevel || '',
        position:      profile.position || '',
        locationCity:  profile.locationCity || '',
        locationState: profile.locationState || '',
        phone:         profile.phone || '',
        bio:           profile.bio || '',
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => profileApi.updateAthleteProfile({
      ...data,
      age: data.age ? parseInt(data.age) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Section title="Personal Details">
          <Field label="Age">
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.age && styles.inputError]}
                  placeholder="e.g. 22"
                  placeholderTextColor={Colors.muted}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                />
              )}
            />
            {errors.age && <ErrText msg={errors.age.message!} />}
          </Field>

          <Field label="Phone">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. +44 7700 900123"
                  placeholderTextColor={Colors.muted}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
          </Field>
        </Section>

        <Section title="Football Profile">
          <Field label="Skill Level">
            <Controller
              control={control}
              name="skillLevel"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {SKILL_LEVELS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, value === s && styles.chipActive]}
                      onPress={() => onChange(s)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, value === s && styles.chipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </Field>

          <Field label="Position">
            <Controller
              control={control}
              name="position"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {POSITIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, value === p && styles.chipActive]}
                      onPress={() => onChange(p)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, value === p && styles.chipTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </Field>
        </Section>

        <Section title="Location">
          <Field label="City">
            <Controller
              control={control}
              name="locationCity"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.locationCity && styles.inputError]}
                  placeholder="e.g. Manchester"
                  placeholderTextColor={Colors.muted}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.locationCity && <ErrText msg={errors.locationCity.message!} />}
          </Field>

          <Field label="State / County">
            <Controller
              control={control}
              name="locationState"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.locationState && styles.inputError]}
                  placeholder="e.g. Greater Manchester"
                  placeholderTextColor={Colors.muted}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.locationState && <ErrText msg={errors.locationState.message!} />}
          </Field>
        </Section>

        <Section title="About You">
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textArea}
                placeholder="Tell coaches about your football goals and experience..."
                placeholderTextColor={Colors.muted}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
              />
            )}
          />
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, mutation.isPending && styles.btnDisabled]}
          onPress={handleSubmit((d) => mutation.mutate(d))}
          disabled={mutation.isPending}
          activeOpacity={0.85}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ErrText({ msg }: { msg: string }) {
  return <Text style={styles.errorText}>{msg}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSizes.xs, fontWeight: '700', color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: Spacing.sm, marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.xs,
  },
  field: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  input: {
    height: 44, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base, color: Colors.ink, backgroundColor: Colors.background,
  },
  inputError: { borderColor: Colors.statusRed },
  errorText: { fontSize: FontSizes.xs, color: Colors.statusRed, marginTop: 4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.body },
  chipTextActive: { color: Colors.white },

  textArea: {
    minHeight: 120, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSizes.base, color: Colors.ink, backgroundColor: Colors.surface,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface, borderTopWidth: 1,
    borderTopColor: Colors.border, ...Shadow.md,
  },
  saveBtn: {
    height: 52, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  saveBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white },
  btnDisabled: { opacity: 0.5 },
});
