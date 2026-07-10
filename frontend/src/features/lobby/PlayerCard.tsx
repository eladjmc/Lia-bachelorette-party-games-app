import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import type { PublicPlayerState } from "@/types/session.types";
import { cn } from "@/utils/classnames";

interface PlayerCardProps {
  player: PublicPlayerState;
  isHost: boolean;
  isYou: boolean;
  compact?: boolean;
}

export function PlayerCard({ player, isHost, isYou, compact = false }: PlayerCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "glass-card flex items-center gap-3",
        compact ? "px-2.5 py-1.5" : "px-3 py-2.5",
        player.connectionStatus === "disconnected" && "opacity-55",
        isHost && "ring-1 ring-gold/50",
        isYou && "bg-brand-50/90",
      )}
    >
      <AvatarBadge
        avatarId={player.avatarId}
        displayName={player.displayName}
        size={compact ? "md" : "lg"}
        isHost={isHost}
        dimmed={player.connectionStatus === "disconnected"}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold text-brand-900", compact && "text-sm")}>
          {player.displayName}
          {isYou ? ` (${t("lobby.you")})` : ""}
        </p>
        <p className="text-xs text-brand-700/70">
          {player.connectionStatus === "connected"
            ? t("lobby.connected")
            : t("lobby.disconnected")}
          {isHost ? ` · ${t("lobby.host")}` : ""}
        </p>
      </div>
    </motion.div>
  );
}
