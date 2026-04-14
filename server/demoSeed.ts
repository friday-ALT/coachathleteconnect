/**
 * Demo Seed Script for CoachConnect
 * 
 * This script creates demo coach profiles for showcasing the platform.
 * ONLY run in development/demo environments, never in production.
 * 
 * Usage: Call POST /api/admin/seed-demo (requires NODE_ENV=development)
 */

import { db } from "./db";
import { users, coachProfiles, coachAvailabilityRules, athleteProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import { DEMO_USER_DATA, DEMO_ATHLETE_PROFILE, DEMO_COACH_PROFILE, DEMO_CREDENTIALS } from "./demoAuth";

// Demo coach data
const DEMO_COACHES = [
  {
    id: "demo-coach-yohannes",
    firstName: "Mathias",
    lastName: "Yohannes",
    email: "mathias.yohannes@demo.coachconnect.com",
    profile: {
      name: "Mathias Yohannes",
      locationCity: "Blacksburg",
      locationState: "VA",
      lat: 37.2296,
      lng: -80.4139,
      bio: "Mathias Yohannes specializes in youth soccer coaching with a focus on developing confident, technically sound, and intelligent players through age-appropriate, high-level training. Drawing from his experience as a Division I and professional soccer player, he helps kids improve ball control, passing, shooting, decision-making, and overall game understanding while building creativity and composure on the field. Beyond technical skills, Mathias emphasizes discipline, confidence, work ethic, and mindset, guiding young athletes on proper training habits, fitness fundamentals, positioning, and long-term development pathways so they can grow both as players and as people.",
      experience: "Division I & Pro Soccer Player | Youth Development Specialist",
      yearsCoaching: 5,
      specialties: ["Dribbling", "Passing", "Shooting", "Decision Making", "Positioning"],
      certifications: "USSF D License, Virginia Tech Athletics",
      ageGroupsTaught: ["Under 8", "Under 10", "Under 12", "Under 14", "Teens"],
      sessionTypes: ["1-on-1", "Small Group"],
      maxGroupSize: 4,
      pricePerHour: 7500, // $75 per hour in cents
      ratingAvg: 4.9,
      ratingCount: 12,
      avatarUrl: null, // Will use placeholder
      timezone: "America/New_York",
      isComplete: 1,
    }
  }
];

export async function seedDemoCoaches(): Promise<{ success: boolean; message: string; coaches: string[] }> {
  const createdCoaches: string[] = [];
  
  // First, seed the main demo user with both athlete and coach profiles
  await seedMainDemoUser();
  
  for (const demoCoach of DEMO_COACHES) {
    try {
      // Check if demo user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, demoCoach.id));
      
      if (!existingUser) {
        // Create demo user
        await db.insert(users).values({
          id: demoCoach.id,
          email: demoCoach.email,
          firstName: demoCoach.firstName,
          lastName: demoCoach.lastName,
          authProvider: "demo",
          emailVerified: 1,
        });
        console.log(`Created demo user: ${demoCoach.firstName} ${demoCoach.lastName}`);
      }

      // Check if coach profile already exists
      const [existingProfile] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, demoCoach.id));
      
      if (!existingProfile) {
        // Create coach profile
        await db.insert(coachProfiles).values({
          ...demoCoach.profile,
          userId: demoCoach.id,
        });
        console.log(`Created coach profile: ${demoCoach.profile.name}`);
        createdCoaches.push(demoCoach.profile.name);
      } else {
        // Update existing profile with latest data
        await db.update(coachProfiles)
          .set(demoCoach.profile)
          .where(eq(coachProfiles.userId, demoCoach.id));
        console.log(`Updated coach profile: ${demoCoach.profile.name}`);
        createdCoaches.push(`${demoCoach.profile.name} (updated)`);
      }

      // Seed availability rules for this coach
      await seedCoachAvailability(demoCoach.id);
      
    } catch (error) {
      console.error(`Error creating demo coach ${demoCoach.firstName}:`, error);
    }
  }

  return {
    success: true,
    message: `Demo seed completed. ${createdCoaches.length} coaches processed.`,
    coaches: createdCoaches,
  };
}

/**
 * Seeds the main demo user account with both athlete and coach profiles
 * This allows the demo user to switch between roles and test all features
 */
