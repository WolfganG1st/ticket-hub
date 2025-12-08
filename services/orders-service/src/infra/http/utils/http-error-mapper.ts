import process from 'node:process';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'shared-kernel';
import { ZodError } from 'zod';

type HttpErrorResponse = {
  statusCode: number;
  body: {
    error: string;
    message: string;
    details?: unknown;
  };
};

export function mapErrorToHttpStatus(error: unknown): HttpErrorResponse {
  if (error instanceof AppError) {
    let statusCode = 500;

    if (error instanceof ValidationError) {
      statusCode = 400;
    } else if (error instanceof NotFoundError) {
      statusCode = 404;
    } else if (error instanceof ConflictError) {
      statusCode = 409;
    } else if (error instanceof UnauthorizedError) {
      statusCode = 401;
    } else if (error instanceof ForbiddenError) {
      statusCode = 403;
    }

    return {
      statusCode,
      body: {
        error: error.name,
        message: error.message,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: 'ValidationError',
        message: 'Validation failed',
        details: error.cause,
      },
    };
  }

  const err = error as Error;
  return {
    statusCode: 500,
    body: {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  };
}
