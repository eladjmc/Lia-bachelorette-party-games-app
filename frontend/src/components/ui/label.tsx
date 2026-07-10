import * as React from "react";
import { cn } from "@/utils/classnames";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-brand-900", className)}
      {...props}
    />
  );
}
