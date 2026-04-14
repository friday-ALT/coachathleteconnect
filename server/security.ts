import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export interface AuthRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      name?: string;
    };
  };
}

export interface AuthFailure {
  timestamp: Date;
  userId: string | null;
  attemptedAction: string;
  resourceId?: string;
  reason: string;
  ip?: string;
}

const authFailures: AuthFailure[] = [];

export function logAuthFailure(failure: AuthFailure): void {
  authFailures.push(failure);
  console.warn(`[AUTH FAILURE] ${failure.timestamp.toISOString()} - User: ${failure.userId || 'anonymous'} - Action: ${failure.attemptedAction} - Resource: ${failure.resourceId || 'N/A'} - Reason: ${failure.reason}`);
  
  if (authFailures.length > 1000) {
    authFailures.shift();
  }
}

export function getRecentAuthFailures(limit: number = 50): AuthFailure[] {
  return authFailures.slice(-limit);
}

export function requireAthlete(req: AuthRequest, res: Response, next: NextFunction): void {
  const userId = req.user?.claims?.sub;
  
  if (!userId) {
    logAuthFailure({
      timestamp: new Date(),
      userId: null,
      attemptedAction: `${req.method} ${req.path}`,
      reason: 'Unauthenticated access attempt',
      ip: req.ip,
    });
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  storage.getAthleteProfile(userId).then(profile => {
    if (!profile) {
      logAuthFailure({
        timestamp: new Date(),
        userId,
        attemptedAction: `${req.method} ${req.path}`,
        reason: 'User is not an athlete',
        ip: req.ip,
      });
      res.status(403).json({ message: 'Athlete profile required' });
      return;
    }
    next();
  }).catch(error => {
    console.error('Error checking athlete profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  });
}

export function requireCoach(req: AuthRequest, res: Response, next: NextFunction): void {
  const userId = req.user?.claims?.sub;
  
  if (!userId) {
    logAuthFailure({
      timestamp: new Date(),
      userId: null,
      attemptedAction: `${req.method} ${req.path}`,
      reason: 'Unauthenticated access attempt',
      ip: req.ip,
    });
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  storage.getCoachProfile(userId).then(profile => {
    if (!profile) {
      logAuthFailure({
        timestamp: new Date(),
        userId,
        attemptedAction: `${req.method} ${req.path}`,
        reason: 'User is not a coach',
        ip: req.ip,
      });
      res.status(403).json({ message: 'Coach profile required' });
      return;
    }
    next();
  }).catch(error => {
    console.error('Error checking coach profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  });
}

export const ALLOWED_ATHLETE_UPDATE_FIELDS = [
  'age',
  'skillLevel',
  'locationCity',
  'locationState',
  'phone',
] as const;

export const ALLOWED_COACH_UPDATE_FIELDS = [
  'name',
  'locationCity',
  'locationState',
  'bio',
  'experience',
  'yearsCoaching',
  'specialties',
  'certifications',
  'ageGroupsTaught',
  'sessionTypes',
  'maxGroupSize',
  'pricePerHour',
  'timezone',
  'phone',
] as const;

export function sanitizeUpdateFields<T extends object>(
  data: T,
  allowedFields: readonly string[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const key of Object.keys(data) as (keyof T)[]) {
    const value = data[key];
    // Only include keys that are:
    // 1. In the allowed list
    // 2. Have a defined, non-undefined value
    if (allowedFields.includes(key as string) && value !== undefined) {
      sanitized[key] = value;
    } else if (!allowedFields.includes(key as string) && value !== undefined) {
      console.warn(`[SECURITY] Blocked field in update: ${String(key)}`);
    }
  }
  
  return sanitized;
}

export const PROTECTED_USER_FIELDS = [
  'id',
  'userId',
  'createdAt',
  'updatedAt',
  'ratingAvg',
  'ratingCount',
  'avatarUrl',
] as const;

export function validateNoProtectedFields(data: object): { valid: boolean; blockedFields: string[] } {
  const blockedFields: string[] = [];
  
  for (const key of Object.keys(data)) {
    if (PROTECTED_USER_FIELDS.includes(key as any)) {
      blockedFields.push(key);
    }
  }
  
  return {
    valid: blockedFields.length === 0,
    blockedFields,
  };
}
