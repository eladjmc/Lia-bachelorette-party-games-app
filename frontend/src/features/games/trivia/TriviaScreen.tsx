import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "@/components/animations/confetti";
import { MissReaction } from "@/components/animations/MissReaction";
import { FadeSwap } from "@/components/animations/CollapseReveal";
import { HostEndGameButton } from "@/components/feedback/HostEndGameButton";
import { GameLayout } from "@/components/layout/GameLayout";
import { HostActionBar } from "@/components/layout/HostActionBar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { getSocket } from "@/lib/socket";
import { getPlayerToken } from "@/lib/storage";
import type { PublicTriviaGameState } from "@/types/session.types";
import type { SocketAck } from "@/types/socket.types";
import { SOCKET_EVENTS } from "@/types/socket.types";
import { cn } from "@/utils/classnames";

function emitAdvance() {
  const token = getPlayerToken();
  if (!token) return;
  getSocket().emit(SOCKET_EVENTS.HOST_ADVANCE, { playerToken: token }, (_ack: SocketAck) => undefined);
}

function TriviaQuestionBody({ game }: { game: PublicTriviaGameState }) {
  const { t } = useTranslation();
  const { isHost } = useSession();
  const question = game.currentQuestion;
  const answered = Boolean(game.mySubmission);
  const answeredCount = game.answeredPlayerIds.length;
  const totalExpected = game.expectedPlayerIds.length;

  const submit = (optionId: string) => {
    const token = getPlayerToken();
    if (!token || answered) return;
    getSocket().emit(
      SOCKET_EVENTS.TRIVIA_SUBMIT_ANSWER,
      { playerToken: token, optionId },
      (_ack: SocketAck) => undefined,
    );
  };

  if (!question) return null;

  return (
    <>
      <div className="glass-card p-5">
        <h2 className="text-xl font-bold leading-snug text-brand-900">{question.text}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((option) => {
            const selected = game.mySubmission?.optionId === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                variant="secondary"
                className={cn(
                  "h-auto min-h-12 justify-start whitespace-normal rounded-2xl py-3 text-start",
                  selected && "border-brand-500 bg-brand-50 ring-2 ring-brand-300",
                  answered && !selected && "opacity-60",
                )}
                disabled={answered}
                onClick={() => submit(option.id)}
              >
                {option.text}
              </Button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-brand-700/80">
        {t("trivia.answerProgress", { answered: answeredCount, total: totalExpected })}
      </p>

      {answered && (
        <p className="mt-2 text-center text-sm font-medium text-brand-800">
          {isHost ? t("trivia.waitingForHost") : t("trivia.waitingForOthers")}
        </p>
      )}
    </>
  );
}

function TriviaResultBody({ game }: { game: PublicTriviaGameState }) {
  const { t } = useTranslation();
  const { isHost, currentPlayerId } = useSession();
  const question = game.currentQuestion;
  const myOption = game.mySubmission?.optionId;
  const correct = game.hostAnswerOptionId;
  const isGuest = currentPlayerId != null && game.expectedPlayerIds.includes(currentPlayerId);
  const isCorrect = Boolean(myOption && myOption === correct);
  const isIncorrect = Boolean(isGuest && myOption && !isCorrect);

  useEffect(() => {
    if (!isGuest) return;
    if (isCorrect) fireConfetti();
  }, [isGuest, isCorrect]);

  return (
    <>
      <MissReaction
        triggerKey={`${game.currentQuestionIndex}-${game.hostAnswerOptionId}`}
        active={isIncorrect}
      />

      <div className="glass-card p-5">
        <h2 className="text-lg font-bold text-brand-900">{question?.text}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {question?.options.map((option) => {
            const isRight = option.id === correct;
            const isMine = option.id === myOption;
            return (
              <motion.div
                key={option.id}
                animate={isMine && !isRight ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-medium",
                  isRight && "border-brand-500 bg-brand-50 text-brand-900",
                  !isRight && isMine && "border-coral bg-coral/10 text-coral",
                  !isRight && !isMine && "border-brand-100 bg-white",
                )}
              >
                <span>{option.text}</span>
                {isRight && (
                  <span className="ms-2 text-xs font-semibold text-brand-700">
                    ({t("trivia.correctAnswer")})
                  </span>
                )}
                {isHost && game.optionCounts ? (
                  <span className="ms-2 text-brand-700/70">
                    ({game.optionCounts[option.id] ?? 0})
                  </span>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      {isGuest && (
        <motion.p
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "mt-4 text-center text-xl font-bold",
            isCorrect ? "text-brand-600" : "text-coral",
          )}
        >
          {!myOption
            ? t("trivia.noAnswer")
            : isCorrect
              ? t("trivia.correct")
              : t("trivia.incorrect")}
        </motion.p>
      )}
    </>
  );
}

function TriviaScoreboardBody({ game }: { game: PublicTriviaGameState }) {
  const { t } = useTranslation();
  const { currentPlayerId } = useSession();
  const topScore = game.scores[0]?.score ?? 0;
  const isWinner =
    currentPlayerId != null &&
    game.scores.some((s) => s.playerId === currentPlayerId && s.score === topScore && topScore > 0);

  useEffect(() => {
    if (isWinner) fireConfetti();
  }, [isWinner]);

  return (
    <>
      <h2 className="title-display mb-4 text-center text-2xl">
        {isWinner ? t("trivia.winner") : t("trivia.gameOver")}
      </h2>
      <ol className="flex flex-col gap-2">
        {game.scores.map((score, index) => (
          <li
            key={score.playerId}
            className={cn(
              "glass-card flex items-center justify-between px-4 py-3",
              score.playerId === currentPlayerId && "ring-2 ring-gold/60",
              index === 0 && "bg-gradient-to-l from-gold/20 to-white",
            )}
          >
            <span className="font-semibold text-brand-900">
              {index === 0 ? "👑 " : `#${index + 1} `}
              {score.displayName}
              {!score.connected ? " ⚠" : ""}
            </span>
            <span className="text-sm font-bold text-brand-700">
              {score.score} {t("trivia.score")}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function TriviaHostFooter({ game }: { game: PublicTriviaGameState }) {
  const { t } = useTranslation();

  return (
    <HostActionBar
      hint={
        game.phase === "question" && !game.hasHostAnswered
          ? t("trivia.hostMustAnswer")
          : undefined
      }
    >
      {game.phase === "question" ? (
        <Button
          type="button"
          variant="royal"
          className="w-full"
          disabled={!game.hasHostAnswered}
          onClick={emitAdvance}
        >
          {t("trivia.reveal")}
        </Button>
      ) : null}
      {game.phase === "result" ? (
        <Button type="button" variant="royal" className="w-full" onClick={emitAdvance}>
          {t("trivia.next")}
        </Button>
      ) : null}
      <HostEndGameButton confirm={game.phase !== "completed"} />
    </HostActionBar>
  );
}

export function TriviaScreen({ game }: { game: PublicTriviaGameState }) {
  const { t } = useTranslation();
  const { isHost } = useSession();

  const phaseKey =
    game.phase === "question"
      ? `q-${game.currentQuestionIndex}`
      : game.phase === "result"
        ? `r-${game.currentQuestionIndex}`
        : "completed";

  const progress =
    game.phase === "question"
      ? `${t("trivia.question")} ${game.currentQuestionIndex + 1} ${t("trivia.of")} ${game.questionOrder.length}`
      : game.phase === "result"
        ? t("trivia.roundResults")
        : t("trivia.leaderboard");

  let body: ReactNode = null;
  if (game.phase === "question") {
    body = <TriviaQuestionBody game={game} />;
  } else if (game.phase === "result") {
    body = <TriviaResultBody game={game} />;
  } else {
    body = <TriviaScoreboardBody game={game} />;
  }

  return (
    <GameLayout
      title={t("trivia.title")}
      progress={progress}
      footer={isHost ? <TriviaHostFooter game={game} /> : undefined}
    >
      <FadeSwap swapKey={phaseKey}>{body}</FadeSwap>
    </GameLayout>
  );
}
