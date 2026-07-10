import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { HOST_PASSWORD_RATE_LIMIT } from "../constants/game.constants.js";
import type { InternalPlayer } from "../types/player.types.js";
import { verifyHostPassword } from "../utils/password.util.js";
import { nowMs } from "../utils/time.util.js";
import {
  assertAvatarAvailable,
  assertSessionHasCapacity,
  assertValidDisplayName,
  createPlayer,
} from "./player.service.js";
import {
  AppError,
  findPlayerById,
  getConnectedHost,
  getSession,
  removePlayer,
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

export function joinAsHost(params: {
  displayName: string;
  avatarId: string;
  password: string;
  socketId: string;
}): InternalPlayer {
  assertValidHostPassword(params.password, params.socketId);

  const connectedHost = getConnectedHost();
  if (connectedHost) {
    throw new AppError(ERROR_CODES.HOST_ALREADY_ACTIVE, "A host is already active");
  }

  const session = getSession();
  const disconnectedHost =
    session.hostPlayerId != null
      ? findPlayerById(session.hostPlayerId)
      : undefined;

  const canReplaceDisconnectedHost =
    disconnectedHost != null &&
    disconnectedHost.role === "host" &&
    disconnectedHost.connectionStatus === "disconnected";

  if (canReplaceDisconnectedHost && disconnectedHost) {
    const displayName = assertValidDisplayName(params.displayName);
    assertAvatarAvailable(params.avatarId, disconnectedHost.id);

    removePlayer(disconnectedHost.id);

    const replacement = createPlayer({
      displayName,
      avatarId: params.avatarId,
      role: "host",
      socketId: params.socketId,
    });

    setHostPlayerId(replacement.id);
    if (session.phase === "paused_no_host") {
      resumeAfterHostAvailable();
    }
    return replacement;
  }

  assertSessionHasCapacity(1);
  const host = createPlayer({
    displayName: params.displayName,
    avatarId: params.avatarId,
    role: "host",
    socketId: params.socketId,
  });
  setHostPlayerId(host.id);

  if (session.phase === "paused_no_host") {
    resumeAfterHostAvailable();
  }

  return host;
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
