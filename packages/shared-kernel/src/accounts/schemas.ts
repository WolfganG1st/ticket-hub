import { z } from 'zod';

export const signupRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
