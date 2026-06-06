import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { Request } from 'express';

/** Bump version — invalidates all existing JWTs and cookie sessions for this user. */
export async function invalidateUserTokens(userId: string): Promise<number> {
  const [row] = await db
    .update(users)
    .set({
      tokenVersion: sql`COALESCE(${users.tokenVersion}, 0) + 1`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ tokenVersion: users.tokenVersion });

  return row?.tokenVersion ?? 1;
}

export async function getTokenVersion(userId: string): Promise<number> {
  const [row] = await db
    .select({ tokenVersion: users.tokenVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.tokenVersion ?? 0;
}

/** Resolve user id from Bearer token (even if already invalidated) or web session. */
export function resolveLogoutUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const decoded = jwt.decode(authHeader.slice(7)) as { sub?: string } | null;
    if (decoded?.sub) return decoded.sub;
  }

  const session = req.session as { userId?: string } | undefined;
  if (session?.userId) return session.userId;

  const claims = (req as any).user?.claims?.sub as string | undefined;
  return claims ?? null;
}

export async function performLogout(req: Request): Promise<void> {
  const userId = resolveLogoutUserId(req);
  if (userId) await invalidateUserTokens(userId);
}
