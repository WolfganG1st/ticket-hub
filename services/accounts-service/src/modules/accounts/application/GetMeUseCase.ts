import { NotFoundError, type UserRole } from 'shared-kernel';
import type { UserRepository } from '../domain/UserRepository.port';
import type { TokenService } from './TokenService.port';

type GetMeInput = {
  token: string;
};

type GetMeOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export class GetMeUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(input: GetMeInput): Promise<GetMeOutput> {
    const payload = this.tokenService.verify(input.token);

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
