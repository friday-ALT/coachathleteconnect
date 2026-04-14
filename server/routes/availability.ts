import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';

export const availabilityRouter = Router();

// GET /api/availability/:coachId/rules
availabilityRouter.get('/:coachId/rules', async (req, res) => {
  try {
    const rules = await storage.getAvailabilityRules(req.params.coachId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch availability rules' });
  }
});

// PUT /api/availability/rules
availabilityRouter.put('/rules', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const coachId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(coachId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can manage availability' });

    const rulesSchema = z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isActive: z.number().optional().default(1),
    }));

    const rules = rulesSchema.parse(req.body);
    const created = await storage.upsertAvailabilityRules(coachId, rules);
    res.json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update availability rules' });
  }
});

// GET /api/availability/:coachId/exceptions
availabilityRouter.get('/:coachId/exceptions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });
    const exceptions = await storage.getAvailabilityExceptions(req.params.coachId, startDate as string, endDate as string);
    res.json(exceptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch availability exceptions' });
  }
});

// POST /api/availability/exceptions
availabilityRouter.post('/exceptions', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const coachId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(coachId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can manage availability' });

    const exceptionSchema = z.object({
      date: z.string(),
      startTime: z.string().nullable().optional(),
      endTime: z.string().nullable().optional(),
      exceptionType: z.enum(['BLOCK', 'ADD']),
    });

    const data = exceptionSchema.parse(req.body);
    const exception = await storage.createAvailabilityException({ ...data, coachId });
    res.status(201).json(exception);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create exception' });
  }
});

// DELETE /api/availability/exceptions/:id
availabilityRouter.delete('/exceptions/:id', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    await storage.deleteAvailabilityException(req.params.id, req.user.claims.sub);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete exception' });
  }
});

// GET /api/availability/:coachId/sessions
availabilityRouter.get('/:coachId/sessions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });
    const sessions = await storage.getBookedSessions(
      req.params.coachId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booked sessions' });
  }
});
