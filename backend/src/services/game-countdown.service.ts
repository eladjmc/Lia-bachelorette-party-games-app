import { GAME_COUNTDOWN_MS, GAME_TYPES } from "../constants/game.constants.js";
import { ERROR_CODES } from "../constants/error-codes.constants.js";
import { DARE_PROMPTS } from "../data/dare-prompts.js";
import { PASS_THE_PARCEL_QUESTIONS } from "../data/pass-the-parcel-questions.js";
import { TRIVIA_QUESTIONS } from "../data/trivia-questions.js";
import { TRUTH_PROMPTS } from "../data/truth-prompts.js";
import type { GameType } from "../types/game.types.js";
import type { GameCountdownState } from "../types/session.types.js";
import { nowMs } from "../utils/time.util.js";
import { startPassTheParcelGame } from "./games/pass-the-parcel.service.js";
import { startTriviaGame } from "./games/trivia.service.js";
import { startTruthOrDareGame } from "./games/truth-or-dare.service.js";
import {
  AppError,
  getConnectedGuests,
  getSession,
  touchSession,
} from "./session.service.js";

function totalRoundsForGame(gameType: GameType): number {
  if (gameType === GAME_TYPES.TRIVIA) {
    return TRIVIA_QUESTIONS.length;
  }
  if (gameType === GAME_TYPES.PASS_THE_PARCEL) {
    return PASS_THE_PARCEL_QUESTIONS.length;
  }
  return TRUTH_PROMPTS.length + DARE_PROMPTS.length;
}
let countdownTimer: ReturnType<typeof setTimeout> | null = null;
let onCountdownFinished: (() => void) | null = null;

export function setCountdownFinishedCallback(cb: () => void): void {
  onCountdownFinished = cb;
}

export function getGameCountdown(): GameCountdownState | null {
  return getSession().gameCountdown;
}

export function clearGameCountdownTimer(): void {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}

export function clearGameCountdown(): void {
  clearGameCountdownTimer();
  const session = getSession();
  if (session.gameCountdown) {
    session.gameCountdown = null;
    touchSession();
  }
}

export function beginGameCountdown(gameType: GameType): GameCountdownState {
  const session = getSession();

  if (session.activeGame || session.gameCountdown) {
    throw new AppError(ERROR_CODES.GAME_ALREADY_ACTIVE, "A game is already active");
  }
  if (session.phase === "paused_no_host") {
    throw new AppError(ERROR_CODES.HOST_REQUIRED, "Session is paused");
  }
  if (getConnectedGuests().length < 1) {
    throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "Need at least one connected guest");
  }

  clearGameCountdownTimer();

  const startedAt = nowMs();
  const countdown: GameCountdownState = {
    gameType,
    startedAt,
    endsAt: startedAt + GAME_COUNTDOWN_MS,
    durationMs: GAME_COUNTDOWN_MS,
    serverNow: startedAt,
    totalRounds: totalRoundsForGame(gameType),
  };
  session.gameCountdown = countdown;
  touchSession();

  const delay = Math.max(0, countdown.endsAt - nowMs());
  countdownTimer = setTimeout(() => {
    countdownTimer = null;
    finalizeGameCountdown();
  }, delay);

  return countdown;
}

function finalizeGameCountdown(): void {
  const session = getSession();
  const pending = session.gameCountdown;
  if (!pending) {
    return;
  }

  session.gameCountdown = null;
  touchSession();

  try {
    if (pending.gameType === GAME_TYPES.TRIVIA) {
      startTriviaGame();
    } else if (pending.gameType === GAME_TYPES.PASS_THE_PARCEL) {
      startPassTheParcelGame();
    } else if (pending.gameType === GAME_TYPES.TRUTH_OR_DARE) {
      startTruthOrDareGame();
    }
  } catch {
    // Guests may have left during countdown — stay in lobby without a game.
    session.gameCountdown = null;
    touchSession();
  }

  onCountdownFinished?.();
}
