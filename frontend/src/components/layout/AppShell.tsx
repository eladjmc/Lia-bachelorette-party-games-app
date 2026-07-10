import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh w-full">{children}</div>;
}
