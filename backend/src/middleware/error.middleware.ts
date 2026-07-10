import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { AppError } from "../services/session.service.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(400).json({
      ok: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error({ err }, "Unhandled HTTP error");
  res.status(500).json({
    ok: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: env.NODE_ENV === "production" ? "Internal server error" : String(err),
    },
  });
}
