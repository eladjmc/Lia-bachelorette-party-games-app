import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../constants/socket-events.constants.js";
import { ERROR_CODES } from "../../constants/error-codes.constants.js";
import { advancePassTheParcel } from "../../services/games/pass-the-parcel.service.js";
import { advanceTrivia } from "../../services/games/trivia.service.js";
import { advanceTruthOrDare } from "../../services/games/truth-or-dare.service.js";
import {
  beginGameCountdown,
  clearGameCountdown,
} from "../../services/game-countdown.service.js";
import { clearGraceTimer } from "../../services/reconnect.service.js";
import {
  AppError,
  clearSessionKeepingHost,
  getSession,
  requireHostByToken,
  resetSessionToLobby,
} from "../../services/session.service.js";
import { hostActionSchema, startGameSchema } from "../../validation/host.schemas.js";
import type { AckCallback } from "../../types/socket.types.js";
import { handleAckError, okAck, parsePayload } from "../socket-context.js";
import { broadcastSessionState, emitToAll, getIo } from "../socket-server.js";

export function registerHostHandlers(_io: Server, socket: Socket): void {
  socket.on(
    SOCKET_EVENTS.HOST_START_GAME,
    (payload: unknown, ack?: AckCallback<{ started: boolean }>) => {
      try {
        const data = parsePayload(startGameSchema, payload);
        requireHostByToken(data.playerToken);

        beginGameCountdown(data.gameType);

        const countdown = getSession().gameCountdown;
        ack?.(okAck({ started: true }));
        broadcastSessionState();
        if (countdown) {
          emitToAll(SOCKET_EVENTS.GAME_COUNTDOWN, countdown);
        }
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.HOST_ADVANCE,
    (payload: unknown, ack?: AckCallback<{ advanced: boolean }>) => {
      try {
        const data = parsePayload(hostActionSchema, payload);
        requireHostByToken(data.playerToken);

        const session = getSession();
        if (!session.activeGame) {
          throw new AppError(ERROR_CODES.NO_ACTIVE_GAME, "No active game");
        }
        if (session.phase === "paused_no_host") {
          throw new AppError(ERROR_CODES.HOST_REQUIRED, "Session is paused");
        }

        if (session.activeGame.type === "trivia") {
          advanceTrivia();
        } else if (session.activeGame.type === "pass_the_parcel") {
          advancePassTheParcel();
        } else if (session.activeGame.type === "truth_or_dare") {
          advanceTruthOrDare();
        }

        const after = getSession();
        ack?.(okAck({ advanced: true }));
        broadcastSessionState();
        emitToAll(SOCKET_EVENTS.GAME_TRANSITION);

        if (after.activeGame && "phase" in after.activeGame && after.activeGame.phase === "completed") {
          emitToAll(SOCKET_EVENTS.GAME_COMPLETED);
        }
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.HOST_END_GAME,
    (payload: unknown, ack?: AckCallback<{ ended: boolean }>) => {
      try {
        const data = parsePayload(hostActionSchema, payload);
        requireHostByToken(data.playerToken);

        const session = getSession();
        if (!session.activeGame && !session.gameCountdown) {
          throw new AppError(ERROR_CODES.NO_ACTIVE_GAME, "No active game");
        }

        clearGameCountdown();
        resetSessionToLobby();
        ack?.(okAck({ ended: true }));
        broadcastSessionState();
        emitToAll(SOCKET_EVENTS.GAME_ENDED);
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.HOST_RESET_SESSION,
    (payload: unknown, ack?: AckCallback<{ reset: boolean }>) => {
      try {
        const data = parsePayload(hostActionSchema, payload);
        const host = requireHostByToken(data.playerToken);

        clearGameCountdown();
        const removedPlayers = clearSessionKeepingHost(host.id);
        for (const player of removedPlayers) {
          clearGraceTimer(player.id);
        }

        const io = getIo();
        for (const player of removedPlayers) {
          if (!player.socketId || !io) {
            continue;
          }
          io.to(player.socketId).emit(SOCKET_EVENTS.SESSION_RESET);
        }

        ack?.(okAck({ reset: true }));
        broadcastSessionState();
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );
}
