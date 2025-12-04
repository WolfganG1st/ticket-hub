import { ValidationError } from 'shared-kernel';
import { InsufficientStockError } from './errors/InsufficientStockError';

export class Event {
  constructor(
    public readonly id: string,
    public readonly organizerId: string,
    public title: string,
    public description: string | null,
    public venue: string,
    public startsAt: Date,
    public endsAt: Date,
    public readonly createdAt: Date,
  ) {}
}

export class TicketType {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public name: string,
    public priceInCents: number,
    public totalQuantity: number,
    public remainingQuantity: number,
    public readonly createdAt: Date,
  ) {}

  public reserve(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    if (this.remainingQuantity < quantity) {
      throw new InsufficientStockError(quantity, this.remainingQuantity);
    }

    this.remainingQuantity -= quantity;
  }
}
