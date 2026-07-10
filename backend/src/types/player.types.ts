export type PlayerRole = "host" | "guest";

export type ConnectionStatus = "connected" | "disconnected";

export interface PlayerState {
  id: string;
  role: PlayerRole;
  displayName: string;
  avatarId: string;
  connectionStatus: ConnectionStatus;
  joinedAt: number;
  disconnectedAt: number | null;
}

/** Server-only player record (never sent to clients). */
export interface InternalPlayer extends PlayerState {
  token: string;
  socketId: string | null;
}
