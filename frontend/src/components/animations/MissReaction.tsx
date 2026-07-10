import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";

interface MissReactionProps {
  /** Bump this (e.g. question index) to replay when a new wrong result appears. */
  triggerKey: string | number;
  active: boolean;
}

const TEARS = [
  { x: -36, delay: 0.15, size: 10 },
  { x: 28, delay: 0.28, size: 8 },
  { x: -8, delay: 0.4, size: 7 },
  { x: 42, delay: 0.22, size: 9 },
];

/** Playful “oops” burst for wrong trivia answers (pairs with confetti on correct). */
export function MissReaction({ triggerKey, active }: MissReactionProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), reduced ? 700 : 1600);
    return () => window.clearTimeout(timeout);
  }, [active, triggerKey, reduced]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={`miss-${triggerKey}`}
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative flex flex-col items-center"
            initial={reduced ? { opacity: 0, scale: 0.9 } : { opacity: 0, scale: 0.4, y: 24, rotate: -12 }}
            animate={
              reduced
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: [0, 1, 1, 0],
                    scale: [0.4, 1.15, 1, 0.95],
                    y: [24, -8, -28, -56],
                    rotate: [-12, 6, -4, 0],
                  }
            }
            transition={{ duration: reduced ? 0.35 : 1.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="select-none text-7xl drop-shadow-md" aria-hidden>
              🥺
            </span>
            {!reduced &&
              TEARS.map((tear, index) => (
                <motion.span
                  key={index}
                  className="absolute top-14 text-sky-400"
                  style={{ fontSize: tear.size, left: `calc(50% + ${tear.x}px)` }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 48, 72], x: [0, tear.x * 0.15, tear.x * 0.3] }}
                  transition={{ duration: 1.1, delay: tear.delay, ease: "easeOut" }}
                  aria-hidden
                >
                  💧
                </motion.span>
              ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
