import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { eventRouter } from "./event/event.routes";
import { ticketRouter } from "./ticket/ticket.routes";
import { errorHandler } from "./lib/errors";

export function buildApp() {
  const app = express();

  // Middlewares (similar to .NET pipeline)
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // Routes
  app.use("/api/event", eventRouter);
  app.use("/api/ticket", ticketRouter);
 
  // Health
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}