import { z } from "zod";

export type Ticket = {
  id: string;
  eventId: string;
  email: string;
  purchaseDate: Date;
  name: string;
  date: Date;
  ticketPrice: number;
};

export const BuyTicketSchema = z.object({
  eventId: z.string().min(1, { message: "eventId must have at least 1 character" }),
  email: z.string().email({ message: "Invalid email address" })
});

export type BuyTicketDto = z.infer<typeof BuyTicketSchema>;