import { randomUUID } from 'node:crypto';
import type { Request as ExpressRequest, NextFunction, Response } from 'express';
import { logger } from './index';

declare global {
  // biome-ignore lint/style/noNamespace: Express types use namespace for augmentation
  namespace Express {
    interface Request {
      id?: string;
      log?: typeof logger;
    }
  }
}

const IGNORED_ROUTES: string[] = [];

export function loggerMiddleware(req: ExpressRequest, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Ensure request ID exists
  if (!req.id) {
    req.id = typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : randomUUID();
  }

  // Create child logger
  req.log = logger.child({ requestId: req.id });

  const url = req.originalUrl || req.url;

  res.on('finish', () => {
    if (IGNORED_ROUTES.some((route) => url.includes(route))) {
      return;
    }

    const duration = Date.now() - startTime;
    const { method, query, body } = req;

    const logData: Record<string, unknown> = {
      method,
      url,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (query && Object.keys(query).length > 0) {
      logData.query = query;
    }

    if (body && Object.keys(body).length > 0) {
      logData.body = body;
    }

    req.log?.info(logData, 'request completed');
  });

  next();
}
