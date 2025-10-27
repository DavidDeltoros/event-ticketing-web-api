import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { ticketStore } from "./ticket.store";
import { eventStore } from "../event/event.store";
import { HttpError } from "../lib/errors";
import { validateBody } from "../lib/validate";
import { Ticket, BuyTicketSchema, BuyTicketDto} from "./ticket.types";

export const ticketRouter = Router();


// GET /api/events
ticketRouter.get("/", (_req: Request, res: Response) => {
  res.json(ticketStore.list());
});

// GET /api/events/:id
ticketRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const item = ticketStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  res.json(item);
});

ticketRouter.get("/event/:eventId", (req: Request, res: Response) => {
  res.json(ticketStore.get_event_list(req.params.eventId));
});

ticketRouter.get("/buyer/:email", (req: Request, res: Response) => {
  res.json(ticketStore.get_tickets_by_email(req.params.email));
});

// POST /api/tickets
ticketRouter.post(
  "/",
  validateBody(BuyTicketSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const dto = (req as any).data as BuyTicketDto;

    // Business rule: ticket with same name must be unique
    const existing = eventStore.list().find((ev) => ev.id === dto.eventId);
    if (!existing) {
      return next(new HttpError(409, "An Enent with this ID Do not exist"));
    }
    const item = eventStore.get(dto.eventId);
    if (!item) return next(new HttpError(404, "Event not found"));
    if (!item.capacity) return  next(new HttpError(400, "No Capasity for event"));
    if (!item.ticketPrice) return  next(new HttpError(400, "No ticket price for event"));
    const ticket_count = ticketStore.get_event_list(dto.eventId)
    console.log(ticket_count);
    console.log(ticket_count.length);
    if (ticket_count.length >= item.capacity) return next(new HttpError(400, `Event is sold out. All ${item.capacity} tickets have been purchased`));


    const e: Ticket = {
        id: randomUUID(),
        eventId: dto.eventId,
        email: dto.email,
        purchaseDate: new Date(),
        name: item.name,
        date: item.date,
        ticketPrice: item.ticketPrice,
        };

        ticketStore.create(e);

    res.status(201).json(e);
  }
);

ticketRouter.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
 const item = ticketStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  const ok = ticketStore.delete(req.params.id);
  if (!ok) return next(new HttpError(404, "Ticket not found"));
  res.status(204).send();
});
