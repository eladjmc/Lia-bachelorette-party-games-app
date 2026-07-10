import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";

interface HostEndGameButtonProps {
  confirm?: boolean;
  className?: string;
}

export function HostEndGameButton({ confirm = true, className }: HostEndGameButtonProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const runEndGame = () => {
    const token = getPlayerToken();
    if (!token || busy) {
      return;
    }

    setBusy(true);
    getSocket().emit(
      SOCKET_EVENTS.HOST_END_GAME,
      { playerToken: token },
      (_ack: SocketAck) => {
        setBusy(false);
        setOpen(false);
      },
    );
  };

  const onClick = () => {
    if (!getPlayerToken() || busy) {
      return;
    }
    if (confirm) {
      setOpen(true);
      return;
    }
    runEndGame();
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        className={className ?? "w-full"}
        disabled={busy}
        onClick={onClick}
      >
        {t("host.abortGame")}
      </Button>

      <ConfirmModal
        open={open}
        title={t("host.endGameTitle")}
        description={t("host.endGameConfirm")}
        confirmLabel={t("host.endGameAction")}
        busy={busy}
        onCancel={() => {
          if (!busy) {
            setOpen(false);
          }
        }}
        onConfirm={runEndGame}
      />
    </>
  );
}
