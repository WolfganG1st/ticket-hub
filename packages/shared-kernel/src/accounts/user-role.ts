import { z } from 'zod';

export const userRoleSchema = z.enum(['CUSTOMER', 'ORGANIZER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;
