import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { requestApi, availabilityApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import SectionHeader from '../../components/ui/SectionHeader';
import { formatDate, formatTime } from '../../utils/format';
import { useSafeTop } from '../../hooks/useSafeTop';
import { useAuth } from '../../hooks/useAuth';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TIME_OPTIONS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00',
];

const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

type DaySchedule = { enabled: boolean; startTime: string; endTime: string };
type WeekSchedule = Record<number, DaySchedule>;

const DEFAULT_SCHEDULE: WeekSchedule = {
  0: { enabled: false, startTime: '09:00', endTime: '17:00' },
  1: { enabled: true,  startTime: '09:00', endTime: '17:00' },
  2: { enabled: true,  startTime: '09:00', endTime: '17:00' },
  3: { enabled: true,  startTime: '09:00', endTime: '17:00' },
  4: { enabled: true,  startTime: '09:00', endTime: '17:00' },
  5: { enabled: true,  startTime: '09:00', endTime: '17:00' },
  6: { enabled: false, startTime: '09:00', endTime: '17:00' },
};

function get7Days(from: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function formatHour(t: string) {
  const [h] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${ampm}`;
}

export default function CoachSchedule() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [editorOpen, setEditorOpen] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const safeTop = useSafeTop();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', 'coach'],
    queryFn: () => requestApi.getRequests('coach'),
  });

  // Load existing availability rules when editor opens
  const { data: rulesData } = useQuery({
    queryKey: ['availability-rules'],
    queryFn: () => user?.id ? availabilityApi.getRules(user.id) : null,
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const saveRulesMutation = useMutation({
    mutationFn: (rules: any[]) => availabilityApi.setRules(rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-rules'] });
      setEditorOpen(false);
      Alert.alert('Saved!', 'Your availability has been updated.');
    },
    onError: () => Alert.alert('Error', 'Failed to save availability. Please try again.'),
  });

  const openEditor = () => {
    // Pre-fill from existing rules if available
    if (rulesData?.rules?.length) {
      const schedule: WeekSchedule = { ...DEFAULT_SCHEDULE };
      rulesData.rules.forEach((rule: any) => {
        const dayIndex = DAY_NAMES_FULL.indexOf(rule.dayOfWeek);
        if (dayIndex >= 0) {
          schedule[dayIndex] = {
            enabled: true,
            startTime: rule.startTime?.slice(0, 5) || '09:00',
            endTime:   rule.endTime?.slice(0, 5)   || '17:00',
          };
        }
      });
      setLocalSchedule(schedule);
    }
    setEditorOpen(true);
  };

  const handleSave = () => {
    const rules = Object.entries(localSchedule)
      .filter(([, v]) => v.enabled)
      .map(([dayIdx, v]) => ({
        dayOfWeek: DAY_NAMES_FULL[Number(dayIdx)],
        startTime: v.startTime,
        endTime:   v.endTime,
      }));
    saveRulesMutation.mutate(rules);
  };

  const toggleDay = (dayIdx: number) => {
    setLocalSchedule(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], enabled: !prev[dayIdx].enabled },
    }));
  };

  const setTime = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: value },
    }));
  };

  const confirmed = requests?.filter((r: any) => r.status === 'ACCEPTED') || [];
  const days = get7Days(weekStart);

  const dayStr = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}`;
  const daySessions = confirmed.filter((r: any) => r.requestedDate === dayStr);

  const upcoming = confirmed
    .filter((r: any) => new Date(r.requestedDate) >= today)
    .sort((a: any, b: any) => a.requestedDate.localeCompare(b.requestedDate));

  const hasDotOn = (day: Date) => {
    const d = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    return confirmed.some((r: any) => r.requestedDate === d);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <View>
          <Text style={styles.title}>My Schedule</Text>
          <Text style={styles.sub}>{confirmed.length} confirmed session{confirmed.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.availBtn} onPress={openEditor} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={15} color={Colors.primary} />
          <Text style={styles.availBtnText}>Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Week strip */}
      <View style={styles.weekSection}>
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; })}>
            <Ionicons name="chevron-back" size={20} color={Colors.body} />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>
            {MONTHS[days[0].getMonth()]} {days[0].getDate()} – {MONTHS[days[6].getMonth()]} {days[6].getDate()}, {days[6].getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; })}>
            <Ionicons name="chevron-forward" size={20} color={Colors.body} />
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday    = isSameDay(day, today);
            const hasDot     = hasDotOn(day);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[styles.dayCell, isSelected && styles.dayCellActive]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{DAYS[day.getDay()]}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>
                  {day.getDate()}
                </Text>
                {hasDot && <View style={[styles.dot, isSelected && styles.dotActive]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionHeader
          label={isSameDay(selectedDay, today) ? 'Today' : DAYS[selectedDay.getDay()] + ' ' + selectedDay.getDate()}
          color={Colors.primary}
          count={daySessions.length}
        />

        {daySessions.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>No sessions this day</Text>
          </View>
        ) : (
          daySessions.map((r: any) => <SessionCard key={r.id} request={r} />)
        )}

        <SectionHeader label="All Upcoming" color={Colors.statusBlue} count={upcoming.length} />
        {upcoming.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No upcoming sessions</Text>
            <Text style={styles.emptySub}>Accept session requests to see them here</Text>
          </View>
        ) : (
          upcoming.map((r: any) => <SessionCard key={r.id} request={r} showDate />)
        )}
      </ScrollView>

      {/* Availability Editor Modal */}
      <Modal visible={editorOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditorOpen(false)}>
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Set Availability</Text>
            <TouchableOpacity onPress={() => setEditorOpen(false)} style={modal.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.ink} />
            </TouchableOpacity>
          </View>
          <Text style={modal.sub}>Choose which days and hours you're available for sessions.</Text>

          <ScrollView style={modal.scroll} showsVerticalScrollIndicator={false}>
            {Object.entries(localSchedule).map(([dayIdx, schedule]) => {
              const idx = Number(dayIdx);
              return (
                <View key={idx} style={modal.dayRow}>
                  <View style={modal.dayTop}>
                    <Text style={[modal.dayName, !schedule.enabled && modal.dayNameOff]}>
                      {DAY_NAMES_FULL[idx]}
                    </Text>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={() => toggleDay(idx)}
                      trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
                      thumbColor={schedule.enabled ? Colors.primary : Colors.muted}
                    />
                  </View>
                  {schedule.enabled && (
                    <View style={modal.timePickers}>
                      <TimeSelector
                        label="From"
                        value={schedule.startTime}
                        options={TIME_OPTIONS}
                        onChange={(v) => setTime(idx, 'startTime', v)}
                      />
                      <Text style={modal.timeSep}>–</Text>
                      <TimeSelector
                        label="To"
                        value={schedule.endTime}
                        options={TIME_OPTIONS}
                        onChange={(v) => setTime(idx, 'endTime', v)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={modal.footer}>
            <TouchableOpacity
              style={[modal.saveBtn, saveRulesMutation.isPending && modal.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saveRulesMutation.isPending}
              activeOpacity={0.85}
            >
              {saveRulesMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                  <Text style={modal.saveBtnText}>Save Availability</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimeSelector({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={modal.timeLabel}>{label}</Text>
      <TouchableOpacity style={modal.timeBtn} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={modal.timeBtnText}>{formatHour(value)}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.body} />
      </TouchableOpacity>
      {open && (
        <View style={modal.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
            {options.map((t) => (
              <TouchableOpacity
                key={t}
                style={[modal.dropdownItem, t === value && modal.dropdownItemActive]}
                onPress={() => { onChange(t); setOpen(false); }}
              >
                <Text style={[modal.dropdownText, t === value && modal.dropdownTextActive]}>
                  {formatHour(t)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function SessionCard({ request: r, showDate }: { request: any; showDate?: boolean }) {
  return (
    <View style={sessionStyles.card}>
      <View style={sessionStyles.timeCol}>
        <Text style={sessionStyles.startTime}>{formatTime(r.requestedStartTime)}</Text>
        <View style={sessionStyles.timeLine} />
        <Text style={sessionStyles.endTime}>{formatTime(r.requestedEndTime)}</Text>
      </View>
      <View style={sessionStyles.body}>
        <View style={sessionStyles.top}>
          <Avatar name={r.athleteName} size={34} />
          <View style={sessionStyles.info}>
            <Text style={sessionStyles.name}>{r.athleteName}</Text>
            {showDate && <Text style={sessionStyles.date}>{formatDate(r.requestedDate)}</Text>}
          </View>
        </View>
        {r.message && (
          <Text style={sessionStyles.msg} numberOfLines={1}>"{r.message}"</Text>
        )}
      </View>
    </View>
  );
}

const sessionStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.xs,
  },
  timeCol: {
    width: 52, backgroundColor: Colors.primaryLight,
    alignItems: 'center', paddingVertical: Spacing.md, gap: 4,
  },
  startTime: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.primaryDark },
  timeLine: { width: 1, flex: 1, backgroundColor: Colors.primary, opacity: 0.3, minHeight: 12 },
  endTime: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.primaryDark, opacity: 0.7 },
  body: { flex: 1, padding: Spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  info: { flex: 1 },
  name: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink },
  date: { fontSize: FontSizes.xs, color: Colors.muted, fontWeight: '500', marginTop: 1 },
  msg: { fontSize: FontSizes.xs, color: Colors.body, fontStyle: 'italic', marginTop: 6 },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.ink },
  closeBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center',
  },
  sub: {
    fontSize: FontSizes.sm, color: Colors.muted,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  scroll: { flex: 1, paddingHorizontal: Spacing.lg },
  dayRow: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  dayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink },
  dayNameOff: { color: Colors.muted },
  timePickers: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.sm },
  timeSep: { fontSize: FontSizes.lg, color: Colors.muted, alignSelf: 'center', marginTop: 16 },
  timeLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted, marginBottom: 4 },
  timeBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 9, backgroundColor: Colors.background,
  },
  timeBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink },
  dropdown: {
    position: 'absolute', top: 54, left: 0, right: 0,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, zIndex: 100, ...Shadow.md,
  },
  dropdownItem: { paddingHorizontal: Spacing.md, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: Colors.primaryLight },
  dropdownText: { fontSize: FontSizes.sm, color: Colors.body, fontWeight: '500' },
  dropdownTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  footer: {
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
  saveBtn: {
    height: 52, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.ink },
  sub: { fontSize: FontSizes.sm, color: Colors.muted, fontWeight: '500', marginTop: 2 },
  availBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.md, borderWidth: 1.5,
    borderColor: Colors.primary, backgroundColor: Colors.primaryLight,
  },
  availBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.primary },
  weekSection: {
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  weekNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.sm,
  },
  weekLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.ink },
  daysRow: { flexDirection: 'row', gap: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, gap: 3 },
  dayCellActive: { backgroundColor: Colors.primary },
  dayName: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted },
  dayNameActive: { color: Colors.white },
  dayNum: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink },
  dayNumActive: { color: Colors.white },
  dayNumToday: { color: Colors.primary },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary },
  dotActive: { backgroundColor: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  emptyDay: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.sm,
  },
  emptyDayText: { fontSize: FontSizes.sm, color: Colors.muted, fontWeight: '500' },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, gap: 8 },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink },
  emptySub: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center' },
});
