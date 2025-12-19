import { NotFoundError } from 'shared-kernel';
import type { UserRepository } from '../domain/UserRepository.port';

type GetUserByIdInput = {
  userId: string;
};

type GetUserByIdOutput = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const user = await this.userRepository.findById(input.userId);

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
