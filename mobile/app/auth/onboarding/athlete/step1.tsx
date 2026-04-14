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
  age:   z.string().refine(v => { const n = parseInt(v); return !isNaN(n) && n >= 5 && n <= 100; }, 'Age must be 5 – 100'),
});
type Form = z.infer<typeof schema>;

export default function AthleteStep1() {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', age: '' },
  });

  const onSubmit = async (data: Form) => {
    await SecureStore.setItemAsync('athleteStep1', JSON.stringify(data));
    router.push('/auth/onboarding/athlete/step2');
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
        {/* Icon + title */}
        <View style={styles.iconWrap}>
          <Ionicons name="person-circle-outline" size={52} color={Colors.primary} />
        </View>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>Help coaches know a bit about you</Text>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
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

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>Your Age</Text>
          <Controller control={control} name="age" render={({ field: { onChange, value, onBlur } }) => (
            <View style={[styles.inputRow, errors.age && styles.inputRowError]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.muted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 17"
                value={value} onChangeText={onChange} onBlur={onBlur}
                keyboardType="number-pad" placeholderTextColor={Colors.muted}
              />
            </View>
          )} />
          {errors.age && <Text style={styles.error}>{errors.age.message}</Text>}
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
  progressDotActive: { backgroundColor: Colors.primary, width: 22, borderRadius: 5 },
  progressLine: { width: 32, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  stepLabel: { textAlign: 'center', fontSize: FontSizes.xs, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: FontSizes.base, color: Colors.muted, textAlign: 'center', marginBottom: Spacing.xl },

  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.ink, marginBottom: 6 },
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

  btn: {
    height: 54, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginTop: Spacing.lg, ...Shadow.sm,
  },
  btnText: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white },
});
