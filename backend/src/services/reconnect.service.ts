import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import type { InternalPlayer } from "../types/player.types.js";
import { nowMs } from "../utils/time.util.js";
import { pauseForMissingHost, resumeAfterHostAvailable } from "./host.service.js";
import { markPlayerConnected, markPlayerDisconnected } from "./player.service.js";
import {
  AppError,
  findPlayerByToken,
  getConnectedHost,
  getSession,
  removePlayer,
  requirePlayerByToken,
} from "./session.service.js";

const graceTimers = new Map<string, NodeJS.Timeout>();

export function clearGraceTimer(playerId: string): void {
  const timer = graceTimers.get(playerId);
  if (timer) {
    clearTimeout(timer);
    graceTimers.delete(playerId);
  }
}

export function clearAllGraceTimers(): void {
  for (const timer of graceTimers.values()) {
    clearTimeout(timer);
  }
  graceTimers.clear();
}

export function scheduleGraceRemoval(playerId: string, onRemoved: () => void): void {
  clearGraceTimer(playerId);
  const timer = setTimeout(() => {
    graceTimers.delete(playerId);
    const session = getSession();
    const player = session.players.find((p) => p.id === playerId);
    if (!player || player.connectionStatus === "connected") {
      return;
    }

    const wasHost = session.hostPlayerId === playerId;
    removePlayer(playerId);

    if (wasHost && !getConnectedHost()) {
      pauseForMissingHost();
    }

    onRemoved();
  }, env.PLAYER_DISCONNECT_GRACE_MS);

  graceTimers.set(playerId, timer);
}

export function handleSocketDisconnect(
  socketId: string,
  onStateChange: () => void,
): void {
  const session = getSession();
  const player = session.players.find((p) => p.socketId === socketId);
  if (!player) {
    return;
  }

  markPlayerDisconnected(player);
  scheduleGraceRemoval(player.id, onStateChange);

  if (session.hostPlayerId === player.id) {
    pauseForMissingHost();
  }

  onStateChange();
}

export function reconnectPlayer(playerToken: string, socketId: string): InternalPlayer {
  const player = findPlayerByToken(playerToken);
  if (!player) {
    throw new AppError(ERROR_CODES.INVALID_PLAYER_TOKEN, "Invalid player token");
  }

  clearGraceTimer(player.id);
  markPlayerConnected(player, socketId);

  const session = getSession();
  if (
    session.hostPlayerId === player.id &&
    player.role === "host" &&
    session.phase === "paused_no_host"
  ) {
    resumeAfterHostAvailable();
  }

  return player;
}

export function leaveByToken(playerToken: string): InternalPlayer {
  const player = requirePlayerByToken(playerToken);
  clearGraceTimer(player.id);
  const session = getSession();
  const wasHost = session.hostPlayerId === player.id;
  removePlayer(player.id);
  if (wasHost && !getConnectedHost() && session.activeGame) {
    pauseForMissingHost();
  }
  return player;
}

export function getGraceRemainingMs(player: InternalPlayer): number | null {
  if (player.connectionStatus !== "disconnected" || player.disconnectedAt == null) {
    return null;
  }
  const elapsed = nowMs() - player.disconnectedAt;
  return Math.max(0, env.PLAYER_DISCONNECT_GRACE_MS - elapsed);
}
