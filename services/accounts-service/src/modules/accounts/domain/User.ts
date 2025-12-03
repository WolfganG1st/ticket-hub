export type UserRole = 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    private _role: UserRole,
    private _passwordHash: string,
    public readonly createdAt: Date,
  ) {}

  public isOrganizer(): boolean {
    return this._role === 'ORGANIZER';
  }

  public promoteToOrganizer(): void {
    if (this._role === 'ADMIN') {
      throw new Error('Admin cannot be promoted to organizer');
    }
    this._role = 'ORGANIZER';
  }

  public get role(): UserRole {
    return this._role;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public setPasswordHash(hash: string): void {
    this._passwordHash = hash;
  }
}
