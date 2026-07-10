import { motion, useReducedMotion } from "framer-motion";

interface WaitingMessageProps {
  text: string;
  className?: string;
}

/** Soft live pulse + bouncing dots for lobby waiting state. */
export function WaitingMessage({ text, className }: WaitingMessageProps) {
  const reduced = useReducedMotion();

  return (
    <motion.p
      className={className}
      animate={reduced ? undefined : { opacity: [0.72, 1, 0.72] }}
      transition={reduced ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span>{text}</span>
      <span className="inline-flex w-6 justify-start ps-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block"
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={
              reduced
                ? undefined
                : { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }
            }
          >
            .
          </motion.span>
        ))}
      </span>
    </motion.p>
  );
}
