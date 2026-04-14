import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // Zod validation errors
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      ok: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  console.error('[Server Error]', err);
  res.status(status).json({ ok: false, message });
}
