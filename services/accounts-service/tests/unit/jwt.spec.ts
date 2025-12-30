import type { AuthTokenPayload } from 'shared-kernel';
import { describe, expect, it } from 'vitest';
import { JwtTokenService } from '../../src/modules/accounts/infra/security/JwtTokenService';

describe('JWT (unit)', () => {
  const secret = 'test-secret';
  const tokenService = new JwtTokenService(secret, '1h');

  it('should sign and verify token payload', () => {
    const payload: AuthTokenPayload = {
      sub: 'user-123',
      role: 'CUSTOMER',
    };

    const token = tokenService.sign(payload);
    expect(token).toBeDefined();

    const decoded = tokenService.verify(token);
    expect(decoded).toEqual(payload);
  });

  it('should reject expired token', async () => {
    const shortLivedService = new JwtTokenService(secret, '1ms');
    const payload: AuthTokenPayload = {
      sub: 'user-123',
      role: 'CUSTOMER',
    };

    const token = shortLivedService.sign(payload);

    // Wait for token to expire
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(() => shortLivedService.verify(token)).toThrow();
  });

  it('should reject token with wrong secret', () => {
    const payload: AuthTokenPayload = {
      sub: 'user-123',
      role: 'CUSTOMER',
    };

    const token = tokenService.sign(payload);
    const wrongService = new JwtTokenService('wrong-secret');

    expect(() => wrongService.verify(token)).toThrow();
  });
});
