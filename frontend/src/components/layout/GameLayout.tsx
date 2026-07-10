import type { ReactNode } from "react";
import { cn } from "@/utils/classnames";

interface GameLayoutProps {
  title: string;
  progress?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function GameLayout({ title, progress, children, footer, className }: GameLayoutProps) {
  return (
    <div className={cn("relative mx-auto flex min-h-dvh w-full max-w-md flex-col", className)}>
      <header className="sticky top-0 z-30 border-b border-brand-100/80 bg-white/80 px-4 py-3 backdrop-blur-md safe-pad">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="title-display text-xl leading-tight">{title}</h1>
            {progress ? <p className="mt-0.5 text-sm text-brand-700/80">{progress}</p> : null}
          </div>
        </div>
      </header>

      <div className={cn("flex-1 overflow-y-auto overflow-x-hidden px-4 py-4", footer ? "pb-36" : "pb-6")}>
        {children}
      </div>

      {footer ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
          <div className="pointer-events-auto mx-auto max-w-md">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
