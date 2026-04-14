import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertTrainingSessionRequestSchema } from '@shared/schema';

export const trainingRouter = Router();

// POST /api/training-requests
trainingRouter.post('/', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;
    const athleteProfile = await storage.getAthleteProfile(athleteId);
    if (!athleteProfile) return res.status(403).json({ message: 'Only athletes can request training sessions' });

    const data = insertTrainingSessionRequestSchema.parse(req.body);
    const connection = await storage.getConnection(athleteId, data.coachId);
    if (!connection || connection.status !== 'ACCEPTED') {
      return res.status(403).json({ message: 'You must have an accepted connection with this coach before requesting a session' });
    }

    const request = await storage.createTrainingSessionRequest({ ...data, athleteId, connectionId: connection.id });
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create training request' });
  }
});

// GET /api/training-requests
trainingRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { role } = req.query;

    if (role === 'coach') return res.json(await storage.getTrainingSessionRequestsByCoach(userId));
    if (role === 'athlete') return res.json(await storage.getTrainingSessionRequestsByAthlete(userId));

    const coachProfile = await storage.getCoachProfile(userId);
    if (coachProfile) return res.json(await storage.getTrainingSessionRequestsByCoach(userId));
    res.json(await storage.getTrainingSessionRequestsByAthlete(userId));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch training requests' });
  }
});

// PATCH /api/training-requests/:requestId
trainingRouter.patch('/:requestId', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can update training requests' });

    const updated = await storage.updateTrainingSessionRequestStatus(req.params.requestId, status);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update training request' });
  }
});
