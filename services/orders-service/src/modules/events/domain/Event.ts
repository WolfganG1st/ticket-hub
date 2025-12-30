import { applyReservation } from './ticket-type-rules';

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
    this.remainingQuantity = applyReservation(this.remainingQuantity, quantity);
  }
}
