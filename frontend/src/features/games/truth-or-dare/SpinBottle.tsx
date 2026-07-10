import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import type { PublicPlayerState } from "@/types/session.types";
import { cn } from "@/utils/classnames";

interface SpinBottleProps {
  players: PublicPlayerState[];
  hostPlayerId: string | null;
  selectedPlayerId: string | null;
  spinStartedAt: number | null;
  spinDurationMs: number;
  spinning: boolean;
}

const SPINS = 5;
/** Bottle tip points to the right at 0deg in our SVG. */
const BOTTLE_BASE_DEG = 0;

export function SpinBottle({
  players,
  hostPlayerId,
  selectedPlayerId,
  spinStartedAt,
  spinDurationMs,
  spinning,
}: SpinBottleProps) {
  const participants = useMemo(
    () =>
      [...players]
        .filter((p) => p.connectionStatus === "connected" || p.id === selectedPlayerId)
        .sort((a, b) => a.joinedAt - b.joinedAt),
    [players, selectedPlayerId],
  );

  const selectedIndex = Math.max(
    0,
    participants.findIndex((p) => p.id === selectedPlayerId),
  );

  const [rotation, setRotation] = useState(0);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (participants.length === 0) return;

    const perSlot = 360 / participants.length;
    // Avatars are placed starting at top (-90deg in CSS circle math via translate).
    // Slot 0 is at top; bottle at 0deg points right. Convert slot angle to bottle rotation.
    const slotAngle = selectedIndex * perSlot - 90;
    const target = 360 * SPINS + slotAngle - BOTTLE_BASE_DEG;

    if (!spinning || reducedMotion) {
      setRotation(((slotAngle - BOTTLE_BASE_DEG) % 360 + 360) % 360);
      return;
    }

    const started = spinStartedAt ?? Date.now();
    const duration = spinDurationMs;
    let frame = 0;

    const tick = () => {
      const elapsed = Date.now() - started;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - (1 - t) ** 3;
      setRotation(target * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    spinning,
    selectedIndex,
    participants.length,
    spinStartedAt,
    spinDurationMs,
    reducedMotion,
  ]);

  const radius = 112;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {participants.map((player, index) => {
        const angle = (360 / participants.length) * index - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const isSelected = !spinning && player.id === selectedPlayerId;

        return (
          <div
            key={player.id}
            className={cn(
              "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center",
              isSelected && "z-10",
            )}
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <AvatarBadge
              avatarId={player.avatarId}
              displayName={player.displayName}
              size="md"
              isHost={player.id === hostPlayerId}
              selected={isSelected}
            />
            <span className="mt-1 max-w-[72px] truncate text-center text-[10px] font-semibold text-brand-800">
              {player.displayName}
            </span>
          </div>
        );
      })}

      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          style={{ rotate: rotation }}
          className="flex h-36 w-36 items-center justify-center"
        >
          <img
            src="/branding/bottle.png"
            alt=""
            className="h-10 w-32 origin-center object-contain drop-shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const sibling = e.currentTarget.nextElementSibling;
              if (sibling instanceof HTMLElement) sibling.style.display = "block";
            }}
          />
          <svg
            viewBox="0 0 120 40"
            className="hidden h-10 w-32"
            aria-hidden
          >
            <defs>
              <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E8B84A" />
                <stop offset="100%" stopColor="#C64B79" />
              </linearGradient>
            </defs>
            <rect x="8" y="12" width="88" height="16" rx="8" fill="url(#bottleGrad)" />
            <rect x="96" y="15" width="16" height="10" rx="3" fill="#9D3A5F" />
            <circle cx="20" cy="20" r="5" fill="#FFE4F0" opacity="0.7" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
