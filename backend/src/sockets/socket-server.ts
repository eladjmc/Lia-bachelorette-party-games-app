import type { Server } from "socket.io";
import { GLOBAL_ROOM } from "../constants/app.constants.js";
import { SOCKET_EVENTS } from "../constants/socket-events.constants.js";
import { setCountdownFinishedCallback } from "../services/game-countdown.service.js";
import { getSession } from "../services/session.service.js";
import { serializeSessionForPlayer } from "./serializers/session.serializer.js";
import { registerConnectionHandlers } from "./handlers/connection.handler.js";
import { registerSessionHandlers } from "./handlers/session.handler.js";
import { registerHostHandlers } from "./handlers/host.handler.js";
import { registerTriviaHandlers } from "./handlers/trivia.handler.js";
import { setPassTheParcelSpinCallback } from "../services/games/pass-the-parcel.service.js";
import { setTruthOrDareSpinCallback } from "../services/games/truth-or-dare.service.js";

let ioRef: Server | null = null;

export function getIo(): Server | null {
  return ioRef;
}

export function broadcastSessionState(viewerOverrides?: Map<string, string>): void {
  const io = ioRef;
  if (!io) {
    return;
  }

  const session = getSession();
  const emittedSocketIds = new Set<string>();

  for (const player of session.players) {
    if (!player.socketId || player.connectionStatus !== "connected") {
      continue;
    }
    const socket = io.sockets.sockets.get(player.socketId);
    if (!socket) {
      continue;
    }
    const viewerId = viewerOverrides?.get(player.id) ?? player.id;
    socket.emit(SOCKET_EVENTS.SESSION_STATE, serializeSessionForPlayer(session, viewerId));
    emittedSocketIds.add(player.socketId);
  }

  // Entry-screen clients (not yet joined) still need takenAvatarIds updates
  const publicState = serializeSessionForPlayer(session, null);
  for (const socket of io.sockets.sockets.values()) {
    if (emittedSocketIds.has(socket.id)) {
      continue;
    }
    socket.emit(SOCKET_EVENTS.SESSION_STATE, publicState);
  }
}

export function emitToAll(event: string, payload?: unknown): void {
  ioRef?.to(GLOBAL_ROOM).emit(event, payload);
}

export function createSocketServer(io: Server): void {
  ioRef = io;

  setCountdownFinishedCallback(() => {
    const session = getSession();
    broadcastSessionState();
    if (session.activeGame) {
      emitToAll(SOCKET_EVENTS.GAME_STARTED, { gameType: session.activeGame.type });
    }
  });

  setPassTheParcelSpinCallback(() => {
    broadcastSessionState();
    emitToAll(SOCKET_EVENTS.GAME_TRANSITION);
  });

  setTruthOrDareSpinCallback(() => {
    broadcastSessionState();
    emitToAll(SOCKET_EVENTS.GAME_TRANSITION);
  });

  io.on("connection", (socket) => {
    socket.join(GLOBAL_ROOM);
    registerConnectionHandlers(io, socket);
    registerSessionHandlers(io, socket);
    registerHostHandlers(io, socket);
    registerTriviaHandlers(io, socket);
  });
}
