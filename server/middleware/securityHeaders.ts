import type { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Public auth routes callable from native apps (no Origin/Referer headers).
 * Still protected by rate limits; Bearer-authenticated requests skip CSRF separately.
 */
const CSRF_EXEMPT_AUTH_PATHS = new Set([
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/google',
  '/api/auth/apple',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/demo-login',
  '/api/auth/resend-verification',
]);

/** Allowed browser origins for API + cookies (comma-separated in CORS_ORIGINS). */
function getAllowedOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === 'production' && process.env.WEB_APP_URL) {
      return [process.env.WEB_APP_URL.replace(/\/$/, '')];
    }
    return true;
  }
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

export function applySecurityMiddleware(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  // Lightweight CSRF mitigation for cookie sessions: block cross-site POST without Origin/Referer
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    if (!req.path.startsWith('/api/')) return next();
    if (req.path === '/api/payments/webhook') return next();
    if (req.headers.authorization?.startsWith('Bearer ')) return next();
    if (CSRF_EXEMPT_AUTH_PATHS.has(req.path)) return next();

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    if (!origin && !referer && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  });
}
