import { Crown } from "lucide-react";
import { getAvatarById } from "@/features/entry/avatars";
import { cn } from "@/utils/classnames";

interface AvatarBadgeProps {
  avatarId: string;
  displayName: string;
  size?: "sm" | "md" | "lg" | "xl";
  isHost?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-[4.5rem] w-[4.5rem]",
  xl: "h-24 w-24",
} as const;

const crownSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
} as const;

export function AvatarBadge({
  avatarId,
  displayName,
  size = "md",
  isHost = false,
  selected = false,
  dimmed = false,
  className,
}: AvatarBadgeProps) {
  const avatar = getAvatarById(avatarId);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border-2 bg-gradient-to-br from-brand-100 to-lavender/40 shadow-soft",
          sizeClasses[size],
          selected ? "border-gold ring-2 ring-gold/50" : "border-white",
          dimmed && "opacity-45 grayscale",
        )}
      >
        {avatar ? (
          <img
            src={avatar.imagePath}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
      {isHost && (
        <span className="absolute -top-1 -start-1 rounded-full bg-gold p-0.5 text-ink shadow-glow">
          <Crown className={crownSizes[size]} />
        </span>
      )}
    </div>
  );
}
