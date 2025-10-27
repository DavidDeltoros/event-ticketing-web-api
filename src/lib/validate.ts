import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "./errors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      const msg = r.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
      return next(new HttpError(400, msg));
    }
    // attach parsed body for type-safe handlers
    (req as any).data = r.data;
    next();
  };
}