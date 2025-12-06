import type { NextFunction, Request, Response } from 'express';
import { logger } from 'shared-kernel';

type HttpHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function safeHttpHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): HttpHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
