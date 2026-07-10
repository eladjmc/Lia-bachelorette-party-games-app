import type { ErrorCode } from "../constants/error-codes.constants.js";

export interface SocketAck<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: ErrorCode | string;
    message: string;
  };
}

export type AckCallback<T = unknown> = (response: SocketAck<T>) => void;
