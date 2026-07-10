import { Navigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadeSwap } from "@/components/animations/CollapseReveal";
import { LobbyPage } from "@/features/lobby/LobbyPage";
import { TriviaScreen } from "@/features/games/trivia/TriviaScreen";
import { PassTheParcelScreen } from "@/features/games/pass-the-parcel/PassTheParcelScreen";
import { TruthOrDareScreen } from "@/features/games/truth-or-dare/TruthOrDareScreen";
import { GameIntroScreen } from "@/features/session/GameIntroScreen";
import { HostDisconnectedOverlay } from "@/features/session/HostDisconnectedOverlay";
import { useSession } from "@/hooks/useSession";
import { useSessionStore } from "@/store/session.store";

export function SessionPage() {
  const { session, currentPlayerId } = useSession();
  const gameCountdown = useSessionStore((s) => s.session?.gameCountdown ?? null);
  const reduced = useReducedMotion();

  if (!currentPlayerId) {
    return <Navigate to="/" replace />;
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center safe-pad">
        <p>טוען...</p>
      </div>
    );
  }

  const showPauseOverlay = session.phase === "paused_no_host";

  let content = <LobbyPage />;
  let contentKey = "lobby";

  if (session.activeGame?.type === "trivia") {
    content = <TriviaScreen game={session.activeGame} />;
    contentKey = "trivia";
  } else if (session.activeGame?.type === "pass_the_parcel") {
    content = <PassTheParcelScreen game={session.activeGame} />;
    contentKey = "pass_the_parcel";
  } else if (session.activeGame?.type === "truth_or_dare") {
    content = <TruthOrDareScreen game={session.activeGame} />;
    contentKey = "truth_or_dare";
  } else if (session.phase === "lobby" || session.phase === "paused_no_host") {
    content = <LobbyPage />;
    contentKey = "lobby";
  }

  return (
    <>
      <FadeSwap swapKey={contentKey} className="min-h-dvh">
        {content}
      </FadeSwap>

      <AnimatePresence>
        {gameCountdown && !session.activeGame ? (
          <motion.div
            key={`intro-overlay-${gameCountdown.gameType}-${gameCountdown.startedAt}`}
            className="fixed inset-0 z-[80]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <GameIntroScreen countdown={gameCountdown} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showPauseOverlay ? (
          <motion.div
            key="pause-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <HostDisconnectedOverlay />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
