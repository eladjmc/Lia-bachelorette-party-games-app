import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../constants/socket-events.constants.js";
import { submitTriviaAnswer } from "../../services/games/trivia.service.js";
import { getSession, requirePlayerByToken } from "../../services/session.service.js";
import { submitAnswerSchema } from "../../validation/trivia.schemas.js";
import type { AckCallback } from "../../types/socket.types.js";
import { handleAckError, okAck, parsePayload } from "../socket-context.js";
import { broadcastSessionState, emitToAll } from "../socket-server.js";

export function registerTriviaHandlers(_io: Server, socket: Socket): void {
  socket.on(
    SOCKET_EVENTS.TRIVIA_SUBMIT_ANSWER,
    (payload: unknown, ack?: AckCallback<{ submitted: boolean }>) => {
      try {
        const data = parsePayload(submitAnswerSchema, payload);
        const player = requirePlayerByToken(data.playerToken);
        const session = getSession();
        const isHost =
          player.role === "host" && session.hostPlayerId === player.id;

        const { autoRevealed } = submitTriviaAnswer({
          playerId: player.id,
          optionId: data.optionId,
          isHost,
        });

        ack?.(okAck({ submitted: true }));
        broadcastSessionState();
        socket.emit(SOCKET_EVENTS.TRIVIA_ANSWER_RECEIVED, { ok: true });

        if (autoRevealed) {
          emitToAll(SOCKET_EVENTS.TRIVIA_QUESTION_REVEALED);
          emitToAll(SOCKET_EVENTS.GAME_TRANSITION);
        }
      } catch (error) {
        handleAckError(error, ack);
      }
    },
  );
}
