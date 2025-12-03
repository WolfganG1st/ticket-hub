import { z } from 'zod';

export const orderStatusSchema = z.enum(['PENDING', 'PAID', 'CANCELLED']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;
