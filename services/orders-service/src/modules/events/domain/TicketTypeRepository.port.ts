import type { TicketType } from './Event';

export interface TicketTypeRepository {
  findById(id: string): Promise<TicketType | null>;
  findByEventId(id: string): Promise<TicketType[]>;
  save(ticketType: TicketType): Promise<void>;
  reserveAtomically(id: string, quantity: number): Promise<TicketType>;
}
