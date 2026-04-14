import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertConnectionSchema } from '@shared/schema';

export const connectionsRouter = Router();

// POST /api/connections
connectionsRouter.post('/', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
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
    const userId = req.user.claims.sub;

    if (!['ACCEPTED', 'DECLINED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await storage.getConnectionById(id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });
    if (connection.coachId !== userId) return res.status(403).json({ message: 'Only the coach can update connection status' });

    const updated = await storage.updateConnectionStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update connection' });
  }
});
