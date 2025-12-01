import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../application/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  public async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, 10);
  }

  public async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
