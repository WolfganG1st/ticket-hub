import { z } from 'zod';
import { userRoleSchema } from '../accounts/user-role';

export const authTokenPayloadSchema = z.object({
  sub: z.uuidv7(),
  role: userRoleSchema,
});

export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;
