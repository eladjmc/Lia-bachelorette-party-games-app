import type { Request, Response } from "express";
import { getConnectedPlayerCount, getSession } from "../services/session.service.js";
import { getIo } from "../sockets/socket-server.js";

export function healthController(_req: Request, res: Response): void {
  const session = getSession();

  res.json({
    status: "ok",
    socket: getIo() ? "ready" : "not_ready",
    session: {
      phase: session.phase,
      connectedPlayers: getConnectedPlayerCount(),
    },
  });
}
