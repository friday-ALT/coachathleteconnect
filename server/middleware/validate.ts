import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Calls next() with a 400 error on failure so the global error handler picks it up.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors: (result.error as ZodError).errors,
      });
    }
    (req as any).validatedBody = result.data;
    next();
  };
}

/**
 * Middleware factory that validates req.query against a Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid query parameters',
        errors: (result.error as ZodError).errors,
      });
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}
