export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly eventId: string,
    public readonly ticketTypeId: string,
    public readonly quantity: number,
    private _status: OrderStatus,
    public readonly totalPriceInCents: number,
    public readonly createdAt: Date,
  ) {}

  public getStatus(): OrderStatus {
    return this.status;
  }

  public pay(): void {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending orders can be paid');
    }

    this._status = 'PAID';
  }

  public get status(): OrderStatus {
    return this._status;
  }
}
