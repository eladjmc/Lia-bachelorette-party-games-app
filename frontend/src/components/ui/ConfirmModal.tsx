import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "danger" | "royal";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [busy, onCancel, open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="confirm-modal"
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.2 }}
        >
          <button
            type="button"
            aria-label={cancelLabel ?? t("common.cancel")}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            disabled={busy}
            onClick={() => {
              if (!busy) {
                onCancel();
              }
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            className="glass-card relative z-10 w-full max-w-sm p-5 shadow-glow"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduced ? 0.12 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 id="confirm-modal-title" className="title-display text-xl text-brand-900">
              {title}
            </h2>
            <p id="confirm-modal-desc" className="mt-2 text-sm leading-relaxed text-brand-800/80">
              {description}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
                {cancelLabel ?? t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant={confirmVariant}
                disabled={busy}
                onClick={onConfirm}
              >
                {confirmLabel ?? t("common.confirm")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
