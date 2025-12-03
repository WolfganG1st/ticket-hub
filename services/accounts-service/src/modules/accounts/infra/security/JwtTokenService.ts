import jwt from 'jsonwebtoken';
import { type AuthTokenPayload, authTokenPayloadSchema } from 'shared-kernel';
import type { TokenService } from '../../application/TokenService';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: jwt.SignOptions['expiresIn'] = '1h',
  ) {}

  public async sign(payload: AuthTokenPayload): Promise<string> {
    return await jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  public async verify(token: string): Promise<AuthTokenPayload> {
    const decoded = await jwt.verify(token, this.secret);
    return authTokenPayloadSchema.parse(decoded);
  }
}
