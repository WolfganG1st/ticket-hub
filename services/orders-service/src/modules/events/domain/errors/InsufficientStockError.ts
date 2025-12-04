import { AppError } from 'shared-kernel';

export class InsufficientStockError extends AppError {
  constructor(
    public readonly requested: number,
    public readonly remaining: number,
  ) {
    super(`Cannot reserve ${requested} tickets. Only ${remaining} remaining.`, 'INSUFFICIENT_STOCK');
  }
}
