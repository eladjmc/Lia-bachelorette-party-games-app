import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { healthRouter } from "./routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));

  app.use(healthRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
