import { ValidationError } from 'shared-kernel';

export class PasswordPolicy {
  public static validate(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter) {
      throw new ValidationError('Password must contain at least one letter and one number');
    }
  }
}
