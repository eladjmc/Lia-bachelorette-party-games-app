import * as React from "react";
import { cn } from "@/utils/classnames";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-full border border-brand-200 bg-white/95 px-4 text-base text-ink placeholder:text-brand-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 shadow-soft",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
