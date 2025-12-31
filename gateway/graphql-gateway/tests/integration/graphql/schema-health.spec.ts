import { describe, expect, it } from 'vitest';

describe('Schema (integration)', () => {
  it('should start and respond to introspection', async () => {
    const { graphql } = globalThis.__gatewayTestContext;
    const response = await graphql({
      query: `
        query IntrospectionQuery {
          __schema {
            queryType { name }
          }
        }
      `,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });

  it('should respond to a trivial query', async () => {
    const { graphql } = globalThis.__gatewayTestContext;
    const response = await graphql({
      query: '{ me { id } }',
    });

    expect(response.status).toBe(200);
    // Since we are not mocking the accounts-service yet in this test,
    // it might return null or error depending on how fetch is handled.
    // But the server should at least respond.
    expect(response.body).toHaveProperty('data');
  });

  it('should reject unknown fields with proper GraphQL error', async () => {
    const { graphql } = globalThis.__gatewayTestContext;
    const response = await graphql({
      query: '{ unknownField }',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toContain('Cannot query field "unknownField"');
  });
});
