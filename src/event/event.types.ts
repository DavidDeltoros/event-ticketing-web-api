import { z } from "zod";

// Domain model (what we store/return)
export type Event = {
  id: string;
  name: string;
  state:string;
  description?: string;
  date: Date;
  venue: string;
  capacity?: number;
  ticketPrice?: number;
  category?: string; // e.g. "Music", "Sports", "Conference"
};

// DTOs & validation
export const NewEventSchema = z.object({
  name: z.string().min(1, { message: "name must have at least 1 character" }),
  description: z.string().optional(),
  date: z.coerce.date(),
  venue: z.string().min(1, { message: "venue must have at least 1 character" }),
  capacity: z.number().int().min(0).optional(),
  ticketPrice: z.number().nonnegative().optional(),
  category: z.string().optional()
});

export type NewEventDTO = z.infer<typeof NewEventSchema>;

// Partial schema for updates (PATCH-like)
export const UpdateEventSchema = NewEventSchema.partial();
export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;
