import { ConflictError } from 'shared-kernel';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../domain/User';
import type { UserRepository } from '../domain/UserRepository.port';
import type { PasswordHasher } from './PasswordHasher.port';

type SignupInput = {
  email: string;
  name: string;
  passwordPlain: string;
};

export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(input: SignupInput): Promise<{ userId: string }> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictError('User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.passwordPlain);

    const user = new User(uuidv7(), input.name, input.email, 'CUSTOMER', passwordHash, new Date());

    await this.userRepository.save(user);
    return { userId: user.id };
  }
}
