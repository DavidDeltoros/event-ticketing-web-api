import { Ticket } from "./ticket.types";
import { eventStore } from "../event/event.store";
import { HttpError } from "../lib/errors";

// In-memory store (simple repository)
class TicketStore {
    private data_ticket = new Map<string, Ticket>();

    list(): Ticket[] {
        return Array.from(this.data_ticket.values());
    }

    get(id: string): Ticket | undefined {
        return this.data_ticket.get(id);
    }


    get_event_list(eventId: string) {
    const eventExists = eventStore.get(eventId);
    if (!eventExists) {
        throw new HttpError(404, "Event not found");
    }

    const tickets = Array.from(this.data_ticket.values()).filter(
        (ticket) => ticket.eventId === eventId
    );

    return tickets;
    }


    get_tickets_by_email(email: string) {
    const tickets = Array.from(this.data_ticket.values()).filter(
        (ticket) => ticket.email === email
    );

    return tickets;
    }

    create(e: Ticket): Ticket {
        this.data_ticket.set(e.id, e);
        return e;
    }

    update(id: string, patch: Partial<Ticket>): Ticket | undefined {
        const current = this.data_ticket.get(id);
        if (!current) return undefined;
        const updated = { ...current, ...patch, id };
        this.data_ticket.set(id, updated);
        return updated;
    }

    delete(id: string): boolean {
        return this.data_ticket.delete(id);
    }
}

export const ticketStore = new TicketStore();
