import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BottleWine, Crown, Gift } from "lucide-react";
import { HostEndGameButton } from "@/components/feedback/HostEndGameButton";
import { useSession } from "@/hooks/useSession";
import type { PublicGameCountdown } from "@/types/session.types";
import { cn } from "@/utils/classnames";

interface GameIntroScreenProps {
  countdown: PublicGameCountdown;
}

const GAME_META = {
  trivia: {
    titleKey: "intro.triviaTitle",
    stepsKey: "intro.triviaSteps" as const,
    Icon: Crown,
    accent: "from-brand-500 to-gold",
  },
  pass_the_parcel: {
    titleKey: "intro.parcelTitle",
    stepsKey: "intro.parcelSteps" as const,
    Icon: Gift,
    accent: "from-lavender to-brand-400",
  },
  truth_or_dare: {
    titleKey: "intro.todTitle",
    stepsKey: null,
    Icon: BottleWine,
    accent: "from-brand-600 to-coral",
  },
} as const;

function useSyncedSecondsLeft(countdown: PublicGameCountdown): number {
  const localEndsAt = useMemo(() => {
    const serverNow = countdown.serverNow ?? countdown.startedAt;
    const serverRemaining = Math.max(0, countdown.endsAt - serverNow);
    return Date.now() + serverRemaining;
  }, [countdown.endsAt, countdown.serverNow, countdown.startedAt]);

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((localEndsAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((localEndsAt - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [localEndsAt]);

  return secondsLeft;
}

function useIntroSteps(countdown: PublicGameCountdown): string[] {
  const { t } = useTranslation();

  if (countdown.gameType === "truth_or_dare") {
    const rounds = countdown.totalRounds;
    return [
      t("intro.todStep1"),
      rounds && rounds > 0
        ? t("intro.todStep2", { count: rounds })
        : t("intro.todStep2NoCount"),
      t("intro.todStep3"),
    ];
  }

  const stepsKey =
    countdown.gameType === "pass_the_parcel" ? "intro.parcelSteps" : "intro.triviaSteps";
  const stepsRaw = t(stepsKey, { returnObjects: true });
  return Array.isArray(stepsRaw) ? (stepsRaw as string[]) : [];
}

export function GameIntroScreen({ countdown }: GameIntroScreenProps) {
  const { t } = useTranslation();
  const { isHost } = useSession();
  const reduced = useReducedMotion();
  const meta = GAME_META[countdown.gameType] ?? GAME_META.trivia;
  const Icon = meta.Icon;
  const steps = useIntroSteps(countdown);
  const secondsLeft = useSyncedSecondsLeft(countdown);

  const progress = Math.min(
    1,
    Math.max(0, 1 - secondsLeft / Math.max(1, Math.round(countdown.durationMs / 1000))),
  );
  const displaySeconds = Math.max(1, secondsLeft || 1);
  const showGo = secondsLeft <= 0;

  return (
    <div className="bg-princess-entry flex h-dvh w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col"
        >
          <div
            className={cn(
              "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-glow",
              meta.accent,
            )}
          >
            <Icon className="h-8 w-8" strokeWidth={2.25} aria-hidden />
          </div>

          <p className="text-center text-xs font-semibold tracking-wide text-brand-600">
            {t("intro.ready")}
          </p>
          <h1 className="title-display mt-1 text-center text-3xl leading-snug">
            {t(meta.titleKey)}
          </h1>

          <div className="glass-card mt-5 space-y-3 p-5">
            <p className="text-sm font-semibold text-brand-800">{t("intro.howToPlay")}</p>
            <ol className="flex flex-col gap-2.5">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-brand-800/90">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-auto flex flex-col items-center pb-4 pt-8">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden>
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-brand-100"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#countdownGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * progress }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="countdownGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E85A9B" />
                    <stop offset="100%" stopColor="#E8B84A" />
                  </linearGradient>
                </defs>
              </svg>

              <AnimatePresence mode="popLayout">
                <motion.span
                  key={showGo ? "go" : displaySeconds}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.55 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.2 }}
                  className="title-display text-6xl text-brand-700"
                >
                  {showGo ? t("intro.go") : displaySeconds}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="mt-4 text-center text-sm font-medium text-brand-700/75">
              {t("intro.startsIn")}
            </p>
          </div>
        </motion.div>

        {isHost ? (
          <div className="mt-2 safe-pad-bottom">
            <HostEndGameButton confirm={false} className="w-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
