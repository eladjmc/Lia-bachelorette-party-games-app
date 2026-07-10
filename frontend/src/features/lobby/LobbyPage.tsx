import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingMessage } from "@/components/animations/WaitingMessage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ConnectionIndicator } from "@/features/session/ConnectionIndicator";
import { useSession } from "@/hooks/useSession";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";
import { HostGameMenu } from "./HostGameMenu";
import { LeaveLobbyButton } from "./LeaveLobbyButton";
import { PlayerList } from "./PlayerList";

export function LobbyPage() {
  const { t } = useTranslation();
  const { session, currentPlayerId, isHost, connectionStatus } = useSession();
  const [resetBusy, setResetBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!session) {
    return null;
  }

  const connectedGuests = session.players.filter(
    (p) => p.role === "guest" && p.connectionStatus === "connected",
  );

  const requestReset = () => {
    if (!getPlayerToken() || resetBusy) {
      return;
    }
    setResetOpen(true);
  };

  const confirmReset = () => {
    const token = getPlayerToken();
    if (!token || resetBusy) {
      return;
    }
    setResetBusy(true);
    getSocket().emit(
      SOCKET_EVENTS.HOST_RESET_SESSION,
      { playerToken: token },
      (_ack: SocketAck) => {
        setResetBusy(false);
        setResetOpen(false);
      },
    );
  };

  return (
    <div className="bg-princess-entry flex h-dvh w-full flex-col overflow-hidden">
      <header className="mx-auto flex w-full max-w-md shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-brand-600">{t("app.title")}</p>
          <h1 className="title-display mt-1 text-2xl leading-snug">{t("lobby.players")}</h1>
          <p className="mt-1 text-xs text-brand-700/70">
            {session.players.length} {t("lobby.playersCount")}
          </p>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <div className="mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
        <PlayerList
          players={session.players}
          hostPlayerId={session.hostPlayerId}
          currentPlayerId={currentPlayerId}
          compact
        />
      </div>

      {isHost ? (
        <div className="mx-auto w-full max-w-md shrink-0 border-t border-brand-100/80 bg-white/80 backdrop-blur-md safe-pad-bottom">
          <HostGameMenu
            canStart={connectedGuests.length > 0}
            onReset={requestReset}
            resetBusy={resetBusy}
          />
          <div className="px-3 pb-1">
            <LeaveLobbyButton appearance="footerLink" className="mt-0" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-md shrink-0 border-t border-brand-100/80 bg-white/85 px-4 pt-3 backdrop-blur-md safe-pad-bottom">
          <WaitingMessage
            text={t("lobby.waiting")}
            className="rounded-2xl bg-brand-50/90 px-4 py-3 text-center text-sm font-medium text-brand-800"
          />
          <LeaveLobbyButton className="mt-3 mb-1" />
        </div>
      )}

      <ConfirmModal
        open={resetOpen}
        title={t("lobby.resetSessionTitle")}
        description={t("lobby.resetSessionConfirm")}
        confirmLabel={t("lobby.resetSessionAction")}
        busy={resetBusy}
        onCancel={() => {
          if (!resetBusy) {
            setResetOpen(false);
          }
        }}
        onConfirm={confirmReset}
      />
    </div>
  );
}
