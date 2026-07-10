import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";
import { clearSessionStorage } from "@/lib/storage";
import { useSessionStore } from "@/store/session.store";
import type { PublicGameCountdown, PublicSessionState } from "@/types/session.types";
import { SOCKET_EVENTS } from "@/types/socket.types";

export function useSocket(): void {
  const navigate = useNavigate();
  const setConnectionStatus = useSessionStore((s) => s.setConnectionStatus);
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnectionStatus("connected");
    const onDisconnect = () => setConnectionStatus("disconnected");
    const onState = (session: PublicSessionState) => setSession(session);
    const onCountdown = (countdown: PublicGameCountdown) => {
      const current = useSessionStore.getState().session;
      if (!current) {
        return;
      }
      setSession({
        ...current,
        gameCountdown: {
          ...countdown,
          serverNow: countdown.serverNow ?? countdown.startedAt,
        },
      });
    };
    const onReset = () => {
      clearSessionStorage();
      clearSession();
      navigate("/", { replace: true });
    };

    if (socket.connected) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("connecting");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.SESSION_STATE, onState);
    socket.on(SOCKET_EVENTS.GAME_COUNTDOWN, onCountdown);
    socket.on(SOCKET_EVENTS.SESSION_RESET, onReset);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.SESSION_STATE, onState);
      socket.off(SOCKET_EVENTS.GAME_COUNTDOWN, onCountdown);
      socket.off(SOCKET_EVENTS.SESSION_RESET, onReset);
    };
  }, [clearSession, navigate, setConnectionStatus, setSession]);
}
