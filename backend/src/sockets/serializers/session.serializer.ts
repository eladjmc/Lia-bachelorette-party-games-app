import { HOST_DARE_ID, HOST_DARE_TEXT } from "../../constants/game.constants.js";
import { getPassTheParcelQuestionById } from "../../data/pass-the-parcel-questions.js";
import { getTriviaQuestionById } from "../../data/trivia-questions.js";
import { DARE_PROMPTS } from "../../data/dare-prompts.js";
import { TRUTH_PROMPTS } from "../../data/truth-prompts.js";
import type {
  PublicActiveGame,
  PublicSessionState,
  PublicTriviaGameState,
} from "../../types/dto.types.js";
import type { ActiveGame } from "../../types/game.types.js";
import type { SessionState } from "../../types/session.types.js";
import { getTakenAvatarIds } from "../../services/session.service.js";
import { nowMs } from "../../utils/time.util.js";

function serializeGame(
  game: ActiveGame,
  viewerPlayerId: string | null,
  isHostViewer: boolean,
): PublicActiveGame {
  if (!game) {
    return null;
  }

  if (game.type === "trivia") {
    const questionId = game.questionOrder[game.currentQuestionIndex];
    const question = questionId ? getTriviaQuestionById(questionId) ?? null : null;
    const isResultOrCompleted = game.phase === "result" || game.phase === "completed";

    const mySubmission =
      viewerPlayerId != null
        ? (game.submissions.find((s) => s.playerId === viewerPlayerId) ?? null)
        : null;

    let optionCounts: Record<string, number> | null = null;
    if (isResultOrCompleted && isHostViewer) {
      optionCounts = {};
      for (const submission of game.submissions) {
        if (!game.expectedPlayerIds.includes(submission.playerId)) {
          continue;
        }
        optionCounts[submission.optionId] = (optionCounts[submission.optionId] ?? 0) + 1;
      }
    }

    const publicGame: PublicTriviaGameState = {
      type: "trivia",
      phase: game.phase,
      questionOrder: game.questionOrder,
      currentQuestionIndex: game.currentQuestionIndex,
      questionStartedAt: game.questionStartedAt,
      pausedDurationMs: game.pausedDurationMs,
      hostAnswerOptionId: isResultOrCompleted ? game.hostAnswerOptionId : null,
      submissions: isResultOrCompleted
        ? game.submissions.filter(
            (s) =>
              game.expectedPlayerIds.includes(s.playerId) ||
              (isHostViewer && s.playerId === viewerPlayerId),
          )
        : mySubmission
          ? [mySubmission]
          : [],
      expectedPlayerIds: game.expectedPlayerIds,
      scores: game.scores,
      currentQuestion: question
        ? {
            id: question.id,
            text: question.text,
            options: question.options,
          }
        : null,
      mySubmission,
      optionCounts,
      hasHostAnswered: game.hostAnswerOptionId != null,
      answeredPlayerIds: game.submissions
        .filter((s) => game.expectedPlayerIds.includes(s.playerId))
        .map((s) => s.playerId),
    };

    return publicGame;
  }

  if (game.type === "pass_the_parcel") {
    const questionId = game.questionOrder[game.currentQuestionIndex];
    const question =
      questionId && game.phase !== "spinning"
        ? (getPassTheParcelQuestionById(questionId) ?? null)
        : game.phase === "completed" && questionId
          ? (getPassTheParcelQuestionById(questionId) ?? null)
          : game.phase === "question" && questionId
            ? (getPassTheParcelQuestionById(questionId) ?? null)
            : null;

    return {
      type: "pass_the_parcel",
      phase: game.phase,
      questionOrder: game.questionOrder,
      currentQuestionIndex: game.currentQuestionIndex,
      selectedPlayerId: game.phase === "spinning" ? game.selectedPlayerId : game.selectedPlayerId,
      spinStartedAt: game.spinStartedAt,
      spinDurationMs: game.spinDurationMs,
      currentQuestion:
        game.phase === "question" || game.phase === "completed"
          ? question
            ? { id: question.id, text: question.text }
            : null
          : null,
    };
  }

  const prompt =
    game.currentPromptId && game.currentPromptType
      ? game.currentPromptId === HOST_DARE_ID
        ? { id: HOST_DARE_ID, type: "dare" as const, text: HOST_DARE_TEXT }
        : game.currentPromptType === "truth"
          ? (TRUTH_PROMPTS.find((p) => p.id === game.currentPromptId) ?? null)
          : (DARE_PROMPTS.find((p) => p.id === game.currentPromptId) ?? null)
      : null;

  return {
    type: "truth_or_dare",
    phase: game.phase,
    selectedPlayerId: game.selectedPlayerId,
    currentPromptId: game.phase === "spinning" ? game.currentPromptId : game.currentPromptId,
    currentPromptType: game.currentPromptType,
    usedTruthPromptIds: game.usedTruthPromptIds,
    usedDarePromptIds: game.usedDarePromptIds,
    totalPromptCount: game.totalPromptCount,
    completedPromptCount: game.completedPromptCount,
    spinStartedAt: game.spinStartedAt,
    spinDurationMs: game.spinDurationMs,
    currentPrompt:
      game.phase === "prompt" || game.phase === "completed"
        ? prompt
          ? { id: prompt.id, type: prompt.type, text: prompt.text }
          : null
        : null,
  };
}

export function serializeSessionForPlayer(
  session: SessionState,
  viewerPlayerId: string | null,
): PublicSessionState {
  const viewer = viewerPlayerId
    ? session.players.find((p) => p.id === viewerPlayerId)
    : undefined;
  const isHostViewer = viewer?.role === "host" && session.hostPlayerId === viewer.id;

  return {
    phase: session.phase,
    hostPlayerId: session.hostPlayerId,
    players: session.players.map((p) => ({
      id: p.id,
      role: p.role,
      displayName: p.displayName,
      avatarId: p.avatarId,
      connectionStatus: p.connectionStatus,
      joinedAt: p.joinedAt,
      disconnectedAt: p.disconnectedAt,
    })),
    activeGame: serializeGame(session.activeGame, viewerPlayerId, Boolean(isHostViewer)),
    gameCountdown: session.gameCountdown
      ? {
          gameType: session.gameCountdown.gameType,
          startedAt: session.gameCountdown.startedAt,
          endsAt: session.gameCountdown.endsAt,
          durationMs: session.gameCountdown.durationMs,
          serverNow: nowMs(),
          totalRounds: session.gameCountdown.totalRounds,
        }
      : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    takenAvatarIds: getTakenAvatarIds(),
  };
}
