export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AthleteProfile {
  userId: string;
  phone: string;
  age: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  locationCity: string;
  locationState: string;
  isComplete: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoachProfile {
  userId: string;
  name: string;
  phone: string;
  locationCity: string;
  locationState: string;
  experience: string;
  pricePerHour: number;
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
  isComplete: number;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  athleteId: string;
  coachId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  coachName?: string;
  athleteName?: string;
}

export interface TimeSlotRequest {
  id: string;
  athleteId: string;
  coachId: string;
  connectionId: string | null;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookedSession {
  id: string;
  athleteId: string;
  coachId: string;
  startAt: Date;
  endAt: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  requestId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  athleteId: string;
  coachId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  athleteName?: string;
}

export interface AvailabilityRule {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: number;
}

export interface ScheduleTemplate {
  id: string;
  coachId: string;
  name: string;
  timezone: string;
  isPublic: number;
  items?: ScheduleTemplateItem[];
}

export interface ScheduleTemplateItem {
  id: string;
  templateId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  location?: string;
  trainingType?: string;
  groupSize?: string;
  notes?: string;
}

export type Role = 'athlete' | 'coach';
