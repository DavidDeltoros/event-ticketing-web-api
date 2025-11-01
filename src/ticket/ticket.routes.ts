import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { ticketStore } from "./ticket.store";
import { eventStore } from "../event/event.store";
import { HttpError } from "../lib/errors";
import { validateBody } from "../lib/validate";
import { Ticket, BuyTicketSchema, BuyTicketDto} from "./ticket.types";

export const ticketRouter = Router();

function get_ticket_price(sold_events: number, initial_price: number, bulk: number){
  let price = initial_price;
  let additional_discount = 1;

  if ((bulk >=3) && (bulk<=5)){ 
    additional_discount = 0.9;
  }
  if ((bulk >=6) && (bulk<=10)){ 
    additional_discount = 0.85;
  }
      // discount logic
      if (sold_events <= 5) {
        price = initial_price * 0.4; // 60% off → pay 40%
      } else if (sold_events <= 15) {
        price = initial_price * 0.7; // 30% off → pay 70%
      }      
      return price * additional_discount;
}

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
    if (item.state == "DRAFT") return next(new HttpError(404, "Event not published"));
    if (item.state == "CANCELLED") return next(new HttpError(404, "Event canceleed"));
    if (!item.capacity) return  next(new HttpError(400, "No Capasity for event"));
    if (!item.ticketPrice) return  next(new HttpError(400, "No ticket price for event"));
    const ticket_count = ticketStore.get_event_list(dto.eventId)
    if (ticket_count.length  >= item.capacity) return next(new HttpError(400, `Event is sold out. All ${item.capacity} tickets have been purchased`));
    if (ticket_count.length + dto.amount > item.capacity) return next(new HttpError(400, `You trying to buy more tickets that curently availaible`));

    const created: Ticket[] = [];

    for (let i = 0; i < dto.amount; i++) {
      const e: Ticket = {
        id: randomUUID(),
        eventId: dto.eventId,
        email: dto.email,
        purchaseDate: new Date(),
        name: item.name,
        date: item.date,
        ticketPrice: get_ticket_price(ticket_count.length,item.ticketPrice, dto.amount),
      };
      ticketStore.create(e);
      created.push(e);
    }
    res.status(201).json({ tickets: created });
  }
);

ticketRouter.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
 const item = ticketStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  const ok = ticketStore.delete(req.params.id);
  if (!ok) return next(new HttpError(404, "Ticket not found"));
  res.status(204).send();
});
