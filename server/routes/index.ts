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

  // Privacy Policy page
  app.get('/privacy', (_req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy – Coach Athlete Connect</title>
    <style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#333;line-height:1.7}h1{color:#26a641}h2{margin-top:32px}</style></head>
    <body>
    <h1>Privacy Policy</h1>
    <p><strong>Last updated: April 2026</strong></p>
    <p>Coach Athlete Connect ("we", "our", or "us") operates the Coach Athlete Connect mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our app.</p>
    <h2>Information We Collect</h2>
    <p>We collect information you provide directly, including your name, email address, profile photo, location, and any other information you choose to provide when creating a profile or booking sessions.</p>
    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to provide, maintain, and improve our services, match athletes with coaches, process bookings, and communicate with you about your account and sessions.</p>
    <h2>Google Sign-In</h2>
    <p>We use Google Sign-In for authentication. When you sign in with Google, we receive your name, email address, and profile photo from Google. We do not receive or store your Google password.</p>
    <h2>Data Sharing</h2>
    <p>We do not sell your personal data. Coach and athlete profile information (name, location, specialties, availability) is visible to other users of the platform as part of the core service.</p>
    <h2>Data Retention</h2>
    <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data by contacting us.</p>
    <h2>Security</h2>
    <p>We implement industry-standard security measures to protect your personal information.</p>
    <h2>Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:fraserpage737@gmail.com">fraserpage737@gmail.com</a></p>
    </body></html>`);
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return createServer(app);
}
