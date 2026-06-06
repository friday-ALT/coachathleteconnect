import jwt from 'jsonwebtoken';
import { getTokenVersion } from './tokenVersion';

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}
const JWT_EXPIRES = '30d';

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  tv?: number;
}

export function signToken(payload: Omit<JwtPayload, 'tv'>, tokenVersion = 0): string {
  return jwt.sign(
    { ...payload, tv: tokenVersion },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/** Verify signature, expiry, and that the token has not been revoked via logout/password reset. */
export async function verifyActiveToken(token: string): Promise<JwtPayload | null> {
  const payload = verifyToken(token);
  if (!payload?.sub) return null;

  const currentVersion = await getTokenVersion(payload.sub);
  const tokenVersion = payload.tv ?? 0;
  if (tokenVersion !== currentVersion) return null;

  return payload;
}
