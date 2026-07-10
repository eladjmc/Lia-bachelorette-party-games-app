import { useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Crown, Gift, BottleWine } from "lucide-react";
import { HostActionBar } from "@/components/layout/HostActionBar";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";
import { cn } from "@/utils/classnames";

interface HostGameMenuProps {
  canStart: boolean;
  onReset: () => void;
  resetBusy: boolean;
}

const GAMES: {
  type: "trivia" | "pass_the_parcel" | "truth_or_dare";
  labelKey: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: string;
}[] = [
  {
    type: "trivia",
    labelKey: "lobby.startTrivia",
    Icon: Crown,
    accent: "from-brand-500 to-gold",
  },
  {
    type: "pass_the_parcel",
    labelKey: "lobby.startParcel",
    Icon: Gift,
    accent: "from-lavender to-brand-400",
  },
  {
    type: "truth_or_dare",
    labelKey: "lobby.startTruthOrDare",
    Icon: BottleWine,
    accent: "from-brand-600 to-coral",
  },
];

export function HostGameMenu({ canStart, onReset, resetBusy }: HostGameMenuProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const startGame = (gameType: "trivia" | "pass_the_parcel" | "truth_or_dare") => {
    const token = getPlayerToken();
    if (!token || busy || !canStart) {
      return;
    }
    setBusy(true);
    getSocket().emit(
      SOCKET_EVENTS.HOST_START_GAME,
      { playerToken: token, gameType },
      (_ack: SocketAck) => {
        setBusy(false);
      },
    );
  };

  const hint = !canStart ? t("lobby.needGuest") : t("lobby.chooseGame");

  return (
    <HostActionBar className="border-0 bg-transparent pb-0 pt-3 shadow-none" safeBottom={false}>
      <div className="grid grid-cols-3 gap-2">
        {GAMES.map((game) => {
          const Icon = game.Icon;
          return (
            <motion.button
              key={game.type}
              type="button"
              whileTap={canStart && !busy ? { scale: 0.96 } : undefined}
              disabled={!canStart || busy}
              onClick={() => startGame(game.type)}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br p-2 text-white shadow-soft disabled:opacity-45",
                game.accent,
              )}
            >
              <Icon className="h-5 w-5 drop-shadow-sm" strokeWidth={2.25} aria-hidden />
              <span className="text-center text-[11px] font-bold leading-tight">
                {t(game.labelKey)}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-xs text-brand-700/70">{hint}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full text-coral"
        disabled={resetBusy}
        onClick={onReset}
      >
        {t("lobby.resetSession")}
      </Button>
    </HostActionBar>
  );
}
