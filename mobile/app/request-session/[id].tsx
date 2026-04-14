import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { coachApi, requestApi, paymentApi } from '../../lib/api';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';

// Generate next 14 days starting from tomorrow
function get14Days(): { date: Date; label: string; dayName: string }[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1); // start from tomorrow
    return {
      date: d,
      label: d.getDate().toString(),
      dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
    };
  });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addMins(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

function formatHour(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2,'0')}${ampm}`;
}

const ALL_TIME_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
const DURATIONS = [{ label: '1 hr', value: 60 }, { label: '1.5 hr', value: 90 }, { label: '2 hr', value: 120 }];

const schema = z.object({
  message: z.string().max(300).optional(),
});

export default function RequestSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const safeTop = useSafeTop();

  const days = get14Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);

  const { data: coach } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getCoach(id),
  });

  // Fetch real coach availability for the next 30 days
  const { data: schedule } = useQuery({
    queryKey: ['coach-schedule', id],
    queryFn: () => coachApi.getCoachSchedule30Days(id),
    staleTime: 60_000,
  });

  // Build a set of booked slots for the selected date
  const selectedDateStr = toDateStr(selectedDay.date);
  const scheduledDay = schedule?.days?.find((d: any) => d.date === selectedDateStr);
  const bookedSlots = new Set<string>(
    scheduledDay?.sessions
      ?.filter((s: any) => s.status === 'Booked')
      ?.map((s: any) => s.startTime?.slice(0, 5)) ?? []
  );

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { message: '' },
  });

  // Track pending checkout session ID for polling after browser returns
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null);

  // Free request mutation (no price set)
  const freeMutation = useMutation({
    mutationFn: (data: any) => requestApi.createRequest({
      coachId: id,
      requestedDate: selectedDateStr,
      requestedStartTime: selectedTime,
      requestedEndTime: addMins(selectedTime, selectedDuration),
      message: data.message || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'athlete'] });
      queryClient.invalidateQueries({ queryKey: ['coach-schedule', id] });
      Alert.alert('Request Sent!', "The coach will be notified. You'll hear back soon.", [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send request');
    },
  });

  // Paid booking mutation — opens Stripe Checkout in browser
  const payMutation = useMutation({
    mutationFn: (data: any) => paymentApi.createCheckout({
      coachId: id,
      requestedDate: selectedDateStr,
      requestedStartTime: selectedTime,
      requestedEndTime: addMins(selectedTime, selectedDuration),
      durationMins: selectedDuration,
      message: data.message || undefined,
    }),
    onSuccess: async (result) => {
      setPendingCheckoutId(result.checkoutSessionId);
      // Open Stripe Checkout in an in-app browser
      const browserResult = await WebBrowser.openAuthSessionAsync(
        result.url,
        'coachconnect://'  // deep link scheme that closes the browser
      );
      // Browser was dismissed — poll for payment status
      if (browserResult.type === 'success' || browserResult.type === 'dismiss') {
        pollPaymentStatus(result.checkoutSessionId);
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to start payment');
    },
  });

  const pollPaymentStatus = async (sessionId: string) => {
    try {
      const result = await paymentApi.checkoutStatus(sessionId);
      if (result.status === 'paid') {
        queryClient.invalidateQueries({ queryKey: ['requests', 'athlete'] });
        queryClient.invalidateQueries({ queryKey: ['coach-schedule', id] });
        setPendingCheckoutId(null);
        Alert.alert(
          '🎉 Payment Successful!',
          "Your session is booked and payment is confirmed. The coach will accept shortly.",
          [{ text: 'View Sessions', onPress: () => router.replace('/(athlete)/sessions') }],
        );
      } else {
        setPendingCheckoutId(null);
        Alert.alert('Payment Incomplete', 'Your payment was not completed. Please try again.');
      }
    } catch {
      setPendingCheckoutId(null);
    }
  };

  const onSubmit = (data: any) => {
    if (!selectedTime) {
      Alert.alert('Select a time', 'Please choose a start time for your session.');
      return;
    }
    if (sessionCost) {
      payMutation.mutate(data);
    } else {
      freeMutation.mutate(data);
    }
  };

  const isSubmitting = freeMutation.isPending || payMutation.isPending || !!pendingCheckoutId;
  const endTime = selectedTime ? addMins(selectedTime, selectedDuration) : null;
  const sessionCost = coach?.pricePerHour ? Math.round(coach.pricePerHour * selectedDuration / 60) : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Book Session</Text>
          {coach && <Text style={styles.headerSub}>with {coach.name}</Text>}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Coach price banner */}
        {coach && (
          <View style={styles.coachBanner}>
            <View>
              <Text style={styles.coachBannerName}>{coach.name}</Text>
              <Text style={styles.coachBannerLoc}>
                <Ionicons name="location-outline" size={12} color={Colors.muted} /> {coach.locationCity}, {coach.locationState}
              </Text>
            </View>
            <Text style={styles.coachBannerPrice}>{formatPrice(coach.pricePerHour)}<Text style={styles.perHr}>/hr</Text></Text>
          </View>
        )}

        {/* Date strip — 14 days starting tomorrow */}
        <Text style={styles.fieldLabel}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
          {days.map((d, i) => {
            const isSelected = toDateStr(d.date) === selectedDateStr;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayCell, isSelected && styles.dayCellActive]}
                onPress={() => { setSelectedDay(d); setSelectedTime(''); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{d.dayName}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{d.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time grid with booked slots greyed out */}
        <View style={styles.timeLabelRow}>
          <Text style={styles.fieldLabel}>Start Time</Text>
          {bookedSlots.size > 0 && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: Colors.statusRed }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          )}
        </View>
        <View style={styles.timeGrid}>
          {ALL_TIME_SLOTS.map((slot) => {
            const isBooked   = bookedSlots.has(slot);
            const isSelected = selectedTime === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  isSelected && styles.timeSlotActive,
                  isBooked  && styles.timeSlotBooked,
                ]}
                onPress={() => !isBooked && setSelectedTime(slot)}
                activeOpacity={isBooked ? 1 : 0.8}
                disabled={isBooked}
              >
                <Text style={[
                  styles.timeSlotText,
                  isSelected && styles.timeSlotTextActive,
                  isBooked  && styles.timeSlotTextBooked,
                ]}>
                  {formatHour(slot)}
                </Text>
                {isBooked && (
                  <Ionicons name="close" size={10} color={Colors.statusRed} style={{ marginTop: 1 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration */}
        <Text style={styles.fieldLabel}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.value}
              style={[styles.durationBtn, selectedDuration === d.value && styles.durationBtnActive]}
              onPress={() => setSelectedDuration(d.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.durationText, selectedDuration === d.value && styles.durationTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live summary */}
        {selectedTime && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.summaryText}>{selectedDay.dayName} {selectedDay.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.summaryText}>{formatHour(selectedTime)} – {endTime ? formatHour(endTime) : ''}</Text>
            </View>
            {sessionCost !== null && (
              <View style={styles.summaryRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                <Text style={[styles.summaryText, { fontWeight: '800' }]}>
                  Estimated: {formatPrice(sessionCost)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Message */}
        <Text style={styles.fieldLabel}>Message <Text style={styles.optional}>(optional)</Text></Text>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.textArea, errors.message && styles.inputError]}
              placeholder="Tell the coach what you'd like to work on..."
              placeholderTextColor={Colors.muted}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
            />
          )}
        />
        {errors.message && <Text style={styles.errorText}>{errors.message.message}</Text>}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {/* Price summary strip */}
        {sessionCost && selectedTime && (
          <View style={styles.priceSummary}>
            <View>
              <Text style={styles.priceSummaryLabel}>Total due today</Text>
              <Text style={styles.priceSummaryNote}>Secure payment via Stripe</Text>
            </View>
            <Text style={styles.priceSummaryAmount}>{formatPrice(sessionCost)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!selectedTime || isSubmitting) && styles.btnDisabled,
            sessionCost ? styles.submitBtnPay : null]}
          onPress={handleSubmit(onSubmit)}
          disabled={!selectedTime || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : sessionCost && selectedTime ? (
            <>
              <Ionicons name="card-outline" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>Book & Pay {formatPrice(sessionCost)}</Text>
            </>
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>
                Send Request{!coach?.pricePerHour ? ' — Free' : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {sessionCost && (
          <Text style={styles.stripeNote}>
            <Ionicons name="lock-closed-outline" size={11} color={Colors.muted} /> Payments secured by Stripe. 15% platform fee included.
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  coachBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.xs,
  },
  coachBannerName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink },
  coachBannerLoc: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  coachBannerPrice: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.primary },
  perHr: { fontSize: FontSizes.sm, fontWeight: '400', color: Colors.muted },

  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink, marginBottom: Spacing.sm },
  optional: { fontWeight: '400', color: Colors.muted },

  dayStrip: { gap: Spacing.sm, paddingBottom: Spacing.md, paddingRight: Spacing.xs },
  dayCell: {
    width: 52, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, gap: 3,
  },
  dayCellActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayName: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted },
  dayNameActive: { color: 'rgba(255,255,255,0.85)' },
  dayNum: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.ink },
  dayNumActive: { color: Colors.white },

  timeLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSizes.xs, color: Colors.muted, fontWeight: '500' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  timeSlot: {
    paddingVertical: 9, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  timeSlotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotBooked: { backgroundColor: `${Colors.statusRed}10`, borderColor: `${Colors.statusRed}40` },
  timeSlotText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.body },
  timeSlotTextActive: { color: Colors.white },
  timeSlotTextBooked: { color: Colors.statusRed, opacity: 0.6, textDecorationLine: 'line-through' },

  durationRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  durationBtn: {
    flex: 1, height: 44, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface,
  },
  durationBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  durationText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.body },
  durationTextActive: { color: Colors.white },

  summaryCard: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg, gap: 8,
    borderWidth: 1, borderColor: `${Colors.primary}30`,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primaryDark },

  textArea: {
    minHeight: 100, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, fontSize: FontSizes.base, color: Colors.ink,
    backgroundColor: Colors.surface, marginBottom: Spacing.sm,
  },
  inputError: { borderColor: Colors.statusRed },
  errorText: { fontSize: FontSizes.xs, color: Colors.statusRed, marginBottom: Spacing.sm },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface, borderTopWidth: 1,
    borderTopColor: Colors.border, ...Shadow.md,
  },
  submitBtn: {
    height: 54, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  submitBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white },
  submitBtnPay: { backgroundColor: '#635BFF' }, // Stripe purple for paid bookings
  btnDisabled: { opacity: 0.4 },

  priceSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: `${Colors.primary}30`,
  },
  priceSummaryLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primaryDark },
  priceSummaryNote:  { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 1 },
  priceSummaryAmount: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.primary },
  stripeNote: {
    fontSize: 10, color: Colors.muted, textAlign: 'center',
    marginTop: Spacing.xs, flexDirection: 'row', alignItems: 'center',
  },
});
