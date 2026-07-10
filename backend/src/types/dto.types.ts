import type { ActiveGame, GameType } from "./game.types.js";
import type { ConnectionStatus, PlayerRole } from "./player.types.js";
import type { SessionPhase } from "./session.types.js";

export interface PublicPlayerState {
  id: string;
  role: PlayerRole;
  displayName: string;
  avatarId: string;
  connectionStatus: ConnectionStatus;
  joinedAt: number;
  disconnectedAt: number | null;
}

export interface PublicTriviaSubmission {
  playerId: string;
  optionId: string;
  submittedAt: number;
  answerTimeMs: number;
}

export interface PublicTriviaGameState {
  type: "trivia";
  phase: "question" | "result" | "completed";
  questionOrder: string[];
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  pausedDurationMs: number;
  hostAnswerOptionId: string | null;
  submissions: PublicTriviaSubmission[];
  expectedPlayerIds: string[];
  scores: {
    playerId: string;
    displayName: string;
    score: number;
    totalCorrectAnswerTimeMs: number;
    connected: boolean;
  }[];
  currentQuestion: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
  } | null;
  mySubmission: PublicTriviaSubmission | null;
  optionCounts: Record<string, number> | null;
  hasHostAnswered: boolean;
  answeredPlayerIds: string[];
}

export interface PublicPassTheParcelGameState {
  type: "pass_the_parcel";
  phase: "spinning" | "question" | "completed";
  questionOrder: string[];
  currentQuestionIndex: number;
  selectedPlayerId: string | null;
  spinStartedAt: number | null;
  spinDurationMs: number;
  currentQuestion: { id: string; text: string } | null;
}

export interface PublicTruthOrDareGameState {
  type: "truth_or_dare";
  phase: "spinning" | "prompt" | "completed";
  selectedPlayerId: string | null;
  currentPromptId: string | null;
  currentPromptType: "truth" | "dare" | null;
  usedTruthPromptIds: string[];
  usedDarePromptIds: string[];
  totalPromptCount: number;
  completedPromptCount: number;
  spinStartedAt: number | null;
  spinDurationMs: number;
  currentPrompt: { id: string; type: "truth" | "dare"; text: string } | null;
}

export type PublicActiveGame =
  | PublicTriviaGameState
  | PublicPassTheParcelGameState
  | PublicTruthOrDareGameState
  | null;

export interface PublicGameCountdown {
  gameType: GameType;
  startedAt: number;
  endsAt: number;
  durationMs: number;
  serverNow: number;
  totalRounds: number;
}

export interface PublicSessionState {
  phase: SessionPhase;
  hostPlayerId: string | null;
  players: PublicPlayerState[];
  activeGame: PublicActiveGame;
  gameCountdown: PublicGameCountdown | null;
  createdAt: number;
  updatedAt: number;
  takenAvatarIds: string[];
}

export interface JoinSuccessData {
  playerId: string;
  playerToken: string;
  session: PublicSessionState;
}

export type { GameType, ActiveGame };
