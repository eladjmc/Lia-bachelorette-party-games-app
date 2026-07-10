export type TriviaPhase = "question" | "result" | "completed";

export interface TriviaPlayerScore {
  playerId: string;
  displayName: string;
  score: number;
  totalCorrectAnswerTimeMs: number;
  connected: boolean;
}

export interface TriviaSubmission {
  playerId: string;
  optionId: string;
  submittedAt: number;
  answerTimeMs: number;
}

export interface TriviaGameState {
  type: "trivia";
  phase: TriviaPhase;
  questionOrder: string[];
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  pausedDurationMs: number;
  hostAnswerOptionId: string | null;
  submissions: TriviaSubmission[];
  expectedPlayerIds: string[];
  scores: TriviaPlayerScore[];
  /** Accumulates pause start when host disconnects mid-question */
  pauseStartedAt: number | null;
}

export type PassTheParcelPhase = "spinning" | "question" | "completed";

export interface PassTheParcelGameState {
  type: "pass_the_parcel";
  phase: PassTheParcelPhase;
  questionOrder: string[];
  currentQuestionIndex: number;
  selectedPlayerId: string | null;
  spinStartedAt: number | null;
  spinDurationMs: number;
}

export type TruthOrDarePhase = "spinning" | "prompt" | "completed";

export interface TruthOrDareGameState {
  type: "truth_or_dare";
  phase: TruthOrDarePhase;
  selectedPlayerId: string | null;
  currentPromptId: string | null;
  currentPromptType: "truth" | "dare" | null;
  usedTruthPromptIds: string[];
  usedDarePromptIds: string[];
  totalPromptCount: number;
  completedPromptCount: number;
  spinStartedAt: number | null;
  spinDurationMs: number;
}

export type ActiveGame =
  | TriviaGameState
  | PassTheParcelGameState
  | TruthOrDareGameState
  | null;

export type GameType = "trivia" | "pass_the_parcel" | "truth_or_dare";
