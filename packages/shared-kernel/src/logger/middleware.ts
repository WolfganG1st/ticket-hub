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

  // Monkey patch res.send to capture the response body
  const originalSend = res.send;
  let responseBody: unknown;

  res.send = function (body): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    if (IGNORED_ROUTES.some((route) => url.includes(route))) {
      return;
    }

    const duration = Date.now() - startTime;
    logRequest(req, res, url, duration, responseBody);
  });

  next();
}

function logRequest(req: ExpressRequest, res: Response, url: string, duration: number, responseBody: unknown): void {
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

  // Try to parse response body if it's a string JSON
  if (responseBody) {
    try {
      if (typeof responseBody === 'string') {
        logData.response = JSON.parse(responseBody);
      } else {
        logData.response = responseBody;
      }
    } catch {
      logData.response = responseBody;
    }
  }

  req.log?.info(logData, 'request completed');
}
