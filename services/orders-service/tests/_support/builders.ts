import type { AccountsClient } from '../../src/infra/accounts/AccountsClient.port';

let accountsUserRole: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN' = 'CUSTOMER';
let accountsUserExists = true;

export function setAccountsUser(input: { exists?: boolean; role?: typeof accountsUserRole }): void {
  accountsUserExists = input.exists ?? true;
  accountsUserRole = input.role ?? accountsUserRole;
}

export function makeAccountsClient(): AccountsClient {
  return {
    async getUserById(userId: string) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      return accountsUserExists ? { id: userId, name: 'Test', email: 'test@test.com', role: accountsUserRole } : null;
    },
  };
}
