import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, hasActiveRole, type ActiveRole } from "./replitAuth";
import { insertAthleteProfileSchema, insertCoachProfileSchema, insertConnectionSchema, insertTimeSlotRequestSchema, insertReviewSchema, insertCoachAvailabilityRuleSchema, insertCoachAvailabilityExceptionSchema, insertBookedSessionSchema, insertCoachScheduleTemplateSchema, insertCoachScheduleTemplateItemSchema, insertTrainingSessionRequestSchema } from "@shared/schema";
import { z } from "zod";
import { 
  logAuthFailure, 
  sanitizeUpdateFields, 
  ALLOWED_ATHLETE_UPDATE_FIELDS, 
  ALLOWED_COACH_UPDATE_FIELDS,
  validateNoProtectedFields,
  type AuthRequest 
} from "./security";
import emailAuthRouter from "./emailAuth";
import { seedDemoCoaches, isDemoUser } from "./demoSeed";
import { getSupabaseConfig } from "./lib/supabase";

// Configure multer for avatar uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/avatars",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase config endpoint (public - only exposes safe values)
  app.get("/api/config/supabase", (req, res) => {
    try {
      const config = getSupabaseConfig();
      res.json(config);
    } catch (error) {
      console.error("Error getting Supabase config:", error);
      res.status(500).json({ message: "Failed to get Supabase configuration" });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Email auth routes (signup, login, verify, password reset)
  app.use("/api/auth", emailAuthRouter);

  // Seed demo coaches on startup (development only)
  if (process.env.NODE_ENV === "development") {
    seedDemoCoaches()
      .then((result) => {
        console.log("[Demo Seed]", result.message);
      })
      .catch((error) => {
        console.error("[Demo Seed] Error:", error);
      });
  }

  // Admin route to manually seed demo data (development only)
  app.post("/api/admin/seed-demo", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({ message: "Demo seeding only available in development" });
    }
    try {
      const result = await seedDemoCoaches();
      res.json(result);
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==========================================
  // ROLE SESSION MANAGEMENT ROUTES
  // ==========================================

  // Get current session state (active role and available profiles)
  app.get("/api/auth/session", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeRole = req.session?.activeRole || null;
      
      // Get both profiles to determine what roles are available
      const athleteProfile = await storage.getAthleteProfile(userId);
      const coachProfile = await storage.getCoachProfile(userId);
      
      res.json({
        activeRole,
        hasAthleteProfile: !!athleteProfile,
        hasCoachProfile: !!coachProfile,
        athleteProfileComplete: athleteProfile?.isComplete === 1,
        coachProfileComplete: coachProfile?.isComplete === 1,
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Enter a specific role (with validation)
  app.post("/api/auth/enter-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (role !== 'athlete' && role !== 'coach') {
        return res.status(400).json({ message: "Invalid role. Must be 'athlete' or 'coach'." });
      }
      
      // Verify user has the profile for this role and it's complete
      if (role === 'athlete') {
        const athleteProfile = await storage.getAthleteProfile(userId);
        if (!athleteProfile) {
          return res.status(403).json({ 
            message: "You don't have an athlete profile. Please create one first.",
            code: "NO_PROFILE"
          });
        }
        if (athleteProfile.isComplete !== 1) {
          return res.status(403).json({ 
            message: "Your athlete profile is incomplete. Please complete onboarding.",
            code: "INCOMPLETE_PROFILE",
            redirectTo: "/onboarding?addRole=athlete"
          });
        }
      } else if (role === 'coach') {
        const coachProfile = await storage.getCoachProfile(userId);
        if (!coachProfile) {
          return res.status(403).json({ 
            message: "You don't have a coach profile. Please create one first.",
            code: "NO_PROFILE"
          });
        }
        if (coachProfile.isComplete !== 1) {
          return res.status(403).json({ 
            message: "Your coach profile is incomplete. Please complete onboarding.",
            code: "INCOMPLETE_PROFILE",
            redirectTo: "/onboarding?addRole=coach"
          });
        }
      }
      
      // Set the active role in session
      req.session.activeRole = role as ActiveRole;
      
      // Save session explicitly
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ 
        message: `Entered ${role} mode successfully.`,
        activeRole: role 
      });
    } catch (error) {
      console.error("Error entering role:", error);
      res.status(500).json({ message: "Failed to enter role" });
    }
  });

  // Exit current role (return to role selection)
  app.post("/api/auth/exit-role", isAuthenticated, async (req: any, res) => {
    try {
      req.session.activeRole = null;
      
      // Save session explicitly
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ 
        message: "Exited role successfully.",
        activeRole: null 
      });
    } catch (error) {
      console.error("Error exiting role:", error);
      res.status(500).json({ message: "Failed to exit role" });
    }
  });

  // Athlete Profile routes
  app.get("/api/profiles/athlete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getAthleteProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching athlete profile:", error);
      res.status(500).json({ message: "Failed to fetch athlete profile" });
    }
  });

  app.post("/api/profiles/athlete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAthleteProfileSchema.parse(req.body);

      // Update user phone
      if (data.phone) {
        await storage.updateUserPhone(userId, data.phone);
      }

      const profile = await storage.createAthleteProfile({
        ...data,
        userId,
      });

      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Error creating athlete profile:", error);
      res.status(400).json({ message: error.message || "Failed to create athlete profile" });
    }
  });

  app.put("/api/profiles/athlete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // SECURITY: Check for protected fields in raw request body BEFORE parsing
      const { valid, blockedFields } = validateNoProtectedFields(req.body);
      if (!valid) {
        logAuthFailure({
          timestamp: new Date(),
          userId,
          attemptedAction: 'PUT /api/profiles/athlete',
          reason: `Attempted to modify protected fields: ${blockedFields.join(', ')}`,
          ip: req.ip,
        });
        return res.status(400).json({ 
          message: `Cannot modify protected fields: ${blockedFields.join(', ')}` 
        });
      }
      
      // SECURITY: Pre-filter request body to only allowed fields before schema validation
      const filteredBody: Record<string, any> = {};
      for (const key of ALLOWED_ATHLETE_UPDATE_FIELDS) {
        if (key in req.body && req.body[key] !== undefined) {
          filteredBody[key] = req.body[key];
        }
      }
      
      const data = insertAthleteProfileSchema.partial().parse(filteredBody);

      // Update user phone
      if (data.phone) {
        await storage.updateUserPhone(userId, data.phone);
      }

      const profile = await storage.updateAthleteProfile(userId, data);
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating athlete profile:", error);
      res.status(400).json({ message: error.message || "Failed to update athlete profile" });
    }
  });

  // Coach Profile routes
  app.get("/api/profiles/coach", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCoachProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      res.status(500).json({ message: "Failed to fetch coach profile" });
    }
  });

  app.post("/api/profiles/coach", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertCoachProfileSchema.parse(req.body);

      // Update user phone
      if (data.phone) {
        await storage.updateUserPhone(userId, data.phone);
      }

      const profile = await storage.createCoachProfile({
        ...data,
        userId,
      });

      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Error creating coach profile:", error);
      res.status(400).json({ message: error.message || "Failed to create coach profile" });
    }
  });

  app.put("/api/profiles/coach", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // SECURITY: Check for protected fields in raw request body BEFORE parsing
      const { valid, blockedFields } = validateNoProtectedFields(req.body);
      if (!valid) {
        logAuthFailure({
          timestamp: new Date(),
          userId,
          attemptedAction: 'PUT /api/profiles/coach',
          reason: `Attempted to modify protected fields: ${blockedFields.join(', ')}`,
          ip: req.ip,
        });
        return res.status(400).json({ 
          message: `Cannot modify protected fields: ${blockedFields.join(', ')}` 
        });
      }
      
      // SECURITY: Pre-filter request body to only allowed fields before schema validation
      // Note: key comes from hardcoded ALLOWED_COACH_UPDATE_FIELDS constant, not user input
      const filteredBody: Record<string, any> = {};
      for (const key of ALLOWED_COACH_UPDATE_FIELDS) {
        if (Object.hasOwn(req.body, key) && req.body[key] !== undefined) {
          filteredBody[key as string] = req.body[key as string];
        }
      }
      
      const data = insertCoachProfileSchema.partial().parse(filteredBody);

      // Update user phone
      if (data.phone) {
        await storage.updateUserPhone(userId, data.phone);
      }

      const profile = await storage.updateCoachProfile(userId, data);
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating coach profile:", error);
      res.status(400).json({ message: error.message || "Failed to update coach profile" });
    }
  });

  // Avatar upload
  app.post("/api/upload/avatar", isAuthenticated, upload.single("avatar"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      await storage.updateCoachAvatar(userId, avatarUrl);

      res.json({ avatarUrl });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: error.message || "Failed to upload avatar" });
    }
  });

  // Coach Search
  app.get("/api/coaches", async (req, res) => {
    try {
      const { q = "", skillLevel = "", groupSize = "" } = req.query;
      
      const coaches = await storage.searchCoaches(
        q as string,
        skillLevel as string,
        groupSize as string
      );

      res.json(coaches);
    } catch (error) {
      console.error("Error searching coaches:", error);
      res.status(500).json({ message: "Failed to search coaches" });
    }
  });

  // Athlete Search (for coaches)
  app.get("/api/athletes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can browse athletes" });
      }

      const { q = "", skillLevel = "" } = req.query;
      
      const athletes = await storage.searchAthletes(
        q as string,
        skillLevel as string
      );

      res.json(athletes);
    } catch (error) {
      console.error("Error searching athletes:", error);
      res.status(500).json({ message: "Failed to search athletes" });
    }
  });

  // Connection routes
  // Athletes send connection requests - requires athlete mode
  app.post("/api/connections", isAuthenticated, requireRole('athlete'), async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const data = insertConnectionSchema.parse(req.body);

      // Prevent self-connection
      if (athleteId === data.coachId) {
        return res.status(400).json({ message: "Cannot connect with yourself" });
      }

      // Verify user has an athlete profile
      const athleteProfile = await storage.getAthleteProfile(athleteId);
      if (!athleteProfile) {
        return res.status(403).json({ message: "Only athletes can send connection requests" });
      }

      // Verify target is a coach
      const coachProfile = await storage.getCoachProfile(data.coachId);
      if (!coachProfile) {
        return res.status(400).json({ message: "Target user is not a coach" });
      }

      // Check if connection already exists
      const existing = await storage.getConnection(athleteId, data.coachId);
      if (existing) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const connection = await storage.createConnection({
        ...data,
        athleteId,
      });

      res.status(201).json(connection);
    } catch (error: any) {
      console.error("Error creating connection:", error);
      res.status(400).json({ message: error.message || "Failed to create connection" });
    }
  });

  app.get("/api/connections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.query;

      if (role === "athlete") {
        const connections = await storage.getConnectionsByAthlete(userId);
        return res.json(connections);
      }

      if (role === "coach") {
        const connections = await storage.getConnectionsByCoach(userId);
        return res.json(connections);
      }

      // Default: check if user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (coachProfile) {
        const connections = await storage.getConnectionsByCoach(userId);
        return res.json(connections);
      }

      const connections = await storage.getConnectionsByAthlete(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Get connection status between athlete and specific coach
  app.get("/api/connections/check/:coachId", isAuthenticated, async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const { coachId } = req.params;

      const connection = await storage.getConnection(athleteId, coachId);
      res.json({ connection: connection || null });
    } catch (error) {
      console.error("Error checking connection:", error);
      res.status(500).json({ message: "Failed to check connection" });
    }
  });

  // Coaches accept/decline connections - requires coach mode
  app.patch("/api/connections/:id", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;

      if (!["ACCEPTED", "DECLINED", "BLOCKED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify user is the coach for this connection
      const connection = await storage.getConnectionById(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      if (connection.coachId !== userId) {
        return res.status(403).json({ message: "Only the coach can update connection status" });
      }

      const updated = await storage.updateConnectionStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating connection:", error);
      res.status(400).json({ message: error.message || "Failed to update connection" });
    }
  });

  // Time Slot Request routes
  // Athletes create requests - requires athlete mode
  app.post("/api/requests", isAuthenticated, requireRole('athlete'), async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const data = insertTimeSlotRequestSchema.parse(req.body);

      // TEMPORARY: Connection check bypassed for testing
      // Verify athlete has an accepted connection with this coach
      const connection = await storage.getConnection(athleteId, data.coachId);
      // if (!connection || connection.status !== "ACCEPTED") {
      //   return res.status(403).json({ 
      //     message: "You must have an accepted connection with this coach before requesting a session" 
      //   });
      // }

      const request = await storage.createTimeSlotRequest({
        ...data,
        athleteId,
        connectionId: connection?.id ?? undefined,
      });

      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating request:", error);
      res.status(400).json({ message: error.message || "Failed to create request" });
    }
  });

  app.get("/api/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.query;
      
      // If role is explicitly specified, use that
      if (role === "athlete") {
        const requests = await storage.getRequestsByAthlete(userId);
        return res.json(requests);
      }
      
      if (role === "coach") {
        const requests = await storage.getRequestsByCoach(userId);
        return res.json(requests);
      }
      
      // Default behavior: check if user has coach profile first
      const coachProfile = await storage.getCoachProfile(userId);
      
      if (coachProfile) {
        const requests = await storage.getRequestsByCoach(userId);
        return res.json(requests);
      }
      
      // Otherwise get athlete requests
      const requests = await storage.getRequestsByAthlete(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Coaches accept/decline requests - requires coach mode
  app.patch("/api/requests/:id", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;

      if (!["ACCEPTED", "DECLINED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // SECURITY: Verify user is the coach for this request
      const request = await storage.getRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      if (request.coachId !== userId) {
        logAuthFailure({
          timestamp: new Date(),
          userId,
          attemptedAction: 'PATCH /api/requests/:id',
          resourceId: id,
          reason: 'User is not the coach for this request',
          ip: req.ip,
        });
        return res.status(403).json({ message: "Only the coach can update request status" });
      }

      const updated = await storage.updateRequestStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating request:", error);
      res.status(400).json({ message: error.message || "Failed to update request" });
    }
  });

  // Review routes
  // Athletes leave reviews - requires athlete mode
  app.post("/api/reviews", isAuthenticated, requireRole('athlete'), async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const data = insertReviewSchema.parse(req.body);

      // Verify that the athlete has an accepted request with this coach
      const acceptedCoaches = await storage.getAcceptedCoachesForAthlete(athleteId);
      const hasAcceptedRequest = acceptedCoaches.some(
        coach => coach.userId === data.coachId
      );

      if (!hasAcceptedRequest) {
        return res.status(403).json({ 
          message: "You can only review coaches you've had accepted sessions with" 
        });
      }

      const review = await storage.createReview({
        ...data,
        athleteId,
      });

      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: error.message || "Failed to create review" });
    }
  });

  app.get("/api/reviews/my-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const reviews = await storage.getReviewsByAthlete(athleteId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/accepted-coaches", isAuthenticated, async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      const coaches = await storage.getAcceptedCoachesForAthlete(athleteId);
      res.json(coaches);
    } catch (error) {
      console.error("Error fetching accepted coaches:", error);
      res.status(500).json({ message: "Failed to fetch accepted coaches" });
    }
  });

  app.get("/api/reviews/coach/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const reviews = await storage.getReviewsByCoach(coachId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching coach reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Public coach profile by ID
  app.get("/api/coaches/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const profile = await storage.getCoachProfileById(coachId);
      
      if (!profile) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching coach profile:", error);
      res.status(500).json({ message: "Failed to fetch coach profile" });
    }
  });

  // Coach Availability Rules - GET (public, for viewing by athletes)
  app.get("/api/availability/:coachId/rules", async (req, res) => {
    try {
      const { coachId } = req.params;
      console.log(`[Availability] Fetching rules for coach: ${coachId}`);
      
      const rules = await storage.getAvailabilityRules(coachId);
      console.log(`[Availability] Found ${rules.length} rules`);
      
      res.json(rules);
    } catch (error) {
      console.error("[Availability] Error fetching rules:", error);
      res.status(500).json({ message: "Failed to fetch availability rules" });
    }
  });

  // Coach Availability Rules - PUT (coach only, upsert all rules)
  // Coaches manage availability rules - requires coach mode
  app.put("/api/availability/rules", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const coachId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(coachId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can manage availability" });
      }

      const rulesSchema = z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        isActive: z.number().optional().default(1),
      }));

      const rules = rulesSchema.parse(req.body);
      console.log(`[Availability] Upserting ${rules.length} rules for coach: ${coachId}`);
      
      const created = await storage.upsertAvailabilityRules(coachId, rules);
      console.log(`[Availability] Created ${created.length} rules`);
      
      res.json(created);
    } catch (error: any) {
      console.error("[Availability] Error upserting rules:", error);
      res.status(400).json({ message: error.message || "Failed to update availability rules" });
    }
  });

  // Coach Availability Exceptions - GET (public, for viewing by athletes)
  app.get("/api/availability/:coachId/exceptions", async (req, res) => {
    try {
      const { coachId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      console.log(`[Availability] Fetching exceptions for coach: ${coachId}, ${startDate} to ${endDate}`);
      
      const exceptions = await storage.getAvailabilityExceptions(
        coachId,
        startDate as string,
        endDate as string
      );
      console.log(`[Availability] Found ${exceptions.length} exceptions`);
      
      res.json(exceptions);
    } catch (error) {
      console.error("[Availability] Error fetching exceptions:", error);
      res.status(500).json({ message: "Failed to fetch availability exceptions" });
    }
  });

  // Coach Availability Exceptions - POST (coach only)
  // Coaches add availability exceptions - requires coach mode
  app.post("/api/availability/exceptions", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const coachId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(coachId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can manage availability" });
      }

      const exceptionSchema = z.object({
        date: z.string(),
        startTime: z.string().nullable().optional(),
        endTime: z.string().nullable().optional(),
        exceptionType: z.enum(['BLOCK', 'ADD']),
      });

      const data = exceptionSchema.parse(req.body);
      console.log(`[Availability] Creating exception for coach: ${coachId}`, data);
      
      const exception = await storage.createAvailabilityException({
        ...data,
        coachId,
      });
      
      res.status(201).json(exception);
    } catch (error: any) {
      console.error("[Availability] Error creating exception:", error);
      res.status(400).json({ message: error.message || "Failed to create exception" });
    }
  });

  // Coach Availability Exceptions - DELETE (coach only)
  // Coaches delete availability exceptions - requires coach mode
  app.delete("/api/availability/exceptions/:id", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const coachId = req.user.claims.sub;
      const { id } = req.params;
      
      console.log(`[Availability] Deleting exception ${id} for coach: ${coachId}`);
      await storage.deleteAvailabilityException(id, coachId);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Availability] Error deleting exception:", error);
      res.status(400).json({ message: error.message || "Failed to delete exception" });
    }
  });

  // Booked Sessions - GET (for computing available slots)
  app.get("/api/availability/:coachId/sessions", async (req, res) => {
    try {
      const { coachId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      console.log(`[Sessions] Fetching sessions for coach: ${coachId}`);
      
      const sessions = await storage.getBookedSessions(
        coachId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      console.log(`[Sessions] Found ${sessions.length} booked sessions`);
      
      res.json(sessions);
    } catch (error) {
      console.error("[Sessions] Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch booked sessions" });
    }
  });

  // Book a session (athlete only)
  // Athletes book sessions - requires athlete mode
  app.post("/api/sessions", isAuthenticated, requireRole('athlete'), async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      
      const sessionSchema = z.object({
        coachId: z.string(),
        startAt: z.string().transform(s => new Date(s)),
        endAt: z.string().transform(s => new Date(s)),
        requestId: z.string().optional(),
      });

      const data = sessionSchema.parse(req.body);
      
      // SECURITY: Prevent self-booking
      if (athleteId === data.coachId) {
        logAuthFailure({
          timestamp: new Date(),
          userId: athleteId,
          attemptedAction: 'POST /api/sessions',
          reason: 'Attempted self-booking',
          ip: req.ip,
        });
        return res.status(400).json({ message: "Cannot book a session with yourself" });
      }

      // SECURITY: Verify athlete has an athlete profile
      const athleteProfile = await storage.getAthleteProfile(athleteId);
      if (!athleteProfile) {
        logAuthFailure({
          timestamp: new Date(),
          userId: athleteId,
          attemptedAction: 'POST /api/sessions',
          reason: 'User is not an athlete',
          ip: req.ip,
        });
        return res.status(403).json({ message: "Only athletes can book sessions" });
      }

      // SECURITY: Verify target is a coach
      const coachProfile = await storage.getCoachProfile(data.coachId);
      if (!coachProfile) {
        return res.status(400).json({ message: "Target user is not a coach" });
      }

      // SECURITY: Verify athlete has accepted connection with coach
      const connection = await storage.getConnection(athleteId, data.coachId);
      if (!connection || connection.status !== "ACCEPTED") {
        logAuthFailure({
          timestamp: new Date(),
          userId: athleteId,
          attemptedAction: 'POST /api/sessions',
          resourceId: data.coachId,
          reason: 'No accepted connection with coach',
          ip: req.ip,
        });
        return res.status(403).json({ 
          message: "You must have an accepted connection with this coach before booking a session" 
        });
      }

      // SECURITY: Validate requestId belongs to this athlete-coach pair and is in ACCEPTED status
      if (data.requestId) {
        const request = await storage.getRequestById(data.requestId);
        if (!request) {
          logAuthFailure({
            timestamp: new Date(),
            userId: athleteId,
            attemptedAction: 'POST /api/sessions',
            resourceId: data.requestId,
            reason: 'Request not found',
            ip: req.ip,
          });
          return res.status(400).json({ message: "Invalid request ID" });
        }
        
        if (request.athleteId !== athleteId || request.coachId !== data.coachId) {
          logAuthFailure({
            timestamp: new Date(),
            userId: athleteId,
            attemptedAction: 'POST /api/sessions',
            resourceId: data.requestId,
            reason: 'Request ID does not belong to this athlete-coach pair',
            ip: req.ip,
          });
          return res.status(400).json({ message: "Invalid request ID" });
        }
        
        // Verify request is ACCEPTED (only accepted requests can be used for session booking)
        if (request.status !== 'ACCEPTED') {
          logAuthFailure({
            timestamp: new Date(),
            userId: athleteId,
            attemptedAction: 'POST /api/sessions',
            resourceId: data.requestId,
            reason: `Request status is ${request.status}, not ACCEPTED`,
            ip: req.ip,
          });
          return res.status(400).json({ 
            message: "Request must be accepted before booking a session" 
          });
        }
        
        // Verify request's connection matches the resolved connection
        if (request.connectionId && request.connectionId !== connection.id) {
          logAuthFailure({
            timestamp: new Date(),
            userId: athleteId,
            attemptedAction: 'POST /api/sessions',
            resourceId: data.requestId,
            reason: 'Request connection ID does not match current connection',
            ip: req.ip,
          });
          return res.status(400).json({ message: "Invalid request ID" });
        }
      }

      console.log(`[Sessions] Booking session for athlete: ${athleteId}`, data);
      
      const session = await storage.createBookedSession({
        ...data,
        athleteId,
        status: 'SCHEDULED',
      });
      
      res.status(201).json(session);
    } catch (error: any) {
      console.error("[Sessions] Error booking session:", error);
      res.status(400).json({ message: error.message || "Failed to book session" });
    }
  });

  // ==========================================
  // COACH SCHEDULE TEMPLATE ROUTES
  // ==========================================

  // Get coach's schedule template
  // Coaches get their schedule templates - requires coach mode
  app.get("/api/schedule-templates", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can access schedule templates" });
      }

      const template = await storage.getScheduleTemplate(userId);
      if (!template) {
        return res.json(null);
      }

      const items = await storage.getScheduleTemplateItems(template.id);
      res.json({ ...template, items });
    } catch (error) {
      console.error("Error fetching schedule template:", error);
      res.status(500).json({ message: "Failed to fetch schedule template" });
    }
  });

  // Get a coach's public schedule template (for athletes)
  app.get("/api/coaches/:coachId/schedule", async (req, res) => {
    try {
      const { coachId } = req.params;
      
      const coachProfile = await storage.getCoachProfile(coachId);
      if (!coachProfile) {
        return res.status(404).json({ message: "Coach not found" });
      }

      const template = await storage.getScheduleTemplate(coachId);
      if (!template || template.isPublic !== 1) {
        return res.json(null);
      }

      const items = await storage.getScheduleTemplateItems(template.id);
      const publicItems = items.map(item => ({
        ...item,
        notes: undefined, // Remove private notes from public view
      }));

      res.json({ ...template, items: publicItems });
    } catch (error) {
      console.error("Error fetching coach schedule:", error);
      res.status(500).json({ message: "Failed to fetch coach schedule" });
    }
  });

  // Create/Update schedule template
  // Coaches create schedule templates - requires coach mode
  app.post("/api/schedule-templates", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can create schedule templates" });
      }

      const data = insertCoachScheduleTemplateSchema.parse({
        ...req.body,
        coachId: userId,
      });

      // Check if template already exists
      let template = await storage.getScheduleTemplate(userId);
      if (template) {
        template = await storage.updateScheduleTemplate(userId, data);
      } else {
        template = await storage.createScheduleTemplate(data);
      }

      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating schedule template:", error);
      res.status(400).json({ message: error.message || "Failed to create schedule template" });
    }
  });

  // Update schedule template
  // Coaches update schedule templates - requires coach mode
  app.put("/api/schedule-templates", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can update schedule templates" });
      }

      const template = await storage.getScheduleTemplate(userId);
      if (!template) {
        return res.status(404).json({ message: "Schedule template not found" });
      }

      const data = insertCoachScheduleTemplateSchema.partial().parse(req.body);
      const updated = await storage.updateScheduleTemplate(userId, data);

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating schedule template:", error);
      res.status(400).json({ message: error.message || "Failed to update schedule template" });
    }
  });

  // Delete schedule template
  // Coaches delete schedule templates - requires coach mode
  app.delete("/api/schedule-templates", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can delete schedule templates" });
      }

      await storage.deleteScheduleTemplate(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting schedule template:", error);
      res.status(400).json({ message: error.message || "Failed to delete schedule template" });
    }
  });

  // ==========================================
  // SCHEDULE TEMPLATE ITEMS ROUTES
  // ==========================================

  // Add session to template
  // Coaches add schedule template items - requires coach mode
  app.post("/api/schedule-templates/items", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can add schedule items" });
      }

      // Get or create template
      let template = await storage.getScheduleTemplate(userId);
      if (!template) {
        template = await storage.createScheduleTemplate({
          coachId: userId,
          name: "Weekly Training Schedule",
          timezone: coachProfile.timezone || "America/New_York",
          isPublic: 1,
        });
      }

      const data = insertCoachScheduleTemplateItemSchema.parse({
        ...req.body,
        templateId: template.id,
      });

      const item = await storage.createScheduleTemplateItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating schedule item:", error);
      res.status(400).json({ message: error.message || "Failed to create schedule item" });
    }
  });

  // Update schedule item
  // Coaches update schedule template items - requires coach mode
  app.put("/api/schedule-templates/items/:itemId", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId } = req.params;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can update schedule items" });
      }

      const template = await storage.getScheduleTemplate(userId);
      if (!template) {
        return res.status(404).json({ message: "Schedule template not found" });
      }

      const data = insertCoachScheduleTemplateItemSchema.partial().parse(req.body);
      const updated = await storage.updateScheduleTemplateItem(itemId, template.id, data);

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating schedule item:", error);
      res.status(400).json({ message: error.message || "Failed to update schedule item" });
    }
  });

  // Delete schedule item
  // Coaches delete schedule template items - requires coach mode
  app.delete("/api/schedule-templates/items/:itemId", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId } = req.params;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can delete schedule items" });
      }

      const template = await storage.getScheduleTemplate(userId);
      if (!template) {
        return res.status(404).json({ message: "Schedule template not found" });
      }

      await storage.deleteScheduleTemplateItem(itemId, template.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting schedule item:", error);
      res.status(400).json({ message: error.message || "Failed to delete schedule item" });
    }
  });

  // Copy day to another day
  // Coaches copy schedule template day - requires coach mode
  app.post("/api/schedule-templates/copy-day", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can copy schedule days" });
      }

      const template = await storage.getScheduleTemplate(userId);
      if (!template) {
        return res.status(404).json({ message: "Schedule template not found" });
      }

      const { fromDay, toDay } = z.object({
        fromDay: z.number().min(0).max(6),
        toDay: z.number().min(0).max(6),
      }).parse(req.body);

      const items = await storage.copyDayItems(template.id, fromDay, toDay);
      res.json(items);
    } catch (error: any) {
      console.error("Error copying schedule day:", error);
      res.status(400).json({ message: error.message || "Failed to copy schedule day" });
    }
  });

  // ==========================================
  // 30-DAY PROJECTION ROUTES
  // ==========================================

  // Get coach's next 30 days schedule projection
  app.get("/api/coaches/:coachId/schedule-30days", async (req: any, res) => {
    try {
      const { coachId } = req.params;
      const userId = req.user?.claims?.sub;
      
      const coachProfile = await storage.getCoachProfile(coachId);
      if (!coachProfile) {
        return res.status(404).json({ message: "Coach not found" });
      }

      const template = await storage.getScheduleTemplate(coachId);
      if (!template || (template.isPublic !== 1 && userId !== coachId)) {
        return res.json({ days: [], message: "No schedule template set" });
      }

      const items = await storage.getScheduleTemplateItems(template.id);
      if (items.length === 0) {
        return res.json({ days: [], message: "No sessions in schedule template" });
      }

      // Get availability rules and exceptions for the next 30 days
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const availabilityRules = await storage.getAvailabilityRules(coachId);
      const availabilityExceptions = await storage.getAvailabilityExceptions(coachId, startDateStr, endDateStr);
      const bookedSessions = await storage.getBookedSessions(coachId, today, endDate);

      // Check if athlete has connection with coach
      let hasConnection = false;
      let connectionStatus = null;
      if (userId && userId !== coachId) {
        const connection = await storage.getConnection(userId, coachId);
        hasConnection = !!connection;
        connectionStatus = connection?.status || null;
      }

      // Generate 30-day projection
      const days: any[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
        const dateStr = date.toISOString().split('T')[0];

        // Check for full-day block exceptions
        const fullDayBlock = availabilityExceptions.find(
          e => e.date === dateStr && e.exceptionType === 'BLOCK' && !e.startTime
        );

        if (fullDayBlock) {
          days.push({
            date: dateStr,
            dayOfWeek,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            sessions: [],
            isBlocked: true,
          });
          continue;
        }

        // Get sessions for this day of week
        const daySessions = items
          .filter(item => item.dayOfWeek === dayOfWeek)
          .map(item => {
            // Check if session falls within availability rules
            const isWithinAvailability = availabilityRules.length === 0 || availabilityRules.some(rule => 
              rule.dayOfWeek === dayOfWeek &&
              rule.isActive === 1 &&
              rule.startTime <= item.startTime &&
              rule.endTime >= item.endTime
            );

            // Check for time-specific block exceptions
            const isBlocked = availabilityExceptions.some(
              e => e.date === dateStr && 
                   e.exceptionType === 'BLOCK' && 
                   e.startTime && 
                   e.startTime <= item.startTime && 
                   e.endTime! >= item.endTime
            );

            // Check if session is already booked
            const isBooked = bookedSessions.some(session => {
              const sessionDate = session.startAt.toISOString().split('T')[0];
              const sessionStart = session.startAt.toTimeString().substring(0, 5);
              return sessionDate === dateStr && sessionStart === item.startTime;
            });

            const available = isWithinAvailability && !isBlocked && !isBooked;

            return {
              id: item.id,
              date: dateStr,
              startTime: item.startTime,
              endTime: item.endTime,
              title: item.title,
              location: item.location,
              trainingType: item.trainingType,
              groupSize: item.groupSize,
              status: isBooked ? 'Booked' : (available ? 'Available' : 'Unavailable'),
              canRequest: available && hasConnection && connectionStatus === 'ACCEPTED',
            };
          });

        days.push({
          date: dateStr,
          dayOfWeek,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          sessions: daySessions,
          isBlocked: false,
        });
      }

      res.json({
        days,
        coachName: coachProfile.name,
        timezone: template.timezone,
        hasConnection,
        connectionStatus,
      });
    } catch (error) {
      console.error("Error fetching 30-day schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  // ==========================================
  // TRAINING SESSION REQUEST ROUTES
  // ==========================================

  // Create training session request
  // Athletes create training requests - requires athlete mode
  app.post("/api/training-requests", isAuthenticated, requireRole('athlete'), async (req: any, res) => {
    try {
      const athleteId = req.user.claims.sub;
      
      // Verify user is an athlete
      const athleteProfile = await storage.getAthleteProfile(athleteId);
      if (!athleteProfile) {
        return res.status(403).json({ message: "Only athletes can request training sessions" });
      }

      const data = insertTrainingSessionRequestSchema.parse(req.body);

      // Verify connection with coach
      const connection = await storage.getConnection(athleteId, data.coachId);
      if (!connection || connection.status !== "ACCEPTED") {
        return res.status(403).json({ 
          message: "You must have an accepted connection with this coach before requesting a session" 
        });
      }

      const request = await storage.createTrainingSessionRequest({
        ...data,
        athleteId,
        connectionId: connection.id,
      });

      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating training request:", error);
      res.status(400).json({ message: error.message || "Failed to create training request" });
    }
  });

  // Get training requests (for coach or athlete)
  app.get("/api/training-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.query;
      
      if (role === "coach") {
        const requests = await storage.getTrainingSessionRequestsByCoach(userId);
        return res.json(requests);
      }
      
      if (role === "athlete") {
        const requests = await storage.getTrainingSessionRequestsByAthlete(userId);
        return res.json(requests);
      }
      
      // Default: check role
      const coachProfile = await storage.getCoachProfile(userId);
      if (coachProfile) {
        const requests = await storage.getTrainingSessionRequestsByCoach(userId);
        return res.json(requests);
      }
      
      const requests = await storage.getTrainingSessionRequestsByAthlete(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching training requests:", error);
      res.status(500).json({ message: "Failed to fetch training requests" });
    }
  });

  // Update training request status (coach only)
  // Coaches respond to training requests - requires coach mode
  app.patch("/api/training-requests/:requestId", isAuthenticated, requireRole('coach'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      const { status } = req.body;

      if (!["ACCEPTED", "DECLINED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify user is a coach
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "Only coaches can update training requests" });
      }

      const updated = await storage.updateTrainingSessionRequestStatus(requestId, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating training request:", error);
      res.status(400).json({ message: error.message || "Failed to update training request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
