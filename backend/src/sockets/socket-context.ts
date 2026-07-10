import type { Server, Socket } from "socket.io";
import type { ZodType } from "zod";
import { logger } from "../config/logger.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { AppError } from "../services/session.service.js";
import type { SocketAck } from "../types/socket.types.js";

export interface SocketContext {
  io: Server;
  socket: Socket;
}

export function okAck<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}

export function errorAck(code: string, message: string): {
  ok: false;
  error: { code: string; message: string };
} {
  return { ok: false, error: { code, message } };
}

/** Sends error acks only; accepts any typed ack callback. */
export function handleAckError(error: unknown, ack?: unknown): void {
  const respond =
    typeof ack === "function"
      ? (ack as (response: SocketAck) => void)
      : undefined;

  if (error instanceof AppError) {
    respond?.(errorAck(error.code, error.message));
    return;
  }
  logger.error({ err: error }, "Unhandled socket error");
  respond?.(errorAck(ERROR_CODES.INTERNAL_ERROR, "Internal server error"));
}

export function parsePayload<T>(schema: ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid payload");
  }
  return result.data;
}
