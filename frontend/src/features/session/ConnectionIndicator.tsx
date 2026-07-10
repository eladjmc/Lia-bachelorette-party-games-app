import { useTranslation } from "react-i18next";
import { cn } from "@/utils/classnames";
import type { ClientConnectionStatus } from "@/store/session.store";

export function ConnectionIndicator({ status }: { status: ClientConnectionStatus }) {
  const { t } = useTranslation();
  const label =
    status === "connected"
      ? t("lobby.connected")
      : status === "connecting"
        ? t("app.connecting")
        : t("app.disconnected");

  return (
    <div className="inline-flex items-center gap-2 text-sm text-brand-800">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          status === "connected" && "bg-brand-500",
          status === "connecting" && "bg-gold animate-pulse",
          status === "disconnected" && "bg-coral",
        )}
      />
      {label}
    </div>
  );
}
