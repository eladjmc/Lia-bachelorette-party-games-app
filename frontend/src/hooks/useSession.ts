import { useSessionStore } from "@/store/session.store";

export function useSession() {
  const session = useSessionStore((s) => s.session);
  const currentPlayerId = useSessionStore((s) => s.currentPlayerId);
  const connectionStatus = useSessionStore((s) => s.connectionStatus);
  const lastError = useSessionStore((s) => s.lastError);

  const currentPlayer =
    session?.players.find((p) => p.id === currentPlayerId) ?? null;
  const isHost =
    currentPlayer?.role === "host" && session?.hostPlayerId === currentPlayerId;

  return {
    session,
    currentPlayerId,
    currentPlayer,
    isHost,
    connectionStatus,
    lastError,
  };
}
