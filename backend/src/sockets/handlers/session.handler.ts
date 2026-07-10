import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../constants/socket-events.constants.js";
import { joinAsHost } from "../../services/host.service.js";
import { createPlayer } from "../../services/player.service.js";
import { leaveByToken, reconnectPlayer } from "../../services/reconnect.service.js";
import { getSession } from "../../services/session.service.js";
import {
  joinGuestSchema,
  joinHostSchema,
  leaveSchema,
  reconnectSchema,
} from "../../validation/session.schemas.js";
import { serializeSessionForPlayer } from "../serializers/session.serializer.js";
import { handleAckError, okAck, parsePayload } from "../socket-context.js";
import { broadcastSessionState, emitToAll } from "../socket-server.js";
import type { AckCallback } from "../../types/socket.types.js";
import type { JoinSuccessData } from "../../types/dto.types.js";

export function registerSessionHandlers(_io: Server, socket: Socket): void {
  socket.on(
    SOCKET_EVENTS.SESSION_JOIN_GUEST,
    (payload: unknown, ack?: AckCallback<JoinSuccessData>) => {
      try {
        const data = parsePayload(joinGuestSchema, payload);
        const player = createPlayer({
          displayName: data.displayName,
          avatarId: data.avatarId,
          role: "guest",
          socketId: socket.id,
        });
        const session = getSession();
        const publicSession = serializeSessionForPlayer(session, player.id);
        ack?.(
          okAck({
            playerId: player.id,
            playerToken: player.token,
            session: publicSession,
          }),
        );
        broadcastSessionState();
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.SESSION_JOIN_HOST,
    (payload: unknown, ack?: AckCallback<JoinSuccessData>) => {
      try {
        const data = parsePayload(joinHostSchema, payload);
        const wasPaused = getSession().phase === "paused_no_host";
        const player = joinAsHost({
          displayName: data.displayName,
          avatarId: data.avatarId,
          password: data.password,
          socketId: socket.id,
        });
        const session = getSession();
        const publicSession = serializeSessionForPlayer(session, player.id);
        ack?.(
          okAck({
            playerId: player.id,
            playerToken: player.token,
            session: publicSession,
          }),
        );
        broadcastSessionState();
        if (wasPaused && session.phase === "playing") {
          emitToAll(SOCKET_EVENTS.SESSION_RESUMED);
        }
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.SESSION_RECONNECT,
    (payload: unknown, ack?: AckCallback<JoinSuccessData>) => {
      try {
        const data = parsePayload(reconnectSchema, payload);
        const wasPaused = getSession().phase === "paused_no_host";
        const player = reconnectPlayer(data.playerToken, socket.id);
        const session = getSession();
        ack?.(
          okAck({
            playerId: player.id,
            playerToken: player.token,
            session: serializeSessionForPlayer(session, player.id),
          }),
        );
        broadcastSessionState();
        if (wasPaused && session.phase === "playing") {
          emitToAll(SOCKET_EVENTS.SESSION_RESUMED);
        }
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.SESSION_LEAVE,
    (payload: unknown, ack?: AckCallback<{ left: boolean }>) => {
      try {
        const data = parsePayload(leaveSchema, payload);
        leaveByToken(data.playerToken);
        ack?.(okAck({ left: true }));
        broadcastSessionState();
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  // Allow clients to request current public taken avatars before joining
  socket.on(
    SOCKET_EVENTS.SESSION_PEEK,
    (_payload: unknown, ack?: AckCallback<{ takenAvatarIds: string[] }>) => {
      try {
        const session = getSession();
        ack?.(
          okAck({
            takenAvatarIds: session.players.map((p) => p.avatarId),
          }),
        );
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.emit(
    SOCKET_EVENTS.SESSION_STATE,
    serializeSessionForPlayer(getSession(), null),
  );
}
