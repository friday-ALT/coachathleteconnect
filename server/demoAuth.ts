/**
 * Demo Authentication Configuration
 * 
 * This file contains the demo account credentials for app store testing.
 * IMPORTANT: Change these credentials before deploying to production!
 */

export const DEMO_CREDENTIALS = {
  email: 'demo@coachconnect.app',
  password: 'Demo2026!',
  userId: 'demo-user-main',
};

export const DEMO_USER_DATA = {
  id: DEMO_CREDENTIALS.userId,
  email: DEMO_CREDENTIALS.email,
  firstName: 'Demo',
  lastName: 'User',
  authProvider: 'demo',
  emailVerified: 1,
};

export const DEMO_ATHLETE_PROFILE = {
  name: 'Demo User',
  age: 19,
  locationCity: 'Blacksburg',
  locationState: 'VA',
  lat: 37.2296,
  lng: -80.4139,
  bio: 'Demo athlete account for testing the CoachConnect platform.',
  skillLevel: 'Intermediate',
  goals: 'Improve technical skills and game awareness',
  preferredSessionType: '1-on-1',
  ageGroup: 'Teens',
  isComplete: 1,
};

export const DEMO_COACH_PROFILE = {
  name: 'Demo Coach',
  locationCity: 'Blacksburg',
  locationState: 'VA',
  lat: 37.2296,
  lng: -80.4139,
  bio: 'Demo coach account for testing the CoachConnect platform.',
  experience: 'Professional Coach | 10+ Years Experience',
  yearsCoaching: 10,
  specialties: ['Technical Skills', 'Tactical Awareness', 'Physical Conditioning'],
  certifications: 'USSF B License',
  ageGroupsTaught: ['Under 10', 'Under 12', 'Under 14', 'Teens'],
  sessionTypes: ['1-on-1', 'Small Group'],
  maxGroupSize: 6,
  pricePerHour: 8000,
  timezone: 'America/New_York',
  isComplete: 1,
};

/**
 * Check if credentials match the demo account
 */
export function isDemoLogin(email: string, password: string): boolean {
  return email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && 
         password === DEMO_CREDENTIALS.password;
}

/**
 * Check if a user ID is the demo user
 */
export function isDemoUserId(userId: string): boolean {
  return userId === DEMO_CREDENTIALS.userId;
}
