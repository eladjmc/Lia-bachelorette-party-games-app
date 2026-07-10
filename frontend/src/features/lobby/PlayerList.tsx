import type { PublicPlayerState } from "@/types/session.types";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: PublicPlayerState[];
  hostPlayerId: string | null;
  currentPlayerId: string | null;
  compact?: boolean;
}

export function PlayerList({
  players,
  hostPlayerId,
  currentPlayerId,
  compact = false,
}: PlayerListProps) {
  const sorted = [...players].sort((a, b) => {
    const aHost = a.id === hostPlayerId ? 0 : 1;
    const bHost = b.id === hostPlayerId ? 0 : 1;
    if (aHost !== bHost) {
      return aHost - bHost;
    }
    return a.joinedAt - b.joinedAt;
  });

  return (
    <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2"}>
      {sorted.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isHost={player.id === hostPlayerId}
          isYou={player.id === currentPlayerId}
          compact={compact}
        />
      ))}
    </div>
  );
}
