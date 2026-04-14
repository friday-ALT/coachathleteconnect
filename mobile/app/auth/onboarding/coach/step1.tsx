import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../../../constants/theme';
import * as SecureStore from 'expo-secure-store';

const schema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  name:  z.string().min(2, 'Display name is required'),
});
type Form = z.infer<typeof schema>;

export default function CoachStep1() {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', name: '' },
  });

  const onSubmit = async (data: Form) => {
    await SecureStore.setItemAsync('coachStep1', JSON.stringify(data));
    router.push('/auth/onboarding/coach/step2');
  };

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
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.iconWrap}>
          <Ionicons name="trophy-outline" size={52} color={Colors.accent} />
        </View>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <Text style={styles.title}>Coach Profile</Text>
        <Text style={styles.subtitle}>Set up your public coaching identity</Text>

        {/* Display Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.hint}>This is how athletes will see you</Text>
          <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
            <View style={[styles.inputRow, errors.name && styles.inputRowError]}>
              <Ionicons name="person-outline" size={18} color={Colors.muted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Coach Alex Thompson"
                value={value} onChangeText={onChange} onBlur={onBlur}
                autoCapitalize="words" placeholderTextColor={Colors.muted}
              />
            </View>
          )} />
          {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.hint}>For session confirmations (not public)</Text>
          <Controller control={control} name="phone" render={({ field: { onChange, value, onBlur } }) => (
            <View style={[styles.inputRow, errors.phone && styles.inputRowError]}>
              <Ionicons name="call-outline" size={18} color={Colors.muted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="+44 7700 900 000"
                value={value} onChangeText={onChange} onBlur={onBlur}
                keyboardType="phone-pad" placeholderTextColor={Colors.muted}
              />
            </View>
          )} />
          {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
        </View>

        {/* Trust badge */}
        <View style={styles.trustCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.trustText}>Your phone number is never shared publicly — it's only used for booking confirmations.</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
          <Text style={styles.btnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
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

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  stepLabel: { textAlign: 'center', fontSize: FontSizes.xs, fontWeight: '600', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: FontSizes.base, color: Colors.muted, textAlign: 'center', marginBottom: Spacing.xl },

  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink, marginBottom: 4 },
  hint: { fontSize: FontSizes.xs, color: Colors.muted, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 52, ...Shadow.xs,
  },
  inputRowError: { borderColor: Colors.error },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSizes.base, color: Colors.ink },
  error: { fontSize: FontSizes.xs, color: Colors.error, marginTop: 4, marginLeft: 2 },

  trustCard: {
    flexDirection: 'row', gap: 10, backgroundColor: `${Colors.primary}10`,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: `${Colors.primary}20`,
    marginBottom: Spacing.lg,
  },
  trustText: { flex: 1, fontSize: FontSizes.sm, color: Colors.body, lineHeight: 20 },

  btn: {
    height: 54, backgroundColor: Colors.accent, borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, ...Shadow.sm,
  },
  btnText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
});
