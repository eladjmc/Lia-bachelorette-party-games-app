import { useTranslation } from "react-i18next";
import { cn } from "@/utils/classnames";

interface PromptCardProps {
  type: "truth" | "dare";
  text: string;
  playerName: string;
}

export function PromptCard({ type, text, playerName }: PromptCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "rounded-3xl p-6 text-center text-white shadow-soft",
        type === "truth"
          ? "bg-gradient-to-br from-brand-500 to-lavender"
          : "bg-gradient-to-br from-coral to-brand-700",
      )}
    >
      <p className="text-sm font-semibold tracking-wide opacity-95">
        {type === "truth" ? t("tod.truth") : t("tod.dare")} · {t("tod.for")} {playerName}
      </p>
      <p className="mt-4 font-display text-2xl leading-snug">{text}</p>
    </div>
  );
}
