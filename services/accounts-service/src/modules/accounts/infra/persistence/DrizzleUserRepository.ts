import { eq } from 'drizzle-orm';
import { User } from '../../domain/User';
import type { UserRepository } from '../../domain/UserRepository';
import type { Db } from './db';
import { newUserRowSchema, userRowSchema, users } from './schema';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly database: Db) {}

  public async findById(id: string): Promise<User | null> {
    const row = await this.database.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!row) {
      return null;
    }

    const parsed = userRowSchema.parse(row);

    return new User(parsed.id, parsed.name, parsed.email, parsed.role, parsed.passwordHash, parsed.createdAt);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const row = await this.database.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!row) {
      return null;
    }

    const parsed = userRowSchema.parse(row);

    return new User(parsed.id, parsed.name, parsed.email, parsed.role, parsed.passwordHash, parsed.createdAt);
  }

  public async save(user: User): Promise<void> {
    const payload = newUserRowSchema.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });

    await this.database
      .insert(users)
      .values(payload)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          passwordHash: payload.passwordHash,
        },
      });
  }
}
