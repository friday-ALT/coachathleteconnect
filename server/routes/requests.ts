import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertTimeSlotRequestSchema } from '@shared/schema';
import { logAuthFailure } from '../security';
import { sendPushToUser } from '../notifications';
import { db } from '../db';

export const requestsRouter = Router();

// POST /api/requests
requestsRouter.post('/', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;
    const data = insertTimeSlotRequestSchema.parse(req.body);

    const connection = await storage.getConnection(athleteId, data.coachId);
    const request = await storage.createTimeSlotRequest({
      ...data,
      athleteId,
      connectionId: connection?.id ?? undefined,
    });

    // Notify coach of new booking request
    const athlete = await storage.getUser(athleteId);
    const athleteName = athlete?.firstName
      ? `${athlete.firstName} ${athlete.lastName ?? ''}`.trim()
      : (athlete?.email ?? 'An athlete');
    sendPushToUser(
      db, data.coachId,
      '📅 New Booking Request',
      `${athleteName} wants to book a session with you.`,
      { screen: '/(coach)/requests', requestId: request.id }
    );

    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create request' });
  }
});

// GET /api/requests
requestsRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { role } = req.query;

    if (role === 'athlete') return res.json(await storage.getRequestsByAthlete(userId));
    if (role === 'coach') return res.json(await storage.getRequestsByCoach(userId));

    const coachProfile = await storage.getCoachProfile(userId);
    if (coachProfile) return res.json(await storage.getRequestsByCoach(userId));
    res.json(await storage.getRequestsByAthlete(userId));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// DELETE /api/requests/:id — athlete cancels a PENDING request
requestsRouter.delete('/:id', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const athleteId = req.user.claims.sub;

    const request = await storage.getRequestById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.athleteId !== athleteId) return res.status(403).json({ message: 'Not authorized' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled' });
    }

    await storage.deleteRequest(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to cancel request' });
  }
});

// PATCH /api/requests/:id
requestsRouter.patch('/:id', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.claims.sub;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await storage.getRequestById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.coachId !== userId) {
      logAuthFailure({ timestamp: new Date(), userId, attemptedAction: 'PATCH /api/requests/:id', resourceId: id, reason: 'User is not the coach for this request', ip: req.ip });
      return res.status(403).json({ message: 'Only the coach can update request status' });
    }

    const updated = await storage.updateRequestStatus(id, status);

    // Notify athlete of approval or decline
    const coach = await storage.getUser(userId);
    const coachName = coach?.firstName
      ? `${coach.firstName} ${coach.lastName ?? ''}`.trim()
      : 'Your coach';
    if (status === 'ACCEPTED') {
      sendPushToUser(
        db, request.athleteId,
        '✅ Session Confirmed!',
        `${coachName} approved your booking request.`,
        { screen: '/(athlete)/sessions', requestId: request.id }
      );
    } else {
      sendPushToUser(
        db, request.athleteId,
        '❌ Session Declined',
        `${coachName} declined your booking request.`,
        { screen: '/(athlete)/sessions', requestId: request.id }
      );
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update request' });
  }
});
