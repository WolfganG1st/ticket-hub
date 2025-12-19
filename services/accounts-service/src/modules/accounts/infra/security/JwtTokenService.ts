import jwt from 'jsonwebtoken';
import { type AuthTokenPayload, authTokenPayloadSchema } from 'shared-kernel';
import type { TokenService } from '../../application/TokenService.port';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: jwt.SignOptions['expiresIn'] = '1h',
  ) {}

  public sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  public verify(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, this.secret);
    return authTokenPayloadSchema.parse(decoded);
  }
}
