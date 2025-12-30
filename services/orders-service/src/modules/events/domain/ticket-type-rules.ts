import { ValidationError } from 'shared-kernel';
import { InsufficientStockError } from './errors/InsufficientStockError';

export function applyReservation(remaining: number, quantity: number): number {
  if (quantity <= 0) {
    throw new ValidationError('Quantity must be greater than 0');
  }
  if (remaining < quantity) {
    throw new InsufficientStockError(quantity, remaining);
  }
  return remaining - quantity;
}
