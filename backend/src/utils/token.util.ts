import { randomBytes } from "node:crypto";

export function createPlayerToken(): string {
  return randomBytes(32).toString("hex");
}

export function createPlayerId(): string {
  return randomBytes(16).toString("hex");
}
