import type { Express } from 'express';
import express from 'express';
import { createServer } from 'http';
import { setupAuth } from '../replitAuth';
import emailAuthRouter from '../emailAuth';
import { getSupabaseConfig } from '../lib/supabase';
import { seedDemoCoaches } from '../demoSeed';
import { authRateLimit, apiRateLimit } from '../middleware/rateLimiter';
import { errorHandler } from '../middleware/errorHandler';

import { authRouter } from './auth';
import { profilesRouter } from './profiles';
import { coachesRouter, athletesRouter } from './coaches';
import { connectionsRouter } from './connections';
import { requestsRouter } from './requests';
import { reviewsRouter } from './reviews';
import { availabilityRouter } from './availability';
import { sessionsRouter } from './sessions';
import { scheduleRouter } from './schedule';
import { trainingRouter } from './training';
import { paymentsRouter } from './payments';

export async function registerRoutes(app: Express) {
  // Auto-seed demo data on every startup in development
  if (process.env.NODE_ENV === 'development') {
    seedDemoCoaches().catch((e) => console.warn('Demo seed failed (non-fatal):', e.message));
  }

  // General rate limiting on all API routes
  app.use('/api', apiRateLimit);

  // Stricter rate limiting on auth mutation endpoints
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/signup', authRateLimit);
  app.use('/api/auth/forgot-password', authRateLimit);

  // Public Supabase config
  app.get('/api/config/supabase', (_req, res) => {
    try {
      res.json(getSupabaseConfig());
    } catch (error) {
      res.status(500).json({ message: 'Failed to get Supabase configuration' });
    }
  });

  // Session-based auth setup (Replit OIDC + session middleware)
  await setupAuth(app);

  // Email auth (signup, login, verify, password reset)
  app.use('/api/auth', emailAuthRouter);

  // Domain routers
  app.use('/api/auth', authRouter);
  app.use('/api/profiles', profilesRouter);

  // Avatar upload is now at /api/profiles/avatar (kept as-is in profilesRouter)
  // Legacy alias: /api/upload/avatar → /api/profiles/avatar
  app.use('/api/upload', profilesRouter);

  app.use('/api/coaches', coachesRouter);
  app.use('/api/athletes', athletesRouter);
  app.use('/api/connections', connectionsRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/availability', availabilityRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/schedule-templates', scheduleRouter);
  app.use('/api/training-requests', trainingRouter);
  // Stripe webhook needs raw body — register BEFORE express.json() parses it
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    // Re-export to paymentsRouter
    next();
  });
  app.use('/api/payments', paymentsRouter);

  // Dev-only admin routes (not auto-seeded on startup — run manually)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/admin/seed-demo', async (_req, res) => {
      try {
        const result = await seedDemoCoaches();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Failed to seed demo data' });
      }
    });
  }

  // Global error handler (must be last)
  app.use(errorHandler);

  return createServer(app);
}
