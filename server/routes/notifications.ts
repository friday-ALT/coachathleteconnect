import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { notifications } from '@shared/schema';
import { isAuthenticated } from '../replitAuth';

export const notificationsRouter = Router();

/** Helper: create a notification + optional Expo push (fire-and-forget) */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  try {
    await db.insert(notifications).values({ userId, type, title, body, data: data || {} });
  } catch (err) {
    console.warn('[Notifications] Failed to create notification:', err);
  }
}

/** GET /api/notifications — list recent notifications for user */
notificationsRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

/** GET /api/notifications/unread-count */
notificationsRouter.get('/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    res.json({ count: rows.length });
  } catch {
    res.json({ count: 0 });
  }
});

/** PATCH /api/notifications/:id/read — mark one notification read */
notificationsRouter.patch('/:id/read', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, userId)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

/** PATCH /api/notifications/read-all — mark all as read */
notificationsRouter.patch('/read-all', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});
