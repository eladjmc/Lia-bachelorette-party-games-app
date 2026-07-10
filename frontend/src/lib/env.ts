import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000"),
  VITE_SOCKET_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
});

export const env = parsed.success
  ? parsed.data
  : {
      VITE_API_URL: "http://localhost:3000",
      VITE_SOCKET_URL: "http://localhost:3000",
    };
