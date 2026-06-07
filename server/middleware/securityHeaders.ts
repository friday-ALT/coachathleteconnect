import type { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

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

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    if (!origin && !referer && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  });
}
