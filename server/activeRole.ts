import type { Request } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { ActiveRole } from './replitAuth';

export async function getLastActiveRole(userId: string): Promise<ActiveRole | null> {
  const [user] = await db.select({ lastActiveRole: users.lastActiveRole })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const role = user?.lastActiveRole;
  return role === 'athlete' || role === 'coach' ? role : null;
}

export async function setLastActiveRole(userId: string, role: ActiveRole | null): Promise<void> {
  await db.update(users)
    .set({ lastActiveRole: role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/** Web session role, else DB (mobile JWT / cross-device). */
export async function resolveActiveRole(req: Request & { session?: { activeRole?: ActiveRole }; user?: { claims?: { sub: string } } }): Promise<ActiveRole | null> {
  if (req.session?.activeRole) return req.session.activeRole;
  const userId = (req as any).user?.claims?.sub;
  if (!userId) return null;
  return getLastActiveRole(userId);
}
