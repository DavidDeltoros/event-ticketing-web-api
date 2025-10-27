import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { eventStore } from "./event.store";
import { HttpError } from "../lib/errors";
import { validateBody } from "../lib/validate";
import { Event, NewEventDTO, NewEventSchema } from "./event.types";

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

// POST /api/events
eventRouter.post(
  "/",
  (req, res, next) => {
    console.log("I'm here :)");
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

// DELETE /api/events/:id
eventRouter.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  const item = eventStore.get(req.params.id);
    if (!item) return next(new HttpError(404, "Event not found"));
    
  const ok = eventStore.delete(req.params.id);
  if (!ok) return next(new HttpError(404, "Event not found"));
  res.status(204).send();
});
