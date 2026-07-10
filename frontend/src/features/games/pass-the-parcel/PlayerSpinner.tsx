import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import type { PublicPlayerState } from "@/types/session.types";
import { cn } from "@/utils/classnames";

interface PlayerSpinnerProps {
  players: PublicPlayerState[];
  selectedPlayerId: string | null;
  spinStartedAt: number | null;
  spinDurationMs: number;
  spinning: boolean;
}

export function PlayerSpinner({
  players,
  selectedPlayerId,
  spinStartedAt,
  spinDurationMs,
  spinning,
}: PlayerSpinnerProps) {
  const guests = useMemo(
    () =>
      [...players]
        .filter((p) => p.role === "guest")
        .sort((a, b) => a.joinedAt - b.joinedAt),
    [players],
  );

  const selectedIndex = Math.max(
    0,
    guests.findIndex((p) => p.id === selectedPlayerId),
  );
  const [highlightIndex, setHighlightIndex] = useState(0);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!spinning || guests.length === 0) {
      setHighlightIndex(selectedIndex);
      return;
    }

    if (reducedMotion) {
      setHighlightIndex(selectedIndex);
      return;
    }

    const started = spinStartedAt ?? Date.now();
    const endsAt = started + spinDurationMs;
    let tick = 0;
    let delay = 60;

    let timeoutId = 0;
    const step = () => {
      const now = Date.now();
      if (now >= endsAt) {
        setHighlightIndex(selectedIndex);
        return;
      }
      tick += 1;
      setHighlightIndex(tick % guests.length);
      const progress = (now - started) / spinDurationMs;
      delay = 60 + progress * progress * 220;
      timeoutId = window.setTimeout(step, delay);
    };

    timeoutId = window.setTimeout(step, delay);
    return () => window.clearTimeout(timeoutId);
  }, [spinning, guests.length, selectedIndex, spinStartedAt, spinDurationMs, reducedMotion]);

  const selected = guests.find((p) => p.id === selectedPlayerId) ?? guests[selectedIndex];

  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {guests.map((player, index) => {
          const active = spinning ? index === highlightIndex : player.id === selectedPlayerId;
          return (
            <motion.div
              key={player.id}
              animate={{
                scale: active ? 1.08 : 1,
                opacity: spinning && !active ? 0.45 : 1,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl p-2",
                active && "bg-brand-50 ring-2 ring-gold/70",
              )}
            >
              <AvatarBadge
                avatarId={player.avatarId}
                displayName={player.displayName}
                size="lg"
                selected={active}
              />
              <span className="max-w-full truncate text-center text-xs font-semibold text-brand-800">
                {player.displayName}
              </span>
            </motion.div>
          );
        })}
      </div>

      {!spinning && selected && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center title-display text-xl text-brand-700"
        >
          {selected.displayName}
        </motion.p>
      )}
    </div>
  );
}
