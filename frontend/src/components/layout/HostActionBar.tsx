import type { ReactNode } from "react";
import { cn } from "@/utils/classnames";

interface HostActionBarProps {
  children: ReactNode;
  className?: string;
  hint?: string;
  safeBottom?: boolean;
}

export function HostActionBar({
  children,
  className,
  hint,
  safeBottom = true,
}: HostActionBarProps) {
  return (
    <div
      className={cn(
        "border-t border-brand-100 bg-white/95 px-3 pt-3 shadow-soft backdrop-blur-md",
        safeBottom && "safe-pad-bottom",
        className,
      )}
    >
      <div className="flex flex-col gap-2">{children}</div>
      {hint ? <p className="pb-2 pt-1 text-center text-xs text-brand-700/70">{hint}</p> : null}
    </div>
  );
}
