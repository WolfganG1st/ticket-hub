import { type AuthTokenPayload, UnauthorizedError } from 'shared-kernel';
import type { UserRepository } from '../domain/UserRepository.port';
import type { PasswordHasher } from './PasswordHasher.port';
import type { TokenService } from './TokenService.port';

type LoginInput = {
  email: string;
  passwordPlain: string;
};

type LoginOutput = {
  accessToken: string;
};

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  public async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await this.passwordHasher.compare(input.passwordPlain, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.tokenService.sign(payload);

    return { accessToken };
  }
}
