import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "@/components/animations/confetti";
import { FadeSwap } from "@/components/animations/CollapseReveal";
import { HostEndGameButton } from "@/components/feedback/HostEndGameButton";
import { GameLayout } from "@/components/layout/GameLayout";
import { HostActionBar } from "@/components/layout/HostActionBar";
import { Button } from "@/components/ui/button";
import { PromptCard } from "./PromptCard";
import { SpinBottle } from "./SpinBottle";
import { useSession } from "@/hooks/useSession";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { PublicTruthOrDareGameState } from "@/types/session.types";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";

export function TruthOrDareScreen({ game }: { game: PublicTruthOrDareGameState }) {
  const { t } = useTranslation();
  const { session, isHost } = useSession();
  const selected = session?.players.find((p) => p.id === game.selectedPlayerId);

  useEffect(() => {
    if (game.phase === "completed") {
      fireConfetti();
    }
  }, [game.phase]);

  const advance = () => {
    const token = getPlayerToken();
    if (!token) return;
    getSocket().emit(SOCKET_EVENTS.HOST_ADVANCE, { playerToken: token }, (_ack: SocketAck) => undefined);
  };

  const usedCount = game.usedTruthPromptIds.length + game.usedDarePromptIds.length;
  const progress = `${t("tod.progress")} ${usedCount} / ${game.totalPromptCount}`;

  return (
    <GameLayout
      title={t("tod.title")}
      progress={progress}
      footer={
        isHost ? (
          <HostActionBar>
            {game.phase === "prompt" && (
              <Button type="button" variant="royal" className="w-full" onClick={advance}>
                {t("tod.next")}
              </Button>
            )}
            <HostEndGameButton confirm={game.phase !== "completed"} />
          </HostActionBar>
        ) : undefined
      }
    >
      {(game.phase === "spinning" || game.phase === "prompt") && (
        <>
          {game.phase === "spinning" && (
            <p className="mb-3 text-center text-brand-800">{t("tod.spinning")}</p>
          )}
          <SpinBottle
            players={session?.players ?? []}
            hostPlayerId={session?.hostPlayerId ?? null}
            selectedPlayerId={game.selectedPlayerId}
            spinStartedAt={game.spinStartedAt}
            spinDurationMs={game.spinDurationMs}
            spinning={game.phase === "spinning"}
          />
        </>
      )}

      {game.phase === "prompt" && game.currentPrompt && selected && (
        <div className="mt-5">
          <FadeSwap swapKey={game.currentPrompt.id}>
            <PromptCard
              type={game.currentPrompt.type}
              text={game.currentPrompt.text}
              playerName={selected.displayName}
            />
          </FadeSwap>
        </div>
      )}

      {game.phase === "completed" && (
        <FadeSwap swapKey="completed">
          <div className="glass-card p-6 text-center">
            <h2 className="title-display text-2xl">{t("tod.completed")}</h2>
          </div>
        </FadeSwap>
      )}
    </GameLayout>
  );
}
