import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { insertAthleteProfileSchema, insertCoachProfileSchema } from '@shared/schema';
import {
  logAuthFailure,
  ALLOWED_ATHLETE_UPDATE_FIELDS,
  ALLOWED_COACH_UPDATE_FIELDS,
  validateNoProtectedFields,
} from '../security';

export const profilesRouter = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/avatars',
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// ── Athlete profile ───────────────────────────────────────────────────────────

profilesRouter.get('/athlete', isAuthenticated, async (req: any, res) => {
  try {
    const profile = await storage.getAthleteProfile(req.user.claims.sub);
    if (!profile) return res.status(404).json({ message: 'Athlete profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch athlete profile' });
  }
});

profilesRouter.post('/athlete', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = insertAthleteProfileSchema.parse(req.body);
    if (data.phone) await storage.updateUserPhone(userId, data.phone);

    // Upsert: update existing profile if one already exists
    const existing = await storage.getAthleteProfile(userId);
    let profile;
    if (existing) {
      profile = await storage.updateAthleteProfile(userId, data);
    } else {
      profile = await storage.createAthleteProfile({ ...data, userId });
    }
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create athlete profile' });
  }
});

profilesRouter.put('/athlete', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { valid, blockedFields } = validateNoProtectedFields(req.body);
    if (!valid) {
      logAuthFailure({ timestamp: new Date(), userId, attemptedAction: 'PUT /api/profiles/athlete', reason: `Protected fields: ${blockedFields.join(', ')}`, ip: req.ip });
      return res.status(400).json({ message: `Cannot modify protected fields: ${blockedFields.join(', ')}` });
    }
    const filteredBody: Record<string, any> = {};
    for (const key of ALLOWED_ATHLETE_UPDATE_FIELDS) {
      if (key in req.body && req.body[key] !== undefined) filteredBody[key] = req.body[key];
    }
    const data = insertAthleteProfileSchema.partial().parse(filteredBody);
    if (data.phone) await storage.updateUserPhone(userId, data.phone);
    const profile = await storage.updateAthleteProfile(userId, data);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update athlete profile' });
  }
});

// ── Coach profile ─────────────────────────────────────────────────────────────

profilesRouter.get('/coach', isAuthenticated, async (req: any, res) => {
  try {
    const profile = await storage.getCoachProfile(req.user.claims.sub);
    if (!profile) return res.status(404).json({ message: 'Coach profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coach profile' });
  }
});

profilesRouter.post('/coach', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = insertCoachProfileSchema.parse(req.body);
    if (data.phone) await storage.updateUserPhone(userId, data.phone);

    // Upsert: update existing profile if one already exists
    const existing = await storage.getCoachProfile(userId);
    let profile;
    if (existing) {
      profile = await storage.updateCoachProfile(userId, data);
    } else {
      profile = await storage.createCoachProfile({ ...data, userId });
    }
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create coach profile' });
  }
});

profilesRouter.put('/coach', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { valid, blockedFields } = validateNoProtectedFields(req.body);
    if (!valid) {
      logAuthFailure({ timestamp: new Date(), userId, attemptedAction: 'PUT /api/profiles/coach', reason: `Protected fields: ${blockedFields.join(', ')}`, ip: req.ip });
      return res.status(400).json({ message: `Cannot modify protected fields: ${blockedFields.join(', ')}` });
    }
    const filteredBody: Record<string, any> = {};
    for (const key of ALLOWED_COACH_UPDATE_FIELDS) {
      if (Object.hasOwn(req.body, key) && req.body[key] !== undefined) filteredBody[key as string] = req.body[key as string];
    }
    const data = insertCoachProfileSchema.partial().parse(filteredBody);
    if (data.phone) await storage.updateUserPhone(userId, data.phone);
    const profile = await storage.updateCoachProfile(userId, data);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update coach profile' });
  }
});

// ── Avatar upload ─────────────────────────────────────────────────────────────

profilesRouter.post('/avatar', isAuthenticated, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await storage.updateCoachAvatar(req.user.claims.sub, avatarUrl);
    res.json({ avatarUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to upload avatar' });
  }
});
