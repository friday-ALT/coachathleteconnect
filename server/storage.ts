import {
  users,
  athleteProfiles,
  coachProfiles,
  connections,
  timeSlotRequests,
  reviews,
  coachAvailabilityRules,
  coachAvailabilityExceptions,
  bookedSessions,
  coachScheduleTemplates,
  coachScheduleTemplateItems,
  trainingSessionRequests,
  type User,
  type UpsertUser,
  type AthleteProfile,
  type InsertAthleteProfile,
  type CreateAthleteProfile,
  type CoachProfile,
  type InsertCoachProfile,
  type CreateCoachProfile,
  type Connection,
  type CreateConnection,
  type TimeSlotRequest,
  type InsertTimeSlotRequest,
  type CreateTimeSlotRequest,
  type Review,
  type InsertReview,
  type CoachAvailabilityRule,
  type InsertCoachAvailabilityRule,
  type CoachAvailabilityException,
  type InsertCoachAvailabilityException,
  type BookedSession,
  type InsertBookedSession,
  type CoachScheduleTemplate,
  type InsertCoachScheduleTemplate,
  type CoachScheduleTemplateItem,
  type InsertCoachScheduleTemplateItem,
  type TrainingSessionRequest,
  type CreateTrainingSessionRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPhone(id: string, phone: string): Promise<void>;

  // Athlete Profile operations
  getAthleteProfile(userId: string): Promise<AthleteProfile | undefined>;
  createAthleteProfile(profile: CreateAthleteProfile): Promise<AthleteProfile>;
  updateAthleteProfile(userId: string, profile: Partial<InsertAthleteProfile>): Promise<AthleteProfile>;

  // Coach Profile operations
  getCoachProfile(userId: string): Promise<CoachProfile | undefined>;
  getCoachProfileById(id: string): Promise<CoachProfile | undefined>;
  createCoachProfile(profile: CreateCoachProfile): Promise<CoachProfile>;
  updateCoachProfile(userId: string, profile: Partial<InsertCoachProfile>): Promise<CoachProfile>;
  searchCoaches(query: string, skillLevel?: string, groupSize?: string, limit?: number, cursor?: string): Promise<CoachProfile[]>;
  updateCoachAvatar(userId: string, avatarUrl: string): Promise<void>;

  // Athlete Search (for coaches)
  searchAthletes(query: string, skillLevel?: string): Promise<any[]>;

  // Connection operations
  createConnection(connection: CreateConnection): Promise<Connection>;
  getConnection(athleteId: string, coachId: string): Promise<Connection | undefined>;
  getConnectionById(id: string): Promise<Connection | undefined>;
  getConnectionsByAthlete(athleteId: string): Promise<any[]>;
  getConnectionsByCoach(coachId: string): Promise<any[]>;
  updateConnectionStatus(id: string, status: "ACCEPTED" | "DECLINED" | "BLOCKED"): Promise<Connection>;

  // Time Slot Request operations
  createTimeSlotRequest(request: CreateTimeSlotRequest & { connectionId?: string }): Promise<TimeSlotRequest>;
  getRequestById(id: string): Promise<TimeSlotRequest | undefined>;
  getRequestsByCoach(coachId: string): Promise<any[]>;
  getRequestsByAthlete(athleteId: string): Promise<any[]>;
  updateRequestStatus(id: string, status: "ACCEPTED" | "DECLINED"): Promise<TimeSlotRequest>;
  deleteRequest(id: string): Promise<void>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByCoach(coachId: string): Promise<any[]>;
  getReviewsByAthlete(athleteId: string): Promise<any[]>;
  getAcceptedCoachesForAthlete(athleteId: string): Promise<CoachProfile[]>;
  updateCoachRating(coachId: string): Promise<void>;

  // Availability operations
  getAvailabilityRules(coachId: string): Promise<CoachAvailabilityRule[]>;
  upsertAvailabilityRules(coachId: string, rules: Omit<InsertCoachAvailabilityRule, 'coachId'>[]): Promise<CoachAvailabilityRule[]>;
  deleteAvailabilityRule(id: string, coachId: string): Promise<void>;
  
  getAvailabilityExceptions(coachId: string, startDate: string, endDate: string): Promise<CoachAvailabilityException[]>;
  createAvailabilityException(exception: InsertCoachAvailabilityException): Promise<CoachAvailabilityException>;
  deleteAvailabilityException(id: string, coachId: string): Promise<void>;
  
  // Session operations
  getBookedSessions(coachId: string, startDate: Date, endDate: Date): Promise<BookedSession[]>;
  createBookedSession(session: InsertBookedSession): Promise<BookedSession>;

  // Coach Schedule Template operations
  getScheduleTemplate(coachId: string): Promise<CoachScheduleTemplate | undefined>;
  createScheduleTemplate(template: InsertCoachScheduleTemplate): Promise<CoachScheduleTemplate>;
  updateScheduleTemplate(coachId: string, template: Partial<InsertCoachScheduleTemplate>): Promise<CoachScheduleTemplate>;
  deleteScheduleTemplate(coachId: string): Promise<void>;

  // Schedule Template Items operations
  getScheduleTemplateItems(templateId: string): Promise<CoachScheduleTemplateItem[]>;
  createScheduleTemplateItem(item: InsertCoachScheduleTemplateItem): Promise<CoachScheduleTemplateItem>;
  updateScheduleTemplateItem(id: string, templateId: string, item: Partial<InsertCoachScheduleTemplateItem>): Promise<CoachScheduleTemplateItem>;
  deleteScheduleTemplateItem(id: string, templateId: string): Promise<void>;
  copyDayItems(templateId: string, fromDay: number, toDay: number): Promise<CoachScheduleTemplateItem[]>;

  // Training Session Request operations
  createTrainingSessionRequest(request: CreateTrainingSessionRequest): Promise<TrainingSessionRequest>;
  getTrainingSessionRequestsByCoach(coachId: string): Promise<TrainingSessionRequest[]>;
  getTrainingSessionRequestsByAthlete(athleteId: string): Promise<TrainingSessionRequest[]>;
  updateTrainingSessionRequestStatus(id: string, status: "ACCEPTED" | "DECLINED"): Promise<TrainingSessionRequest>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPhone(id: string, phone: string): Promise<void> {
    await db
      .update(users)
      .set({ phone, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Athlete Profile operations
  async getAthleteProfile(userId: string): Promise<AthleteProfile | undefined> {
    const [profile] = await db
      .select()
      .from(athleteProfiles)
      .where(eq(athleteProfiles.userId, userId));
    return profile;
  }

  async createAthleteProfile(profile: CreateAthleteProfile): Promise<AthleteProfile> {
    const [created] = await db
      .insert(athleteProfiles)
      .values({ ...profile, isComplete: 1 })
      .returning();
    return created;
  }

  async updateAthleteProfile(
    userId: string,
    profile: Partial<InsertAthleteProfile>
  ): Promise<AthleteProfile> {
    const [updated] = await db
      .update(athleteProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(athleteProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Coach Profile operations
  async getCoachProfile(userId: string): Promise<CoachProfile | undefined> {
    const [profile] = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId));
    return profile;
  }

  async getCoachProfileById(coachId: string): Promise<CoachProfile | undefined> {
    // First try to find by userId (most common case)
    let [profile] = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, coachId));
    
    // If not found by userId, try by profile id
    if (!profile) {
      [profile] = await db
        .select()
        .from(coachProfiles)
        .where(eq(coachProfiles.id, coachId));
    }
    return profile;
  }

  async createCoachProfile(profile: CreateCoachProfile): Promise<CoachProfile> {
    const [created] = await db
      .insert(coachProfiles)
      .values({ ...profile, isComplete: 1 })
      .returning();
    return created;
  }

  async updateCoachProfile(
    userId: string,
    profile: Partial<InsertCoachProfile>
  ): Promise<CoachProfile> {
    const [updated] = await db
      .update(coachProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(coachProfiles.userId, userId))
      .returning();
    return updated;
  }

  async searchCoaches(query: string, skillLevel?: string, _groupSize?: string, limit = 20, cursor?: string): Promise<CoachProfile[]> {
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(coachProfiles.name, `%${query}%`),
          like(coachProfiles.locationCity, `%${query}%`),
          like(coachProfiles.locationState, `%${query}%`),
        ),
      );
    }

    if (skillLevel && skillLevel !== 'all') {
      // filter by coaches who teach this level (specialties contains it or age group)
      // stored as free-form for now — skip this filter unless a dedicated column is added
    }

    // Cursor-based pagination: cursor is the last coach's id from the previous page
    if (cursor) {
      const [last] = await db.select({ ratingAvg: coachProfiles.ratingAvg }).from(coachProfiles).where(eq(coachProfiles.id, cursor));
      if (last) {
        conditions.push(
          sql`${coachProfiles.ratingAvg} < ${last.ratingAvg ?? 0} OR (${coachProfiles.ratingAvg} = ${last.ratingAvg ?? 0} AND ${coachProfiles.id} > ${cursor})`,
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const coaches = await db
      .select()
      .from(coachProfiles)
      .where(whereClause)
      .orderBy(sql`${coachProfiles.ratingAvg} DESC NULLS LAST`, coachProfiles.id)
      .limit(Math.min(limit, 50));

    return coaches;
  }

  async updateCoachAvatar(userId: string, avatarUrl: string): Promise<void> {
    await db
      .update(coachProfiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(coachProfiles.userId, userId));
  }

  // Athlete Search (for coaches)
  async searchAthletes(query: string, skillLevel?: string): Promise<any[]> {
    let conditions = [];

    if (query) {
      conditions.push(
        or(
          like(athleteProfiles.locationCity, `%${query}%`),
          like(athleteProfiles.locationState, `%${query}%`)
        )
      );
    }

    if (skillLevel && skillLevel !== "all") {
      conditions.push(eq(athleteProfiles.skillLevel, skillLevel as "Beginner" | "Intermediate" | "Advanced"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const athletes = await db
      .select({
        id: athleteProfiles.id,
        userId: athleteProfiles.userId,
        age: athleteProfiles.age,
        skillLevel: athleteProfiles.skillLevel,
        locationCity: athleteProfiles.locationCity,
        locationState: athleteProfiles.locationState,
        createdAt: athleteProfiles.createdAt,
        updatedAt: athleteProfiles.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(athleteProfiles)
      .leftJoin(users, eq(athleteProfiles.userId, users.id))
      .where(whereClause)
      .limit(50);

    return athletes;
  }

  // Connection operations
  async createConnection(connection: CreateConnection): Promise<Connection> {
    const [created] = await db
      .insert(connections)
      .values(connection)
      .returning();
    return created;
  }

  async getConnection(athleteId: string, coachId: string): Promise<Connection | undefined> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.athleteId, athleteId),
          eq(connections.coachId, coachId)
        )
      );
    return connection;
  }

  async getConnectionById(id: string): Promise<Connection | undefined> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(eq(connections.id, id));
    return connection;
  }

  async getConnectionsByAthlete(athleteId: string): Promise<any[]> {
    const connectionList = await db
      .select({
        id: connections.id,
        athleteId: connections.athleteId,
        coachId: connections.coachId,
        status: connections.status,
        message: connections.message,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        coachProfile: coachProfiles,
        coachUser: users,
      })
      .from(connections)
      .leftJoin(coachProfiles, eq(connections.coachId, coachProfiles.userId))
      .leftJoin(users, eq(connections.coachId, users.id))
      .where(eq(connections.athleteId, athleteId))
      .orderBy(sql`${connections.createdAt} DESC`);
    return connectionList;
  }

  async getConnectionsByCoach(coachId: string): Promise<any[]> {
    const connectionList = await db
      .select({
        id: connections.id,
        athleteId: connections.athleteId,
        coachId: connections.coachId,
        status: connections.status,
        message: connections.message,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        athleteProfile: athleteProfiles,
        athleteUser: users,
      })
      .from(connections)
      .leftJoin(athleteProfiles, eq(connections.athleteId, athleteProfiles.userId))
      .leftJoin(users, eq(connections.athleteId, users.id))
      .where(eq(connections.coachId, coachId))
      .orderBy(sql`${connections.createdAt} DESC`);
    return connectionList;
  }

  async updateConnectionStatus(
    id: string,
    status: "ACCEPTED" | "DECLINED" | "BLOCKED"
  ): Promise<Connection> {
    const [updated] = await db
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return updated;
  }

  // Time Slot Request operations
  async createTimeSlotRequest(request: CreateTimeSlotRequest & { connectionId?: string }): Promise<TimeSlotRequest> {
    const [created] = await db
      .insert(timeSlotRequests)
      .values(request)
      .returning();
    return created;
  }

  async getRequestById(id: string): Promise<TimeSlotRequest | undefined> {
    const [request] = await db
      .select()
      .from(timeSlotRequests)
      .where(eq(timeSlotRequests.id, id));
    return request;
  }

  async getRequestsByCoach(coachId: string): Promise<any[]> {
    const requests = await db
      .select({
        id: timeSlotRequests.id,
        athleteId: timeSlotRequests.athleteId,
        coachId: timeSlotRequests.coachId,
        groupSize: timeSlotRequests.groupSize,
        desiredPosition: timeSlotRequests.desiredPosition,
        note: timeSlotRequests.note,
        status: timeSlotRequests.status,
        createdAt: timeSlotRequests.createdAt,
        updatedAt: timeSlotRequests.updatedAt,
        athleteProfile: athleteProfiles,
        athleteUser: users,
      })
      .from(timeSlotRequests)
      .leftJoin(athleteProfiles, eq(timeSlotRequests.athleteId, athleteProfiles.userId))
      .leftJoin(users, eq(timeSlotRequests.athleteId, users.id))
      .where(eq(timeSlotRequests.coachId, coachId))
      .orderBy(sql`${timeSlotRequests.createdAt} DESC`);

    return requests;
  }

  async getRequestsByAthlete(athleteId: string): Promise<any[]> {
    const requests = await db
      .select({
        id: timeSlotRequests.id,
        athleteId: timeSlotRequests.athleteId,
        coachId: timeSlotRequests.coachId,
        groupSize: timeSlotRequests.groupSize,
        desiredPosition: timeSlotRequests.desiredPosition,
        note: timeSlotRequests.note,
        status: timeSlotRequests.status,
        createdAt: timeSlotRequests.createdAt,
        updatedAt: timeSlotRequests.updatedAt,
        coachProfile: coachProfiles,
        coachUser: users,
      })
      .from(timeSlotRequests)
      .leftJoin(coachProfiles, eq(timeSlotRequests.coachId, coachProfiles.userId))
      .leftJoin(users, eq(timeSlotRequests.coachId, users.id))
      .where(eq(timeSlotRequests.athleteId, athleteId))
      .orderBy(sql`${timeSlotRequests.createdAt} DESC`);

    return requests;
  }

  async updateRequestStatus(
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ): Promise<TimeSlotRequest> {
    const [updated] = await db
      .update(timeSlotRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(timeSlotRequests.id, id))
      .returning();
    return updated;
  }

  async deleteRequest(id: string): Promise<void> {
    await db.delete(timeSlotRequests).where(eq(timeSlotRequests.id, id));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db
      .insert(reviews)
      .values(review)
      .returning();

    // Update coach rating
    await this.updateCoachRating(review.coachId);

    return created;
  }

  async getReviewsByCoach(coachId: string): Promise<any[]> {
    const reviewList = await db
      .select({
        id: reviews.id,
        athleteId: reviews.athleteId,
        coachId: reviews.coachId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        athleteUser: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.athleteId, users.id))
      .where(eq(reviews.coachId, coachId))
      .orderBy(sql`${reviews.createdAt} DESC`);

    return reviewList;
  }

  async getReviewsByAthlete(athleteId: string): Promise<any[]> {
    const reviewList = await db
      .select({
        id: reviews.id,
        athleteId: reviews.athleteId,
        coachId: reviews.coachId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        coachProfile: coachProfiles,
        coachUser: users,
      })
      .from(reviews)
      .leftJoin(coachProfiles, eq(reviews.coachId, coachProfiles.userId))
      .leftJoin(users, eq(reviews.coachId, users.id))
      .where(eq(reviews.athleteId, athleteId))
      .orderBy(sql`${reviews.createdAt} DESC`);

    return reviewList;
  }

  async getAcceptedCoachesForAthlete(athleteId: string): Promise<CoachProfile[]> {
    const acceptedRequests = await db
      .select({
        coachProfile: coachProfiles,
      })
      .from(timeSlotRequests)
      .innerJoin(coachProfiles, eq(timeSlotRequests.coachId, coachProfiles.userId))
      .where(
        and(
          eq(timeSlotRequests.athleteId, athleteId),
          eq(timeSlotRequests.status, "ACCEPTED")
        )
      );

    return acceptedRequests.map(r => r.coachProfile);
  }

  async updateCoachRating(coachId: string): Promise<void> {
    const reviewList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.coachId, coachId));

    if (reviewList.length === 0) return;

    const totalRating = reviewList.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviewList.length;

    await db
      .update(coachProfiles)
      .set({
        ratingAvg: avgRating,
        ratingCount: reviewList.length,
        updatedAt: new Date(),
      })
      .where(eq(coachProfiles.userId, coachId));
  }

  // Availability operations
  async getAvailabilityRules(coachId: string): Promise<CoachAvailabilityRule[]> {
    const rules = await db
      .select()
      .from(coachAvailabilityRules)
      .where(eq(coachAvailabilityRules.coachId, coachId))
      .orderBy(coachAvailabilityRules.dayOfWeek, coachAvailabilityRules.startTime);
    return rules;
  }

  async upsertAvailabilityRules(
    coachId: string,
    rules: Omit<InsertCoachAvailabilityRule, 'coachId'>[]
  ): Promise<CoachAvailabilityRule[]> {
    // Delete existing rules for this coach
    await db
      .delete(coachAvailabilityRules)
      .where(eq(coachAvailabilityRules.coachId, coachId));

    if (rules.length === 0) return [];

    // Insert new rules
    const newRules = rules.map(rule => ({
      ...rule,
      coachId,
    }));

    const created = await db
      .insert(coachAvailabilityRules)
      .values(newRules)
      .returning();

    return created;
  }

  async deleteAvailabilityRule(id: string, coachId: string): Promise<void> {
    await db
      .delete(coachAvailabilityRules)
      .where(
        and(
          eq(coachAvailabilityRules.id, id),
          eq(coachAvailabilityRules.coachId, coachId)
        )
      );
  }

  async getAvailabilityExceptions(
    coachId: string,
    startDate: string,
    endDate: string
  ): Promise<CoachAvailabilityException[]> {
    const exceptions = await db
      .select()
      .from(coachAvailabilityExceptions)
      .where(
        and(
          eq(coachAvailabilityExceptions.coachId, coachId),
          gte(coachAvailabilityExceptions.date, startDate),
          lte(coachAvailabilityExceptions.date, endDate)
        )
      )
      .orderBy(coachAvailabilityExceptions.date, coachAvailabilityExceptions.startTime);
    return exceptions;
  }

  async createAvailabilityException(
    exception: InsertCoachAvailabilityException
  ): Promise<CoachAvailabilityException> {
    const [created] = await db
      .insert(coachAvailabilityExceptions)
      .values(exception)
      .returning();
    return created;
  }

  async deleteAvailabilityException(id: string, coachId: string): Promise<void> {
    await db
      .delete(coachAvailabilityExceptions)
      .where(
        and(
          eq(coachAvailabilityExceptions.id, id),
          eq(coachAvailabilityExceptions.coachId, coachId)
        )
      );
  }

  // Session operations
  async getBookedSessions(
    coachId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BookedSession[]> {
    const sessions = await db
      .select()
      .from(bookedSessions)
      .where(
        and(
          eq(bookedSessions.coachId, coachId),
          gte(bookedSessions.startAt, startDate),
          lte(bookedSessions.endAt, endDate),
          eq(bookedSessions.status, 'SCHEDULED')
        )
      )
      .orderBy(bookedSessions.startAt);
    return sessions;
  }

  async createBookedSession(session: InsertBookedSession): Promise<BookedSession> {
    const [created] = await db
      .insert(bookedSessions)
      .values(session)
      .returning();
    return created;
  }

  // Coach Schedule Template operations
  async getScheduleTemplate(coachId: string): Promise<CoachScheduleTemplate | undefined> {
    const [template] = await db
      .select()
      .from(coachScheduleTemplates)
      .where(eq(coachScheduleTemplates.coachId, coachId));
    return template;
  }

  async createScheduleTemplate(template: InsertCoachScheduleTemplate): Promise<CoachScheduleTemplate> {
    const [created] = await db
      .insert(coachScheduleTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateScheduleTemplate(
    coachId: string,
    template: Partial<InsertCoachScheduleTemplate>
  ): Promise<CoachScheduleTemplate> {
    const [updated] = await db
      .update(coachScheduleTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(coachScheduleTemplates.coachId, coachId))
      .returning();
    return updated;
  }

  async deleteScheduleTemplate(coachId: string): Promise<void> {
    await db
      .delete(coachScheduleTemplates)
      .where(eq(coachScheduleTemplates.coachId, coachId));
  }

  // Schedule Template Items operations
  async getScheduleTemplateItems(templateId: string): Promise<CoachScheduleTemplateItem[]> {
    const items = await db
      .select()
      .from(coachScheduleTemplateItems)
      .where(eq(coachScheduleTemplateItems.templateId, templateId))
      .orderBy(coachScheduleTemplateItems.dayOfWeek, coachScheduleTemplateItems.sortOrder, coachScheduleTemplateItems.startTime);
    return items;
  }

  async createScheduleTemplateItem(item: InsertCoachScheduleTemplateItem): Promise<CoachScheduleTemplateItem> {
    const [created] = await db
      .insert(coachScheduleTemplateItems)
      .values(item)
      .returning();
    return created;
  }

  async updateScheduleTemplateItem(
    id: string,
    templateId: string,
    item: Partial<InsertCoachScheduleTemplateItem>
  ): Promise<CoachScheduleTemplateItem> {
    const [updated] = await db
      .update(coachScheduleTemplateItems)
      .set({ ...item, updatedAt: new Date() })
      .where(
        and(
          eq(coachScheduleTemplateItems.id, id),
          eq(coachScheduleTemplateItems.templateId, templateId)
        )
      )
      .returning();
    return updated;
  }

  async deleteScheduleTemplateItem(id: string, templateId: string): Promise<void> {
    await db
      .delete(coachScheduleTemplateItems)
      .where(
        and(
          eq(coachScheduleTemplateItems.id, id),
          eq(coachScheduleTemplateItems.templateId, templateId)
        )
      );
  }

  async copyDayItems(templateId: string, fromDay: number, toDay: number): Promise<CoachScheduleTemplateItem[]> {
    const sourceItems = await db
      .select()
      .from(coachScheduleTemplateItems)
      .where(
        and(
          eq(coachScheduleTemplateItems.templateId, templateId),
          eq(coachScheduleTemplateItems.dayOfWeek, fromDay)
        )
      );

    if (sourceItems.length === 0) {
      return [];
    }

    await db
      .delete(coachScheduleTemplateItems)
      .where(
        and(
          eq(coachScheduleTemplateItems.templateId, templateId),
          eq(coachScheduleTemplateItems.dayOfWeek, toDay)
        )
      );

    const newItems = sourceItems.map(item => ({
      templateId: item.templateId,
      dayOfWeek: toDay,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      location: item.location,
      trainingType: item.trainingType,
      groupSize: item.groupSize,
      notes: item.notes,
      sortOrder: item.sortOrder,
    }));

    const created = await db
      .insert(coachScheduleTemplateItems)
      .values(newItems)
      .returning();
    return created;
  }

  // Training Session Request operations
  async createTrainingSessionRequest(request: CreateTrainingSessionRequest): Promise<TrainingSessionRequest> {
    const [created] = await db
      .insert(trainingSessionRequests)
      .values(request)
      .returning();
    return created;
  }

  async getTrainingSessionRequestsByCoach(coachId: string): Promise<TrainingSessionRequest[]> {
    const requests = await db
      .select()
      .from(trainingSessionRequests)
      .where(eq(trainingSessionRequests.coachId, coachId))
      .orderBy(trainingSessionRequests.createdAt);
    return requests;
  }

  async getTrainingSessionRequestsByAthlete(athleteId: string): Promise<TrainingSessionRequest[]> {
    const requests = await db
      .select()
      .from(trainingSessionRequests)
      .where(eq(trainingSessionRequests.athleteId, athleteId))
      .orderBy(trainingSessionRequests.createdAt);
    return requests;
  }

  async updateTrainingSessionRequestStatus(
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ): Promise<TrainingSessionRequest> {
    const [updated] = await db
      .update(trainingSessionRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(trainingSessionRequests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