async function seedMainDemoUser(): Promise<void> {
  try {
    // Check if demo user exists
    const [existingUser] = await db.select().from(users)
      .where(eq(users.id, DEMO_CREDENTIALS.userId))
      .limit(1);
    
    if (!existingUser) {
      // Create demo user
      await db.insert(users).values(DEMO_USER_DATA);
      console.log('Created main demo user');
    }

    // Check if athlete profile exists
    const [existingAthleteProfile] = await db.select().from(athleteProfiles)
      .where(eq(athleteProfiles.userId, DEMO_CREDENTIALS.userId))
      .limit(1);
    
    if (!existingAthleteProfile) {
      await db.insert(athleteProfiles).values({
        ...DEMO_ATHLETE_PROFILE,
        userId: DEMO_CREDENTIALS.userId,
      });
      console.log('Created demo athlete profile');
    } else {
      await db.update(athleteProfiles)
        .set(DEMO_ATHLETE_PROFILE)
        .where(eq(athleteProfiles.userId, DEMO_CREDENTIALS.userId));
      console.log('Updated demo athlete profile');
    }

    // Check if coach profile exists
    const [existingCoachProfile] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, DEMO_CREDENTIALS.userId))
      .limit(1);
    
    if (!existingCoachProfile) {
      await db.insert(coachProfiles).values({
        ...DEMO_COACH_PROFILE,
        userId: DEMO_CREDENTIALS.userId,
      });
      console.log('Created demo coach profile');
    } else {
      await db.update(coachProfiles)
        .set(DEMO_COACH_PROFILE)
        .where(eq(coachProfiles.userId, DEMO_CREDENTIALS.userId));
      console.log('Updated demo coach profile');
    }

    // Seed availability rules for demo coach
    await seedCoachAvailability(DEMO_CREDENTIALS.userId);
    
  } catch (error) {
    console.error('Error seeding main demo user:', error);
  }
}

// Check if a user is a demo account (cannot be edited by others)
export function isDemoUser(userId: string): boolean {
  return userId.startsWith("demo-");
}

/**
 * Seeds availability rules for a demo coach
 * Creates a realistic weekly training schedule with 1-hour sessions
 */
async function seedCoachAvailability(coachId: string): Promise<void> {
  // Delete any existing rules for this coach to allow re-seeding with updated schedule
  await db.delete(coachAvailabilityRules).where(eq(coachAvailabilityRules.coachId, coachId));

  // Define Mathias's training schedule:
  // Realistic 1-hour sessions, 2 per day on weekdays
  // Monday-Friday: Morning (8:00-9:00 AM) and Evening (5:00-6:00 PM)
  // Saturday: 3 sessions (10:00-11:00 AM, 2:00-3:00 PM, 4:00-5:00 PM)
  // Sunday: 2 sessions (11:00 AM-12:00 PM, 3:00-4:00 PM)
  const availabilityRules = [
    // Monday (1) - 2 one-hour sessions
    { coachId, dayOfWeek: 1, startTime: "08:00", endTime: "09:00", isActive: 1 },
    { coachId, dayOfWeek: 1, startTime: "17:00", endTime: "18:00", isActive: 1 },
    // Tuesday (2) - 2 one-hour sessions
    { coachId, dayOfWeek: 2, startTime: "08:00", endTime: "09:00", isActive: 1 },
    { coachId, dayOfWeek: 2, startTime: "17:00", endTime: "18:00", isActive: 1 },
    // Wednesday (3) - 2 one-hour sessions
    { coachId, dayOfWeek: 3, startTime: "08:00", endTime: "09:00", isActive: 1 },
    { coachId, dayOfWeek: 3, startTime: "17:00", endTime: "18:00", isActive: 1 },
    // Thursday (4) - 2 one-hour sessions
    { coachId, dayOfWeek: 4, startTime: "08:00", endTime: "09:00", isActive: 1 },
    { coachId, dayOfWeek: 4, startTime: "17:00", endTime: "18:00", isActive: 1 },
    // Friday (5) - 2 one-hour sessions
    { coachId, dayOfWeek: 5, startTime: "08:00", endTime: "09:00", isActive: 1 },
    { coachId, dayOfWeek: 5, startTime: "17:00", endTime: "18:00", isActive: 1 },
    // Saturday (6) - 3 one-hour sessions
    { coachId, dayOfWeek: 6, startTime: "10:00", endTime: "11:00", isActive: 1 },
    { coachId, dayOfWeek: 6, startTime: "14:00", endTime: "15:00", isActive: 1 },
    { coachId, dayOfWeek: 6, startTime: "16:00", endTime: "17:00", isActive: 1 },
    // Sunday (0) - 2 one-hour sessions
    { coachId, dayOfWeek: 0, startTime: "11:00", endTime: "12:00", isActive: 1 },
    { coachId, dayOfWeek: 0, startTime: "15:00", endTime: "16:00", isActive: 1 },
  ];

  try {
    await db.insert(coachAvailabilityRules).values(availabilityRules);
    console.log(`Created ${availabilityRules.length} availability rules for coach ${coachId}`);
  } catch (error) {
    console.error(`Error seeding availability for coach ${coachId}:`, error);
  }
}
