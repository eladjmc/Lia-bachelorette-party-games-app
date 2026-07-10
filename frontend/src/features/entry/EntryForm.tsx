import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CollapseReveal } from "@/components/animations/CollapseReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "./AvatarPicker";
import { getSocket } from "@/lib/socket";
import { setPlayerProfile, setPlayerToken } from "@/lib/storage";
import { useSessionStore } from "@/store/session.store";
import type { PlayerRole, PublicSessionState } from "@/types/session.types";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";

interface JoinData {
  playerId: string;
  playerToken: string;
  session: PublicSessionState;
}

export function EntryForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const setCurrentPlayerId = useSessionStore((s) => s.setCurrentPlayerId);
  const setLastError = useSessionStore((s) => s.setLastError);

  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [role, setRole] = useState<PlayerRole>("guest");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [takenIds, setTakenIds] = useState<string[]>([]);

  const errorMessage = useSessionStore((s) => s.lastError);

  // Live updates from session broadcasts (including pre-join clients)
  useEffect(() => {
    if (session?.takenAvatarIds) {
      setTakenIds(session.takenAvatarIds);
    }
  }, [session?.takenAvatarIds]);

  // Peek on mount/reconnect — covers missed initial session:state race
  useEffect(() => {
    const socket = getSocket();

    const refreshTaken = () => {
      socket.emit(
        SOCKET_EVENTS.SESSION_PEEK,
        {},
        (ack: SocketAck<{ takenAvatarIds: string[] }>) => {
          if (ack.ok && ack.data) {
            setTakenIds(ack.data.takenAvatarIds);
          }
        },
      );
    };

    refreshTaken();
    socket.on("connect", refreshTaken);
    return () => {
      socket.off("connect", refreshTaken);
    };
  }, []);

  useEffect(() => {
    if (avatarId && takenIds.includes(avatarId)) {
      setAvatarId(null);
    }
  }, [avatarId, takenIds]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!avatarId || submitting) {
      return;
    }

    setSubmitting(true);
    setLastError(null);
    const socket = getSocket();
    const eventName =
      role === "host" ? SOCKET_EVENTS.SESSION_JOIN_HOST : SOCKET_EVENTS.SESSION_JOIN_GUEST;
    const payload =
      role === "host"
        ? { displayName, avatarId, password }
        : { displayName, avatarId };

    socket.emit(eventName, payload, (ack: SocketAck<JoinData>) => {
      setSubmitting(false);
      if (!ack.ok || !ack.data) {
        const code = ack.error?.code ?? "VALIDATION_ERROR";
        setLastError({
          code,
          message: t(`entry.errors.${code}`, {
            defaultValue: ack.error?.message ?? t("app.error"),
          }),
        });
        return;
      }

      setPlayerToken(ack.data.playerToken);
      setPlayerProfile({
        displayName: displayName.trim(),
        avatarId,
        role,
      });
      setCurrentPlayerId(ack.data.playerId);
      setSession(ack.data.session);
      navigate("/session");
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">{t("entry.name")}</Label>
        <Input
          id="name"
          value={displayName}
          maxLength={20}
          placeholder={t("entry.namePlaceholder")}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <AvatarPicker value={avatarId} takenIds={takenIds} onChange={setAvatarId} />

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={role === "guest" ? "default" : "secondary"}
          onClick={() => {
            setRole("guest");
            setPassword("");
          }}
        >
          {t("entry.guest")}
        </Button>
        <Button
          type="button"
          variant={role === "host" ? "default" : "secondary"}
          onClick={() => setRole("host")}
        >
          {t("entry.host")}
        </Button>
      </div>

      <CollapseReveal show={role === "host"}>
        <div>
          <Label htmlFor="password">{t("entry.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            placeholder={t("entry.passwordPlaceholder")}
            onChange={(e) => setPassword(e.target.value)}
            required={role === "host"}
          />
        </div>
      </CollapseReveal>

      <CollapseReveal show={Boolean(errorMessage)}>
        <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {errorMessage?.message}
        </p>
      </CollapseReveal>

      <Button type="submit" size="lg" disabled={!avatarId || submitting}>
        {t("entry.join")}
      </Button>
    </form>
  );
}
