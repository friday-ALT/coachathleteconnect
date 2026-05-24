import { Router } from 'express';
import { eq, and, or, desc, asc } from 'drizzle-orm';
import { db } from '../db';
import { conversations, messages, users, athleteProfiles, coachProfiles, notifications } from '@shared/schema';
import { isAuthenticated } from '../replitAuth';
import { createNotification } from './notifications';

export const messagesRouter = Router();

/** GET /api/conversations — list all conversations for the current user */
messagesRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const rows = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.athleteId, userId), eq(conversations.coachId, userId)))
      .orderBy(desc(conversations.lastMessageAt));

    // Enrich with latest message + unread count + other user info
    const enriched = await Promise.all(
      rows.map(async (conv) => {
        const [latest] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const unreadCount = await db
          .select({ id: messages.id })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.read, false),
              // only count messages the OTHER user sent
            )
          );

        const otherUserId = conv.athleteId === userId ? conv.coachId : conv.athleteId;
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);

        // Get display name from profile
        let otherName = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || otherUser?.email || 'User';
        let otherAvatar: string | null = otherUser?.profileImageUrl || null;

        if (conv.coachId === otherUserId) {
          const [cp] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, otherUserId)).limit(1);
          if (cp) { otherName = cp.name; otherAvatar = cp.avatarUrl || null; }
        }

        // Unread = messages from OTHER user that are unread
        const unread = unreadCount.filter(() => latest?.senderId !== userId).length;

        return {
          ...conv,
          latestMessage: latest || null,
          unreadCount: latest && latest.senderId !== userId && !latest.read ? 1 : 0,
          otherUser: { id: otherUserId, name: otherName, avatarUrl: otherAvatar },
        };
      })
    );

    res.json(enriched);
  } catch (err: any) {
    console.error('GET /conversations error:', err);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
});

/** POST /api/conversations — start or get an existing conversation with a user */
messagesRouter.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' });

    // Determine who is athlete and who is coach
    const [myCoachProfile] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, userId)).limit(1);
    const [theirCoachProfile] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, otherUserId)).limit(1);

    let athleteId: string, coachId: string;
    if (myCoachProfile && !theirCoachProfile) {
      // I am coach, they are athlete
      coachId = userId; athleteId = otherUserId;
    } else {
      // I am athlete (or both have coach profiles — default: I'm athlete, they're coach)
      athleteId = userId; coachId = otherUserId;
    }

    // Find existing conversation
    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.athleteId, athleteId), eq(conversations.coachId, coachId)))
      .limit(1);

    if (existing) return res.json(existing);

    // Create new
    const [created] = await db
      .insert(conversations)
      .values({ athleteId, coachId })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error('POST /conversations error:', err);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

/** GET /api/conversations/:id/messages — get messages for a conversation */
messagesRouter.get('/:id/messages', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { id } = req.params;

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    if (conv.athleteId !== userId && conv.coachId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark messages from other user as read
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, id),
          eq(messages.read, false),
        )
      );

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    res.json(msgs);
  } catch (err: any) {
    console.error('GET /conversations/:id/messages error:', err);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

/** POST /api/conversations/:id/messages — send a message */
messagesRouter.post('/:id/messages', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    if (conv.athleteId !== userId && conv.coachId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Insert message
    const [msg] = await db
      .insert(messages)
      .values({ conversationId: id, senderId: userId, content: content.trim() })
      .returning();

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id));

    // Notify the other user
    const recipientId = conv.athleteId === userId ? conv.coachId : conv.athleteId;
    const [sender] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const senderName = `${sender?.firstName || ''} ${sender?.lastName || ''}`.trim() || 'Someone';

    await createNotification(recipientId, 'new_message', `New message from ${senderName}`, content.trim().slice(0, 80), { conversationId: id });

    res.status(201).json(msg);
  } catch (err: any) {
    console.error('POST /conversations/:id/messages error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/** GET /api/conversations/unread-count — count of conversations with unread messages */
messagesRouter.get('/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const myConvs = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(or(eq(conversations.athleteId, userId), eq(conversations.coachId, userId)));

    let unread = 0;
    for (const conv of myConvs) {
      const [latest] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      if (latest && latest.senderId !== userId && !latest.read) unread++;
    }

    res.json({ unread });
  } catch {
    res.json({ unread: 0 });
  }
});
