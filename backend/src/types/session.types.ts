import type { ActiveGame } from "./game.types.js";
import type { InternalPlayer } from "./player.types.js";
import type { GameType } from "./game.types.js";

export type SessionPhase = "lobby" | "playing" | "paused_no_host";

export interface GameCountdownState {
  gameType: GameType;
  startedAt: number;
  endsAt: number;
  durationMs: number;
  serverNow: number;
  totalRounds: number;
}

export interface SessionState {
  phase: SessionPhase;
  hostPlayerId: string | null;
  players: InternalPlayer[];
  activeGame: ActiveGame;
  gameCountdown: GameCountdownState | null;
  createdAt: number;
  updatedAt: number;
}
