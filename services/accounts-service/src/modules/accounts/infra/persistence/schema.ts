import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userRoleSchema } from 'shared-kernel';
import { z } from 'zod';

const roles = pgEnum('roles', userRoleSchema.enum);
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roles('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRowSchema = createSelectSchema(users, {
  role: () => userRoleSchema,
});

export const newUserRowSchema = createInsertSchema(users, {
  email: z.email(),
  role: () => userRoleSchema,
});

export type UserRow = z.infer<typeof userRowSchema>;
export type NewUserRow = z.infer<typeof newUserRowSchema>;
