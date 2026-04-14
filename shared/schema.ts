import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  real,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Supports both Replit Auth and Email/Password Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  // Email/Password Auth fields
  passwordHash: varchar("password_hash"),
  emailVerified: integer("email_verified").default(0), // 0=not verified, 1=verified
  verificationToken: varchar("verification_token"),
  verificationTokenExpires: timestamp("verification_token_expires"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  authProvider: varchar("auth_provider").default("email"), // "email", "replit", or "google"
  googleId: varchar("google_id").unique(),
  expoPushToken: varchar("expo_push_token"),
  stripeCustomerId: varchar("stripe_customer_id").unique(), // Stripe customer for payments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Enums
export const skillLevelEnum = pgEnum('skill_level', ['Beginner', 'Intermediate', 'Advanced']);
export const requestStatusEnum = pgEnum('request_status', ['PENDING', 'ACCEPTED', 'DECLINED']);
export const connectionStatusEnum = pgEnum('connection_status', ['PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED']);

// Athlete Profile
export const athleteProfiles = pgTable("athlete_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  age: integer("age").notNull(),
  skillLevel: skillLevelEnum("skill_level").notNull(),
  locationCity: varchar("location_city").notNull(),
  locationState: varchar("location_state").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  isComplete: integer("is_complete").default(0), // 0=incomplete, 1=complete
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));

export const insertAthleteProfileSchema = createInsertSchema(athleteProfiles).omit({
  id: true,
  userId: true,
  lat: true,
  lng: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  phone: z.string().optional(),
});

export type InsertAthleteProfile = z.infer<typeof insertAthleteProfileSchema>;
export type CreateAthleteProfile = InsertAthleteProfile & { userId: string };
export type AthleteProfile = typeof athleteProfiles.$inferSelect;

// Coach Profile
export const coachProfiles = pgTable("coach_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: varchar("name").notNull(),
  locationCity: varchar("location_city").notNull(),
  locationState: varchar("location_state").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  bio: text("bio"),
  experience: varchar("experience", { length: 160 }).notNull(),
  yearsCoaching: integer("years_coaching"),
  specialties: text("specialties").array(),
  certifications: text("certifications"),
  ageGroupsTaught: text("age_groups_taught").array(),
  sessionTypes: text("session_types").array(),
  maxGroupSize: integer("max_group_size"),
  pricePerHour: integer("price_per_hour").notNull(), // in cents
  ratingAvg: real("rating_avg").default(0),
  ratingCount: integer("rating_count").default(0),
  avatarUrl: varchar("avatar_url"),
  timezone: varchar("timezone").default("America/New_York"),
  isComplete: integer("is_complete").default(0),
  // Stripe Connect
  stripeAccountId: varchar("stripe_account_id").unique(),
  stripeOnboardingComplete: integer("stripe_onboarding_complete").default(0), // 0=no, 1=yes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_coach_profiles_rating").on(table.ratingAvg),
  index("idx_coach_profiles_location").on(table.locationCity, table.locationState),
  index("idx_coach_profiles_price").on(table.pricePerHour),
]);

export const coachProfilesRelations = relations(coachProfiles, ({ one }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id],
  }),
}));

export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({
  id: true,
  userId: true,
  lat: true,
  lng: true,
  ratingAvg: true,
  ratingCount: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  ageGroupsTaught: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
});

export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;
export type CreateCoachProfile = InsertCoachProfile & { userId: string };
export type CoachProfile = typeof coachProfiles.$inferSelect;

// Connections (athlete-coach relationship)
export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum("status").notNull().default('PENDING'),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_connections_athlete").on(table.athleteId, table.status),
  index("idx_connections_coach").on(table.coachId, table.status),
  index("idx_connections_pair").on(table.athleteId, table.coachId),
]);

