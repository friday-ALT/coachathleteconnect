import { db } from "./db";
import { users, coachProfiles, athleteProfiles } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create test coaches with their user records
    const coaches = [
      {
        email: "sarah.johnson@coach.com",
        firstName: "Sarah",
        lastName: "Johnson",
        name: "Sarah Johnson",
        locationCity: "Austin",
        locationState: "TX",
        experience: "10 years coaching youth soccer, former college player",
        pricePerHour: 5000, // $50/hr in cents
      },
      {
        email: "mike.rodriguez@coach.com",
        firstName: "Mike",
        lastName: "Rodriguez",
        name: "Mike Rodriguez",
        locationCity: "Houston",
        locationState: "TX",
        experience: "5 years coaching youth soccer",
        pricePerHour: 3000, // $30/hr in cents
      },
      {
        email: "lisa.chen@coach.com",
        firstName: "Lisa",
        lastName: "Chen",
        name: "Lisa Chen",
        locationCity: "Dallas",
        locationState: "TX",
        experience: "8 years coaching competitive youth teams",
        pricePerHour: 4500, // $45/hr in cents
      },
    ];

    for (const coach of coaches) {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${coach.email}`)
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        console.log(`✓ User already exists: ${coach.email}`);
      } else {
        // Create user record
        const [newUser] = await db
          .insert(users)
          .values({
            email: coach.email,
            firstName: coach.firstName,
            lastName: coach.lastName,
          })
          .returning();

        userId = newUser.id;
        console.log(`✓ Created user: ${coach.email}`);
      }

      // Check if coach profile already exists
      const existingCoach = await db
        .select()
        .from(coachProfiles)
        .where(sql`${coachProfiles.userId} = ${userId}`)
        .limit(1);

      if (existingCoach.length === 0) {
        // Create coach profile
        await db.insert(coachProfiles).values({
          userId,
          name: coach.name,
          locationCity: coach.locationCity,
          locationState: coach.locationState,
          experience: coach.experience,
          pricePerHour: coach.pricePerHour,
          ratingAvg: 0,
          ratingCount: 0,
        });
        console.log(`✓ Created coach profile: ${coach.name}`);
      } else {
        console.log(`✓ Coach profile already exists: ${coach.name}`);
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
