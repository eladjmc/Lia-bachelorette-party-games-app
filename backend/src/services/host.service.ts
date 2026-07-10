import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { HOST_PASSWORD_RATE_LIMIT } from "../constants/game.constants.js";
import type { InternalPlayer } from "../types/player.types.js";
import { verifyHostPassword } from "../utils/password.util.js";
import { nowMs } from "../utils/time.util.js";
import { clearGameCountdown } from "./game-countdown.service.js";
import { createPlayer } from "./player.service.js";
import {
  AppError,
  getSession,
  removePlayer,
  resetSessionToLobby,
  setHostPlayerId,
  setSessionPhase,
  touchSession,
} from "./session.service.js";

interface PasswordAttemptBucket {
  count: number;
  windowStartedAt: number;
}

const passwordAttempts = new Map<string, PasswordAttemptBucket>();

function assertPasswordRateLimit(key: string): void {
  const now = nowMs();
  const bucket = passwordAttempts.get(key);
  if (!bucket || now - bucket.windowStartedAt > HOST_PASSWORD_RATE_LIMIT.windowMs) {
    passwordAttempts.set(key, { count: 1, windowStartedAt: now });
    return;
  }
  if (bucket.count >= HOST_PASSWORD_RATE_LIMIT.maxAttempts) {
    throw new AppError(ERROR_CODES.INVALID_HOST_PASSWORD, "Too many password attempts");
  }
  bucket.count += 1;
}

export function assertValidHostPassword(password: string, rateLimitKey: string): void {
  assertPasswordRateLimit(rateLimitKey);
  if (!verifyHostPassword(password, env.HOST_PASSWORD)) {
    throw new AppError(ERROR_CODES.INVALID_HOST_PASSWORD, "Invalid host password");
  }
}

export interface HostJoinResult {
  player: InternalPlayer;
  /** Previous host(s) removed by takeover (snapshot before removal). */
  displacedHosts: InternalPlayer[];
  /** True when an active game or countdown was cleared for the new host. */
  endedActivePlay: boolean;
}

/**
 * Join as host with password. Always takes over: removes any previous host,
 * ends any running/paused game or countdown, and starts fresh in the lobby.
 */
export function joinAsHost(params: {
  displayName: string;
  avatarId: string;
  password: string;
  socketId: string;
}): HostJoinResult {
  assertValidHostPassword(params.password, params.socketId);

  const session = getSession();

  const previousHosts = session.players.filter(
    (p) => p.role === "host" || p.id === session.hostPlayerId,
  );
  const displacedHosts = previousHosts.map((p) => ({ ...p }));

  for (const old of previousHosts) {
    removePlayer(old.id);
  }

  const endedActivePlay = Boolean(session.activeGame || session.gameCountdown);
  clearGameCountdown();
  resetSessionToLobby();

  const player = createPlayer({
    displayName: params.displayName,
    avatarId: params.avatarId,
    role: "host",
    socketId: params.socketId,
  });
  setHostPlayerId(player.id);

  return { player, displacedHosts, endedActivePlay };
}

export function pauseForMissingHost(): void {
  const session = getSession();
  if (session.phase === "playing" && session.activeGame) {
    if (session.activeGame.type === "trivia" && session.activeGame.phase === "question") {
      session.activeGame.pauseStartedAt = nowMs();
    }
    setSessionPhase("paused_no_host");
  }
}

export function resumeAfterHostAvailable(): void {
  const session = getSession();
  if (session.phase !== "paused_no_host") {
    return;
  }

  if (session.activeGame?.type === "trivia" && session.activeGame.pauseStartedAt != null) {
    const pausedFor = nowMs() - session.activeGame.pauseStartedAt;
    session.activeGame.pausedDurationMs += Math.max(0, pausedFor);
    session.activeGame.pauseStartedAt = null;
  }

  if (session.activeGame) {
    setSessionPhase("playing");
  } else {
    setSessionPhase("lobby");
  }
  touchSession();
}

export function demotePlayerFromHost(player: InternalPlayer): void {
  player.role = "guest";
  touchSession();
}
