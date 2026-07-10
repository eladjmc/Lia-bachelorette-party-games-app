import { create } from "zustand";
import type { PublicSessionState } from "@/types/session.types";
import type { AppError } from "@/types/socket.types";

export type ClientConnectionStatus = "connecting" | "connected" | "disconnected";

interface SessionStore {
  connectionStatus: ClientConnectionStatus;
  currentPlayerId: string | null;
  session: PublicSessionState | null;
  lastError: AppError | null;
  setConnectionStatus: (status: ClientConnectionStatus) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setSession: (session: PublicSessionState | null) => void;
  setLastError: (error: AppError | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  connectionStatus: "connecting",
  currentPlayerId: null,
  session: null,
  lastError: null,
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setCurrentPlayerId: (currentPlayerId) => set({ currentPlayerId }),
  setSession: (session) => set({ session }),
  setLastError: (lastError) => set({ lastError }),
  clearSession: () =>
    set({
      currentPlayerId: null,
      session: null,
      lastError: null,
    }),
}));
