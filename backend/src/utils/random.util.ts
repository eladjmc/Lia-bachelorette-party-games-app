import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function generateId(): string {
  return randomBytes(16).toString("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function randomIntInclusive(min: number, max: number): number {
  return randomInt(min, max + 1);
}

export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  return items[randomIntInclusive(0, items.length - 1)] as T;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomIntInclusive(0, i);
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
