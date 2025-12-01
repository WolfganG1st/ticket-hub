export type UserRole = 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    private role: UserRole,
    private passwordHash: string,
    public readonly createdAt: Date,
  ) {}

  public isOrganizer(): boolean {
    return this.role === 'ORGANIZER';
  }

  public promoteToOrganizer(): void {
    if (this.role === 'ADMIN') {
      throw new Error('Admin cannot be promoted to organizer');
    }
    this.role = 'ORGANIZER';
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public setPasswordHash(hash: string): void {
    this.passwordHash = hash;
  }
}
