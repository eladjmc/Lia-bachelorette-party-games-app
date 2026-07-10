import { ERROR_CODES } from "../../constants/error-codes.constants.js";
import {
  getTriviaQuestionById,
  TRIVIA_QUESTIONS,
} from "../../data/trivia-questions.js";
import type { TriviaGameState, TriviaSubmission } from "../../types/game.types.js";
import { shuffle } from "../../utils/random.util.js";
import { nowMs } from "../../utils/time.util.js";
import {
  AppError,
  getConnectedGuests,
  getSession,
  setActiveGame,
  setSessionPhase,
  touchSession,
} from "../session.service.js";

export function startTriviaGame(): TriviaGameState {
  const guests = getConnectedGuests();
  if (guests.length < 1) {
    throw new AppError(ERROR_CODES.NOT_ENOUGH_PLAYERS, "Need at least one connected guest");
  }

  const questionOrder = shuffle(TRIVIA_QUESTIONS.map((q) => q.id));
  const game: TriviaGameState = {
    type: "trivia",
    phase: "question",
    questionOrder,
    currentQuestionIndex: 0,
    questionStartedAt: nowMs(),
    pausedDurationMs: 0,
    hostAnswerOptionId: null,
    submissions: [],
    expectedPlayerIds: guests.map((g) => g.id),
    scores: guests.map((g) => ({
      playerId: g.id,
      displayName: g.displayName,
      score: 0,
      totalCorrectAnswerTimeMs: 0,
      connected: true,
    })),
    pauseStartedAt: null,
  };

  setActiveGame(game);
  setSessionPhase("playing");
  return game;
}

function getTriviaOrThrow(): TriviaGameState {
  const session = getSession();
  if (!session.activeGame || session.activeGame.type !== "trivia") {
    throw new AppError(ERROR_CODES.NO_ACTIVE_GAME, "No active trivia game");
  }
  return session.activeGame;
}

function getCurrentQuestion(game: TriviaGameState) {
  const questionId = game.questionOrder[game.currentQuestionIndex];
  if (!questionId) {
    return null;
  }
  return getTriviaQuestionById(questionId) ?? null;
}

function syncScoreConnectionFlags(game: TriviaGameState): void {
  const session = getSession();
  for (const score of game.scores) {
    const player = session.players.find((p) => p.id === score.playerId);
    score.connected = player?.connectionStatus === "connected";
  }
}

function maybeAutoReveal(game: TriviaGameState): boolean {
  if (game.phase !== "question" || game.hostAnswerOptionId == null) {
    return false;
  }
  const answeredGuests = new Set(
    game.submissions
      .filter((s) => game.expectedPlayerIds.includes(s.playerId))
      .map((s) => s.playerId),
  );
  const allExpectedAnswered = game.expectedPlayerIds.every((id) => answeredGuests.has(id));
  if (!allExpectedAnswered) {
    return false;
  }
  revealResults(game);
  return true;
}

function revealResults(game: TriviaGameState): void {
  if (game.hostAnswerOptionId == null) {
    throw new AppError(ERROR_CODES.HOST_MUST_ANSWER_FIRST, "Host must answer first");
  }

  for (const playerId of game.expectedPlayerIds) {
    const submission = game.submissions.find((s) => s.playerId === playerId);
    const scoreEntry = game.scores.find((s) => s.playerId === playerId);
    if (!scoreEntry) {
      continue;
    }
    if (submission && submission.optionId === game.hostAnswerOptionId) {
      scoreEntry.score += 1;
      scoreEntry.totalCorrectAnswerTimeMs += submission.answerTimeMs;
    }
  }

  syncScoreConnectionFlags(game);
  game.scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.totalCorrectAnswerTimeMs !== b.totalCorrectAnswerTimeMs) {
      return a.totalCorrectAnswerTimeMs - b.totalCorrectAnswerTimeMs;
    }
    const session = getSession();
    const aJoined = session.players.find((p) => p.id === a.playerId)?.joinedAt ?? 0;
    const bJoined = session.players.find((p) => p.id === b.playerId)?.joinedAt ?? 0;
    return aJoined - bJoined;
  });

  game.phase = "result";
  touchSession();
}

export function submitTriviaAnswer(params: {
  playerId: string;
  optionId: string;
  isHost: boolean;
}): { submission: TriviaSubmission; autoRevealed: boolean } {
  const game = getTriviaOrThrow();
  if (game.phase !== "question") {
    throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "Not in question phase");
  }

  const question = getCurrentQuestion(game);
  if (!question) {
    throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "No current question");
  }

  if (!question.options.some((o) => o.id === params.optionId)) {
    throw new AppError(ERROR_CODES.INVALID_ANSWER, "Invalid answer option");
  }

  if (game.submissions.some((s) => s.playerId === params.playerId)) {
    throw new AppError(ERROR_CODES.ANSWER_ALREADY_SUBMITTED, "Answer already submitted");
  }

  if (!params.isHost && !game.expectedPlayerIds.includes(params.playerId)) {
    throw new AppError(ERROR_CODES.INVALID_ANSWER, "Player not expected to answer");
  }

  const receivedAt = nowMs();
  const startedAt = game.questionStartedAt ?? receivedAt;
  const answerTimeMs = Math.max(0, receivedAt - startedAt - game.pausedDurationMs);

  const submission: TriviaSubmission = {
    playerId: params.playerId,
    optionId: params.optionId,
    submittedAt: receivedAt,
    answerTimeMs,
  };

  game.submissions.push(submission);

  if (params.isHost) {
    game.hostAnswerOptionId = params.optionId;
  }

  touchSession();
  const autoRevealed = maybeAutoReveal(game);
  return { submission, autoRevealed };
}

export function advanceTrivia(): TriviaGameState {
  const game = getTriviaOrThrow();

  if (game.phase === "question") {
    if (game.hostAnswerOptionId == null) {
      throw new AppError(ERROR_CODES.HOST_MUST_ANSWER_FIRST, "Host must answer first");
    }
    revealResults(game);
    return game;
  }

  if (game.phase === "result") {
    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex >= game.questionOrder.length) {
      game.phase = "completed";
      syncScoreConnectionFlags(game);
      touchSession();
      return game;
    }

    const session = getSession();
    const connectedGuestIds = session.players
      .filter((p) => p.role === "guest" && p.connectionStatus === "connected")
      .map((p) => p.id);

    // Keep scores for removed players; only expect currently connected guests
    game.currentQuestionIndex = nextIndex;
    game.phase = "question";
    game.questionStartedAt = nowMs();
    game.pausedDurationMs = 0;
    game.pauseStartedAt = null;
    game.hostAnswerOptionId = null;
    game.submissions = [];
    game.expectedPlayerIds = connectedGuestIds;
    syncScoreConnectionFlags(game);
    touchSession();
    return game;
  }

  throw new AppError(ERROR_CODES.INVALID_GAME_TRANSITION, "Cannot advance from completed");
}

export function getTriviaQuestionForIndex(game: TriviaGameState) {
  return getCurrentQuestion(game);
}