export const connectionsRelations = relations(connections, ({ one }) => ({
  athlete: one(users, {
    fields: [connections.athleteId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [connections.coachId],
    references: [users.id],
  }),
}));

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  athleteId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type CreateConnection = InsertConnection & { athleteId: string };
export type Connection = typeof connections.$inferSelect;

// Time Slot Request
export const timeSlotRequests = pgTable("time_slot_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  connectionId: varchar("connection_id").references(() => connections.id, { onDelete: 'cascade' }),
  requestedDate: varchar("requested_date"),
  requestedStartTime: varchar("requested_start_time"),
  groupSize: integer("group_size").notNull(),
  desiredPosition: varchar("desired_position").notNull(),
  note: text("note"),
  status: requestStatusEnum("status").notNull().default('PENDING'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_timeslot_requests_athlete").on(table.athleteId, table.status),
  index("idx_timeslot_requests_coach").on(table.coachId, table.status),
]);

export const timeSlotRequestsRelations = relations(timeSlotRequests, ({ one }) => ({
  athlete: one(users, {
    fields: [timeSlotRequests.athleteId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [timeSlotRequests.coachId],
    references: [users.id],
  }),
}));

export const insertTimeSlotRequestSchema = createInsertSchema(timeSlotRequests).omit({
  id: true,
  athleteId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTimeSlotRequest = z.infer<typeof insertTimeSlotRequestSchema>;
export type CreateTimeSlotRequest = InsertTimeSlotRequest & { athleteId: string };
export type TimeSlotRequest = typeof timeSlotRequests.$inferSelect;

// Review
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  athlete: one(users, {
    fields: [reviews.athleteId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [reviews.coachId],
    references: [users.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().int().min(1).max(5),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Enums for availability
export const dayOfWeekEnum = pgEnum('day_of_week', ['0', '1', '2', '3', '4', '5', '6']); // 0=Sunday, 6=Saturday
export const exceptionTypeEnum = pgEnum('exception_type', ['BLOCK', 'ADD']);
export const sessionStatusEnum = pgEnum('session_status', ['SCHEDULED', 'COMPLETED', 'CANCELLED']);

// Coach Availability Rules (recurring weekly schedule)
export const coachAvailabilityRules = pgTable("coach_availability_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: varchar("start_time").notNull(), // HH:MM format (24h)
  endTime: varchar("end_time").notNull(), // HH:MM format (24h)
  isActive: integer("is_active").notNull().default(1), // 1=active, 0=inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coachAvailabilityRulesRelations = relations(coachAvailabilityRules, ({ one }) => ({
  coach: one(users, {
    fields: [coachAvailabilityRules.coachId],
    references: [users.id],
  }),
}));

export const insertCoachAvailabilityRuleSchema = createInsertSchema(coachAvailabilityRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCoachAvailabilityRule = z.infer<typeof insertCoachAvailabilityRuleSchema>;
export type CoachAvailabilityRule = typeof coachAvailabilityRules.$inferSelect;

// Coach Availability Exceptions (date-specific blocks or additions)
export const coachAvailabilityExceptions = pgTable("coach_availability_exceptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  startTime: varchar("start_time"), // HH:MM format, nullable for full-day blocks
  endTime: varchar("end_time"), // HH:MM format, nullable for full-day blocks
  exceptionType: varchar("exception_type").notNull(), // 'BLOCK' or 'ADD'
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachAvailabilityExceptionsRelations = relations(coachAvailabilityExceptions, ({ one }) => ({
  coach: one(users, {
    fields: [coachAvailabilityExceptions.coachId],
    references: [users.id],
  }),
}));

export const insertCoachAvailabilityExceptionSchema = createInsertSchema(coachAvailabilityExceptions).omit({
  id: true,
  createdAt: true,
});

export type InsertCoachAvailabilityException = z.infer<typeof insertCoachAvailabilityExceptionSchema>;
export type CoachAvailabilityException = typeof coachAvailabilityExceptions.$inferSelect;

// Booked Sessions
export const bookedSessions = pgTable("booked_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestId: varchar("request_id").references(() => timeSlotRequests.id, { onDelete: 'set null' }),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  status: varchar("status").notNull().default('SCHEDULED'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_booked_sessions_coach").on(table.coachId, table.startAt),
  index("idx_booked_sessions_athlete").on(table.athleteId, table.startAt),
]);

export const bookedSessionsRelations = relations(bookedSessions, ({ one }) => ({
  coach: one(users, {
    fields: [bookedSessions.coachId],
    references: [users.id],
  }),
  athlete: one(users, {
    fields: [bookedSessions.athleteId],
    references: [users.id],
  }),
  request: one(timeSlotRequests, {
    fields: [bookedSessions.requestId],
    references: [timeSlotRequests.id],
  }),
}));

export const insertBookedSessionSchema = createInsertSchema(bookedSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookedSession = z.infer<typeof insertBookedSessionSchema>;
export type BookedSession = typeof bookedSessions.$inferSelect;

// Coach Schedule Templates (Weekly Training Schedule)
export const coachScheduleTemplates = pgTable("coach_schedule_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: varchar("name").default("Weekly Training Schedule"),
  timezone: varchar("timezone").default("America/New_York"),
  isPublic: integer("is_public").notNull().default(1), // 1=public, 0=private
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_schedule_templates_coach").on(table.coachId),
]);

export const coachScheduleTemplatesRelations = relations(coachScheduleTemplates, ({ one, many }) => ({
  coach: one(users, {
    fields: [coachScheduleTemplates.coachId],
    references: [users.id],
  }),
  items: many(coachScheduleTemplateItems),
}));

export const insertCoachScheduleTemplateSchema = createInsertSchema(coachScheduleTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCoachScheduleTemplate = z.infer<typeof insertCoachScheduleTemplateSchema>;
export type CoachScheduleTemplate = typeof coachScheduleTemplates.$inferSelect;

// Coach Schedule Template Items (Individual Sessions)
export const coachScheduleTemplateItems = pgTable("coach_schedule_template_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => coachScheduleTemplates.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: varchar("start_time").notNull(), // HH:MM format (24h)
  endTime: varchar("end_time").notNull(), // HH:MM format (24h)
  title: varchar("title").notNull(),
  location: varchar("location"),
  trainingType: varchar("training_type"), // e.g., "1-on-1", "Group", "Team"
  groupSize: integer("group_size"),
  notes: text("notes"), // Private notes (not shown to athletes)
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_template_items_template").on(table.templateId),
  index("idx_template_items_day").on(table.templateId, table.dayOfWeek),
]);

export const coachScheduleTemplateItemsRelations = relations(coachScheduleTemplateItems, ({ one }) => ({
  template: one(coachScheduleTemplates, {
    fields: [coachScheduleTemplateItems.templateId],
    references: [coachScheduleTemplates.id],
  }),
}));

export const insertCoachScheduleTemplateItemSchema = createInsertSchema(coachScheduleTemplateItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCoachScheduleTemplateItem = z.infer<typeof insertCoachScheduleTemplateItemSchema>;
export type CoachScheduleTemplateItem = typeof coachScheduleTemplateItems.$inferSelect;

// Training Session Request (for athletes requesting specific sessions)
export const trainingSessionRequests = pgTable("training_session_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  connectionId: varchar("connection_id").references(() => connections.id, { onDelete: 'cascade' }),
  requestedDate: varchar("requested_date").notNull(), // YYYY-MM-DD format
  requestedStartTime: varchar("requested_start_time").notNull(), // HH:MM format
  requestedEndTime: varchar("requested_end_time").notNull(), // HH:MM format
  sessionTitle: varchar("session_title"),
  note: text("note"),
  status: requestStatusEnum("status").notNull().default('PENDING'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_training_requests_athlete").on(table.athleteId),
  index("idx_training_requests_coach").on(table.coachId),
]);

export const trainingSessionRequestsRelations = relations(trainingSessionRequests, ({ one }) => ({
  athlete: one(users, {
    fields: [trainingSessionRequests.athleteId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [trainingSessionRequests.coachId],
    references: [users.id],
  }),
  connection: one(connections, {
    fields: [trainingSessionRequests.connectionId],
    references: [connections.id],
  }),
}));

export const insertTrainingSessionRequestSchema = createInsertSchema(trainingSessionRequests).omit({
  id: true,
  athleteId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrainingSessionRequest = z.infer<typeof insertTrainingSessionRequestSchema>;
export type CreateTrainingSessionRequest = InsertTrainingSessionRequest & { athleteId: string };
export type TrainingSessionRequest = typeof trainingSessionRequests.$inferSelect;

// ─── Payments ───────────────────────────────────────────────────────────────

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENDING',       // checkout session created, not yet paid
  'COMPLETED',     // payment succeeded
  'REFUNDED',      // refunded to athlete
  'FAILED',        // payment failed or expired
]);

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => timeSlotRequests.id, { onDelete: 'set null' }),
  athleteId: varchar("athlete_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: varchar("coach_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Amounts in pence/cents
  amount: integer("amount").notNull(),           // total charged to athlete
  platformFee: integer("platform_fee").notNull(),// our 15% cut
  coachPayout: integer("coach_payout").notNull(),// amount sent to coach
  currency: varchar("currency", { length: 3 }).default('gbp'),
  status: transactionStatusEnum("status").notNull().default('PENDING'),
  // Stripe identifiers
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id").unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeTransferId: varchar("stripe_transfer_id"),
  // Session details snapshot
  sessionDate: varchar("session_date"),
  sessionStartTime: varchar("session_start_time"),
  sessionDurationMins: integer("session_duration_mins"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_transactions_athlete").on(table.athleteId),
  index("idx_transactions_coach").on(table.coachId),
  index("idx_transactions_status").on(table.status),
  index("idx_transactions_checkout").on(table.stripeCheckoutSessionId),
]);

export type Transaction = typeof transactions.$inferSelect;
