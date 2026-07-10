import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";
import { clearSessionStorage, getPlayerToken, setPlayerToken } from "@/lib/storage";
import { useSessionStore } from "@/store/session.store";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";
import type { PublicSessionState } from "@/types/session.types";

interface ReconnectData {
  playerId: string;
  playerToken: string;
  session: PublicSessionState;
}

export function useReconnect(): { ready: boolean } {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const setCurrentPlayerId = useSessionStore((s) => s.setCurrentPlayerId);
  const attempted = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    if (attempted.current) {
      return;
    }
    attempted.current = true;

    const token = getPlayerToken();
    if (!token) {
      readyRef.current = true;
      return;
    }

    const socket = getSocket();

    const tryReconnect = () => {
      socket.emit(
        SOCKET_EVENTS.SESSION_RECONNECT,
        { playerToken: token },
        (ack: SocketAck<ReconnectData>) => {
          readyRef.current = true;
          if (!ack.ok || !ack.data) {
            clearSessionStorage();
            setCurrentPlayerId(null);
            return;
          }
          setPlayerToken(ack.data.playerToken);
          setCurrentPlayerId(ack.data.playerId);
          setSession(ack.data.session);
          navigate("/session", { replace: true });
        },
      );
    };

    if (socket.connected) {
      tryReconnect();
    } else {
      socket.once("connect", tryReconnect);
    }
  }, [navigate, setCurrentPlayerId, setSession]);

  return { ready: readyRef.current };
}
