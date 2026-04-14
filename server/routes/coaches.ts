import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

export const coachesRouter = Router();

// GET /api/coaches — paginated coach search
coachesRouter.get('/', async (req, res) => {
  try {
    const { q = '', skillLevel = '', groupSize = '', limit, cursor } = req.query;
    const coaches = await storage.searchCoaches(
      q as string,
      skillLevel as string,
      groupSize as string,
      limit ? parseInt(limit as string, 10) : 20,
      cursor as string | undefined,
    );
    res.json(coaches);
  } catch (error) {
    console.error('Error searching coaches:', error);
    res.status(500).json({ message: 'Failed to search coaches' });
  }
});

// GET /api/coaches/:coachId — public coach profile
coachesRouter.get('/:coachId', async (req, res) => {
  try {
    const profile = await storage.getCoachProfileById(req.params.coachId);
    if (!profile) return res.status(404).json({ message: 'Coach not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coach profile' });
  }
});

// GET /api/coaches/:coachId/schedule — public weekly schedule
coachesRouter.get('/:coachId/schedule', async (req, res) => {
  try {
    const { coachId } = req.params;
    const coachProfile = await storage.getCoachProfile(coachId);
    if (!coachProfile) return res.status(404).json({ message: 'Coach not found' });

    const template = await storage.getScheduleTemplate(coachId);
    if (!template || template.isPublic !== 1) return res.json(null);

    const items = await storage.getScheduleTemplateItems(template.id);
    res.json({ ...template, items: items.map(i => ({ ...i, notes: undefined })) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coach schedule' });
  }
});

// GET /api/coaches/:coachId/schedule-30days — 30-day projection
coachesRouter.get('/:coachId/schedule-30days', async (req: any, res) => {
  try {
    const { coachId } = req.params;
    const userId = req.user?.claims?.sub;

    const coachProfile = await storage.getCoachProfile(coachId);
    if (!coachProfile) return res.status(404).json({ message: 'Coach not found' });

    const template = await storage.getScheduleTemplate(coachId);
    if (!template || (template.isPublic !== 1 && userId !== coachId)) {
      return res.json({ days: [], message: 'No schedule template set' });
    }

    const items = await storage.getScheduleTemplateItems(template.id);
    if (items.length === 0) return res.json({ days: [], message: 'No sessions in schedule template' });

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const [availabilityRules, availabilityExceptions, bookedSessions] = await Promise.all([
      storage.getAvailabilityRules(coachId),
      storage.getAvailabilityExceptions(coachId, startDateStr, endDateStr),
      storage.getBookedSessions(coachId, today, endDate),
    ]);

    let hasConnection = false;
    let connectionStatus = null;
    if (userId && userId !== coachId) {
      const connection = await storage.getConnection(userId, coachId);
      hasConnection = !!connection;
      connectionStatus = connection?.status || null;
    }

    const days: any[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      const fullDayBlock = availabilityExceptions.find(
        e => e.date === dateStr && e.exceptionType === 'BLOCK' && !e.startTime,
      );
      if (fullDayBlock) {
        days.push({ date: dateStr, dayOfWeek, dayName: date.toLocaleDateString('en-US', { weekday: 'long' }), sessions: [], isBlocked: true });
        continue;
      }

      const daySessions = items
        .filter(item => item.dayOfWeek === dayOfWeek)
        .map(item => {
          const isWithinAvailability =
            availabilityRules.length === 0 ||
            availabilityRules.some(r => r.dayOfWeek === dayOfWeek && r.isActive === 1 && r.startTime <= item.startTime && r.endTime >= item.endTime);
          const isBlocked = availabilityExceptions.some(
            e => e.date === dateStr && e.exceptionType === 'BLOCK' && e.startTime && e.startTime <= item.startTime && e.endTime! >= item.endTime,
          );
          const isBooked = bookedSessions.some(s => {
            const sd = s.startAt.toISOString().split('T')[0];
            const st = s.startAt.toTimeString().substring(0, 5);
            return sd === dateStr && st === item.startTime;
          });
          const available = isWithinAvailability && !isBlocked && !isBooked;
          return {
            id: item.id, date: dateStr, startTime: item.startTime, endTime: item.endTime,
            title: item.title, location: item.location, trainingType: item.trainingType,
            groupSize: item.groupSize,
            status: isBooked ? 'Booked' : available ? 'Available' : 'Unavailable',
            canRequest: available && hasConnection && connectionStatus === 'ACCEPTED',
          };
        });

      days.push({ date: dateStr, dayOfWeek, dayName: date.toLocaleDateString('en-US', { weekday: 'long' }), sessions: daySessions, isBlocked: false });
    }

    res.json({ days, coachName: coachProfile.name, timezone: template.timezone, hasConnection, connectionStatus });
  } catch (error) {
    console.error('Error fetching 30-day schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// GET /api/athletes — coach-only athlete search
export const athletesRouter = Router();
athletesRouter.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can browse athletes' });

    const { q = '', skillLevel = '' } = req.query;
    const athletes = await storage.searchAthletes(q as string, skillLevel as string);
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search athletes' });
  }
});
