import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { clearSessionStorage, getPlayerToken } from "@/lib/storage";
import { useSessionStore } from "@/store/session.store";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";
import { cn } from "@/utils/classnames";

interface LeaveLobbyButtonProps {
  className?: string;
  /** Guest: full secondary button. Host: quiet footer link under controls. */
  appearance?: "button" | "footerLink";
}

export function LeaveLobbyButton({
  className,
  appearance = "button",
}: LeaveLobbyButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearSession = useSessionStore((s) => s.clearSession);
  const [busy, setBusy] = useState(false);

  const leave = () => {
    const token = getPlayerToken();
    if (!token || busy) {
      return;
    }

    setBusy(true);
    getSocket().emit(
      SOCKET_EVENTS.SESSION_LEAVE,
      { playerToken: token },
      (_ack: SocketAck) => {
        clearSessionStorage();
        clearSession();
        setBusy(false);
        navigate("/", { replace: true });
      },
    );
  };

  if (appearance === "footerLink") {
    return (
      <div className={cn("flex justify-center border-t border-brand-100/70 pt-2", className)}>
        <button
          type="button"
          disabled={busy}
          onClick={leave}
          className="inline-flex touch-target items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-brand-700/65 transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          {t("lobby.leave")}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("mt-6 flex flex-col items-center gap-1", className)}>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={busy}
        onClick={leave}
      >
        {t("lobby.leave")}
      </Button>
      <p className="text-xs text-brand-700/70">{t("lobby.leaveHint")}</p>
    </div>
  );
}
