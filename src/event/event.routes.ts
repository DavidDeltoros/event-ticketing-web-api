import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { eventStore } from "./event.store";
import { HttpError } from "../lib/errors";
import { validateBody } from "../lib/validate";
import { Event, NewEventDTO, NewEventSchema, UpdateEventDTO, UpdateEventSchema } from "./event.types";

export const eventRouter = Router();

// GET /api/events
eventRouter.get("/", (_req: Request, res: Response) => {
  res.json(eventStore.list());
});

// GET /api/events/:id
eventRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const item = eventStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  res.json(item);
});

eventRouter.post("/:id/status/published", (req: Request, res: Response, next: NextFunction) => {
  const item = eventStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  if (item.state == "PUBLISHED") return next(new HttpError(409, "An event already PUBLISHED"));
  if (item.state == "CANCELLED") return next(new HttpError(409, "An event already CANCELLED"));
  if (!item.capacity) return  next(new HttpError(400, "No Capasity for event"));
  if (!item.ticketPrice) return  next(new HttpError(400, "No ticket price for event"));
  // Example logic: mark as published
  eventStore.update(req.params.id, { state: "PUBLISHED" });
  res.json({ message: "Event published successfully", event: item });
});

eventRouter.post("/:id/status/cancelled", (req: Request, res: Response, next: NextFunction) => {
  const item = eventStore.get(req.params.id);
  if (!item) return next(new HttpError(404, "Event not found"));
  if (item.state == "PUBLISHED") return next(new HttpError(409, "An event already PUBLISHED"));
  if (item.state == "CANCELLED") return next(new HttpError(409, "An event already CANCELLED"));
  // Example logic: mark as published
  eventStore.update(req.params.id, { state: "CANCELLED" });
  res.json({ message: "Event cancelled successfully", event: item });
});


// POST /api/events
eventRouter.post(
  "/",
  (req, res, next) => {
    next();
  },
  validateBody(NewEventSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const dto = (req as any).data as NewEventDTO;

    // Business rule: event with same name must be unique
    const existing = eventStore.list().find((ev) => ev.name === dto.name);
    if (existing) {
      return next(new HttpError(409, "An event with this name already exists"));
    }

    const e: Event = {
      id: randomUUID(),
      name: dto.name,
      state: "DRAFT",
      description: dto.description ?? "",
      date: dto.date, // NewEventSchema uses z.date(), so this is a Date
      venue: dto.venue,
      capacity: dto.capacity ?? 0,
      ticketPrice: dto.ticketPrice ?? 0,
      category: dto.category ?? ""
    };

    eventStore.create(e);

    res.status(201).json(e);
  }
);


// POST /api/events/update
eventRouter.post(
  "/update/:id",
  (req, res, next) => {
    next();
  },
  validateBody(UpdateEventSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const dto = (req as any).data as UpdateEventDTO;

    const item = eventStore.get(req.params.id);
    if (!item) return next(new HttpError(404, "Event not found"));
    if (item.state == "PUBLISHED") return next(new HttpError(409, "An event already PUBLISHED"));
    if (item.state == "CANCELLED") return next(new HttpError(409, "An event already CANCELLED"));


    const updated = eventStore.update(req.params.id,dto);

    res.status(201).json(updated);
  }
);


// DELETE /api/events/:id
eventRouter.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  const item = eventStore.get(req.params.id);
    if (!item) return next(new HttpError(404, "Event not found"));
    
  const ok = eventStore.delete(req.params.id);
  if (!ok) return next(new HttpError(404, "Event not found"));
  res.status(204).send();
});
