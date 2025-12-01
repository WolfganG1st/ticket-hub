export class AppError extends Error {
  public readonly isAppError = true;

  constructor(
    public readonly message: string,
    public readonly code: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

export class UnexpectedError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message, 'UNEXPECTED_ERROR');
  }
}
