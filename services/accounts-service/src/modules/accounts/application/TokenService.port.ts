import type { AuthTokenPayload } from 'shared-kernel';

export interface TokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}
