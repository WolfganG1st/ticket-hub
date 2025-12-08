import { Metadata, type ServiceError, status } from '@grpc/grpc-js';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'shared-kernel';

export function mapErrorToGrpcStatus(error: unknown): ServiceError {
  const metadata = new Metadata();

  if (error instanceof AppError) {
    let code = status.INTERNAL;

    if (error instanceof ValidationError) {
      code = status.INVALID_ARGUMENT;
    } else if (error instanceof NotFoundError) {
      code = status.NOT_FOUND;
    } else if (error instanceof ConflictError) {
      code = status.ALREADY_EXISTS;
    } else if (error instanceof UnauthorizedError) {
      code = status.UNAUTHENTICATED;
    } else if (error instanceof ForbiddenError) {
      code = status.PERMISSION_DENIED;
    }

    return {
      name: error.name,
      message: error.message,
      code,
      details: error.message,
      metadata,
    };
  }

  const err = error as Error;
  return {
    name: 'Internal',
    message: err.message || 'An unexpected error occurred',
    code: status.INTERNAL,
    details: err.message || 'An unexpected error occurred',
    metadata,
  };
}
