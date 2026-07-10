import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { isValidAvatarId } from "../data/avatars.js";
import type { InternalPlayer, PlayerRole } from "../types/player.types.js";
import { createPlayerId, createPlayerToken } from "../utils/token.util.js";
import { nowMs } from "../utils/time.util.js";
import {
  AppError,
  addPlayer,
  countPlayers,
  findPlayerById,
  getTakenAvatarIds,
  removePlayer,
  touchSession,
} from "./session.service.js";

export function assertValidDisplayName(displayName: string): string {
  const trimmed = displayName.trim();
  if (trimmed.length < 1 || trimmed.length > 20) {
    throw new AppError(ERROR_CODES.INVALID_NAME, "Display name must be 1-20 characters");
  }
  return trimmed;
}

export function assertAvatarAvailable(avatarId: string, exceptPlayerId?: string): void {
  if (!isValidAvatarId(avatarId)) {
    throw new AppError(ERROR_CODES.INVALID_AVATAR, "Invalid avatar");
  }
  const taken = getTakenAvatarIds();
  const conflict = taken.includes(avatarId);
  if (!conflict) {
    return;
  }
  if (exceptPlayerId) {
    const owner = findPlayerById(exceptPlayerId);
    if (owner?.avatarId === avatarId) {
      return;
    }
  }
  throw new AppError(ERROR_CODES.AVATAR_ALREADY_TAKEN, "Avatar already taken");
}

export function assertSessionHasCapacity(extraSlotsNeeded = 1): void {
  if (countPlayers() + extraSlotsNeeded > env.MAX_PLAYERS) {
    throw new AppError(ERROR_CODES.SESSION_FULL, "Session is full");
  }
}

export function createPlayer(params: {
  displayName: string;
  avatarId: string;
  role: PlayerRole;
  socketId: string;
}): InternalPlayer {
  const displayName = assertValidDisplayName(params.displayName);
  assertAvatarAvailable(params.avatarId);
  assertSessionHasCapacity(1);

  const player: InternalPlayer = {
    id: createPlayerId(),
    token: createPlayerToken(),
    role: params.role,
    displayName,
    avatarId: params.avatarId,
    connectionStatus: "connected",
    joinedAt: nowMs(),
    disconnectedAt: null,
    socketId: params.socketId,
  };

  addPlayer(player);
  return player;
}

export function markPlayerConnected(player: InternalPlayer, socketId: string): void {
  player.connectionStatus = "connected";
  player.disconnectedAt = null;
  player.socketId = socketId;
  touchSession();
}

export function markPlayerDisconnected(player: InternalPlayer): void {
  player.connectionStatus = "disconnected";
  player.disconnectedAt = nowMs();
  player.socketId = null;
  touchSession();
}

export function leavePlayer(playerId: string): void {
  removePlayer(playerId);
}
