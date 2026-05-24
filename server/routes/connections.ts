import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertConnectionSchema } from '@shared/schema';
import { createNotification } from './notifications';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const connectionsRouter = Router();

// POST /api/connections
connectionsRouter.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;
    const data = insertConnectionSchema.parse(req.body);

    if (athleteId === data.coachId) return res.status(400).json({ message: 'Cannot connect with yourself' });

    const athleteProfile = await storage.getAthleteProfile(athleteId);
    if (!athleteProfile) return res.status(403).json({ message: 'Only athletes can send connection requests' });

    const coachProfile = await storage.getCoachProfile(data.coachId);
    if (!coachProfile) return res.status(400).json({ message: 'Target user is not a coach' });

    const existing = await storage.getConnection(athleteId, data.coachId);
    if (existing) return res.status(400).json({ message: 'Connection already exists' });

    const connection = await storage.createConnection({ ...data, athleteId });

    // Notify the coach
    const [athlete] = await db.select().from(users).where(eq(users.id, athleteId)).limit(1);
    const athleteName = athlete?.firstName ? `${athlete.firstName} ${athlete.lastName ?? ''}`.trim() : 'An athlete';
    const body = `${athleteName} wants to connect with you.`;
    createNotification(data.coachId, 'connection_request', 'New connection request', body, { connectionId: connection.id });

    res.status(201).json(connection);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create connection' });
  }
});

// GET /api/connections
connectionsRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { role } = req.query;

    if (role === 'athlete') return res.json(await storage.getConnectionsByAthlete(userId));
    if (role === 'coach') return res.json(await storage.getConnectionsByCoach(userId));

    const coachProfile = await storage.getCoachProfile(userId);
    if (coachProfile) return res.json(await storage.getConnectionsByCoach(userId));
    res.json(await storage.getConnectionsByAthlete(userId));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
});

// GET /api/connections/check/:coachId
connectionsRouter.get('/check/:coachId', isAuthenticated, async (req: any, res) => {
  try {
    const connection = await storage.getConnection(req.user.claims.sub, req.params.coachId);
    res.json({ connection: connection || null });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check connection' });
  }
});

// PATCH /api/connections/:id
connectionsRouter.patch('/:id', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const coachId = req.user.claims.sub;

    if (!['ACCEPTED', 'DECLINED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await storage.getConnectionById(id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });
    if (connection.coachId !== coachId) return res.status(403).json({ message: 'Only the coach can update connection status' });

    const updated = await storage.updateConnectionStatus(id, status);

    // Notify athlete of decision
    const [coach] = await db.select().from(users).where(eq(users.id, coachId)).limit(1);
    const coachName = coach?.firstName ? `${coach.firstName} ${coach.lastName ?? ''}`.trim() : 'The coach';
    if (status === 'ACCEPTED') {
      createNotification(connection.athleteId, 'connection_accepted', 'Connection accepted! 🎉', `${coachName} accepted your connection request. You can now book sessions.`, { connectionId: id });
    } else if (status === 'DECLINED') {
      createNotification(connection.athleteId, 'connection_declined', 'Connection declined', `${coachName} declined your connection request.`, { connectionId: id });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update connection' });
  }
});
