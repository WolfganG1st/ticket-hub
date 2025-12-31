import { NotFoundError, UnauthorizedError, UnexpectedError } from 'shared-kernel';

export type AccountUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
};

export class AccountsApi {
  constructor(private readonly baseUrl: string) {}

  public async me(token: string | null): Promise<AccountUser | null> {
    if (!token) {
      return null;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    if (response.status === 404) {
      throw new NotFoundError('User not found');
    }

    if (!response.ok) {
      throw new UnexpectedError(`Accounts /me failed with status ${response.status}`);
    }

    const data = (await response.json()) as AccountUser;
    return data;
  }
}
