import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "@/components/animations/confetti";
import { FadeSwap } from "@/components/animations/CollapseReveal";
import { HostEndGameButton } from "@/components/feedback/HostEndGameButton";
import { GameLayout } from "@/components/layout/GameLayout";
import { HostActionBar } from "@/components/layout/HostActionBar";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { Button } from "@/components/ui/button";
import { PlayerSpinner } from "./PlayerSpinner";
import { useSession } from "@/hooks/useSession";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { PublicPassTheParcelGameState } from "@/types/session.types";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";

export function PassTheParcelScreen({ game }: { game: PublicPassTheParcelGameState }) {
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

  return (
    <GameLayout
      title={t("parcel.title")}
      progress={`${game.currentQuestionIndex + 1} / ${game.questionOrder.length}`}
      footer={
        isHost ? (
          <HostActionBar>
            {game.phase === "question" && (
              <Button type="button" variant="royal" className="w-full" onClick={advance}>
                {t("parcel.next")}
              </Button>
            )}
            <HostEndGameButton confirm={game.phase !== "completed"} />
          </HostActionBar>
        ) : undefined
      }
    >
      {game.phase === "spinning" && (
        <>
          <p className="mb-3 text-center text-brand-800">{t("parcel.spinning")}</p>
          <PlayerSpinner
            players={session?.players ?? []}
            selectedPlayerId={game.selectedPlayerId}
            spinStartedAt={game.spinStartedAt}
            spinDurationMs={game.spinDurationMs}
            spinning
          />
        </>
      )}

      {game.phase === "question" && game.currentQuestion && (
        <FadeSwap swapKey={game.currentQuestion.id}>
          <div className="flex flex-col items-center gap-5 pt-2">
            {selected ? (
              <div className="flex flex-col items-center gap-2">
                <AvatarBadge
                  avatarId={selected.avatarId}
                  displayName={selected.displayName}
                  size="xl"
                  selected
                />
                <p className="title-display text-2xl text-brand-800">{selected.displayName}</p>
                <p className="text-sm font-medium text-brand-600">{t("parcel.chosen")}</p>
              </div>
            ) : null}

            <div className="glass-card w-full p-5">
              <h2 className="mb-3 text-center text-sm font-semibold text-brand-700/80">
                {t("parcel.questionFor")} {selected?.displayName}
              </h2>
              <p className="text-center text-xl font-bold leading-relaxed text-brand-900">
                {game.currentQuestion.text}
              </p>
            </div>
          </div>
        </FadeSwap>
      )}

      {game.phase === "completed" && (
        <FadeSwap swapKey="completed">
          <div className="glass-card p-6 text-center">
            <h2 className="title-display text-2xl">{t("parcel.completed")}</h2>
          </div>
        </FadeSwap>
      )}
    </GameLayout>
  );
}
