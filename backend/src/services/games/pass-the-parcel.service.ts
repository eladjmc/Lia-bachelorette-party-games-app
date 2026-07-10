import { ERROR_CODES } from "../../constants/error-codes.constants.js";
import { SPIN_DURATION_MS } from "../../constants/game.constants.js";
import {
  getPassTheParcelQuestionById,
  PASS_THE_PARCEL_QUESTIONS,
} from "../../data/pass-the-parcel-questions.js";
import type { PassTheParcelGameState } from "../../types/game.types.js";
import { pickRandom, shuffle } from "../../utils/random.util.js";
import { nowMs } from "../../utils/time.util.js";
import {
  AppError,
  getConnectedGuests,
  getSession,
  setActiveGame,
  setSessionPhase,
  touchSession,
} from "../session.service.js";

export function startPassTheParcelGame(): PassTheParcelGameState {
  const guests = getConnectedGuests();
  if (guests.length < 1) {
    throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "Need at least one connected guest");
  }

  const questionOrder = shuffle(PASS_THE_PARCEL_QUESTIONS.map((q) => q.id));
  const selected = pickRandom(guests);

  const game: PassTheParcelGameState = {
    type: "pass_the_parcel",
    phase: "spinning",
    questionOrder,
    currentQuestionIndex: 0,
    selectedPlayerId: selected.id,
    spinStartedAt: nowMs(),
    spinDurationMs: SPIN_DURATION_MS,
  };

  setActiveGame(game);
  setSessionPhase("playing");

  scheduleSpinComplete();
  return game;
}

function getGameOrThrow(): PassTheParcelGameState {
  const session = getSession();
  if (!session.activeGame || session.activeGame.type !== "pass_the_parcel") {
    throw new AppError(ERROR_CODES.NO_ACTIVE_GAME, "No active pass the parcel game");
  }
  return session.activeGame;
}

let spinTimer: NodeJS.Timeout | null = null;
let onSpinComplete: (() => void) | null = null;

export function setPassTheParcelSpinCallback(cb: (() => void) | null): void {
  onSpinComplete = cb;
}

function scheduleSpinComplete(): void {
  if (spinTimer) {
    clearTimeout(spinTimer);
  }
  spinTimer = setTimeout(() => {
    spinTimer = null;
    const session = getSession();
    if (
      session.activeGame?.type === "pass_the_parcel" &&
      session.activeGame.phase === "spinning"
    ) {
      session.activeGame.phase = "question";
      touchSession();
      onSpinComplete?.();
    }
  }, SPIN_DURATION_MS);
}

export function advancePassTheParcel(): PassTheParcelGameState {
  const game = getGameOrThrow();

  if (game.phase === "spinning") {
    game.phase = "question";
    if (spinTimer) {
      clearTimeout(spinTimer);
      spinTimer = null;
    }
    touchSession();
    return game;
  }

  if (game.phase === "question") {
    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex >= game.questionOrder.length) {
      game.phase = "completed";
      touchSession();
      return game;
    }

    const guests = getConnectedGuests();
    if (guests.length < 1) {
      throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "No connected guests");
    }

    const selected = pickRandom(guests);
    game.currentQuestionIndex = nextIndex;
    game.selectedPlayerId = selected.id;
    game.phase = "spinning";
    game.spinStartedAt = nowMs();
    game.spinDurationMs = SPIN_DURATION_MS;
    touchSession();
    scheduleSpinComplete();
    return game;
  }

  throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "Game already completed");
}

export function getCurrentPassTheParcelQuestion(game: PassTheParcelGameState) {
  const id = game.questionOrder[game.currentQuestionIndex];
  if (!id) {
    return null;
  }
  return getPassTheParcelQuestionById(id) ?? null;
}
