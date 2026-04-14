/**
 * Expo Push Notification helper.
 * Sends via Expo's push API — no native SDK needed on the server.
 */

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default';
  badge?: number;
}

export async function sendPushNotification(payload: PushPayload) {
  if (!payload.to?.startsWith('ExponentPushToken')) return; // not a valid token

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ...payload, sound: 'default' }),
    });
  } catch (err) {
    console.warn('[Push] Failed to send notification:', err);
  }
}

export async function sendPushToUser(
  db: any,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const { users } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    const [user] = await db.select({ token: users.expoPushToken })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user?.token) {
      await sendPushNotification({ to: user.token, title, body, data });
    }
  } catch (err) {
    console.warn('[Push] sendPushToUser error:', err);
  }
}
