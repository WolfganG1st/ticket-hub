export type OrdersEvent = {
  id: string;
  title: string;
  description: string | null;
  organizerId: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type OrdersOrder = {
  id: string;
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  totalPriceInCents: number;
  createdAt: string;
};

type CreateEventInput = {
  organizerId: string;
  title: string;
  description?: string | null;
  venue: string;
  startsAt: string;
  endsAt: string;
  ticketTypes: {
    name: string;
    priceInCents: number;
    totalQuantity: number;
  }[];
  idempotencyKey?: string | null;
};

type CreateEventResponse = {
  eventId: string;
};

type CreateOrderInput = {
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  idempotencyKey?: string | null;
};

type CreateOrderResponse = {
  orderId: string;
  totalPriceInCents: number;
};

type PayOrderResponse = {
  id: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
};

export class OrdersApi {
  constructor(private readonly baseUrl: string) {}

  public async listEvents(organizerId?: string): Promise<OrdersEvent[]> {
    const url = new URL(`${this.baseUrl}/api/v1/events`);

    if (organizerId) {
      url.searchParams.set('organizerId', organizerId);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Order /events failed with status ${response.status}`);
    }
    const data = (await response.json()) as OrdersEvent[];
    return data;
  }

  public async getEventById(id: string): Promise<OrdersEvent | null> {
    const response = await fetch(`${this.baseUrl}/api/v1/events/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Orders /events/${id} failed with status ${response.status}`);
    }

    const data = (await response.json()) as OrdersEvent;
    return data;
  }

  public async createEvent(input: CreateEventInput): Promise<CreateEventResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Orders POST /events failed with status ${response.status}`);
    }

    const data = (await response.json()) as CreateEventResponse;
    return data;
  }

  public async createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    const { idempotencyKey, ...body } = input;

    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };

    if (idempotencyKey) {
      headers['x-idempotency-key'] = idempotencyKey;
    }
    const response = await fetch(`${this.baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Orders POST /orders failed with status ${response.status}`);
    }

    const data = (await response.json()) as CreateOrderResponse;
    return data;
  }

  public async payOrder(id: string): Promise<PayOrderResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/orders/${id}/pay`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Orders POST /orders/${id}/pay failed with status ${response.status}`);
    }

    const data = (await response.json()) as PayOrderResponse;
    return data;
  }

  public async listOrdersByCustomer(customerId: string): Promise<OrdersOrder[]> {
    const url = new URL(`${this.baseUrl}/api/v1/orders`);
    url.searchParams.set('customerId', customerId);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Orders GET /orders failed with status ${response.status}`);
    }

    const data = (await response.json()) as OrdersOrder[];
    return data;
  }
}
