import type { NextFunction, Request, Response } from 'express';
import { mapErrorToHttpStatus } from './http-error-mapper';

export function globalErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const { statusCode, body } = mapErrorToHttpStatus(error);
  res.status(statusCode).json(body);
}
