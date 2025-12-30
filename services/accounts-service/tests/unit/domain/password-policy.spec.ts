import { describe, expect, it } from 'vitest';
import { PasswordPolicy } from '../../../src/modules/accounts/domain/PasswordPolicy';

describe('Password Policy (unit)', () => {
  it('should accept valid password', () => {
    expect(() => PasswordPolicy.validate('Password123')).not.toThrow();
    expect(() => PasswordPolicy.validate('StrongerPass789')).not.toThrow();
  });

  it('should reject invalid password per policy', () => {
    // Too short
    expect(() => PasswordPolicy.validate('Short1')).toThrow('Password must be at least 8 characters long');

    // No number
    expect(() => PasswordPolicy.validate('NoNumberPass')).toThrow(
      'Password must contain at least one letter and one number',
    );

    // No letter
    expect(() => PasswordPolicy.validate('123456789')).toThrow(
      'Password must contain at least one letter and one number',
    );
  });
});
