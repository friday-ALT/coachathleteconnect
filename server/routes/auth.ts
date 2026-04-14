import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, type ActiveRole } from '../replitAuth';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const authRouter = Router();

// GET /api/auth/user
authRouter.get('/user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// GET /api/auth/session
authRouter.get('/session', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const activeRole = req.session?.activeRole || null;

    const athleteProfile = await storage.getAthleteProfile(userId);
    const coachProfile = await storage.getCoachProfile(userId);

    res.json({
      activeRole,
      hasAthleteProfile: !!athleteProfile,
      hasCoachProfile: !!coachProfile,
      athleteProfileComplete: athleteProfile?.isComplete === 1,
      coachProfileComplete: coachProfile?.isComplete === 1,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

// POST /api/auth/enter-role
authRouter.post('/enter-role', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { role } = req.body;

    if (role !== 'athlete' && role !== 'coach') {
      return res.status(400).json({ message: "Invalid role. Must be 'athlete' or 'coach'." });
    }

    if (role === 'athlete') {
      const athleteProfile = await storage.getAthleteProfile(userId);
      if (!athleteProfile) {
        return res.status(403).json({ message: "You don't have an athlete profile.", code: 'NO_PROFILE' });
      }
      if (athleteProfile.isComplete !== 1) {
        return res.status(403).json({
          message: 'Your athlete profile is incomplete.',
          code: 'INCOMPLETE_PROFILE',
          redirectTo: '/onboarding?addRole=athlete',
        });
      }
    } else {
      const coachProfile = await storage.getCoachProfile(userId);
      if (!coachProfile) {
        return res.status(403).json({ message: "You don't have a coach profile.", code: 'NO_PROFILE' });
      }
      if (coachProfile.isComplete !== 1) {
        return res.status(403).json({
          message: 'Your coach profile is incomplete.',
          code: 'INCOMPLETE_PROFILE',
          redirectTo: '/onboarding?addRole=coach',
        });
      }
    }

    req.session.activeRole = role as ActiveRole;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => (err ? reject(err) : resolve()));
    });

    res.json({ message: `Entered ${role} mode successfully.`, activeRole: role });
  } catch (error) {
    console.error('Error entering role:', error);
    res.status(500).json({ message: 'Failed to enter role' });
  }
});

// POST /api/auth/push-token  — saves Expo push token for this user
authRouter.post('/push-token', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'token is required' });
    }
    await db.update(users).set({ expoPushToken: token }).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving push token:', error);
    res.status(500).json({ message: 'Failed to save push token' });
  }
});

// POST /api/auth/exit-role
authRouter.post('/exit-role', isAuthenticated, async (req: any, res) => {
  try {
    req.session.activeRole = null;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => (err ? reject(err) : resolve()));
    });
    res.json({ message: 'Exited role successfully.', activeRole: null });
  } catch (error) {
    console.error('Error exiting role:', error);
    res.status(500).json({ message: 'Failed to exit role' });
  }
});
