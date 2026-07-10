import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/classnames";

const buttonVariants = cva(
  "inline-flex touch-target items-center justify-center gap-2 rounded-full text-base font-semibold shadow-soft transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-l from-brand-600 to-brand-500 text-white shadow-soft hover:from-brand-700 hover:to-brand-600",
        royal:
          "bg-gradient-to-l from-brand-700 via-brand-500 to-gold text-white shadow-glow hover:brightness-105",
        secondary:
          "border border-brand-200 bg-white/90 text-brand-800 hover:bg-brand-50",
        danger: "bg-coral text-white hover:opacity-90",
        ghost: "bg-transparent text-brand-800 shadow-none hover:bg-brand-100/70",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-11 px-4 text-sm",
        lg: "h-14 px-6 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";
