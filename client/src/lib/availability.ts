import type { CoachAvailabilityRule, CoachAvailabilityException, BookedSession, CoachScheduleTemplateItem } from "@shared/schema";

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  isBooked: boolean;
  isException: boolean;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  slots: TimeSlot[];
}

const SLOT_DURATION_MINUTES = 30;

export function generateTimeSlots(startTime: string, endTime: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  while (currentMinutes + SLOT_DURATION_MINUTES <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endM = currentMinutes + SLOT_DURATION_MINUTES;
    const endH = Math.floor(endM / 60);
    const endMm = endM % 60;
    
    slots.push({
      start: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
      end: `${endH.toString().padStart(2, '0')}:${endMm.toString().padStart(2, '0')}`,
    });
    
    currentMinutes += SLOT_DURATION_MINUTES;
  }
  
  return slots;
}

export function computeAvailability(
  date: string,
  rules: CoachAvailabilityRule[],
  exceptions: CoachAvailabilityException[],
  bookedSessions: BookedSession[]
): TimeSlot[] {
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
  
  // Get current time to filter out past slots for today
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const isToday = date === today;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const dayRules = rules.filter(r => r.dayOfWeek === dayOfWeek && r.isActive === 1);
  const dayExceptions = exceptions.filter(e => e.date === date);
  
  const blockExceptions = dayExceptions.filter(e => e.exceptionType === 'BLOCK');
  const addExceptions = dayExceptions.filter(e => e.exceptionType === 'ADD');
  
  const hasFullDayBlock = blockExceptions.some(e => !e.startTime && !e.endTime);
  
  if (hasFullDayBlock) {
    return [];
  }
  
  const availableSlots: TimeSlot[] = [];
  
  // Helper to check if a slot is in the past (for today only)
  const isSlotInPast = (startTime: string): boolean => {
    if (!isToday) return false;
    const [h, m] = startTime.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    // Require at least 30 minutes lead time for booking
    return slotMinutes <= currentTimeMinutes + 30;
  };
  
  for (const rule of dayRules) {
    const ruleSlots = generateTimeSlots(rule.startTime, rule.endTime);
    
    for (const slot of ruleSlots) {
      // Skip past time slots for today
      if (isSlotInPast(slot.start)) {
        continue;
      }
      
      const isBlocked = blockExceptions.some(e => {
        if (!e.startTime || !e.endTime) return false;
        return slot.start >= e.startTime && slot.end <= e.endTime;
      });
      
      if (!isBlocked) {
        const isBooked = bookedSessions.some(s => {
          const sessionStart = new Date(s.startAt);
          const sessionEnd = new Date(s.endAt);
          const slotStart = new Date(`${date}T${slot.start}:00`);
          const slotEnd = new Date(`${date}T${slot.end}:00`);
          
          return sessionStart < slotEnd && sessionEnd > slotStart;
        });
        
        availableSlots.push({
          date,
          startTime: slot.start,
          endTime: slot.end,
          isAvailable: !isBooked,
          isBooked,
          isException: false,
        });
      }
    }
  }
  
  for (const exc of addExceptions) {
    if (exc.startTime && exc.endTime) {
      const addSlots = generateTimeSlots(exc.startTime, exc.endTime);
      
      for (const slot of addSlots) {
        // Skip past time slots for today
        if (isSlotInPast(slot.start)) {
          continue;
        }
        
        const exists = availableSlots.some(
          s => s.startTime === slot.start && s.endTime === slot.end
        );
        
        if (!exists) {
          const isBooked = bookedSessions.some(s => {
            const sessionStart = new Date(s.startAt);
            const sessionEnd = new Date(s.endAt);
            const slotStart = new Date(`${date}T${slot.start}:00`);
            const slotEnd = new Date(`${date}T${slot.end}:00`);
            
            return sessionStart < slotEnd && sessionEnd > slotStart;
          });
          
          availableSlots.push({
            date,
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: !isBooked,
            isBooked,
            isException: true,
          });
        }
      }
    }
  }
  
  availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  return availableSlots;
}

export function getNext30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

export function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
}

export const DEFAULT_TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

// Compute availability from schedule template items (new system)
export function computeAvailabilityFromTemplate(
  date: string,
  templateItems: CoachScheduleTemplateItem[],
  exceptions: CoachAvailabilityException[],
  bookedSessions: BookedSession[]
): TimeSlot[] {
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
  
  // Get current time to filter out past slots for today
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const isToday = date === today;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const dayExceptions = exceptions.filter(e => e.date === date);
  const blockExceptions = dayExceptions.filter(e => e.exceptionType === 'BLOCK');
  
  const hasFullDayBlock = blockExceptions.some(e => !e.startTime && !e.endTime);
  
  if (hasFullDayBlock) {
    return [];
  }
  
  // Helper to check if a slot is in the past (for today only)
  const isSlotInPast = (startTime: string): boolean => {
    if (!isToday) return false;
    const [h, m] = startTime.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    // Require at least 30 minutes lead time for booking
    return slotMinutes <= currentTimeMinutes + 30;
  };
  
  const availableSlots: TimeSlot[] = [];
  
  // Get template items for this day of week
  const dayItems = templateItems.filter(item => item.dayOfWeek === dayOfWeek);
  
  for (const item of dayItems) {
    // Skip past time slots for today
    if (isSlotInPast(item.startTime)) {
      continue;
    }
    
    // Check for time-specific block exceptions
    const isBlocked = blockExceptions.some(e => {
      if (!e.startTime || !e.endTime) return false;
      return item.startTime >= e.startTime && item.endTime <= e.endTime;
    });
    
    if (isBlocked) {
      continue;
    }
    
    // Check if session is already booked
    const isBooked = bookedSessions.some(s => {
      const sessionStart = new Date(s.startAt);
      const sessionEnd = new Date(s.endAt);
      const slotStart = new Date(`${date}T${item.startTime}:00`);
      const slotEnd = new Date(`${date}T${item.endTime}:00`);
      
      return sessionStart < slotEnd && sessionEnd > slotStart;
    });
    
    availableSlots.push({
      date,
      startTime: item.startTime,
      endTime: item.endTime,
      isAvailable: !isBooked,
      isBooked,
      isException: false,
    });
  }
  
  availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  return availableSlots;
}
