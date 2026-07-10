import { randomInt } from "node:crypto";
import {
  HOST_DARE_ID,
  HOST_DARE_TEXT,
  SPIN_DURATION_MS,
  TRUTH_PROBABILITY,
} from "../../constants/game.constants.js";
import { ERROR_CODES } from "../../constants/error-codes.constants.js";
import { DARE_PROMPTS } from "../../data/dare-prompts.js";
import { TRUTH_PROMPTS } from "../../data/truth-prompts.js";
import type { TruthOrDareGameState } from "../../types/game.types.js";
import { pickRandom } from "../../utils/random.util.js";
import { nowMs } from "../../utils/time.util.js";
import {
  AppError,
  getConnectedGuests,
  getConnectedTruthOrDareParticipants,
  getSession,
  setActiveGame,
  setSessionPhase,
  touchSession,
} from "../session.service.js";

export function startTruthOrDareGame(): TruthOrDareGameState {
  const guests = getConnectedGuests();
  if (guests.length < 1) {
    throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "Need at least one connected guest");
  }

  const game: TruthOrDareGameState = {
    type: "truth_or_dare",
    phase: "spinning",
    selectedPlayerId: null,
    currentPromptId: null,
    currentPromptType: null,
    usedTruthPromptIds: [],
    usedDarePromptIds: [],
    totalPromptCount: TRUTH_PROMPTS.length + DARE_PROMPTS.length,
    completedPromptCount: 0,
    spinStartedAt: nowMs(),
    spinDurationMs: SPIN_DURATION_MS,
  };

  beginRound(game);
  setActiveGame(game);
  setSessionPhase("playing");
  scheduleSpinComplete();
  return game;
}

function getGameOrThrow(): TruthOrDareGameState {
  const session = getSession();
  if (!session.activeGame || session.activeGame.type !== "truth_or_dare") {
    throw new AppError(ERROR_CODES.NO_ACTIVE_GAME, "No active truth or dare game");
  }
  return session.activeGame;
}

let spinTimer: NodeJS.Timeout | null = null;
let onSpinComplete: (() => void) | null = null;

export function setTruthOrDareSpinCallback(cb: (() => void) | null): void {
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
      session.activeGame?.type === "truth_or_dare" &&
      session.activeGame.phase === "spinning"
    ) {
      session.activeGame.phase = "prompt";
      touchSession();
      onSpinComplete?.();
    }
  }, SPIN_DURATION_MS);
}

function selectPromptType(game: TruthOrDareGameState): "truth" | "dare" {
  const truthsLeft = TRUTH_PROMPTS.filter((p) => !game.usedTruthPromptIds.includes(p.id));
  const daresLeft = DARE_PROMPTS.filter((p) => !game.usedDarePromptIds.includes(p.id));

  if (truthsLeft.length === 0 && daresLeft.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "No prompts remaining");
  }
  if (truthsLeft.length === 0) {
    return "dare";
  }
  if (daresLeft.length === 0) {
    return "truth";
  }

  const roll = randomInt(0, 100);
  return roll < TRUTH_PROBABILITY * 100 ? "truth" : "dare";
}

function beginRound(game: TruthOrDareGameState): void {
  const participants = getConnectedTruthOrDareParticipants();
  if (participants.length < 1) {
    throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "No connected participants");
  }

  const selected = pickRandom(participants);
  const session = getSession();
  const isHostSelected = selected.id === session.hostPlayerId || selected.role === "host";

  if (isHostSelected) {
    // Fixed host dare — does not consume prompt pools or progress.
    game.selectedPlayerId = selected.id;
    game.currentPromptId = HOST_DARE_ID;
    game.currentPromptType = "dare";
  } else {
    const promptType = selectPromptType(game);
    if (promptType === "truth") {
      const pool = TRUTH_PROMPTS.filter((p) => !game.usedTruthPromptIds.includes(p.id));
      const prompt = pickRandom(pool);
      game.selectedPlayerId = selected.id;
      game.currentPromptId = prompt.id;
      game.currentPromptType = "truth";
      game.usedTruthPromptIds.push(prompt.id);
    } else {
      const pool = DARE_PROMPTS.filter((p) => !game.usedDarePromptIds.includes(p.id));
      const prompt = pickRandom(pool);
      game.selectedPlayerId = selected.id;
      game.currentPromptId = prompt.id;
      game.currentPromptType = "dare";
      game.usedDarePromptIds.push(prompt.id);
    }
  }

  game.phase = "spinning";
  game.spinStartedAt = nowMs();
  game.spinDurationMs = SPIN_DURATION_MS;
  game.completedPromptCount =
    game.usedTruthPromptIds.length + game.usedDarePromptIds.length;
}

export function advanceTruthOrDare(): TruthOrDareGameState {
  const game = getGameOrThrow();

  if (game.phase === "spinning") {
    game.phase = "prompt";
    if (spinTimer) {
      clearTimeout(spinTimer);
      spinTimer = null;
    }
    touchSession();
    return game;
  }

  if (game.phase === "prompt") {
    const truthsLeft = TRUTH_PROMPTS.filter((p) => !game.usedTruthPromptIds.includes(p.id));
    const daresLeft = DARE_PROMPTS.filter((p) => !game.usedDarePromptIds.includes(p.id));

    if (truthsLeft.length === 0 && daresLeft.length === 0) {
      game.phase = "completed";
      game.completedPromptCount = game.totalPromptCount;
      touchSession();
      return game;
    }

    beginRound(game);
    touchSession();
    scheduleSpinComplete();
    return game;
  }

  throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "Game already completed");
}

export function getCurrentTruthOrDarePrompt(game: TruthOrDareGameState) {
  if (!game.currentPromptId || !game.currentPromptType) {
    return null;
  }
  if (game.currentPromptId === HOST_DARE_ID) {
    return { id: HOST_DARE_ID, type: "dare" as const, text: HOST_DARE_TEXT };
  }
  if (game.currentPromptType === "truth") {
    return TRUTH_PROMPTS.find((p) => p.id === game.currentPromptId) ?? null;
  }
  return DARE_PROMPTS.find((p) => p.id === game.currentPromptId) ?? null;
}
