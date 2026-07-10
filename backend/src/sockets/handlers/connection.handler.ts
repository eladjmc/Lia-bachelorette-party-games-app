import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../constants/socket-events.constants.js";
import { handleSocketDisconnect } from "../../services/reconnect.service.js";
import { getSession } from "../../services/session.service.js";
import { broadcastSessionState, emitToAll } from "../socket-server.js";

export function registerConnectionHandlers(_io: Server, socket: Socket): void {
  socket.on("disconnect", () => {
    const sessionBefore = getSession();
    const wasPlaying = sessionBefore.phase === "playing";

    handleSocketDisconnect(socket.id, () => {
      const session = getSession();
      broadcastSessionState();

      if (wasPlaying && session.phase === "paused_no_host") {
        emitToAll(SOCKET_EVENTS.SESSION_PAUSED, {
          reason: "host_disconnected",
        });
      }
    });
  });
}
