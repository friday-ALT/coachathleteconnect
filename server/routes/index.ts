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
import { messagesRouter } from './messages';
import { notificationsRouter } from './notifications';

export async function registerRoutes(app: Express) {
  // Auto-seed demo data on startup
  seedDemoCoaches().catch((e) => console.warn('Demo seed failed (non-fatal):', e.message));

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
  app.use('/api/conversations', messagesRouter);
  app.use('/api/notifications', notificationsRouter);

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
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Privacy Policy – Coach Athlete Connect</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f9fafb;
      color: #1a1a1a;
      line-height: 1.75;
    }
    header {
      background: #062d14;
      padding: 28px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    header .dot { width: 10px; height: 10px; border-radius: 50%; background: #00e87a; }
    header h1 { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    header span { color: rgba(255,255,255,0.5); font-size: 20px; font-weight: 300; }
    .container { max-width: 740px; margin: 48px auto; padding: 0 24px 80px; }
    .badge {
      display: inline-block;
      background: #e6f9ef;
      color: #15803d;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 28px;
    }
    h2 { font-size: 26px; font-weight: 800; color: #062d14; margin-bottom: 8px; }
    .lead { color: #555; font-size: 15px; margin-bottom: 40px; }
    section { margin-bottom: 36px; }
    section h3 {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #00a84a;
      margin-bottom: 10px;
    }
    section p { font-size: 15px; color: #374151; margin-bottom: 10px; }
    ul { padding-left: 20px; margin-bottom: 10px; }
    ul li { font-size: 15px; color: #374151; margin-bottom: 5px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0 28px; }
    a { color: #00a84a; text-decoration: none; }
    a:hover { text-decoration: underline; }
    footer { text-align: center; font-size: 13px; color: #9ca3af; padding-bottom: 40px; }
  </style>
</head>
<body>
  <header>
    <div class="dot"></div>
    <h1>Coach<span>Athlete</span> Connect</h1>
  </header>

  <div class="container">
    <div class="badge">Last updated: April 22, 2026</div>
    <h2>Privacy Policy</h2>
    <p class="lead">
      Coach Athlete Connect (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) built the Coach Athlete Connect
      mobile app as a commercial service. This page explains what information we collect, why we collect it,
      and how it is used and protected.
    </p>

    <hr class="divider" />

    <section>
      <h3>Information We Collect</h3>
      <p>We collect the following categories of information when you create an account or use the app:</p>
      <ul>
        <li><strong>Identity &amp; Contact:</strong> First name, last name, email address, and phone number.</li>
        <li><strong>Profile Information:</strong> City and state location, skill level (athlete), coaching experience and hourly rate (coach), and profile photo.</li>
        <li><strong>Session &amp; Booking Data:</strong> Requested session dates and times, messages sent with session requests, and reviews/ratings you submit.</li>
        <li><strong>Account Identifiers:</strong> An internal user ID assigned to your account.</li>
        <li><strong>Device Identifiers:</strong> An Expo push notification token associated with your device, used solely to deliver in-app notifications.</li>
        <li><strong>Financial Information:</strong> Coach pricing (hourly rate) and a record of your session purchase history. Payment card details are processed exclusively by Stripe on their secure servers — we never see or store your card number.</li>
      </ul>
    </section>

    <hr class="divider" />

    <section>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To create and manage your account.</li>
        <li>To match athletes with coaches and facilitate session bookings.</li>
        <li>To send push notifications about session requests, confirmations, and updates.</li>
        <li>To display coach profiles (name, location, experience, pricing, photo) to athletes searching for coaches.</li>
        <li>To process payments via Stripe for session bookings.</li>
        <li>To respond to support requests and communicate about your account.</li>
      </ul>
    </section>

    <hr class="divider" />

    <section>
      <h3>Third-Party Services</h3>
      <p>We use the following third-party services which may receive limited data:</p>
      <ul>
        <li><strong>Google Sign-In:</strong> When you sign in with Google we receive your name, email, and profile photo. We do not receive or store your Google password.</li>
        <li><strong>Stripe:</strong> Handles payment processing. All card data is entered on Stripe&rsquo;s secure checkout — we receive only a booking confirmation and transaction record.</li>
        <li><strong>Expo:</strong> Powers push notifications via Expo&rsquo;s notification infrastructure.</li>
        <li><strong>Railway:</strong> Hosts our backend servers. Data is stored on encrypted servers in the United States.</li>
      </ul>
    </section>

    <hr class="divider" />

    <section>
      <h3>Data Sharing</h3>
      <p>
        We do <strong>not</strong> sell your personal data to third parties.
        Coach profile information (name, city/state, experience, pricing, photo) is visible to
        athlete users as part of the core matchmaking service. Your personal contact details
        (email, phone) are never publicly displayed.
      </p>
    </section>

    <hr class="divider" />

    <section>
      <h3>Data Retention &amp; Deletion</h3>
      <p>
        We retain your data for as long as your account remains active. To request deletion of
        your account and all associated personal data, email us at
        <a href="mailto:fraserpage737@gmail.com">fraserpage737@gmail.com</a> with the subject
        &ldquo;Delete My Account&rdquo;. We will process your request within 30 days.
      </p>
    </section>

    <hr class="divider" />

    <section>
      <h3>Security</h3>
      <p>
        We implement industry-standard security measures including HTTPS encryption in transit,
        hashed passwords, JWT-based authentication, and rate limiting on all API endpoints.
        No method of transmission over the internet is 100% secure, and we cannot guarantee
        absolute security.
      </p>
    </section>

    <hr class="divider" />

    <section>
      <h3>Children&rsquo;s Privacy</h3>
      <p>
        Coach Athlete Connect is not directed to children under the age of 13. We do not
        knowingly collect personal information from children under 13. If you become aware
        that a child has provided us with personal data, please contact us.
      </p>
    </section>

    <hr class="divider" />

    <section>
      <h3>Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes
        by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date above.
        Continued use of the app after changes constitutes your acceptance of the revised policy.
      </p>
    </section>

    <hr class="divider" />

    <section>
      <h3>Contact Us</h3>
      <p>
        If you have any questions about this Privacy Policy or our data practices, please contact us:<br />
        <a href="mailto:fraserpage737@gmail.com">fraserpage737@gmail.com</a>
      </p>
    </section>
  </div>

  <footer>
    &copy; 2026 Coach Athlete Connect. All rights reserved.
  </footer>
</body>
</html>`);
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return createServer(app);
}
