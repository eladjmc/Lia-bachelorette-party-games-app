import { useTranslation } from "react-i18next";

export function HostDisconnectedOverlay() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-berry/50 p-6 backdrop-blur-sm safe-pad">
      <div className="glass-card w-full max-w-sm p-6 text-center">
        <p className="text-3xl" aria-hidden>
          👑
        </p>
        <h2 className="title-display mt-2 text-xl">{t("session.pausedTitle")}</h2>
        <p className="mt-3 text-brand-800/80">{t("session.pausedBody")}</p>
      </div>
    </div>
  );
}
