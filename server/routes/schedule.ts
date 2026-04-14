import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertCoachScheduleTemplateSchema, insertCoachScheduleTemplateItemSchema } from '@shared/schema';

export const scheduleRouter = Router();

// GET /api/schedule-templates
scheduleRouter.get('/', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can access schedule templates' });

    const template = await storage.getScheduleTemplate(userId);
    if (!template) return res.json(null);

    const items = await storage.getScheduleTemplateItems(template.id);
    res.json({ ...template, items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedule template' });
  }
});

// POST /api/schedule-templates
scheduleRouter.post('/', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can create schedule templates' });

    const data = insertCoachScheduleTemplateSchema.parse({ ...req.body, coachId: userId });
    let template = await storage.getScheduleTemplate(userId);
    template = template ? await storage.updateScheduleTemplate(userId, data) : await storage.createScheduleTemplate(data);
    res.status(201).json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create schedule template' });
  }
});

// PUT /api/schedule-templates
scheduleRouter.put('/', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can update schedule templates' });

    const template = await storage.getScheduleTemplate(userId);
    if (!template) return res.status(404).json({ message: 'Schedule template not found' });

    const data = insertCoachScheduleTemplateSchema.partial().parse(req.body);
    const updated = await storage.updateScheduleTemplate(userId, data);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update schedule template' });
  }
});

// DELETE /api/schedule-templates
scheduleRouter.delete('/', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const coachProfile = await storage.getCoachProfile(req.user.claims.sub);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can delete schedule templates' });
    await storage.deleteScheduleTemplate(req.user.claims.sub);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete schedule template' });
  }
});

// POST /api/schedule-templates/items
scheduleRouter.post('/items', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can add schedule items' });

    let template = await storage.getScheduleTemplate(userId);
    if (!template) {
      template = await storage.createScheduleTemplate({
        coachId: userId,
        name: 'Weekly Training Schedule',
        timezone: coachProfile.timezone || 'America/New_York',
        isPublic: 1,
      });
    }

    const data = insertCoachScheduleTemplateItemSchema.parse({ ...req.body, templateId: template.id });
    const item = await storage.createScheduleTemplateItem(data);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create schedule item' });
  }
});

// PUT /api/schedule-templates/items/:itemId
scheduleRouter.put('/items/:itemId', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can update schedule items' });

    const template = await storage.getScheduleTemplate(userId);
    if (!template) return res.status(404).json({ message: 'Schedule template not found' });

    const data = insertCoachScheduleTemplateItemSchema.partial().parse(req.body);
    const updated = await storage.updateScheduleTemplateItem(req.params.itemId, template.id, data);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update schedule item' });
  }
});

// DELETE /api/schedule-templates/items/:itemId
scheduleRouter.delete('/items/:itemId', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can delete schedule items' });

    const template = await storage.getScheduleTemplate(userId);
    if (!template) return res.status(404).json({ message: 'Schedule template not found' });

    await storage.deleteScheduleTemplateItem(req.params.itemId, template.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete schedule item' });
  }
});

// POST /api/schedule-templates/copy-day
scheduleRouter.post('/copy-day', isAuthenticated, requireRole('coach'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) return res.status(403).json({ message: 'Only coaches can copy schedule days' });

    const template = await storage.getScheduleTemplate(userId);
    if (!template) return res.status(404).json({ message: 'Schedule template not found' });

    const { fromDay, toDay } = z.object({
      fromDay: z.number().min(0).max(6),
      toDay: z.number().min(0).max(6),
    }).parse(req.body);

    const items = await storage.copyDayItems(template.id, fromDay, toDay);
    res.json(items);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to copy schedule day' });
  }
});
