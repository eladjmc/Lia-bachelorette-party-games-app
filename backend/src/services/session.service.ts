import { ERROR_CODES } from "../constants/error-codes.constants.js";
import type { ErrorCode } from "../constants/error-codes.constants.js";
import type { ActiveGame } from "../types/game.types.js";
import type { InternalPlayer } from "../types/player.types.js";
import type { SessionPhase, SessionState } from "../types/session.types.js";
import { nowMs } from "../utils/time.util.js";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

function createEmptySession(): SessionState {
  const now = nowMs();
  return {
    phase: "lobby",
    hostPlayerId: null,
    players: [],
    activeGame: null,
    gameCountdown: null,
    createdAt: now,
    updatedAt: now,
  };
}

let session: SessionState = createEmptySession();

export function getSession(): SessionState {
  return session;
}

export function touchSession(): void {
  session.updatedAt = nowMs();
}

export function setSessionPhase(phase: SessionPhase): void {
  session.phase = phase;
  touchSession();
}

export function setActiveGame(game: ActiveGame): void {
  session.activeGame = game;
  touchSession();
}

export function setHostPlayerId(playerId: string | null): void {
  session.hostPlayerId = playerId;
  touchSession();
}

export function resetSessionToLobby(): void {
  session.phase = "lobby";
  session.activeGame = null;
  session.gameCountdown = null;
  touchSession();
}

export function resetEntireSession(): void {
  session = createEmptySession();
}

/** Clears all players except the active host, ends any game, returns to lobby. */
export function clearSessionKeepingHost(hostPlayerId: string): InternalPlayer[] {
  const host = session.players.find((p) => p.id === hostPlayerId);
  if (!host) {
    throw new AppError(ERROR_CODES.HOST_REQUIRED, "Host not found");
  }

  const removed = session.players.filter((p) => p.id !== hostPlayerId);
  host.role = "host";
  host.connectionStatus = "connected";
  host.disconnectedAt = null;

  session.players = [host];
  session.hostPlayerId = host.id;
  session.phase = "lobby";
  session.activeGame = null;
  session.gameCountdown = null;
  touchSession();

  return removed;
}

export function findPlayerById(playerId: string): InternalPlayer | undefined {
  return session.players.find((p) => p.id === playerId);
}

export function findPlayerByToken(token: string): InternalPlayer | undefined {
  return session.players.find((p) => p.token === token);
}

export function findPlayerBySocketId(socketId: string): InternalPlayer | undefined {
  return session.players.find((p) => p.socketId === socketId);
}

export function getConnectedGuests(): InternalPlayer[] {
  return session.players.filter(
    (p) => p.role === "guest" && p.connectionStatus === "connected",
  );
}

export function getConnectedHost(): InternalPlayer | undefined {
  return session.players.find(
    (p) => p.role === "host" && p.connectionStatus === "connected",
  );
}

/** Guests + host for Truth or Dare selection. */
export function getConnectedTruthOrDareParticipants(): InternalPlayer[] {
  return session.players.filter((p) => p.connectionStatus === "connected");
}

export function getTakenAvatarIds(): string[] {
  return session.players.map((p) => p.avatarId);
}

export function countPlayers(): number {
  return session.players.length;
}

export function getConnectedPlayerCount(): number {
  return session.players.filter((p) => p.connectionStatus === "connected").length;
}

export function requirePlayerByToken(token: string): InternalPlayer {
  const player = findPlayerByToken(token);
  if (!player) {
    throw new AppError(ERROR_CODES.INVALID_PLAYER_TOKEN, "Invalid player token");
  }
  return player;
}

export function requireHostByToken(token: string): InternalPlayer {
  const player = requirePlayerByToken(token);
  if (player.role !== "host" || session.hostPlayerId !== player.id) {
    throw new AppError(ERROR_CODES.HOST_REQUIRED, "Host privileges required");
  }
  return player;
}

export function addPlayer(player: InternalPlayer): void {
  session.players.push(player);
  touchSession();
}

export function removePlayer(playerId: string): void {
  session.players = session.players.filter((p) => p.id !== playerId);
  if (session.hostPlayerId === playerId) {
    session.hostPlayerId = null;
  }
  touchSession();
}

export function replacePlayer(playerId: string, next: InternalPlayer): void {
  const index = session.players.findIndex((p) => p.id === playerId);
  if (index === -1) {
    session.players.push(next);
  } else {
    session.players[index] = next;
  }
  touchSession();
}
