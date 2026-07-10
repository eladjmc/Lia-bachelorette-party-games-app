import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
