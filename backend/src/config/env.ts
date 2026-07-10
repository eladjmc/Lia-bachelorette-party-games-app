import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST_PASSWORD: z.string().min(1),
  CORS_ORIGIN: z.string().default("*"),
  MAX_PLAYERS: z.coerce.number().int().positive().default(12),
  PLAYER_DISCONNECT_GRACE_MS: z.coerce.number().int().positive().default(180_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
