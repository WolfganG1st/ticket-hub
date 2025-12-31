import { GraphQLError } from 'graphql';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from 'shared-kernel';

export function formatError(formattedError: unknown, error: unknown): GraphQLError {
  const originalError = (error as GraphQLError)?.originalError;

  if (originalError instanceof UnauthorizedError) {
    return new GraphQLError(originalError.message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  if (originalError instanceof ForbiddenError) {
    return new GraphQLError(originalError.message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }

  if (originalError instanceof NotFoundError) {
    return new GraphQLError(originalError.message, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }

  if (originalError instanceof ConflictError) {
    return new GraphQLError(originalError.message, {
      extensions: {
        code: 'CONFLICT',
        domainCode: originalError.code,
        http: { status: 409 },
      },
    });
  }

  // Allow standard GraphQL validation/parse errors to pass through
  const code = (formattedError as GraphQLError).extensions?.code;
  if (code === 'GRAPHQL_VALIDATION_FAILED' || code === 'GRAPHQL_PARSE_FAILED' || code === 'BAD_USER_INPUT') {
    return formattedError as GraphQLError;
  }

  // Default to INTERNAL_SERVER_ERROR for 5xx or unknown errors
  return new GraphQLError('Internal server error', {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      http: { status: 500 },
    },
  });
}
