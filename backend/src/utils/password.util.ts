import { safeCompare } from "./random.util.js";

export function verifyHostPassword(provided: string, expected: string): boolean {
  return safeCompare(provided, expected);
}
