import { Event } from "./event.types";

// In-memory store (simple repository)
class EventStore {
  private data = new Map<string, Event>();

  list(): Event[] {
    return Array.from(this.data.values());
  }

  get(id: string): Event | undefined {
    return this.data.get(id);
  }

  create(e: Event): Event {
    this.data.set(e.id, e);
    return e;
  }

  update(id: string, patch: Partial<Event>): Event | undefined {
    const current = this.data.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...patch, id };
    this.data.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }
}

export const eventStore = new EventStore();
