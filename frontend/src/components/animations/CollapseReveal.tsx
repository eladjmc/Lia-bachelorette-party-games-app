import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface CollapseRevealProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

/** Smooth height + fade for show/hide UI (password fields, errors, etc.). */
export function CollapseReveal({ show, children, className }: CollapseRevealProps) {
  const reduced = useReducedMotion();
  const [overflow, setOverflow] = useState<"hidden" | "visible">("hidden");

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          key="collapse-reveal"
          className={className}
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow }}
          onAnimationStart={() => setOverflow("hidden")}
          onAnimationComplete={() => setOverflow("visible")}
        >
          {/* Padding keeps borders/rings from being clipped while height animates */}
          <div className="py-1">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface FadeSwapProps {
  swapKey: string;
  children: ReactNode;
  className?: string;
}

/** Horizontal slide when content key changes (game phases, prompts). */
export function FadeSwap({ swapKey, children, className }: FadeSwapProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28 }}
        transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
