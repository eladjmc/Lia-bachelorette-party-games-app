import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createSocketServer } from "./sockets/socket-server.js";

async function main(): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: false,
    },
  });

  createSocketServer(io);

  server.listen(env.PORT, () => {
    logger.info(`Backend listening on port ${env.PORT}`);
  });
}

main().catch((error) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
