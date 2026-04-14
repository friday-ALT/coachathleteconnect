import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { logAuthFailure } from '../security';

export const sessionsRouter = Router();

// POST /api/sessions — athlete books a session
sessionsRouter.post('/', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;

    const sessionSchema = z.object({
      coachId: z.string(),
      startAt: z.string().transform(s => new Date(s)),
      endAt: z.string().transform(s => new Date(s)),
      requestId: z.string().optional(),
    });
    const data = sessionSchema.parse(req.body);

    if (athleteId === data.coachId) {
      logAuthFailure({ timestamp: new Date(), userId: athleteId, attemptedAction: 'POST /api/sessions', reason: 'Attempted self-booking', ip: req.ip });
      return res.status(400).json({ message: 'Cannot book a session with yourself' });
    }

    const athleteProfile = await storage.getAthleteProfile(athleteId);
    if (!athleteProfile) {
      logAuthFailure({ timestamp: new Date(), userId: athleteId, attemptedAction: 'POST /api/sessions', reason: 'User is not an athlete', ip: req.ip });
      return res.status(403).json({ message: 'Only athletes can book sessions' });
    }

    const coachProfile = await storage.getCoachProfile(data.coachId);
    if (!coachProfile) return res.status(400).json({ message: 'Target user is not a coach' });

    const connection = await storage.getConnection(athleteId, data.coachId);
    if (!connection || connection.status !== 'ACCEPTED') {
      logAuthFailure({ timestamp: new Date(), userId: athleteId, attemptedAction: 'POST /api/sessions', resourceId: data.coachId, reason: 'No accepted connection with coach', ip: req.ip });
      return res.status(403).json({ message: 'You must have an accepted connection with this coach before booking a session' });
    }

    if (data.requestId) {
      const request = await storage.getRequestById(data.requestId);
      if (!request) return res.status(400).json({ message: 'Invalid request ID' });
      if (request.athleteId !== athleteId || request.coachId !== data.coachId) {
        logAuthFailure({ timestamp: new Date(), userId: athleteId, attemptedAction: 'POST /api/sessions', resourceId: data.requestId, reason: 'Request ID does not belong to this athlete-coach pair', ip: req.ip });
        return res.status(400).json({ message: 'Invalid request ID' });
      }
      if (request.status !== 'ACCEPTED') return res.status(400).json({ message: 'Request must be accepted before booking a session' });
      if (request.connectionId && request.connectionId !== connection.id) return res.status(400).json({ message: 'Invalid request ID' });
    }

    const session = await storage.createBookedSession({ ...data, athleteId, status: 'SCHEDULED' });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to book session' });
  }
});
