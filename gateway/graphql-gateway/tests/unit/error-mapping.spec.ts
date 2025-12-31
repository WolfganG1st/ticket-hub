import { GraphQLError } from 'graphql';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from 'shared-kernel';
import { describe, expect, it } from 'vitest';
import { formatError } from '../../src/infra/error-mapping';

describe('Error Mapping (unit)', () => {
  it('should map 401 from downstream to GraphQL UNAUTHENTICATED', () => {
    const error = { originalError: new UnauthorizedError('Unauthorized') };
    const formatted = formatError({}, error);

    expect(formatted).toBeInstanceOf(GraphQLError);
    expect(formatted.extensions.code).toBe('UNAUTHENTICATED');
    expect(formatted.message).toBe('Unauthorized');
  });

  it('should map 403 to FORBIDDEN', () => {
    const error = { originalError: new ForbiddenError('Forbidden') };
    const formatted = formatError({}, error);

    expect(formatted).toBeInstanceOf(GraphQLError);
    expect(formatted.extensions.code).toBe('FORBIDDEN');
    expect(formatted.message).toBe('Forbidden');
  });

  it('should map 404 to NOT_FOUND', () => {
    const error = { originalError: new NotFoundError('Not Found') };
    const formatted = formatError({}, error);

    expect(formatted).toBeInstanceOf(GraphQLError);
    expect(formatted.extensions.code).toBe('NOT_FOUND');
    expect(formatted.message).toBe('Not Found');
  });

  it('should map 409 to CONFLICT with domain code preserved', () => {
    const error = { originalError: new ConflictError('Conflict') };
    const formatted = formatError({}, error);

    expect(formatted).toBeInstanceOf(GraphQLError);
    expect(formatted.extensions.code).toBe('CONFLICT');
    expect(formatted.extensions.domainCode).toBe('CONFLICT');
    expect(formatted.message).toBe('Conflict');
  });

  it('should map 5xx to INTERNAL_SERVER_ERROR and hide downstream details', () => {
    const error = { originalError: new Error('Some internal error') };
    const formatted = formatError({}, error);

    expect(formatted).toBeInstanceOf(GraphQLError);
    expect(formatted.extensions.code).toBe('INTERNAL_SERVER_ERROR');
    expect(formatted.message).toBe('Internal server error');
  });
});
